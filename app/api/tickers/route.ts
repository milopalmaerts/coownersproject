import { NextResponse } from "next/server";
import { marketProvider } from "@/lib/providers";
import { checkRateLimit, clientIp } from "@/lib/rateLimit";

// Backs the client-side live price polling (PriceCard, market rows) — reads
// through the same cached provider used by the pages, so this doesn't add
// extra load on CoinGecko/Binance beyond their existing revalidate windows.
export async function GET(request: Request) {
  const { success } = await checkRateLimit(`tickers:${clientIp(request)}`);
  if (!success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

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
