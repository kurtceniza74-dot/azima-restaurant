import { cookies } from "next/headers";

import {
  adminAuthConfigured,
  adminSessionCookieName,
  adminSessionLifetimeSeconds,
  createAdminSession,
  isSameOriginRequest,
  readAdminSession,
  verifyAdminCredentials,
  verifyAdminCsrfToken,
} from "@/lib/admin-auth";
import { rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const limited = rateLimitResponse(request, "admin-session-read", 60, 60 * 1000);
  if (limited) return limited;

  const session = await readAdminSession();
  return Response.json({
    configured: adminAuthConfigured(),
    authenticated: session !== null,
    csrfToken: session?.csrfToken ?? null,
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const limited = rateLimitResponse(request, "admin-login", 5, 15 * 60 * 1000);
  if (limited) return limited;
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  if (!adminAuthConfigured()) {
    return Response.json({ error: "Admin login is not configured on this server." }, { status: 503 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 2_000) {
    return Response.json({ error: "Login request is too large." }, { status: 413 });
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Enter your admin username and password." }, { status: 400 });
  }
  if (
    typeof body.username !== "string" || body.username.length > 64 ||
    typeof body.password !== "string" || body.password.length > 256 ||
    !verifyAdminCredentials(body.username, body.password)
  ) {
    return Response.json({ error: "Those admin details were not recognized." }, { status: 401 });
  }

  const created = createAdminSession(body.username);
  if (!created) {
    return Response.json({ error: "Admin login is not configured on this server." }, { status: 503 });
  }

  const { token, session } = created;
  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: adminSessionLifetimeSeconds,
  });

  return Response.json({ authenticated: true, csrfToken: session.csrfToken });
}

export async function DELETE(request: Request) {
  const limited = rateLimitResponse(request, "admin-logout", 10, 60 * 1000);
  if (limited) return limited;
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  if (!(await verifyAdminCsrfToken(request.headers.get("x-csrf-token")))) {
    return Response.json({ error: "Admin session expired. Sign in again." }, { status: 403 });
  }

  (await cookies()).delete(adminSessionCookieName);
  return Response.json({ authenticated: false });
}