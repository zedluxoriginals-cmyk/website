"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { LATEST_BADGE, BESTSELLER_BADGE } from "@/lib/admin/homepage";

export async function toggleFeatured(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const productId = String(formData.get("product_id") ?? "").trim();
  const next = formData.get("next") === "on";
  if (!productId) throw new Error("Product is required.");

  const { error } = await supabase
    .from("products")
    .update({ is_featured: next })
    .eq("id", productId);
  if (error) throw new Error(`toggle featured: ${error.message}`);

  await supabase.from("audit_log").insert({
    actor_id: admin.id,
    action: "homepage.featured",
    entity_type: "product",
    entity_id: productId,
    metadata: { featured: next },
  });

  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

export async function setHomepageBadge(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const productId = String(formData.get("product_id") ?? "").trim();
  const slot = String(formData.get("slot") ?? ""); // "latest" | "bestseller" | "none"
  if (!productId) throw new Error("Product is required.");

  const badge =
    slot === "latest" ? LATEST_BADGE : slot === "bestseller" ? BESTSELLER_BADGE : null;

  const { error } = await supabase
    .from("products")
    .update({ badge })
    .eq("id", productId);
  if (error) throw new Error(`set homepage badge: ${error.message}`);

  await supabase.from("audit_log").insert({
    actor_id: admin.id,
    action: "homepage.badge",
    entity_type: "product",
    entity_id: productId,
    metadata: { slot },
  });

  revalidatePath("/admin/homepage");
  revalidatePath("/");
  revalidatePath("/shop");
}
