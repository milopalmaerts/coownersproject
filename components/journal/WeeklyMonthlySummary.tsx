"use client";

import { useState } from "react";
import { JournalTrade } from "@/lib/journal/types";
import { computeStats, groupStatsBy } from "@/lib/journal/calculations";
import { Card, CardHeader } from "@/components/ui/Card";

function weekKey(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}
function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function WeeklyMonthlySummary({ trades }: { trades: JournalTrade[] }) {
  const [period, setPeriod] = useState<"week" | "month">("week");

  const groups = new Map<string, JournalTrade[]>();
  for (const t of trades) {
    const key = period === "week" ? weekKey(new Date(t.trade_date)) : monthKey(new Date(t.trade_date));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }

  const rows = Array.from(groups.entries())
    .map(([key, groupTrades]) => {
      const stats = computeStats(groupTrades);
      const bySetup = groupStatsBy(groupTrades, (t) => t.setup ?? "");
      const byAsset = groupStatsBy(groupTrades, (t) => t.asset);
      const violations = groupTrades.filter((t) => t.rule_followed === "no" || t.rule_followed === "partially").length;
      const mistakes = groupTrades.map((t) => t.mistakes).filter(Boolean) as string[];
      return {
        key,
        stats,
        bestSetup: bySetup[0]?.key ?? "—",
        worstSetup: bySetup[bySetup.length - 1]?.key ?? "—",
        bestAsset: byAsset[0]?.key ?? "—",
        violations,
        mistakeCount: mistakes.length,
      };
    })
    .sort((a, b) => b.key.localeCompare(a.key));

  return (
    <Card>
      <CardHeader title={period === "week" ? "Weekly Summary" : "Monthly Summary"} />
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setPeriod("week")}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            period === "week" ? "bg-tl-accent text-black border-tl-accent" : "border-tl-border text-tl-text-secondary"
          }`}
        >
          Weekly
        </button>
        <button
          onClick={() => setPeriod("month")}
          className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
            period === "month" ? "bg-tl-accent text-black border-tl-accent" : "border-tl-border text-tl-text-secondary"
          }`}
        >
          Monthly
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-tl-text-muted border-b border-tl-border">
              <th className="px-2 py-2 font-medium">{period === "week" ? "Week of" : "Month"}</th>
              <th className="px-2 py-2 font-medium">Trades</th>
              <th className="px-2 py-2 font-medium">Total R</th>
              <th className="px-2 py-2 font-medium">Avg R</th>
              <th className="px-2 py-2 font-medium">Win Rate</th>
              <th className="px-2 py-2 font-medium">Expectancy</th>
              <th className="px-2 py-2 font-medium">Max DD</th>
              <th className="px-2 py-2 font-medium">Best Setup</th>
              <th className="px-2 py-2 font-medium">Best Asset</th>
              <th className="px-2 py-2 font-medium">Violations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tl-border">
            {rows.map((r) => (
              <tr key={r.key} className="hover:bg-white/[0.03]">
                <td className="px-2 py-2 text-tl-text-primary">{r.key}</td>
                <td className="px-2 py-2 text-tl-text-secondary">{r.stats.totalTrades}</td>
                <td className={`px-2 py-2 tl-mono font-semibold ${r.stats.totalR >= 0 ? "text-tl-positive" : "text-tl-negative"}`}>
                  {r.stats.totalR >= 0 ? "+" : ""}
                  {r.stats.totalR.toFixed(2)}R
                </td>
                <td className="px-2 py-2 tl-mono text-tl-text-secondary">{r.stats.avgR.toFixed(2)}R</td>
                <td className="px-2 py-2 text-tl-text-secondary">{r.stats.winRate.toFixed(1)}%</td>
                <td className="px-2 py-2 tl-mono text-tl-text-secondary">{r.stats.expectancy.toFixed(2)}R</td>
                <td className="px-2 py-2 tl-mono text-tl-negative">-{r.stats.maxDrawdown.toFixed(2)}R</td>
                <td className="px-2 py-2 text-tl-text-secondary">{r.bestSetup}</td>
                <td className="px-2 py-2 text-tl-text-secondary">{r.bestAsset}</td>
                <td className="px-2 py-2 text-tl-text-secondary">{r.violations}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={10} className="px-2 py-8 text-center text-tl-text-muted">
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
