import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

export type ContactStatus = Database["public"]["Enums"]["contact_status"];

export type AdminMessage = {
  id: string;
  name: string;
  email: string;
  topic: string | null;
  orderNumber: string | null;
  message: string;
  status: ContactStatus;
  createdAt: string;
};

export type AdminSubscriber = {
  id: string;
  email: string;
  fullName: string | null;
  source: string | null;
  isActive: boolean;
  subscribedAt: string;
};

export const CONTACT_STATUSES: ContactStatus[] = [
  "new",
  "in_review",
  "resolved",
  "spam",
];

export async function getMessages(): Promise<AdminMessage[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("contact_messages")
    .select("id, name, email, topic, order_number, message, status, created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`getMessages: ${error.message}`);

  return (data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    topic: m.topic,
    orderNumber: m.order_number,
    message: m.message,
    status: m.status,
    createdAt: m.created_at,
  }));
}

export async function getSubscribers(): Promise<AdminSubscriber[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("newsletter_subscribers")
    .select("id, email, full_name, source, is_active, subscribed_at")
    .order("subscribed_at", { ascending: false });
  if (error) throw new Error(`getSubscribers: ${error.message}`);

  return (data ?? []).map((s) => ({
    id: s.id,
    email: s.email,
    fullName: s.full_name,
    source: s.source,
    isActive: s.is_active,
    subscribedAt: s.subscribed_at,
  }));
}
