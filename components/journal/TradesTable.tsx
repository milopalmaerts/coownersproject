"use client";

import { useMemo, useState } from "react";
import { JournalTrade } from "@/lib/journal/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type PresetKey =
  | "all" | "today" | "week" | "month" | "winners" | "losers"
  | "breakeven" | "highestR" | "biggestLosses" | "ruleViolations";

const PRESETS: { key: PresetKey; label: string }[] = [
  { key: "all", label: "All Trades" },
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
  { key: "winners", label: "Winners" },
  { key: "losers", label: "Losers" },
  { key: "breakeven", label: "Break Even" },
  { key: "highestR", label: "Highest R" },
  { key: "biggestLosses", label: "Biggest Losses" },
  { key: "ruleViolations", label: "Rule Violations" },
];

function isSameWeek(date: Date, ref: Date): boolean {
  const d = new Date(ref);
  d.setDate(ref.getDate() - ref.getDay());
  d.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setDate(d.getDate() + 7);
  return date >= d && date < end;
}

export function TradesTable({
  trades,
  onEdit,
  onDelete,
}: {
  trades: JournalTrade[];
  onEdit: (trade: JournalTrade) => void;
  onDelete: (id: string) => void;
}) {
  const [preset, setPreset] = useState<PresetKey>("all");
  const [assetFilter, setAssetFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState<"" | "long" | "short">("");

  const filtered = useMemo(() => {
    const now = new Date();
    let list = [...trades];

    switch (preset) {
      case "today":
        list = list.filter((t) => t.trade_date === now.toISOString().slice(0, 10));
        break;
      case "week":
        list = list.filter((t) => isSameWeek(new Date(t.trade_date), now));
        break;
      case "month":
        list = list.filter((t) => {
          const d = new Date(t.trade_date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });
        break;
      case "winners":
        list = list.filter((t) => t.outcome === "win");
        break;
      case "losers":
        list = list.filter((t) => t.outcome === "loss");
        break;
      case "breakeven":
        list = list.filter((t) => t.outcome === "breakeven");
        break;
      case "highestR":
        list = [...list].sort((a, b) => b.result_r - a.result_r).slice(0, 20);
        break;
      case "biggestLosses":
        list = [...list].sort((a, b) => a.result_r - b.result_r).slice(0, 20);
        break;
      case "ruleViolations":
        list = list.filter((t) => t.rule_followed === "no" || t.rule_followed === "partially");
        break;
      default:
        break;
    }

    if (assetFilter) {
      list = list.filter((t) => t.asset.toLowerCase().includes(assetFilter.toLowerCase()));
    }
    if (directionFilter) {
      list = list.filter((t) => t.direction === directionFilter);
    }

    return list;
  }, [trades, preset, assetFilter, directionFilter]);

  return (
    <Card>
      <CardHeader title="Trades" />
      <div className="flex flex-wrap gap-2 mb-3">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              preset === p.key
                ? "bg-tl-accent text-black border-tl-accent"
                : "border-tl-border text-tl-text-secondary hover:border-tl-accent/50"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        <input
          value={assetFilter}
          onChange={(e) => setAssetFilter(e.target.value)}
          placeholder="Filter by asset…"
          className="rounded-lg border border-tl-border bg-tl-bg-card px-3 py-1.5 text-xs text-tl-text-primary placeholder:text-tl-text-muted"
        />
        <select
          value={directionFilter}
          onChange={(e) => setDirectionFilter(e.target.value as "" | "long" | "short")}
          className="rounded-lg border border-tl-border bg-tl-bg-card px-3 py-1.5 text-xs text-tl-text-primary"
        >
          <option value="">Long &amp; Short</option>
          <option value="long">Long only</option>
          <option value="short">Short only</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-tl-text-muted border-b border-tl-border">
              <th className="px-2 py-2 font-medium">Date</th>
              <th className="px-2 py-2 font-medium">Asset</th>
              <th className="px-2 py-2 font-medium">Dir</th>
              <th className="px-2 py-2 font-medium">Setup</th>
              <th className="px-2 py-2 font-medium">Result</th>
              <th className="px-2 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-tl-border">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-white/[0.03]">
                <td className="px-2 py-2 text-tl-text-secondary whitespace-nowrap">{t.trade_date}</td>
                <td className="px-2 py-2 font-medium text-tl-text-primary">{t.asset}</td>
                <td className="px-2 py-2">
                  <Badge tone={t.direction === "long" ? "positive" : "negative"}>{t.direction}</Badge>
                </td>
                <td className="px-2 py-2 text-tl-text-secondary">{t.setup || "—"}</td>
                <td className="px-2 py-2">
                  <span
                    className={`tl-mono font-semibold ${
                      t.outcome === "win" ? "text-tl-positive" : t.outcome === "loss" ? "text-tl-negative" : "text-tl-text-secondary"
                    }`}
                  >
                    {t.result_r >= 0 ? "+" : ""}
                    {t.result_r.toFixed(2)}R
                  </span>
                </td>
                <td className="px-2 py-2 text-right whitespace-nowrap">
                  <button onClick={() => onEdit(t)} className="text-xs text-tl-accent hover:underline mr-3">
                    Edit
                  </button>
                  <button onClick={() => onDelete(t.id)} className="text-xs text-tl-text-muted hover:text-tl-negative">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-2 py-8 text-center text-tl-text-muted">
                  No trades match this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
