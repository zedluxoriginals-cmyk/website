import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type StoreSettings = {
  announcementText: string;
  supportEmail: string;
  supportPhone: string | null;
  storeHours: string | null;
  returnsWindowDays: number;
  freeShippingThreshold: number;
  currency: string;
};

// store_settings is a single-row table keyed by a boolean `id` (true).
export async function getStoreSettings(): Promise<StoreSettings | null> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select(
      "announcement_text, support_email, support_phone, store_hours, returns_window_days, free_shipping_threshold, currency",
    )
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getStoreSettings: ${error.message}`);
  if (!data) return null;

  return {
    announcementText: data.announcement_text,
    supportEmail: data.support_email,
    supportPhone: data.support_phone,
    storeHours: data.store_hours,
    returnsWindowDays: data.returns_window_days,
    freeShippingThreshold: data.free_shipping_threshold,
    currency: data.currency,
  };
}
