import "server-only";

import { createClient } from "@/lib/supabase/server";

export type AccountProfile = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
};

export type AccountOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  grandTotal: number;
  placedAt: string;
};

export type AccountAddress = {
  id: string;
  label: string | null;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  country: string;
  phone: string | null;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getAccountData(): Promise<{
  profile: AccountProfile | null;
  orders: AccountOrder[];
  addresses: AccountAddress[];
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { profile: null, orders: [], addresses: [] };

  const [profileRes, ordersRes, addressesRes] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, phone").eq("id", user.id).maybeSingle(),
    supabase
      .from("orders")
      .select("id, order_number, status, payment_status, grand_total, placed_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("addresses")
      .select("id, label, full_name, line1, line2, city, state, country, phone, is_default_shipping, is_default_billing")
      .eq("user_id", user.id)
      .order("is_default_shipping", { ascending: false }),
  ]);

  return {
    profile: profileRes.data
      ? {
          id: profileRes.data.id,
          email: profileRes.data.email,
          fullName: profileRes.data.full_name,
          phone: profileRes.data.phone,
        }
      : { id: user.id, email: user.email ?? "", fullName: null, phone: null },
    orders: (ordersRes.data ?? []).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      status: o.status,
      paymentStatus: o.payment_status,
      grandTotal: o.grand_total,
      placedAt: o.placed_at ?? o.created_at,
    })),
    addresses: (addressesRes.data ?? []).map((a) => ({
      id: a.id,
      label: a.label,
      fullName: a.full_name,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      country: a.country,
      phone: a.phone,
      isDefaultShipping: a.is_default_shipping,
      isDefaultBilling: a.is_default_billing,
    })),
  };
}
