"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import type { Database, Json } from "@/lib/supabase/database.types";

type ProductStatus = Database["public"]["Enums"]["product_status"];

const STATUSES = new Set<ProductStatus>(["draft", "active", "archived"]);

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function money(formData: FormData, key: string): number | null {
  const value = String(formData.get(key) ?? "").replaceAll(",", "").trim();
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function statusFrom(formData: FormData): ProductStatus {
  const value = String(formData.get("status") ?? "draft");
  return STATUSES.has(value as ProductStatus) ? (value as ProductStatus) : "draft";
}

async function audit(actorId: string, action: string, entityId: string, metadata: Json) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("audit_log").insert({
    actor_id: actorId,
    action,
    entity_type: "product",
    entity_id: entityId,
    metadata,
  });
  if (error) throw new Error(`audit_log: ${error.message}`);
}

async function setProductCategory(productId: string, categoryId: string | null) {
  const supabase = createAdminClient();
  const { error: deleteError } = await supabase
    .from("product_categories")
    .delete()
    .eq("product_id", productId);
  if (deleteError) throw new Error(`delete product category: ${deleteError.message}`);

  if (!categoryId) return;

  const { error } = await supabase.from("product_categories").insert({
    product_id: productId,
    category_id: categoryId,
  });
  if (error) throw new Error(`insert product category: ${error.message}`);
}

async function setPrimaryImage(productId: string, imageUrl: string | null, altText: string) {
  if (!imageUrl) return;
  const supabase = createAdminClient();
  const { data: existing, error: existingError } = await supabase
    .from("product_images")
    .select("id")
    .eq("product_id", productId)
    .eq("is_primary", true)
    .limit(1)
    .maybeSingle();
  if (existingError) throw new Error(`select primary image: ${existingError.message}`);

  const row = {
    url: imageUrl,
    alt_text: altText,
    is_primary: true,
    sort_order: 0,
    source_type: imageUrl.includes("res.cloudinary.com") ? "cloudinary-admin" : "admin-url",
    production_ready: imageUrl.includes("res.cloudinary.com"),
  };

  if (existing) {
    const { error } = await supabase.from("product_images").update(row).eq("id", existing.id);
    if (error) throw new Error(`update primary image: ${error.message}`);
    return;
  }

  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    ...row,
  });
  if (error) throw new Error(`insert primary image: ${error.message}`);
}

export async function createProduct(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const title = text(formData, "title");
  if (!title) throw new Error("Product title is required.");
  const basePrice = money(formData, "base_price");
  if (basePrice === null) throw new Error("A valid base price is required.");

  const slug = slugify(text(formData, "slug") ?? title);
  const status = statusFrom(formData);
  const imageUrl = text(formData, "primary_image_url");
  const categoryId = text(formData, "category_id");

  const { data, error } = await supabase
    .from("products")
    .insert({
      title,
      slug,
      subtitle: text(formData, "subtitle"),
      description: text(formData, "description"),
      base_price: basePrice,
      compare_at_price: money(formData, "compare_at_price"),
      status,
      badge: text(formData, "badge"),
      is_featured: formData.get("is_featured") === "on",
      material: text(formData, "material"),
      fit_notes: text(formData, "fit_notes"),
      care_instructions: text(formData, "care_instructions"),
      published_at: status === "active" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (error) throw new Error(`create product: ${error.message}`);

  await setProductCategory(data.id, categoryId);
  await setPrimaryImage(data.id, imageUrl, title);
  await audit(admin.id, "product.create", data.id, { title, slug, status });

  revalidatePath("/admin");
  revalidatePath("/shop");
  redirect(`/admin/products/${data.id}`);
}

export async function updateProduct(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const productId = text(formData, "product_id");
  const title = text(formData, "title");
  const basePrice = money(formData, "base_price");
  if (!productId || !title || basePrice === null) throw new Error("Product id, title, and price are required.");

  const status = statusFrom(formData);
  const imageUrl = text(formData, "primary_image_url");
  const categoryId = text(formData, "category_id");

  const { error } = await supabase
    .from("products")
    .update({
      title,
      slug: slugify(text(formData, "slug") ?? title),
      subtitle: text(formData, "subtitle"),
      description: text(formData, "description"),
      base_price: basePrice,
      compare_at_price: money(formData, "compare_at_price"),
      status,
      badge: text(formData, "badge"),
      is_featured: formData.get("is_featured") === "on",
      material: text(formData, "material"),
      fit_notes: text(formData, "fit_notes"),
      care_instructions: text(formData, "care_instructions"),
      published_at: status === "active" ? new Date().toISOString() : null,
    })
    .eq("id", productId);
  if (error) throw new Error(`update product: ${error.message}`);

  await setProductCategory(productId, categoryId);
  await setPrimaryImage(productId, imageUrl, title);
  await audit(admin.id, "product.update", productId, { title, status });

  revalidatePath("/admin");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  redirect(`/admin/products/${productId}`);
}

export async function setProductStatus(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();
  const productId = text(formData, "product_id");
  const status = statusFrom(formData);
  if (!productId) throw new Error("Product id is required.");

  const { error } = await supabase
    .from("products")
    .update({
      status,
      published_at: status === "active" ? new Date().toISOString() : null,
    })
    .eq("id", productId);
  if (error) throw new Error(`set product status: ${error.message}`);

  await audit(admin.id, "product.status", productId, { status });
  revalidatePath("/admin");
  revalidatePath("/shop");
}
