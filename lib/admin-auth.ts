import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { cookies } from "next/headers";

import type { AdminSession } from "@/lib/order-types";

export const adminSessionCookieName = "rogers-admin-session";
export const adminSessionLifetimeSeconds = 60 * 60 * 8;

interface StoredAdminConfig {
  username: string;
  passwordHash: string;
  sessionSecret: string;
}

const adminCredentialsFilename = "admin-credentials.json";

function adminCredentialsPath() {
  return join(process.cwd(), ".data", adminCredentialsFilename);
}

function legacyAdminCredentialsPath() {
  return join(process.cwd(), "lib", adminCredentialsFilename);
}

let warnedAboutLegacyCredentials = false;

function readCredentialsFile(filePath: string): StoredAdminConfig | null {
  try {
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as Partial<StoredAdminConfig>;
    if (
      typeof parsed.username === "string" &&
      typeof parsed.passwordHash === "string" &&
      typeof parsed.sessionSecret === "string"
    ) {
      return {
        username: parsed.username,
        passwordHash: parsed.passwordHash,
        sessionSecret: parsed.sessionSecret,
      };
    }
  } catch {
    // Missing or malformed store: try the next source.
  }

  return null;
}

/**
 * Keeps every caller honest: a store with a missing username, a non-scrypt hash,
 * or a short signing secret is treated as unconfigured instead of half-working.
 */
function validateAdminConfig(config: StoredAdminConfig): StoredAdminConfig | null {
  const username = config.username.trim();
  if (!username || username.length > 64) return null;
  if (!config.passwordHash.startsWith("scrypt$")) return null;
  if (config.sessionSecret.length < 32) return null;
  return { username, passwordHash: config.passwordHash, sessionSecret: config.sessionSecret };
}

/**
 * Credentials live in the gitignored `.data/` store so the signing secret never
 * sits inside the source tree. `.env.local` remains the deployment source, and
 * the legacy `lib/admin-credentials.json` path is still read so existing installs
 * keep working until `npm run admin:setup` moves them.
 */
function readAdminConfig(): StoredAdminConfig | null {
  const stored = readCredentialsFile(adminCredentialsPath());
  if (stored) return validateAdminConfig(stored);

  const legacyPath = legacyAdminCredentialsPath();
  if (existsSync(legacyPath)) {
    const legacy = readCredentialsFile(legacyPath);
    if (legacy) {
      if (!warnedAboutLegacyCredentials) {
        warnedAboutLegacyCredentials = true;
        console.warn(
          "[rogers] Admin credentials are stored in the legacy lib/admin-credentials.json file. " +
            "Run `npm run admin:setup` to move them into the gitignored .data/ store.",
        );
      }
      return validateAdminConfig(legacy);
    }
  }

  const envUsername = process.env.ROGERS_ADMIN_USERNAME;
  const envHash = process.env.ROGERS_ADMIN_PASSWORD_HASH;
  const envSecret = process.env.ROGERS_ADMIN_SESSION_SECRET;

  if (envUsername && envHash && envSecret) {
    return validateAdminConfig({
      username: envUsername,
      passwordHash: envHash,
      sessionSecret: envSecret,
    });
  }

  return null;
}

function secureStringEquals(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);
  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}

export function adminAuthConfigured() {
  return readAdminConfig() !== null;
}

export function verifyAdminCredentials(username: string, password: string) {
  const config = readAdminConfig();
  if (!config) return false;

  const [algorithm, saltValue, hashValue, extra] = config.passwordHash.split("$");
  if (algorithm !== "scrypt" || !saltValue || !hashValue || extra) return false;

  try {
    const salt = Buffer.from(saltValue, "base64url");
    const expectedHash = Buffer.from(hashValue, "base64url");
    if (salt.length < 16 || expectedHash.length !== 64) return false;

    const actualHash = scryptSync(password, salt, expectedHash.length);
    const validPassword = timingSafeEqual(actualHash, expectedHash);
    const validUsername = secureStringEquals(username, config.username);
    return validPassword && validUsername;
  } catch {
    return false;
  }
}

/**
 * Signs a session with the configured secret, or returns null when the store is
 * missing or invalid. Never falls back to a constant key: a known signing secret
 * would let anyone mint an admin cookie.
 */
export function createAdminSession(username: string): { token: string; session: AdminSession } | null {
  const config = readAdminConfig();
  if (!config) return null;

  const session: AdminSession = {
    username,
    expiresAt: Date.now() + adminSessionLifetimeSeconds * 1000,
    csrfToken: randomBytes(32).toString("base64url"),
  };
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = createHmac("sha256", config.sessionSecret).update(payload).digest("base64url");
  return { token: `${payload}.${signature}`, session };
}

export async function readAdminSession(): Promise<AdminSession | null> {
  const config = readAdminConfig();
  if (!config) return null;
  const token = (await cookies()).get(adminSessionCookieName)?.value;
  if (!token) return null;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const expected = createHmac("sha256", config.sessionSecret)
    .update(payload)
    .digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<AdminSession>;
    if (
      session.username !== config.username ||
      typeof session.expiresAt !== "number" ||
      session.expiresAt <= Date.now() ||
      typeof session.csrfToken !== "string"
    ) {
      return null;
    }
    return session as AdminSession;
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated() {
  return (await readAdminSession()) !== null;
}

export async function verifyAdminCsrfToken(token: string | null) {
  if (!token) return false;
  const session = await readAdminSession();
  return session !== null && secureStringEquals(token, session.csrfToken);
}

export function isSameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";

  try {
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
    const expectedOrigin = forwardedProtocol && forwardedHost
      ? new URL(`${forwardedProtocol}://${forwardedHost}`).origin
      : new URL(request.url).origin;
    return new URL(origin).origin === expectedOrigin;
  } catch {
    return false;
  }
}