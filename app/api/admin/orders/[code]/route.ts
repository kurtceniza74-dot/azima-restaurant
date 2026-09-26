import { isAdminAuthenticated, isSameOriginRequest, verifyAdminCsrfToken } from "@/lib/admin-auth";
import { OrderStoreError, updateAdminOrder } from "@/lib/order-store";
import { rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function PATCH(request: Request, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  const limited = rateLimitResponse(request, "admin-order-update", 30, 60 * 1000);
  if (limited) return limited;
  if (!isSameOriginRequest(request)) {
    return Response.json({ error: "Request origin is not allowed." }, { status: 403 });
  }
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Admin login required." }, { status: 401 });
  }
  if (!(await verifyAdminCsrfToken(request.headers.get("x-csrf-token")))) {
    return Response.json({ error: "Admin session expired. Sign in again." }, { status: 403 });
  }

  try {
    const body = await request.json() as { status?: unknown };
    const order = await updateAdminOrder(code, body.status);
    return Response.json({ order }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof OrderStoreError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    return Response.json({ error: "Could not update this order." }, { status: 500 });
  }
}