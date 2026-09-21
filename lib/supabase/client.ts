import { createBrowserClient } from "@supabase/ssr";

export const hasSupabaseConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Client-side Supabase client — safe to use in "use client" components. The
// anon key is public by design (Row Level Security in Postgres is what
// actually restricts access, not secrecy of this key).
export function createClient() {
  if (!hasSupabaseConfig) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not configured"
    );
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
