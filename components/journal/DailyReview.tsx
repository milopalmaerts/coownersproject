"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { JournalTrade, JournalDailyReview, RuleFollowed } from "@/lib/journal/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function DailyReview({ userId, trades }: { userId: string; trades: JournalTrade[] }) {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [review, setReview] = useState<Partial<JournalDailyReview>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const dayTrades = trades.filter((t) => t.trade_date === date);
  const dailyR = dayTrades.reduce((s, t) => s + t.result_r, 0);
  const dailyPnl = dayTrades.reduce((s, t) => s + (t.result_amount ?? 0), 0);
  const best = dayTrades.length > 0 ? dayTrades.reduce((a, b) => (b.result_r > a.result_r ? b : a)) : null;
  const worst = dayTrades.length > 0 ? dayTrades.reduce((a, b) => (b.result_r < a.result_r ? b : a)) : null;

  useEffect(() => {
    setLoading(true);
    createClient()
      .from("journal_daily_reviews")
      .select("*")
      .eq("user_id", userId)
      .eq("review_date", date)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) console.error("[journal] failed to load daily review", error);
        setReview(data ?? {});
        setLoading(false);
      });
  }, [userId, date]);

  async function save() {
    setSaving(true);
    const { error } = await createClient()
      .from("journal_daily_reviews")
      .upsert(
        { ...review, user_id: userId, review_date: date },
        { onConflict: "user_id,review_date" }
      );
    setSaving(false);
    if (error) console.error("[journal] failed to save daily review", error);
  }

  const set = <K extends keyof JournalDailyReview>(key: K) => (v: JournalDailyReview[K]) =>
    setReview((r) => ({ ...r, [key]: v }));

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary"
          />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-tl-text-muted">{dayTrades.length} trades</span>
            <span className={`tl-mono font-semibold ${dailyR >= 0 ? "text-tl-positive" : "text-tl-negative"}`}>
              {dailyR >= 0 ? "+" : ""}
              {dailyR.toFixed(2)}R
            </span>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <div className="text-xs text-tl-text-muted">Daily P/L</div>
          <div className={`mt-1 font-semibold tabular-nums ${dailyPnl >= 0 ? "text-tl-positive" : "text-tl-negative"}`}>
            {dailyPnl >= 0 ? "+" : ""}
            {dailyPnl.toFixed(2)}
          </div>
        </Card>
        <Card>
          <div className="text-xs text-tl-text-muted">Best Trade</div>
          <div className="mt-1 font-semibold text-tl-positive">{best ? `+${best.result_r.toFixed(2)}R (${best.asset})` : "—"}</div>
        </Card>
        <Card>
          <div className="text-xs text-tl-text-muted">Worst Trade</div>
          <div className="mt-1 font-semibold text-tl-negative">{worst ? `${worst.result_r.toFixed(2)}R (${worst.asset})` : "—"}</div>
        </Card>
        <Card>
          <div className="text-xs text-tl-text-muted">Trades</div>
          <div className="mt-1 font-semibold text-tl-text-primary">{dayTrades.length}</div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Review"
          action={
            <button
              onClick={save}
              disabled={saving || loading}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-tl-accent text-black disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          }
        />
        {loading ? (
          <p className="text-sm text-tl-text-muted">Loading…</p>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-tl-text-muted mb-1">Starting Balance</label>
                <input
                  type="number"
                  value={review.starting_balance ?? ""}
                  onChange={(e) => set("starting_balance")(e.target.value === "" ? null : Number(e.target.value))}
                  className="w-full rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-tl-text-muted mb-1">Ending Balance</label>
                <input
                  type="number"
                  value={review.ending_balance ?? ""}
                  onChange={(e) => set("ending_balance")(e.target.value === "" ? null : Number(e.target.value))}
                  className="w-full rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary"
                />
              </div>
            </div>
            {(
              [
                ["what_went_well", "What went well?"],
                ["what_went_wrong", "What went wrong?"],
                ["lesson_learned", "Lesson learned"],
                ["improvement_tomorrow", "Improvement for tomorrow"],
              ] as const
            ).map(([key, label]) => (
              <div key={key}>
                <label className="block text-xs text-tl-text-muted mb-1">{label}</label>
                <textarea
                  value={review[key] ?? ""}
                  onChange={(e) => set(key)(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary"
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-tl-text-muted mb-1">Main emotion</label>
                <input
                  value={review.main_emotion ?? ""}
                  onChange={(e) => set("main_emotion")(e.target.value)}
                  className="w-full rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-tl-text-muted mb-1">Followed plan?</label>
                <select
                  value={review.followed_plan ?? ""}
                  onChange={(e) => set("followed_plan")(e.target.value as RuleFollowed)}
                  className="w-full rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary"
                >
                  <option value="">—</option>
                  <option value="yes">Yes</option>
                  <option value="partially">Partially</option>
                  <option value="no">No</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Card>

      {dayTrades.length > 0 && (
        <Card>
          <CardHeader title="Trades This Day" />
          <ul className="divide-y divide-tl-border">
            {dayTrades.map((t) => (
              <li key={t.id} className="py-2 flex items-center justify-between text-sm">
                <span className="text-tl-text-primary">{t.asset}</span>
                <Badge tone={t.direction === "long" ? "positive" : "negative"}>{t.direction}</Badge>
                <span className={t.result_r >= 0 ? "text-tl-positive" : "text-tl-negative"}>
                  {t.result_r >= 0 ? "+" : ""}
                  {t.result_r.toFixed(2)}R
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
