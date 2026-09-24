import { marketProvider } from "@/lib/providers";
import { getCurrentUser } from "@/lib/supabase/server";
import { PredictionsList } from "@/components/predictions/PredictionsList";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default async function PredictionsPage() {
  const [assets, user] = await Promise.all([
    marketProvider.getAllTickers(),
    getCurrentUser(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 13 · Public Calls</p>
        <h1 className="text-xl font-bold text-tl-text-primary">Predictions</h1>
        <p className="text-sm text-tl-text-secondary">
          Timestamped, public, permanent calls — no editing or deleting after
          posting. A verifiable track record, not just talk.
        </p>
      </div>
      <ScrollReveal>
        <PredictionsList userId={user?.id ?? null} assets={assets} />
      </ScrollReveal>
    </div>
  );
}
