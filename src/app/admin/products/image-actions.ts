"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function sourceTypeFor(url: string): string {
  return url.includes("res.cloudinary.com") ? "cloudinary-admin" : "admin-url";
}

async function audit(actorId: string, action: string, entityId: string, metadata: Record<string, unknown>) {
  const supabase = createAdminClient();
  await supabase.from("audit_log").insert({
    actor_id: actorId,
    action,
    entity_type: "image",
    entity_id: entityId,
    metadata,
  });
}

/** Add a photo to a product's gallery (from an upload or a pasted link). */
export async function addProductImage(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const productId = text(formData, "product_id");
  const url = text(formData, "url");
  if (!productId || !url) throw new Error("A photo is required.");

  // First photo on a product becomes the primary automatically.
  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);
  const isFirst = (count ?? 0) === 0;

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      url,
      alt_text: text(formData, "alt_text"),
      is_primary: isFirst,
      sort_order: count ?? 0,
      source_type: sourceTypeFor(url),
      production_ready: url.includes("res.cloudinary.com"),
    })
    .select("id")
    .single();
  if (error) throw new Error(`add photo: ${error.message}`);

  await audit(admin.id, "image.add", data.id, { productId });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}

/** Make one photo the main (primary) photo; unset the others. */
export async function setPrimaryImage(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const imageId = text(formData, "image_id");
  const productId = text(formData, "product_id");
  if (!imageId || !productId) throw new Error("Photo and product are required.");

  const { error: clearError } = await supabase
    .from("product_images")
    .update({ is_primary: false })
    .eq("product_id", productId);
  if (clearError) throw new Error(`clear primary: ${clearError.message}`);

  const { error } = await supabase
    .from("product_images")
    .update({ is_primary: true, sort_order: 0 })
    .eq("id", imageId);
  if (error) throw new Error(`set primary: ${error.message}`);

  await audit(admin.id, "image.primary", imageId, { productId });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}

/** Remove a photo from a product's gallery. */
export async function deleteProductImage(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const imageId = text(formData, "image_id");
  const productId = text(formData, "product_id");
  if (!imageId || !productId) throw new Error("Photo and product are required.");

  const { data: removed } = await supabase
    .from("product_images")
    .select("is_primary")
    .eq("id", imageId)
    .maybeSingle();

  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw new Error(`remove photo: ${error.message}`);

  // If we removed the main photo, promote the next one so the product still
  // shows something on the storefront.
  if (removed?.is_primary) {
    const { data: next } = await supabase
      .from("product_images")
      .select("id")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (next) {
      await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", next.id);
    }
  }

  await audit(admin.id, "image.delete", imageId, { productId });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}

/** Move a photo up or down in the gallery order. */
export async function reorderProductImage(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const imageId = text(formData, "image_id");
  const productId = text(formData, "product_id");
  const direction = String(formData.get("direction") ?? "");
  if (!imageId || !productId) throw new Error("Photo and product are required.");

  const { data: images, error } = await supabase
    .from("product_images")
    .select("id, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`reorder: ${error.message}`);

  const ordered = images ?? [];
  const index = ordered.findIndex((i) => i.id === imageId);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= ordered.length) return;

  // Reassign sort_order sequentially after the swap so values stay clean.
  [ordered[index], ordered[swapWith]] = [ordered[swapWith], ordered[index]];
  for (let i = 0; i < ordered.length; i++) {
    await supabase.from("product_images").update({ sort_order: i }).eq("id", ordered[i].id);
  }

  await audit(admin.id, "image.reorder", imageId, { productId, direction });
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
}
