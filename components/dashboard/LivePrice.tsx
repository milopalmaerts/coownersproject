"use client";

import { AssetTicker } from "@/lib/types";
import { PriceFlash } from "@/components/ui/PriceFlash";
import { useLiveTickers } from "@/lib/hooks/useLiveTickers";

// Standalone live price for a single asset (e.g. a featured dashboard card).
// For a list of many assets, call useLiveTickers() once at the list level
// instead and render <PriceFlash> per row to avoid one poll loop per row.
export function LivePrice({ initial }: { initial: AssetTicker }) {
  const liveTickers = useLiveTickers();
  const price = liveTickers?.get(initial.symbol)?.price ?? initial.price;
  return <PriceFlash price={price} />;
}
