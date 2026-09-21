"use client";

import { AssetTicker } from "@/lib/types";
import { PctBadge } from "@/components/ui/Badge";
import { useLiveTickers } from "@/lib/hooks/useLiveTickers";

export function LivePctBadge({ initial }: { initial: AssetTicker }) {
  const liveTickers = useLiveTickers();
  const changePct = liveTickers?.get(initial.symbol)?.change24hPct ?? initial.change24hPct;
  return <PctBadge value={changePct} />;
}
