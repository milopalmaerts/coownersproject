import { notFound } from "next/navigation";
import {
  derivativesProvider,
  marketProvider,
  newsProvider,
  whaleProvider,
} from "@/lib/providers";
import { UnknownAssetError } from "@/lib/errors";
import { formatPrice, formatRelativeTime, formatUsd } from "@/lib/format";
import { Timeframe } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { CandleChart } from "@/components/markets/CandleChart";
import { TimeframeSelector } from "@/components/markets/TimeframeSelector";
import { NewsList } from "@/components/news/NewsList";
import { WatchlistStarButton } from "@/components/watchlist/WatchlistStarButton";
import { LiveTradeTape } from "@/components/markets/LiveTradeTape";
import { LivePrice } from "@/components/dashboard/LivePrice";
import { LivePctBadge } from "@/components/dashboard/LivePctBadge";

const VALID_TIMEFRAMES: Timeframe[] = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"];

export default async function CoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ tf?: string }>;
}) {
  const { symbol } = await params;
  const { tf } = await searchParams;
  const timeframe: Timeframe = VALID_TIMEFRAMES.includes(tf as Timeframe)
    ? (tf as Timeframe)
    : "1H";

  let ticker;
  try {
    ticker = await marketProvider.getTicker(symbol);
  } catch (err) {
    if (err instanceof UnknownAssetError) {
      notFound();
    }
    throw err;
  }

  const newsPromise = newsProvider.getNewsBySymbol(symbol, 5).catch(() => null);
  const whalePromise = whaleProvider
    .getLargeTransactionsBySymbol(symbol, 5)
    .catch(() => []);
  const fundingPromise = derivativesProvider.getFundingRates().catch(() => []);

  const [candles] = await Promise.all([
    marketProvider.getHistoricalData(symbol, timeframe),
  ]);
  const news = await newsPromise;
  const whaleTxs = await whalePromise;
  const funding = await fundingPromise;

  const symbolFunding = funding.find(
    (f) => f.symbol.toLowerCase() === symbol.toLowerCase()
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-tl-text-muted">{ticker.name}</div>
          <h1 className="text-2xl font-bold text-tl-text-primary flex items-center gap-2">
            {ticker.symbol}
            <WatchlistStarButton symbol={ticker.symbol} />
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tabular-nums">
            <LivePrice initial={ticker} />
          </span>
          <LivePctBadge initial={ticker} />
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardHeader title="Chart" />
          <TimeframeSelector symbol={ticker.symbol} active={timeframe} />
        </div>
        <CandleChart candles={candles} />
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-xs text-tl-text-muted">24H High</div>
          <div className="mt-1 font-semibold tabular-nums">
            {formatPrice(ticker.high24h)}
          </div>
        </Card>
        <Card>
          <div className="text-xs text-tl-text-muted">24H Low</div>
          <div className="mt-1 font-semibold tabular-nums">
            {formatPrice(ticker.low24h)}
          </div>
        </Card>
        <Card>
          <div className="text-xs text-tl-text-muted">Volume</div>
          <div className="mt-1 font-semibold tabular-nums">
            {formatUsd(ticker.volume24h)}
          </div>
        </Card>
        <Card>
          <div className="text-xs text-tl-text-muted">Market Cap</div>
          <div className="mt-1 font-semibold tabular-nums">
            {formatUsd(ticker.marketCap)}
          </div>
        </Card>
        {symbolFunding && (
          <>
            <Card>
              <div className="text-xs text-tl-text-muted">Funding Rate</div>
              <div className="mt-1 font-semibold tabular-nums">
                {symbolFunding.fundingRatePct.toFixed(4)}%
              </div>
            </Card>
            <Card>
              <div className="text-xs text-tl-text-muted">Open Interest</div>
              <div className="mt-1 font-semibold tabular-nums">
                {formatUsd(symbolFunding.openInterest)}
              </div>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <NewsList
          title="Latest News"
          news={news ?? []}
          unavailable={news === null}
        />

        <Card>
          <CardHeader title="Whale Activity" />
          {whaleTxs.length === 0 ? (
            <p className="text-sm text-tl-text-muted">
              No recent large transactions.
            </p>
          ) : (
            <ul className="space-y-3">
              {whaleTxs.map((tx) => (
                <li key={tx.id} className="text-sm">
                  <div className="text-tl-text-primary font-medium">
                    {formatUsd(tx.usdValue)}
                  </div>
                  <div className="text-xs text-tl-text-secondary">
                    {tx.fromLabel} → {tx.toLabel}
                  </div>
                  <div className="text-xs text-tl-text-muted">
                    {formatRelativeTime(tx.timestamp)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <LiveTradeTape symbol={ticker.symbol} />
      </div>
    </div>
  );
}
