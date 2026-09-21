import Link from "next/link";
import { signOutAction } from "@/lib/auth/actions";

export function AccountMenu({ email }: { email: string | null }) {
  if (!email) {
    return (
      <Link
        href="/login"
        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-tl-border text-tl-text-secondary hover:border-tl-accent/50 hover:text-tl-text-primary transition-colors"
      >
        Sign in
      </Link>
    );
  }

  return (
    <form action={signOutAction} className="flex items-center gap-2">
      <span className="hidden lg:inline text-xs text-tl-text-muted max-w-32 truncate">
        {email}
      </span>
      <button
        type="submit"
        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-tl-border text-tl-text-secondary hover:border-tl-negative/50 hover:text-tl-negative transition-colors"
      >
        Sign out
      </button>
    </form>
  );
}
