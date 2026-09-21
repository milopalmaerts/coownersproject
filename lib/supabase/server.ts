import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { hasSupabaseConfig } from "@/lib/supabase/client";

export { hasSupabaseConfig };

export async function getCurrentUser() {
  if (!hasSupabaseConfig) return null;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Server-side Supabase client for Server Components / Route Handlers —
// reads the session from cookies (kept fresh by middleware.ts).
export async function createServerSupabaseClient() {
  if (!hasSupabaseConfig) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured"
    );
  }

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
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component that can't set cookies —
            // middleware.ts refreshes the session instead, so this is safe.
          }
        },
      },
    }
  );
}
