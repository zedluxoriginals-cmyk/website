/*
  Session refresh for the Next middleware. @supabase/ssr needs to read and
  rewrite auth cookies on each request so server-side getUser() stays valid.
  Wire this from `middleware.ts` at the app root (added in Phase 8 when auth
  goes live). Kept here so the auth plumbing lives in one place.
*/

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Touch the session so the cookie is refreshed if needed.
  await supabase.auth.getUser();

  return response;
}
