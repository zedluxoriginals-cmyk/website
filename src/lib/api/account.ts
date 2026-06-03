import "server-only";

/*
  Account read layer (Phase 8). Reads the logged-in user's profile, addresses,
  and order history. RLS guarantees a user only ever sees their own rows — these
  queries run as the authenticated user via the SSR client.
*/

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
  grandTotal: number;
  createdAt: string;
};

export type AccountAddress = {
  id: string;
  fullName: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  country: string;
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
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { profile: null, orders: [], addresses: [] };

  const [profileRes, ordersRes, addressesRes] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, phone").eq("id", user.id).maybeSingle(),
    supabase
      .from("orders")
      .select("id, order_number, status, grand_total, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("addresses").select("id, full_name, line1, line2, city, state, country"),
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
      grandTotal: o.grand_total,
      createdAt: o.created_at,
    })),
    addresses: (addressesRes.data ?? []).map((a) => ({
      id: a.id,
      fullName: a.full_name,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      country: a.country,
    })),
  };
}
