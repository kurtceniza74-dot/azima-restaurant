import { cookies } from "next/headers";

import { isSameOriginRequest } from "@/lib/admin-auth";
import { guestOrderCookieName } from "@/lib/order-types";
import { createDraftOrder, createGuestCsrfToken, OrderStoreError } from "@/lib/order-store";
import { rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const limited = rateLimitResponse(request, "guest-order-create", 8, 10 * 60 * 1000);
  if (limited) return limited;
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  if (Number(request.headers.get("content-length") ?? 0) > 12_000) {
    return Response.json({ error: "Order request is too large." }, { status: 413 });
  }

  try {
    const body: unknown = await request.json();
    const { order, trackingToken } = await createDraftOrder(body);
    const cookieStore = await cookies();
    cookieStore.set(guestOrderCookieName(order.code), trackingToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: `/api/orders/${order.code}`,
      maxAge: 60 * 60 * 24 * 14,
    });

    return Response.json({ order, csrfToken: createGuestCsrfToken(order.code, trackingToken) }, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "Could not prepare this order." }, { status: 500 });
  }
}