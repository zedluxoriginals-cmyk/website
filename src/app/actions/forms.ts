"use server";

/*
  Form submission server actions (Phase 8): contact message + newsletter
  signup. Both insert through the SSR (anon) client — RLS allows anonymous
  INSERT into contact_messages / newsletter_subscribers but NOT select, so
  submissions are write-only from the public side (admins read them).

  Light server-side validation here; a dedicated Edge Function with spam
  filtering can replace these in Phase 8B without changing the UI.
*/

import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FormResult = { ok: boolean; error?: string };

export async function submitContactMessage(
  _prev: FormResult | undefined,
  formData: FormData,
): Promise<FormResult> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const topic = String(formData.get("subject") ?? "").trim() || null;
  const orderNumber = String(formData.get("order") ?? "").trim() || null;
  const message = String(formData.get("message") ?? "").trim();

  if (!name) return { ok: false, error: "Please enter your name." };
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email." };
  if (!message) return { ok: false, error: "Please enter a message." };

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    topic,
    order_number: orderNumber,
    message,
  });
  if (error) return { ok: false, error: "Something went wrong. Please try again." };
  return { ok: true };
}

export async function subscribeNewsletter(
  _prev: FormResult | undefined,
  formData: FormData,
): Promise<FormResult> {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Please enter a valid email." };

  const supabase = await createClient();
  // Plain insert (anon can't upsert — RLS has no anon read/update path).
  // A duplicate email hits the unique constraint (23505); treat that as
  // success — they're already subscribed.
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email, source: "site-footer" });
  if (error && error.code !== "23505") {
    return { ok: false, error: "Something went wrong. Please try again." };
  }
  return { ok: true };
}
