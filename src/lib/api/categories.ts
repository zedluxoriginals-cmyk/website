import "server-only";

/*
  Category read layer (Phase 8). Maps DB category rows to the frontend
  `Category` shape. Public read of active categories (RLS).
*/

import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/data/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("slug, name, image_url, description")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(`getCategories: ${error.message}`);
  return (data ?? []).map((c) => ({
    slug: c.slug,
    title: c.name,
    image: c.image_url ?? "/assets/ig/black_logo_tee_model.jpg",
    description: c.description ?? undefined,
  }));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const cats = await getCategories();
  return cats.find((c) => c.slug === slug) ?? null;
}
