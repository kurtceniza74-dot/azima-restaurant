export type Fulfillment = "Dine in" | "Takeaway";
export type OrderStatus = "draft" | "submitted" | "confirmed" | "rejected" | "delivered";

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PublicOrder {
  code: string;
  items: OrderItem[];
  fulfillment: Fulfillment;
  subtotal: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}

export interface AdminSession {
  username: string;
  expiresAt: number;
  csrfToken: string;
}

export const guestOrderCookieName = (code: string) => `rogers-order-${code}`;