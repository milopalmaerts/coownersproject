import Link from "next/link";
import { marketProvider } from "@/lib/providers";
import { getCurrentUser } from "@/lib/supabase/server";
import { WatchlistView } from "@/components/watchlist/WatchlistView";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default async function WatchlistPage() {
  const [assets, user] = await Promise.all([
    marketProvider.getAllTickers(),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 06 · Watchlist</p>
        <h1 className="text-xl font-bold text-tl-text-primary">Watchlist</h1>
        <p className="text-sm text-tl-text-secondary">
          {user ? (
            "Saved to your account — follows you across devices."
          ) : (
            <>
              Stored locally in this browser only.{" "}
              <Link href="/login" className="text-tl-accent hover:underline">
                Sign in
              </Link>{" "}
              to sync it across devices.
            </>
          )}
        </p>
      </div>
      <ScrollReveal>
        <WatchlistView allAssets={assets} />
      </ScrollReveal>
    </div>
  );
}
