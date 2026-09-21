// Hyperliquid's Info API — public, free, no key, no signup. Used for real
// funding rates and open interest. See https://hyperliquid.gitbook.io
const HYPERLIQUID_INFO_URL = "https://api.hyperliquid.xyz/info";

interface HyperliquidUniverseAsset {
  name: string;
  isDelisted?: boolean;
}

interface HyperliquidAssetCtx {
  funding: string;
  openInterest: string; // base asset units, e.g. BTC
  markPx: string;
}

type MetaAndAssetCtxsResponse = [
  { universe: HyperliquidUniverseAsset[] },
  HyperliquidAssetCtx[],
];

export interface HyperliquidStats {
  symbol: string;
  fundingRatePct: number;
  openInterestUsd: number;
  markPrice: number;
}

export async function fetchHyperliquidStats(): Promise<HyperliquidStats[]> {
  const res = await fetch(HYPERLIQUID_INFO_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "metaAndAssetCtxs" }),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Hyperliquid info request failed: ${res.status}`);
  }

  const [{ universe }, ctxs] = (await res.json()) as MetaAndAssetCtxsResponse;

  return universe
    .map((asset, index) => {
      const ctx = ctxs[index];
      if (!ctx) return null;
      const markPrice = Number(ctx.markPx);
      return {
        symbol: asset.name,
        fundingRatePct: Number(ctx.funding) * 100,
        openInterestUsd: Number(ctx.openInterest) * markPrice,
        markPrice,
      };
    })
    .filter((s): s is HyperliquidStats => s !== null);
}
