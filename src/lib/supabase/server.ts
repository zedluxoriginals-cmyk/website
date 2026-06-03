/*
  Server Supabase client (Server Components, Route Handlers, Server Actions).
  Reads/writes the auth session via Next's cookie store so RLS sees the
  logged-in user. Still uses the anon key — RLS enforces access. The
  service-role client lives separately (see ./admin.ts) and is server-only.

  Next 16: cookies() is async, so this factory is async.
*/

import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` called from a Server Component — safe to ignore when
            // middleware is responsible for refreshing the session cookie.
          }
        },
      },
    },
  );
}
