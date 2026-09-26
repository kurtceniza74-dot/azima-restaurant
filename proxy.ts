import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Redirect plain HTTP to HTTPS in production, but never redirect loopback,
// health checks, API routes, or Next internals. Behind Render-style proxies,
// trust X-Forwarded-Proto only when the proxy host itself reports loopback.
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "::ffff:127.0.0.1"]);

export function proxy(request: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const host = request.headers.get("host")?.split(",")[0]?.trim().split(":")[0]?.toLowerCase();
  if (host && LOOPBACK_HOSTS.has(host)) return NextResponse.next();

  const path = request.nextUrl.pathname;
  if (path.startsWith("/api/") || path.startsWith("/_next/") || path === "/favicon.ico") {
    return NextResponse.next();
  }

  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  const protocol = forwardedProtocol ?? request.nextUrl.protocol.replace(":", "");
  if (protocol === "https") return NextResponse.next();

  const secureUrl = request.nextUrl.clone();
  secureUrl.protocol = "https:";
  return NextResponse.redirect(secureUrl, 308);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};