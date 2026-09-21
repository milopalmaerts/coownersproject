import { marketProvider } from "@/lib/providers";
import { MarketsTable } from "@/components/markets/MarketsTable";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default async function MarketsPage() {
  const tickers = await marketProvider.getAllTickers();

  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 02 · Scanner</p>
        <h1 className="text-xl font-bold text-tl-text-primary">Markets</h1>
        <p className="text-sm text-tl-text-secondary">
          Browse all tracked assets, filter and search.
        </p>
      </div>
      <ScrollReveal>
        <MarketsTable assets={tickers} />
      </ScrollReveal>
    </div>
  );
}
