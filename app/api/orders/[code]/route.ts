import { cookies } from "next/headers";

import { guestOrderCookieName } from "@/lib/order-types";
import { createGuestCsrfToken, getGuestOrder, OrderStoreError, submitGuestOrder, verifyGuestCsrfToken } from "@/lib/order-store";
import { isSameOriginRequest } from "@/lib/admin-auth";
import { rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const limited = rateLimitResponse(request, "guest-order-status", 60, 60 * 1000, code);
  if (limited) return limited;
  if (!/^[A-Za-z]{4}$/.test(code)) return Response.json({ error: "Order not found." }, { status: 404 });

  const trackingToken = (await cookies()).get(guestOrderCookieName(code))?.value;
  if (!trackingToken) return Response.json({ error: "Order not found." }, { status: 404 });
  const order = await getGuestOrder(code, trackingToken);
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
  return Response.json({ order, csrfToken: createGuestCsrfToken(code, trackingToken) }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const limited = rateLimitResponse(request, "guest-order-submit", 8, 10 * 60 * 1000, code);
  if (limited) return limited;
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  if (!/^[A-Za-z]{4}$/.test(code)) return Response.json({ error: "Order not found." }, { status: 404 });

  const trackingToken = (await cookies()).get(guestOrderCookieName(code))?.value;
  if (!trackingToken) return Response.json({ error: "Order not found." }, { status: 404 });
  if (!verifyGuestCsrfToken(code, trackingToken, request.headers.get("x-csrf-token"))) {
    return Response.json({ error: "Order session expired. Refresh the page and try again." }, { status: 403 });
  }

  try {
    const body = await request.json() as { action?: unknown };
    if (body.action !== "submit") return Response.json({ error: "Invalid order action." }, { status: 400 });
    const order = await submitGuestOrder(code, trackingToken);
    return Response.json({ order }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "Could not update this order." }, { status: 500 });
  }
}