/*
  Browser Supabase client (Client Components). Uses the public anon key —
  safe to ship to the browser because Row Level Security governs every table.
  NEVER import the service-role key here.
*/

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
