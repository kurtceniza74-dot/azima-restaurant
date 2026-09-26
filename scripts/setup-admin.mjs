import { randomBytes, scryptSync } from "node:crypto";
import { existsSync } from "node:fs";
import { chmod, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

function askMasked(prompt) {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    return Promise.reject(new Error("Run this setup command in an interactive terminal."));
  }

  return new Promise((resolve, reject) => {
    let value = "";
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();

    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.pause();
      stdin.off("data", onData);
    };

    const onData = (chunk) => {
      for (const character of chunk.toString("utf8")) {
        if (character === "\u0003") {
          cleanup();
          reject(new Error("Setup cancelled."));
          return;
        }
        if (character === "\r" || character === "\n") {
          cleanup();
          stdout.write("\n");
          resolve(value);
          return;
        }
        if (character === "\u007f" || character === "\b") {
          if (value.length > 0) value = value.slice(0, -1);
          continue;
        }
        value += character;
        stdout.write("*");
      }
    };

    stdin.on("data", onData);
  });
}

function upsertEnvValue(contents, key, value) {
  const lines = contents.split(/\r?\n/);
  const index = lines.findIndex((line) => line.startsWith(`${key}=`));
  if (index === -1) lines.push(`${key}=${value}`);
  else lines[index] = `${key}=${value}`;
  return lines.join("\n").replace(/\n*$/, "\n");
}

const usernameReader = createInterface({ input: stdin, output: stdout });
const username = await usernameReader.question("Admin username (3-40 letters, numbers, dots, dashes, or underscores): ");
usernameReader.close();

if (!/^[A-Za-z0-9._-]{3,40}$/.test(username)) {
  console.error("Username format is invalid.");
  process.exit(1);
}

const password = await askMasked("Admin password (12+ characters): ");
const passwordConfirmation = await askMasked("Confirm admin password: ");
if (password.length < 12 || password !== passwordConfirmation) {
  console.error("Passwords must match and contain at least 12 characters.");
  process.exit(1);
}

const salt = randomBytes(16);
const passwordHash = `scrypt$${salt.toString("base64url")}$${scryptSync(password, salt, 64).toString("base64url")}`;
const sessionSecret = randomBytes(32).toString("base64url");
const envPath = ".env.local";
let envContents = "";

try {
  envContents = await readFile(envPath, "utf8");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

for (const [key, value] of Object.entries({
  ROGERS_ADMIN_USERNAME: username,
  ROGERS_ADMIN_PASSWORD_HASH: passwordHash,
  ROGERS_ADMIN_SESSION_SECRET: sessionSecret,
})) {
  envContents = upsertEnvValue(envContents, key, value);
}

await writeFile(envPath, envContents, { encoding: "utf8", mode: 0o600 });
await chmod(envPath, 0o600);

// Also write a runtime store so login works immediately, without restarting the
// server. It lives in the gitignored .data/ directory (same place as the SQLite
// file) so the session signing secret never sits inside the source tree, and
// lib/admin-auth.ts reads it before falling back to the environment variables.
const dataDirectory = ".data";
const credentialsPath = join(dataDirectory, "admin-credentials.json");
const legacyCredentialsPath = join("lib", "admin-credentials.json");

await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
await writeFile(
  credentialsPath,
  JSON.stringify(
    {
      username,
      passwordHash,
      sessionSecret,
      updatedAt: new Date().toISOString(),
    },
    null,
    2
  ),
  { encoding: "utf8", mode: 0o600 }
);
await chmod(credentialsPath, 0o600);

// Older installs kept a second copy of these secrets inside lib/: remove it so
// only one store holds the signing secret.
if (existsSync(legacyCredentialsPath)) {
  await rm(legacyCredentialsPath, { force: true });
  console.log(`Removed the legacy ${legacyCredentialsPath} copy of these secrets.`);
}

console.log("Admin credentials saved successfully! You can now log into /admin.");
console.log(
  "Keep the password somewhere safe: only a scrypt hash is stored, so it cannot be recovered. Run this command again to rotate it."
);