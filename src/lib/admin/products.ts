import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

type ProductStatus = Database["public"]["Enums"]["product_status"];

type ProductListRow = {
  id: string;
  slug: string;
  title: string;
  status: ProductStatus;
  badge: string | null;
  basePrice: number;
  isFeatured: boolean;
  updatedAt: string;
  imageUrl: string | null;
  categoryName: string | null;
  stockTotal: number;
  variantCount: number;
};

export type AdminProductListItem = ProductListRow;

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
};

export type AdminProductDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  status: ProductStatus;
  badge: string | null;
  basePrice: number;
  compareAtPrice: number | null;
  isFeatured: boolean;
  material: string | null;
  fitNotes: string | null;
  careInstructions: string | null;
  categoryId: string | null;
  primaryImageUrl: string | null;
};

type RawAdminProduct = {
  id: string;
  slug: string;
  title: string;
  status: ProductStatus;
  badge: string | null;
  base_price: number;
  is_featured: boolean;
  updated_at: string;
  product_images: { url: string; is_primary: boolean; sort_order: number }[];
  product_variants: { stock_quantity: number }[];
  product_categories: { categories: { name: string } | null }[];
};

const LIST_SELECT = `
  id, slug, title, status, badge, base_price, is_featured, updated_at,
  product_images ( url, is_primary, sort_order ),
  product_variants ( stock_quantity ),
  product_categories ( categories ( name ) )
`;

export async function getAdminDashboard() {
  const supabase = createAdminClient();
  const [products, orders, messages, subscribers] = await Promise.all([
    supabase.from("products").select("id, status"),
    supabase.from("orders").select("id, status"),
    supabase.from("contact_messages").select("id, status"),
    supabase.from("newsletter_subscribers").select("id"),
  ]);

  if (products.error) throw new Error(products.error.message);
  if (orders.error) throw new Error(orders.error.message);
  if (messages.error) throw new Error(messages.error.message);
  if (subscribers.error) throw new Error(subscribers.error.message);

  const productRows = products.data ?? [];
  return {
    products: productRows.length,
    activeProducts: productRows.filter((p) => p.status === "active").length,
    draftProducts: productRows.filter((p) => p.status === "draft").length,
    orders: orders.data?.length ?? 0,
    unreadMessages: (messages.data ?? []).filter((m) => m.status === "new").length,
    subscribers: subscribers.data?.length ?? 0,
  };
}

export async function getAdminProducts(): Promise<AdminProductListItem[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(LIST_SELECT)
    .order("updated_at", { ascending: false });
  if (error) throw new Error(`getAdminProducts: ${error.message}`);

  return ((data ?? []) as unknown as RawAdminProduct[]).map((product) => {
    const image = [...product.product_images].sort(
      (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
    )[0];

    return {
      id: product.id,
      slug: product.slug,
      title: product.title,
      status: product.status,
      badge: product.badge,
      basePrice: product.base_price,
      isFeatured: product.is_featured,
      updatedAt: product.updated_at,
      imageUrl: image?.url ?? null,
      categoryName: product.product_categories[0]?.categories?.name ?? null,
      stockTotal: product.product_variants.reduce((sum, v) => sum + v.stock_quantity, 0),
      variantCount: product.product_variants.length,
    };
  });
}

export async function getAdminCategories(): Promise<AdminCategory[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw new Error(`getAdminCategories: ${error.message}`);
  return data ?? [];
}

export async function getAdminProduct(id: string): Promise<AdminProductDetail | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, slug, title, subtitle, description, status, badge, base_price, compare_at_price,
      is_featured, material, fit_notes, care_instructions,
      product_images ( url, is_primary, sort_order ),
      product_categories ( category_id )
    `)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getAdminProduct: ${error.message}`);
  if (!data) return null;

  const image = [...data.product_images].sort(
    (a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order,
  )[0];

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
    status: data.status,
    badge: data.badge,
    basePrice: data.base_price,
    compareAtPrice: data.compare_at_price,
    isFeatured: data.is_featured,
    material: data.material,
    fitNotes: data.fit_notes,
    careInstructions: data.care_instructions,
    categoryId: data.product_categories[0]?.category_id ?? null,
    primaryImageUrl: image?.url ?? null,
  };
}
