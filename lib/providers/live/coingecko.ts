const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";

interface CoinGeckoMarketEntry {
  id: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
}

interface CoinGeckoGlobalResponse {
  data: {
    total_market_cap: Record<string, number>;
    total_volume: Record<string, number>;
    market_cap_percentage: Record<string, number>;
  };
}

function apiKeyHeaders(): HeadersInit {
  const apiKey = process.env.MARKET_API_KEY;
  return apiKey ? { "x-cg-demo-api-key": apiKey } : {};
}

async function coingeckoFetch<T>(path: string, revalidateSeconds: number): Promise<T> {
  const res = await fetch(`${COINGECKO_BASE_URL}${path}`, {
    headers: apiKeyHeaders(),
    next: { revalidate: revalidateSeconds },
  });

  if (!res.ok) {
    throw new Error(`CoinGecko request failed: ${res.status} ${path}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchCoinGeckoMarkets(
  coingeckoIds: string[]
): Promise<Map<string, CoinGeckoMarketEntry>> {
  const ids = coingeckoIds.join(",");
  const entries = await coingeckoFetch<CoinGeckoMarketEntry[]>(
    `/coins/markets?vs_currency=usd&ids=${encodeURIComponent(ids)}&price_change_percentage=24h`,
    30
  );

  return new Map(entries.map((entry) => [entry.id, entry]));
}

export async function fetchCoinGeckoGlobal(): Promise<{
  totalMarketCap: number;
  btcDominancePct: number;
  totalVolume24h: number;
}> {
  const { data } = await coingeckoFetch<CoinGeckoGlobalResponse>("/global", 60);

  return {
    totalMarketCap: data.total_market_cap.usd,
    totalVolume24h: data.total_volume.usd,
    btcDominancePct: data.market_cap_percentage.btc,
  };
}

export type { CoinGeckoMarketEntry };
