import "server-only";

/*
  Service-role Supabase client — BYPASSES Row Level Security. Use ONLY in
  trusted server contexts (Route Handlers, Server Actions, Edge Functions) for
  privileged operations: checkout total recalculation, payment-webhook
  processing, admin product/content writes (Phase 8 / 9B).

  The `server-only` import above makes the build FAIL if this module is ever
  imported into a Client Component, so the service-role key can never reach
  the browser. Do not add "use client" anywhere up this import chain.
*/

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL for the admin client.",
    );
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
