import { DerivativesStats } from "@/lib/types";
import { formatUsd } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";

export function DerivativesStatsTable({ stats }: { stats: DerivativesStats[] }) {
  return (
    <Card>
      <CardHeader title="Funding Rates & Open Interest" />
      <p className="text-xs text-tl-text-muted mb-3">
        Live from Hyperliquid perpetuals — no key needed.
      </p>
      {stats.length === 0 ? (
        <p className="text-sm text-tl-text-muted">Unavailable right now.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-tl-text-muted border-b border-tl-border">
              <th className="py-2 font-medium">Asset</th>
              <th className="py-2 font-medium">Funding Rate</th>
              <th className="py-2 font-medium">Open Interest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tl-border">
            {stats.map((s) => (
              <tr key={s.symbol}>
                <td className="py-2 font-medium text-tl-text-primary">{s.symbol}</td>
                <td
                  className={`py-2 tabular-nums ${s.fundingRatePct >= 0 ? "text-tl-positive" : "text-tl-negative"}`}
                >
                  {s.fundingRatePct.toFixed(4)}%
                </td>
                <td className="py-2 tabular-nums text-tl-text-secondary">
                  {formatUsd(s.openInterest)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
