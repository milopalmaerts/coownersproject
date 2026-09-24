"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AssetTicker } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";

export function PredictionForm({
  userId,
  assets,
  onPosted,
}: {
  userId: string;
  assets: AssetTicker[];
  onPosted: () => void;
}) {
  const [symbol, setSymbol] = useState(assets[0]?.symbol ?? "");
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [thesis, setThesis] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!thesis.trim()) return;
    setPosting(true);
    setError(null);

    const priceNow = assets.find((a) => a.symbol === symbol)?.price ?? 0;

    const { error: insertError } = await createClient().from("predictions").insert({
      user_id: userId,
      symbol,
      direction,
      thesis: thesis.trim(),
      price_at_call: priceNow,
    });

    setPosting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setThesis("");
    onPosted();
  }

  return (
    <Card>
      <CardHeader title="Post a Call" />
      <p className="text-xs text-tl-text-muted mb-3">
        Public, timestamped, and permanent — there&apos;s no edit or delete.
        Say what you actually think.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary"
          >
            {assets.map((a) => (
              <option key={a.symbol} value={a.symbol}>
                {a.symbol}
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setDirection("up")}
              className={`text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${
                direction === "up"
                  ? "bg-tl-positive/15 border-tl-positive text-tl-positive"
                  : "border-tl-border text-tl-text-secondary"
              }`}
            >
              ▲ Up
            </button>
            <button
              type="button"
              onClick={() => setDirection("down")}
              className={`text-sm font-medium px-3 py-2 rounded-lg border transition-colors ${
                direction === "down"
                  ? "bg-tl-negative/15 border-tl-negative text-tl-negative"
                  : "border-tl-border text-tl-text-secondary"
              }`}
            >
              ▼ Down
            </button>
          </div>
        </div>
        <textarea
          value={thesis}
          onChange={(e) => setThesis(e.target.value)}
          placeholder="Why? (e.g. BTC breaks $90k before end of month on ETF inflows)"
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary placeholder:text-tl-text-muted"
          required
        />
        {error && <p className="text-xs text-tl-negative">{error}</p>}
        <button
          type="submit"
          disabled={posting}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-tl-accent text-black hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {posting ? "Posting…" : "Post publicly"}
        </button>
      </form>
    </Card>
  );
}
