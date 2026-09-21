import { hasEtherscanApiKey, isDemoMode, whaleProvider } from "@/lib/providers";
import { formatRelativeTime, formatUsd } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { WHALE_THRESHOLDS, isMegaWhale } from "@/lib/whaleThresholds";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const DEFAULT_THRESHOLDS = WHALE_THRESHOLDS;

export default async function WhalesPage() {
  const transactions = await whaleProvider.getLargeTransactions(20);

  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 04 · Whale Watch</p>
        <h1 className="text-xl font-bold text-tl-text-primary">
          Whale Monitor
        </h1>
        <p className="text-sm text-tl-text-secondary">
          Large on-chain transactions detected by scanning the latest BTC and
          ETH blocks. We have no address-labeling database, so a transaction
          is never described as a &quot;buy&quot; or &quot;sell&quot;, and
          both sides show as &quot;Unknown wallet&quot;. Other tracked
          assets (SOL, LINK, AVAX, XRP, DOGE, ADA) aren&apos;t monitored yet.
        </p>
        {!isDemoMode && !hasEtherscanApiKey && (
          <p className="text-xs text-tl-warning mt-2">
            ETHERSCAN_API_KEY isn&apos;t set — showing BTC only. Get a free
            key at etherscan.io/apis to also detect ETH whale transactions.
          </p>
        )}
      </div>

      <ScrollReveal>
      <Card>
        <CardHeader title="Alert Thresholds" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(DEFAULT_THRESHOLDS).map(([symbol, thresholds]) => (
            <div key={symbol} className="flex items-center gap-3">
              <span className="font-medium w-14">{symbol}</span>
              <div className="flex gap-2 flex-wrap">
                {thresholds.map((t) => (
                  <Badge key={t} tone="neutral">
                    {formatUsd(t)}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-tl-text-muted mt-3">
          Thresholds are configurable per asset in Settings (coming soon).
        </p>
      </Card>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
      <Card>
        <CardHeader title="Large Transactions" />
        {transactions.length === 0 ? (
          <p className="text-sm text-tl-text-muted">
            No transactions above threshold in the latest scanned block(s).
            Whale-sized transfers don&apos;t happen every block — check back
            shortly.
          </p>
        ) : (
        <ul className="divide-y divide-tl-border">
          {transactions.map((tx) => {
            const mega = isMegaWhale(tx.symbol, tx.usdValue);
            return (
            <li
              key={tx.id}
              className={`py-3 px-2 -mx-2 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 ${
                mega ? "tl-mega-whale border" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🐋</span>
                <div>
                  <div className="font-medium text-tl-text-primary flex items-center gap-2">
                    {tx.symbol} · {formatUsd(tx.usdValue)}
                    {mega && <Badge tone="warning">MEGA WHALE</Badge>}
                  </div>
                  <div className="text-xs text-tl-text-secondary">
                    {tx.fromLabel} → {tx.toLabel}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-tl-text-muted">
                  {formatRelativeTime(tx.timestamp)}
                </span>
                <a
                  href={tx.txUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-tl-accent hover:underline"
                >
                  View transaction
                </a>
              </div>
            </li>
            );
          })}
        </ul>
        )}
      </Card>
      </ScrollReveal>
    </div>
  );
}
