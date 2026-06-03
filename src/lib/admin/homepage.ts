import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

/*
  Homepage curation. Rather than a separate table, the storefront homepage is
  driven by fields already on each product:
    • Featured Campaign  → is_featured = true
    • Latest Arrivals    → badge = "NEW"
    • Best Sellers       → badge = "BESTSELLER"
  The admin curation screen just toggles these on active products, so what the
  shopper sees on the homepage stays a one-click decision for the operator.
*/

export const LATEST_BADGE = "NEW";
export const BESTSELLER_BADGE = "BESTSELLER";

export type CurationProduct = {
  id: string;
  title: string;
  imageUrl: string | null;
  isFeatured: boolean;
  isLatest: boolean;
  isBestSeller: boolean;
};

export async function getCurationProducts(): Promise<CurationProduct[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, title, badge, is_featured, status, product_images ( url, is_primary, sort_order )")
    .eq("status", "active")
    .order("title", { ascending: true });
  if (error) throw new Error(`getCurationProducts: ${error.message}`);

  type Row = {
    id: string;
    title: string;
    badge: string | null;
    is_featured: boolean;
    product_images: { url: string; is_primary: boolean; sort_order: number }[];
  };

  return ((data ?? []) as unknown as Row[]).map((p) => {
    const image = [...p.product_images].sort(
      (a, b) =>
        Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
    )[0];
    return {
      id: p.id,
      title: p.title,
      imageUrl: image?.url ?? null,
      isFeatured: p.is_featured,
      isLatest: p.badge === LATEST_BADGE,
      isBestSeller: p.badge === BESTSELLER_BADGE,
    };
  });
}
