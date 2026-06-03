import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];

export type DashboardStats = {
  // Sales (paid orders only)
  revenueAllTime: number;
  revenue30: number;
  revenue7: number;
  revenueToday: number;
  paidOrders: number;
  pendingPayments: number;
  averageOrderValue: number;
  // Catalogue
  products: number;
  activeProducts: number;
  draftProducts: number;
  // Operations
  openOrders: number;
  lowStockCount: number;
  unreadMessages: number;
  subscribers: number;
};

export type LowStockItem = {
  productId: string;
  productTitle: string;
  variantLabel: string;
  stock: number;
  threshold: number;
};

export type ActivityItem = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  actorName: string | null;
  createdAt: string;
  metadata: Record<string, unknown> | null;
};

const PAID: PaymentStatus = "paid";
// Orders still needing operator attention (paid/processing but not shipped).
const OPEN_STATUSES: OrderStatus[] = ["paid", "processing"];

function startOf(daysAgo: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = createAdminClient();

  const [products, orders, messages, subscribers, variants] = await Promise.all([
    supabase.from("products").select("id, status"),
    supabase
      .from("orders")
      .select("grand_total, status, payment_status, placed_at, created_at"),
    supabase.from("contact_messages").select("id, status"),
    supabase.from("newsletter_subscribers").select("id, is_active"),
    supabase
      .from("product_variants")
      .select("stock_quantity, low_stock_threshold, is_active"),
  ]);

  for (const r of [products, orders, messages, subscribers, variants]) {
    if (r.error) throw new Error(r.error.message);
  }

  const productRows = products.data ?? [];
  const orderRows = orders.data ?? [];
  const variantRows = variants.data ?? [];

  const todayStart = startOf(0);
  const start7 = startOf(7);
  const start30 = startOf(30);

  const paidRows = orderRows.filter((o) => o.payment_status === PAID);
  const paidWhen = (o: (typeof orderRows)[number]) => o.placed_at ?? o.created_at;
  const sumSince = (since: string) =>
    paidRows
      .filter((o) => paidWhen(o) >= since)
      .reduce((sum, o) => sum + Number(o.grand_total ?? 0), 0);

  const revenueAllTime = paidRows.reduce(
    (sum, o) => sum + Number(o.grand_total ?? 0),
    0,
  );

  return {
    revenueAllTime,
    revenue30: sumSince(start30),
    revenue7: sumSince(start7),
    revenueToday: sumSince(todayStart),
    paidOrders: paidRows.length,
    pendingPayments: orderRows.filter((o) => o.payment_status === "pending")
      .length,
    averageOrderValue: paidRows.length
      ? Math.round(revenueAllTime / paidRows.length)
      : 0,
    products: productRows.length,
    activeProducts: productRows.filter((p) => p.status === "active").length,
    draftProducts: productRows.filter((p) => p.status === "draft").length,
    openOrders: orderRows.filter((o) =>
      OPEN_STATUSES.includes(o.status as OrderStatus),
    ).length,
    lowStockCount: variantRows.filter(
      (v) => v.is_active && v.stock_quantity <= v.low_stock_threshold,
    ).length,
    unreadMessages: (messages.data ?? []).filter((m) => m.status === "new")
      .length,
    subscribers: (subscribers.data ?? []).filter((s) => s.is_active).length,
  };
}

export async function getLowStockItems(limit = 8): Promise<LowStockItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "stock_quantity, low_stock_threshold, size, color_name, title, is_active, products ( id, title )",
    )
    .eq("is_active", true)
    .order("stock_quantity", { ascending: true });
  if (error) throw new Error(`getLowStockItems: ${error.message}`);

  type Row = {
    stock_quantity: number;
    low_stock_threshold: number;
    size: string | null;
    color_name: string | null;
    title: string | null;
    products: { id: string; title: string } | null;
  };

  return ((data ?? []) as unknown as Row[])
    .filter((v) => v.stock_quantity <= v.low_stock_threshold && v.products)
    .slice(0, limit)
    .map((v) => ({
      productId: v.products!.id,
      productTitle: v.products!.title,
      variantLabel:
        v.title ??
        [v.color_name, v.size].filter(Boolean).join(" / ") ??
        "Variant",
      stock: v.stock_quantity,
      threshold: v.low_stock_threshold,
    }));
}

export async function getRecentActivity(limit = 10): Promise<ActivityItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("audit_log")
    .select("id, action, entity_type, entity_id, created_at, metadata, profiles ( full_name, email )")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getRecentActivity: ${error.message}`);

  type Row = {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    created_at: string;
    metadata: Record<string, unknown> | null;
    profiles: { full_name: string | null; email: string } | null;
  };

  return ((data ?? []) as unknown as Row[]).map((r) => ({
    id: r.id,
    action: r.action,
    entityType: r.entity_type,
    entityId: r.entity_id,
    actorName: r.profiles?.full_name ?? r.profiles?.email ?? null,
    createdAt: r.created_at,
    metadata: r.metadata,
  }));
}
