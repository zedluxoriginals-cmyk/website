"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function text(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v.length > 0 ? v : null;
}

export async function addAddress(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const fullName = text(formData, "full_name");
  const line1 = text(formData, "line1");
  const city = text(formData, "city");
  if (!fullName || !line1 || !city) throw new Error("Name, address line 1, and city are required.");

  const makeDefault = formData.get("is_default") === "on";

  if (makeDefault) {
    // Unset existing defaults.
    await supabase
      .from("addresses")
      .update({ is_default_shipping: false, is_default_billing: false })
      .eq("user_id", user.id);
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    full_name: fullName,
    line1,
    line2: text(formData, "line2"),
    city,
    state: text(formData, "state"),
    country: text(formData, "country") ?? "Nigeria",
    phone: text(formData, "phone"),
    postal_code: text(formData, "postal_code"),
    label: text(formData, "label"),
    is_default_shipping: makeDefault,
    is_default_billing: makeDefault,
  });

  if (error) throw new Error(`Could not save address: ${error.message}`);
  revalidatePath("/account");
}

export async function deleteAddress(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const addressId = text(formData, "address_id");
  if (!addressId) throw new Error("Address id is required.");

  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) throw new Error(`Could not remove address: ${error.message}`);
  revalidatePath("/account");
}

export async function setDefaultAddress(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const addressId = text(formData, "address_id");
  if (!addressId) throw new Error("Address id is required.");

  // Clear all defaults first.
  await supabase
    .from("addresses")
    .update({ is_default_shipping: false, is_default_billing: false })
    .eq("user_id", user.id);

  // Set the new default.
  const { error } = await supabase
    .from("addresses")
    .update({ is_default_shipping: true, is_default_billing: true })
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) throw new Error(`Could not update default: ${error.message}`);
  revalidatePath("/account");
}
