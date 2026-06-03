import "server-only";

/*
  Product read layer (Phase 8). Server-only — queries the hosted Supabase DB
  via the anon/SSR client (RLS allows public read of active products). Rows
  are mapped to the existing frontend `Product` shape so page components and
  ProductCard/Grid keep working unchanged.

  Price: DB stores numeric base_price (whole Naira) → formatted to the "₦.."
  display string the UI expects, via lib/money.

  These are read with the SSR server client so pages stay server-rendered.
*/

import { createClient } from "@/lib/supabase/server";
import { formatCents } from "@/lib/money";
import type { Product, Badge } from "@/data/types";

// Shape of the nested select we run for a full product.
type DbVariant = {
  color_name: string | null;
  color_hex: string | null;
  size: string | null;
  is_active: boolean;
};
type DbImage = { url: string; sort_order: number; is_primary: boolean };
type DbCategory = { categories: { slug: string } | null };
type DbProduct = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  base_price: number;
  badge: string | null;
  is_featured: boolean;
  published_at: string | null;
  product_variants: DbVariant[];
  product_images: DbImage[];
  product_categories: DbCategory[];
};

const PRODUCT_SELECT = `
  id, slug, title, description, base_price, badge, is_featured, published_at,
  product_variants ( color_name, color_hex, size, is_active ),
  product_images ( url, sort_order, is_primary ),
  product_categories ( categories ( slug ) )
`;

// DB row → frontend Product. Dedupes colors/sizes from variants, orders
// images (primary first, then sort_order), and formats the price.
function mapProduct(row: DbProduct): Product {
  const images = [...row.product_images]
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
    .map((i) => i.url);

  const colorMap = new Map<string, { name: string; hex: string }>();
  const sizeSet = new Set<string>();
  for (const v of row.product_variants) {
    if (!v.is_active) continue;
    if (v.color_name) {
      colorMap.set(v.color_name, { name: v.color_name, hex: v.color_hex ?? "#111111" });
    }
    if (v.size) sizeSet.add(v.size);
  }

  // First category slug (FE Product carries a single category).
  const category = row.product_categories.find((pc) => pc.categories)?.categories?.slug ?? "";

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    price: formatCents(Math.round(row.base_price * 100)),
    category,
    images: images.length > 0 ? images : ["/assets/ig/black_logo_tee_model.jpg"],
    colors: [...colorMap.values()],
    sizes: [...sizeSet],
    badge: (row.badge as Badge) ?? undefined,
    description: row.description ?? "",
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .order("published_at", { ascending: false });
  if (error) throw new Error(`getAllProducts: ${error.message}`);
  return (data as unknown as DbProduct[]).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "active")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getProductBySlug: ${error.message}`);
  return data ? mapProduct(data as unknown as DbProduct) : null;
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.category === categorySlug);
}

// Homepage curation: featured first, else newest. Returns up to `limit`.
export async function getFeaturedProducts(limit = 6): Promise<Product[]> {
  const all = await getAllProducts();
  const featured = all.filter((p) => p.badge || p.category);
  return (featured.length >= limit ? featured : all).slice(0, limit);
}

// Phase 1 search: case-insensitive over title/description (ilike), then
// widened client-side over category/color so the UX matches the old mock.
export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim();
  if (!q) return [];
  const all = await getAllProducts();
  const needle = q.toLowerCase();
  return all.filter((p) =>
    [p.title, p.category, p.badge ?? "", ...p.colors.map((c) => c.name)]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );
}

export async function getAllProductSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("slug")
    .eq("status", "active");
  if (error) throw new Error(`getAllProductSlugs: ${error.message}`);
  return (data ?? []).map((r) => r.slug);
}
