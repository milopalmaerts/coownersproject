import { NextResponse } from "next/server";
import { createServerSupabaseClient, hasSupabaseConfig } from "@/lib/supabase/server";

// Supabase's confirmation email links here with a `code` query param.
// Exchanging it for a session is what actually signs the user in —
// without this route, clicking the email link verifies the account on
// Supabase's side but leaves the browser signed out.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code && hasSupabaseConfig) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=Could not confirm email`);
}
