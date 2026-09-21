import { NextResponse } from "next/server";
import { marketProvider } from "@/lib/providers";

// Backs the client-side live price polling (PriceCard, market rows) — reads
// through the same cached provider used by the pages, so this doesn't add
// extra load on CoinGecko/Binance beyond their existing revalidate windows.
export async function GET() {
  try {
    const tickers = await marketProvider.getAllTickers();
    return NextResponse.json({ tickers });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load tickers" },
      { status: 502 }
    );
  }
}
