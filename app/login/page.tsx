import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";
import { hasSupabaseConfig } from "@/lib/supabase/client";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <span className="text-tl-accent text-xl">◆</span>
        <span className="font-semibold tracking-wide text-tl-text-primary">
          TRADING<span className="text-tl-accent">LEGENDS</span>
        </span>
      </Link>

      {!hasSupabaseConfig ? (
        <p className="text-sm text-tl-text-muted max-w-sm text-center">
          Accounts aren&apos;t configured on this deployment yet.
        </p>
      ) : (
        <LoginForm />
      )}

      <Link
        href="/dashboard"
        className="text-xs text-tl-text-muted hover:text-tl-text-secondary mt-8"
      >
        Continue without an account →
      </Link>
    </div>
  );
}
