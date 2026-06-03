"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";

function text(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value.length > 0 ? value : null;
}

function intOf(formData: FormData, key: string, fallback: number): number {
  const parsed = Number(String(formData.get(key) ?? "").replaceAll(",", "").trim());
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : fallback;
}

export async function updateStoreSettings(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const announcement = text(formData, "announcement_text") ?? "";
  const supportEmail = text(formData, "support_email");
  if (!supportEmail) throw new Error("A support email is required.");

  // Single-row table keyed on id = true; upsert keeps it to one row.
  const { error } = await supabase.from("store_settings").upsert(
    {
      id: true,
      announcement_text: announcement,
      support_email: supportEmail,
      support_phone: text(formData, "support_phone"),
      store_hours: text(formData, "store_hours"),
      returns_window_days: intOf(formData, "returns_window_days", 14),
      free_shipping_threshold: intOf(formData, "free_shipping_threshold", 150000),
    },
    { onConflict: "id" },
  );
  if (error) throw new Error(`update settings: ${error.message}`);

  await supabase.from("audit_log").insert({
    actor_id: admin.id,
    action: "settings.update",
    entity_type: "settings",
    entity_id: null,
    metadata: { supportEmail },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}
