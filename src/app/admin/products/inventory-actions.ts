"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function intOf(formData: FormData, key: string, fallback = 0): number {
  const parsed = Number(String(formData.get(key) ?? "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : fallback;
}

function moneyOrNull(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").replaceAll(",", "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

async function audit(actorId: string, action: string, entityId: string, metadata: Record<string, unknown>) {
  const supabase = createAdminClient();
  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action,
    entity_type: "variant",
    entity_id: entityId,
    metadata,
  });
}

/** Update stock + threshold + active flag for one existing variant. */
export async function updateVariantStock(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const variantId = text(formData, "variant_id");
  const productId = text(formData, "product_id");
  if (!variantId || !productId) throw new Error("Variant and product are required.");

  const stock = intOf(formData, "stock_quantity");
  const threshold = intOf(formData, "low_stock_threshold", 3);

  const { error } = await supabase
    .from("product_variants")
    .update({
      stock_quantity: stock,
      low_stock_threshold: threshold,
      is_active: formData.get("is_active") === "on",
    })
    .eq("id", variantId);
  if (error) throw new Error(`update variant stock: ${error.message}`);

  await audit(admin.id, "variant.stock", variantId, { stock, threshold });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin");
  revalidatePath("/shop");
}

/** Add a new size/colour option to a product. */
export async function addVariant(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const productId = text(formData, "product_id");
  if (!productId) throw new Error("Product is required.");

  const size = text(formData, "size");
  const colorName = text(formData, "color_name");
  if (!size && !colorName) throw new Error("Add at least a size or a colour.");

  const { data, error } = await supabase
    .from("product_variants")
    .insert({
      product_id: productId,
      size,
      color_name: colorName,
      sku: text(formData, "sku"),
      price: moneyOrNull(formData, "price"),
      stock_quantity: intOf(formData, "stock_quantity"),
      low_stock_threshold: intOf(formData, "low_stock_threshold", 3),
    })
    .select("id")
    .single();
  if (error) throw new Error(`add variant: ${error.message}`);

  await audit(admin.id, "variant.create", data.id, { size, colorName });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}

/** Remove a size/colour option entirely. */
export async function deleteVariant(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const variantId = text(formData, "variant_id");
  const productId = text(formData, "product_id");
  if (!variantId || !productId) throw new Error("Variant and product are required.");

  const { error } = await supabase.from("product_variants").delete().eq("id", variantId);
  if (error) throw new Error(`delete variant: ${error.message}`);

  await audit(admin.id, "variant.delete", variantId, {});
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}
