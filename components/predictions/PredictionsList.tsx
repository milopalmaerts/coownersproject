"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { AssetTicker } from "@/lib/types";
import { PredictionForm } from "@/components/predictions/PredictionForm";
import { useLiveTickers } from "@/lib/hooks/useLiveTickers";
import { formatPct, formatRelativeTime } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Prediction {
  id: string;
  user_id: string;
  symbol: string;
  direction: "up" | "down";
  thesis: string;
  price_at_call: number;
  created_at: string;
}

export function PredictionsList({
  userId,
  assets,
}: {
  userId: string | null;
  assets: AssetTicker[];
}) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const liveTickers = useLiveTickers();

  const load = useCallback(() => {
    if (!hasSupabaseConfig) {
      setLoading(false);
      return;
    }
    createClient()
      .from("predictions")
      .select("id, user_id, symbol, direction, thesis, price_at_call, created_at")
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (error) console.error("[predictions] failed to load", error);
        setPredictions(data ?? []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!hasSupabaseConfig) {
    return (
      <Card>
        <p className="text-sm text-tl-text-muted">
          Accounts aren&apos;t configured on this deployment — predictions
          need an account to attribute a call to.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {userId && <PredictionForm userId={userId} assets={assets} onPosted={load} />}

      <Card>
        <CardHeader title="Public Calls" />
        {loading ? (
          <p className="text-sm text-tl-text-muted">Loading…</p>
        ) : predictions.length === 0 ? (
          <p className="text-sm text-tl-text-muted">No calls posted yet.</p>
        ) : (
          <ul className="divide-y divide-tl-border">
            {predictions.map((p) => {
              const currentPrice = liveTickers?.get(p.symbol)?.price ?? p.price_at_call;
              const pctSince = ((currentPrice - p.price_at_call) / p.price_at_call) * 100;
              const calledUp = p.direction === "up";
              const correct = calledUp ? pctSince > 0 : pctSince < 0;

              return (
                <li key={p.id} className="py-3 text-sm">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-tl-text-primary tl-mono">{p.symbol}</span>
                      <Badge tone={calledUp ? "positive" : "negative"}>
                        {calledUp ? "▲ up" : "▼ down"}
                      </Badge>
                      <span className="text-xs text-tl-text-muted tl-mono">
                        anon-{p.user_id.slice(0, 8)}
                      </span>
                    </div>
                    <Badge tone={correct ? "positive" : "negative"}>
                      {formatPct(pctSince)} since call
                    </Badge>
                  </div>
                  <p className="text-tl-text-secondary">{p.thesis}</p>
                  <p className="text-xs text-tl-text-muted mt-1">
                    {formatRelativeTime(p.created_at)} at ${p.price_at_call.toLocaleString()}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
