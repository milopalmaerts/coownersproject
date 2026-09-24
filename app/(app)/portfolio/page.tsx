import { marketProvider } from "@/lib/providers";
import { getCurrentUser } from "@/lib/supabase/server";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default async function PortfolioPage() {
  const [assets, user] = await Promise.all([
    marketProvider.getAllTickers(),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 12 · Portfolio</p>
        <h1 className="text-xl font-bold text-tl-text-primary">Portfolio</h1>
        <p className="text-sm text-tl-text-secondary">
          Manual holdings tracking — no exchange connection, you enter what
          you hold and we compute live value and P&amp;L.
        </p>
      </div>
      <ScrollReveal>
        <PortfolioView userId={user?.id ?? null} assets={assets} />
      </ScrollReveal>
    </div>
  );
}
