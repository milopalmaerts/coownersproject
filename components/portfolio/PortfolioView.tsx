"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";
import { AssetTicker } from "@/lib/types";
import { formatUsd, formatPct } from "@/lib/format";
import { useLiveTickers } from "@/lib/hooks/useLiveTickers";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface Holding {
  id: string;
  symbol: string;
  quantity: number;
  cost_basis: number;
}

export function PortfolioView({
  userId,
  assets,
}: {
  userId: string | null;
  assets: AssetTicker[];
}) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState(assets[0]?.symbol ?? "");
  const [quantity, setQuantity] = useState("");
  const [costBasis, setCostBasis] = useState("");
  const liveTickers = useLiveTickers();

  useEffect(() => {
    if (!userId || !hasSupabaseConfig) {
      setLoading(false);
      return;
    }
    createClient()
      .from("portfolio_holdings")
      .select("id, symbol, quantity, cost_basis")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) console.error("[portfolio] failed to load", error);
        setHoldings(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  async function addHolding(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || !symbol || !quantity) return;
    const qty = Number(quantity);
    const cost = Number(costBasis || 0);
    if (!Number.isFinite(qty) || qty <= 0) return;

    const { data, error } = await createClient()
      .from("portfolio_holdings")
      .insert({ user_id: userId, symbol, quantity: qty, cost_basis: cost })
      .select("id, symbol, quantity, cost_basis")
      .single();

    if (error) {
      console.error("[portfolio] failed to add", error);
      return;
    }
    setHoldings((prev) => [...prev, data]);
    setQuantity("");
    setCostBasis("");
  }

  async function removeHolding(id: string) {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
    const { error } = await createClient().from("portfolio_holdings").delete().eq("id", id);
    if (error) console.error("[portfolio] failed to remove", error);
  }

  if (!userId) {
    return (
      <Card>
        <p className="text-sm text-tl-text-secondary">
          Portfolio tracking needs an account so your holdings aren&apos;t
          just sitting in this browser&apos;s local storage.{" "}
          <Link href="/login" className="text-tl-accent hover:underline">
            Sign in
          </Link>{" "}
          to start.
        </p>
      </Card>
    );
  }

  const priceFor = (sym: string) => liveTickers?.get(sym)?.price ?? assets.find((a) => a.symbol === sym)?.price ?? 0;

  const rows = holdings.map((h) => {
    const price = priceFor(h.symbol);
    const value = h.quantity * price;
    const cost = h.quantity * h.cost_basis;
    const pnl = cost > 0 ? value - cost : null;
    const pnlPct = cost > 0 ? (pnl! / cost) * 100 : null;
    return { ...h, price, value, pnl, pnlPct };
  });

  const totalValue = rows.reduce((sum, r) => sum + r.value, 0);
  const totalCost = rows.reduce((sum, r) => sum + r.quantity * r.cost_basis, 0);
  const totalPnl = totalCost > 0 ? totalValue - totalCost : null;
  const totalPnlPct = totalCost > 0 ? (totalPnl! / totalCost) * 100 : null;

  return (
    <div className="space-y-4">
      <Card label="portfolio.sh">
        <CardHeader title="Total Value" />
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="text-3xl font-bold tl-mono text-tl-text-primary">
            {formatUsd(totalValue)}
          </span>
          {totalPnl !== null && (
            <Badge tone={totalPnl >= 0 ? "positive" : "negative"}>
              {totalPnl >= 0 ? "+" : ""}
              {formatUsd(totalPnl)} ({formatPct(totalPnlPct!)})
            </Badge>
          )}
        </div>
      </Card>

      <Card>
        <CardHeader title="Add Holding" />
        <form onSubmit={addHolding} className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs text-tl-text-muted mb-1">Asset</label>
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
          </div>
          <div>
            <label className="block text-xs text-tl-text-muted mb-1">Quantity</label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-32 rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary"
              required
            />
          </div>
          <div>
            <label className="block text-xs text-tl-text-muted mb-1">Avg. cost (optional)</label>
            <input
              type="number"
              step="any"
              value={costBasis}
              onChange={(e) => setCostBasis(e.target.value)}
              placeholder="$ per unit"
              className="w-36 rounded-lg border border-tl-border bg-tl-bg-card px-3 py-2 text-sm text-tl-text-primary placeholder:text-tl-text-muted"
            />
          </div>
          <button
            type="submit"
            className="text-sm font-medium px-4 py-2 rounded-lg bg-tl-accent text-black hover:opacity-90 transition-opacity"
          >
            Add
          </button>
        </form>
      </Card>

      <Card>
        <CardHeader title="Holdings" />
        {loading ? (
          <p className="text-sm text-tl-text-muted">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-tl-text-muted">
            No holdings yet — add one above. This is manual entry only; we
            never connect to your exchange account.
          </p>
        ) : (
          <ul className="divide-y divide-tl-border">
            {rows.map((r) => (
              <li key={r.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                <div>
                  <div className="font-medium text-tl-text-primary">
                    {r.quantity} {r.symbol}
                  </div>
                  <div className="text-xs text-tl-text-muted">
                    {formatUsd(r.price)}/unit now
                    {r.cost_basis > 0 && ` · bought at ${formatUsd(r.cost_basis)}`}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-medium text-tl-text-primary tabular-nums">
                      {formatUsd(r.value)}
                    </div>
                    {r.pnl !== null && (
                      <div className={`text-xs tabular-nums ${r.pnl >= 0 ? "text-tl-positive" : "text-tl-negative"}`}>
                        {r.pnl >= 0 ? "+" : ""}
                        {formatUsd(r.pnl)} ({formatPct(r.pnlPct!)})
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeHolding(r.id)}
                    className="text-xs text-tl-text-muted hover:text-tl-negative transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
