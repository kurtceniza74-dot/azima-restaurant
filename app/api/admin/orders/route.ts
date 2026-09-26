import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listAdminOrders } from "@/lib/order-store";
import { rateLimitResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const limited = rateLimitResponse(request, "admin-orders-read", 60, 60 * 1000);
  if (limited) return limited;
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Admin login required." }, { status: 401 });
  }

  try {
    return Response.json({ orders: await listAdminOrders() }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json({ error: "Could not load orders." }, { status: 500 });
  }
}