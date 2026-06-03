"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/auth";
import { CONTACT_STATUSES, type ContactStatus } from "@/lib/admin/inbox";

export async function setMessageStatus(formData: FormData) {
  const admin = await requireAdmin();
  const supabase = createAdminClient();

  const messageId = String(formData.get("message_id") ?? "").trim();
  const status = String(formData.get("status") ?? "") as ContactStatus;
  if (!messageId) throw new Error("Message id is required.");
  if (!CONTACT_STATUSES.includes(status)) throw new Error("Unknown status.");

  const { error } = await supabase
    .from("contact_messages")
    .update({ status })
    .eq("id", messageId);
  if (error) throw new Error(`set message status: ${error.message}`);

  await supabase.from("audit_log").insert({
    actor_id: admin.id,
    action: "message.status",
    entity_type: "message",
    entity_id: messageId,
    metadata: { status },
  });

  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
}
