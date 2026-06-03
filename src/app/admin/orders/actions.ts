"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { MANUAL_ORDER_STATUSES, type OrderStatus } from "@/lib/admin/orders";

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

export async function updateOrderStatus(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const orderId = text(formData, "order_id");
  const status = String(formData.get("status") ?? "") as OrderStatus;
  if (!orderId) throw new Error("Order id is required.");
  if (!MANUAL_ORDER_STATUSES.includes(status)) {
    throw new Error("That status can't be set by hand.");
  }

  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) throw new Error(`update order status: ${error.message}`);

  await supabase.from("audit_log").insert({
    actor_id: admin.id,
    action: "order.status",
    entity_type: "order",
    entity_id: orderId,
    metadata: { status },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateOrderTracking(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const orderId = text(formData, "order_id");
  if (!orderId) throw new Error("Order id is required.");

  const { error } = await supabase
    .from("orders")
    .update({
      tracking_number: text(formData, "tracking_number"),
      tracking_url: text(formData, "tracking_url"),
      notes: text(formData, "notes"),
    })
    .eq("id", orderId);
  if (error) throw new Error(`update order tracking: ${error.message}`);

  await supabase.from("audit_log").insert({
    actor_id: admin.id,
    action: "order.tracking",
    entity_type: "order",
    entity_id: orderId,
    metadata: { tracking: text(formData, "tracking_number") },
  });

  revalidatePath(`/admin/orders/${orderId}`);
}
