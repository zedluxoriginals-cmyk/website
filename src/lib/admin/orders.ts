import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  email: string;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  itemCount: number;
  placedAt: string;
};

export type AdminOrderItem = {
  id: string;
  productTitle: string;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  imageUrl: string | null;
};

export type AdminOrderDetail = {
  id: string;
  orderNumber: string;
  email: string;
  phone: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentProvider: string | null;
  paymentReference: string | null;
  subtotal: number;
  shippingTotal: number;
  discountTotal: number;
  grandTotal: number;
  currency: string;
  notes: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  shippingAddress: Record<string, unknown> | null;
  placedAt: string;
  createdAt: string;
  items: AdminOrderItem[];
};

// Statuses an operator may set by hand. Payment-driven states (paid, refunded)
// are owned by the payment webhook — never mutated from the dashboard.
export const MANUAL_ORDER_STATUSES: OrderStatus[] = [
  "processing",
  "fulfilled",
  "cancelled",
];

export async function getAdminOrders(): Promise<AdminOrderListItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_number, email, grand_total, status, payment_status, placed_at, created_at, order_items ( id )",
    )
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getAdminOrders: ${error.message}`);

  type Row = {
    id: string;
    order_number: string;
    email: string;
    grand_total: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    placed_at: string | null;
    created_at: string;
    order_items: { id: string }[];
  };

  return ((data ?? []) as unknown as Row[]).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    email: o.email,
    grandTotal: o.grand_total,
    status: o.status,
    paymentStatus: o.payment_status,
    itemCount: o.order_items.length,
    placedAt: o.placed_at ?? o.created_at,
  }));
}

export async function getAdminOrder(id: string): Promise<AdminOrderDetail | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      `id, order_number, email, phone, status, payment_status, payment_provider,
       payment_reference, subtotal, shipping_total, discount_total, grand_total,
       currency, notes, tracking_number, tracking_url, shipping_address,
       placed_at, created_at,
       order_items ( id, product_title, variant_title, sku, quantity, unit_price, line_total, image_url )`,
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getAdminOrder: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    orderNumber: data.order_number,
    email: data.email,
    phone: data.phone,
    status: data.status,
    paymentStatus: data.payment_status,
    paymentProvider: data.payment_provider,
    paymentReference: data.payment_reference,
    subtotal: data.subtotal,
    shippingTotal: data.shipping_total,
    discountTotal: data.discount_total,
    grandTotal: data.grand_total,
    currency: data.currency,
    notes: data.notes,
    trackingNumber: data.tracking_number,
    trackingUrl: data.tracking_url,
    shippingAddress: data.shipping_address as Record<string, unknown> | null,
    placedAt: data.placed_at ?? data.created_at,
    createdAt: data.created_at,
    items: (data.order_items ?? []).map((i) => ({
      id: i.id,
      productTitle: i.product_title,
      variantTitle: i.variant_title,
      sku: i.sku,
      quantity: i.quantity,
      unitPrice: i.unit_price,
      lineTotal: i.line_total,
      imageUrl: i.image_url,
    })),
  };
}
