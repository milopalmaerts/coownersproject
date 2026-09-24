"use client";

import { useState } from "react";
import { JournalTrade } from "@/lib/journal/types";
import { groupStatsBy } from "@/lib/journal/calculations";
import { Card, CardHeader } from "@/components/ui/Card";

type BreakdownKey = "setup" | "asset" | "session" | "direction" | "timeframe";

const TABS: { key: BreakdownKey; label: string }[] = [
  { key: "setup", label: "By Setup" },
  { key: "asset", label: "By Asset" },
  { key: "session", label: "By Session" },
  { key: "direction", label: "By Direction" },
  { key: "timeframe", label: "By Timeframe" },
];

function keyFn(key: BreakdownKey) {
  return (t: JournalTrade) => {
    switch (key) {
      case "setup": return t.setup ?? "";
      case "asset": return t.asset;
      case "session": return t.session ?? "";
      case "direction": return t.direction;
      case "timeframe": return t.timeframe ?? "";
    }
  };
}

export function PerformanceBreakdown({ trades }: { trades: JournalTrade[] }) {
  const [tab, setTab] = useState<BreakdownKey>("setup");
  const groups = groupStatsBy(trades, keyFn(tab));

  return (
    <Card>
      <CardHeader title="Performance Breakdown" />
      <div className="flex flex-wrap gap-2 mb-3">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              tab === t.key
                ? "bg-tl-accent text-black border-tl-accent"
                : "border-tl-border text-tl-text-secondary hover:border-tl-accent/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-tl-text-muted border-b border-tl-border">
              <th className="px-2 py-2 font-medium">{TABS.find((t) => t.key === tab)?.label}</th>
              <th className="px-2 py-2 font-medium">Trades</th>
              <th className="px-2 py-2 font-medium">Win Rate</th>
              <th className="px-2 py-2 font-medium">Total R</th>
              <th className="px-2 py-2 font-medium">Avg R</th>
              <th className="px-2 py-2 font-medium">Avg Win</th>
              <th className="px-2 py-2 font-medium">Avg Loss</th>
              <th className="px-2 py-2 font-medium">Expectancy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tl-border">
            {groups.map((g) => (
              <tr key={g.key} className="hover:bg-white/[0.03]">
                <td className="px-2 py-2 font-medium text-tl-text-primary">{g.key || "—"}</td>
                <td className="px-2 py-2 text-tl-text-secondary">{g.stats.totalTrades}</td>
                <td className="px-2 py-2 text-tl-text-secondary">{g.stats.winRate.toFixed(1)}%</td>
                <td className={`px-2 py-2 tl-mono font-semibold ${g.stats.totalR >= 0 ? "text-tl-positive" : "text-tl-negative"}`}>
                  {g.stats.totalR >= 0 ? "+" : ""}
                  {g.stats.totalR.toFixed(2)}R
                </td>
                <td className="px-2 py-2 tl-mono text-tl-text-secondary">
                  {g.stats.avgR >= 0 ? "+" : ""}
                  {g.stats.avgR.toFixed(2)}R
                </td>
                <td className="px-2 py-2 tl-mono text-tl-positive">+{g.stats.avgWinR.toFixed(2)}R</td>
                <td className="px-2 py-2 tl-mono text-tl-negative">{g.stats.avgLossR.toFixed(2)}R</td>
                <td className="px-2 py-2 tl-mono text-tl-text-secondary">
                  {g.stats.expectancy >= 0 ? "+" : ""}
                  {g.stats.expectancy.toFixed(2)}R
                </td>
              </tr>
            ))}
            {groups.length === 0 && (
              <tr>
                <td colSpan={8} className="px-2 py-8 text-center text-tl-text-muted">
                  No trades yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
