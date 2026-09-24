"use client";

import { useState } from "react";
import Link from "next/link";
import { useJournalTrades } from "@/lib/journal/useJournalTrades";
import { computeStats, computeEquityCurve } from "@/lib/journal/calculations";
import { JournalTrade } from "@/lib/journal/types";
import { StatsGrid } from "@/components/journal/StatsGrid";
import { EquityCurveChart } from "@/components/journal/EquityCurveChart";
import { TradesTable } from "@/components/journal/TradesTable";
import { TradeForm } from "@/components/journal/TradeForm";
import { PerformanceBreakdown } from "@/components/journal/PerformanceBreakdown";
import { DailyReview } from "@/components/journal/DailyReview";
import { WeeklyMonthlySummary } from "@/components/journal/WeeklyMonthlySummary";
import { Card, CardHeader } from "@/components/ui/Card";

type Tab = "dashboard" | "trades" | "add" | "performance" | "review";

const TABS: { key: Tab; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "trades", label: "Trades" },
  { key: "add", label: "+ Add Trade" },
  { key: "performance", label: "Performance" },
  { key: "review", label: "Review" },
];

export function JournalApp({ userId }: { userId: string | null }) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [editingTrade, setEditingTrade] = useState<JournalTrade | null>(null);
  const { trades, loading, addTrade, updateTrade, deleteTrade } = useJournalTrades(userId);

  if (!userId) {
    return (
      <Card>
        <p className="text-sm text-tl-text-secondary">
          The journal is personal — your trades, psychology notes and
          reviews only make sense tied to your account.{" "}
          <Link href="/login" className="text-tl-accent hover:underline">
            Sign in
          </Link>{" "}
          to start.
        </p>
      </Card>
    );
  }

  const stats = computeStats(trades);
  const equity = computeEquityCurve(trades);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setEditingTrade(null);
              setTab(t.key);
            }}
            className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
              tab === t.key
                ? "bg-tl-accent text-black border-tl-accent"
                : "border-tl-border text-tl-text-secondary hover:border-tl-accent/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-tl-text-muted">Loading…</p>
      ) : tab === "dashboard" ? (
        <div className="space-y-4">
          <StatsGrid stats={stats} />
          <Card>
            <CardHeader title="Cumulative R" />
            <EquityCurveChart points={equity} />
          </Card>
          <PerformanceBreakdown trades={trades} />
        </div>
      ) : tab === "trades" ? (
        <TradesTable
          trades={trades}
          onEdit={(t) => {
            setEditingTrade(t);
            setTab("add");
          }}
          onDelete={(id) => deleteTrade(id)}
        />
      ) : tab === "add" ? (
        <TradeForm
          key={editingTrade?.id ?? "new"}
          initial={editingTrade ?? undefined}
          onSubmit={async (patch) => {
            const result = editingTrade ? await updateTrade(editingTrade.id, patch) : await addTrade(patch);
            if (!result.error) {
              setEditingTrade(null);
              setTab("trades");
            }
            return result;
          }}
          onCancel={editingTrade ? () => { setEditingTrade(null); setTab("trades"); } : undefined}
        />
      ) : tab === "performance" ? (
        <div className="space-y-4">
          <PerformanceBreakdown trades={trades} />
          <WeeklyMonthlySummary trades={trades} />
        </div>
      ) : (
        <DailyReview userId={userId} trades={trades} />
      )}
    </div>
  );
}
