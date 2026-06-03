import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type AdminVariant = {
  id: string;
  label: string;
  size: string | null;
  colorName: string | null;
  sku: string | null;
  price: number | null;
  stock: number;
  lowStockThreshold: number;
  isActive: boolean;
  isLow: boolean;
};

export type AdminImage = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

export async function getProductImages(productId: string): Promise<AdminImage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_images")
    .select("id, url, alt_text, is_primary, sort_order")
    .eq("product_id", productId)
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getProductImages: ${error.message}`);

  return (data ?? []).map((i) => ({
    id: i.id,
    url: i.url,
    altText: i.alt_text,
    isPrimary: i.is_primary,
    sortOrder: i.sort_order,
  }));
}

export async function getProductVariants(productId: string): Promise<AdminVariant[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_variants")
    .select(
      "id, title, size, color_name, sku, price, stock_quantity, low_stock_threshold, is_active",
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`getProductVariants: ${error.message}`);

  return (data ?? []).map((v) => ({
    id: v.id,
    label:
      v.title ??
      [v.color_name, v.size].filter(Boolean).join(" / ") ??
      "Variant",
    size: v.size,
    colorName: v.color_name,
    sku: v.sku,
    price: v.price,
    stock: v.stock_quantity,
    lowStockThreshold: v.low_stock_threshold,
    isActive: v.is_active,
    isLow: v.is_active && v.stock_quantity <= v.low_stock_threshold,
  }));
}
