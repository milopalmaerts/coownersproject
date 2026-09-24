import { JournalTrade, PartialExit, TradeOutcome } from "@/lib/journal/types";

// Weighted-average realized R across partial exits + remaining/final exit.
// Each closed slice contributes its % of the position times its own R —
// this is what actually distinguishes "closed 50% at +1R, rest at breakeven"
// (+0.5R total) from a naive "hit TP1 so it's a win" classification.
export function computeRealizedR(
  partials: PartialExit[],
  finalExitR: number | null,
  remainingPct: number | null
): number | null {
  let weightedR = 0;
  let accountedPct = 0;

  for (const p of partials) {
    if (p.pctClosed === null || p.r === null) continue;
    weightedR += (p.pctClosed / 100) * p.r;
    accountedPct += p.pctClosed;
  }

  const remaining = remainingPct ?? Math.max(0, 100 - accountedPct);
  if (remaining > 0) {
    if (finalExitR === null) {
      // Position isn't fully accounted for and we don't know what the rest
      // did — can't produce a real number, not even an approximation.
      return accountedPct > 0 ? null : null;
    }
    weightedR += (remaining / 100) * finalExitR;
    accountedPct += remaining;
  }

  if (accountedPct === 0) return null;
  return weightedR;
}

export function classifyOutcome(resultR: number): TradeOutcome {
  if (resultR > 0) return "win";
  if (resultR < 0) return "loss";
  return "breakeven";
}

// Percentages across TP1/TP2/TP3 + remaining must never exceed 100 — the
// one hard validation rule the spec calls out explicitly.
export function validatePartialPercentages(pcts: (number | null)[]): boolean {
  const total = pcts.reduce((sum: number, p) => sum + (p ?? 0), 0);
  return total <= 100.001; // float slack
}

export interface JournalStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades: number;
  winRate: number; // %
  totalR: number;
  avgR: number;
  avgWinR: number;
  avgLossR: number;
  largestWin: number;
  largestLoss: number;
  expectancy: number; // = winRate*avgWin + lossRate*avgLoss
  profitFactor: number | null; // gross win R / gross loss R, null if no losses
  currentStreak: { type: "win" | "loss" | "none"; count: number };
  currentDrawdown: number; // R below the running peak, as a positive number
  maxDrawdown: number;
}

export function computeStats(trades: JournalTrade[]): JournalStats {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  );

  const wins = sorted.filter((t) => t.outcome === "win");
  const losses = sorted.filter((t) => t.outcome === "loss");
  const breakEvens = sorted.filter((t) => t.outcome === "breakeven");

  const totalR = sorted.reduce((sum, t) => sum + t.result_r, 0);
  const winRate = sorted.length > 0 ? (wins.length / sorted.length) * 100 : 0;
  const avgR = sorted.length > 0 ? totalR / sorted.length : 0;
  const avgWinR = wins.length > 0 ? wins.reduce((s, t) => s + t.result_r, 0) / wins.length : 0;
  const avgLossR = losses.length > 0 ? losses.reduce((s, t) => s + t.result_r, 0) / losses.length : 0;
  const largestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.result_r)) : 0;
  const largestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.result_r)) : 0;

  const lossRate = sorted.length > 0 ? losses.length / sorted.length : 0;
  const expectancy = (winRate / 100) * avgWinR + lossRate * avgLossR;

  const grossWin = wins.reduce((s, t) => s + t.result_r, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.result_r, 0));
  const profitFactor = grossLoss > 0 ? grossWin / grossLoss : null;

  // Current streak: walk backward from the most recent trade.
  let currentStreak: JournalStats["currentStreak"] = { type: "none", count: 0 };
  for (let i = sorted.length - 1; i >= 0; i--) {
    const outcome = sorted[i].outcome;
    if (outcome === "breakeven") break;
    const type = outcome === "win" ? "win" : "loss";
    if (currentStreak.type === "none") {
      currentStreak = { type, count: 1 };
    } else if (currentStreak.type === type) {
      currentStreak.count++;
    } else {
      break;
    }
  }

  // Drawdown from the cumulative-R equity curve.
  let cumulative = 0;
  let peak = 0;
  let maxDrawdown = 0;
  for (const t of sorted) {
    cumulative += t.result_r;
    peak = Math.max(peak, cumulative);
    maxDrawdown = Math.max(maxDrawdown, peak - cumulative);
  }
  const currentDrawdown = peak - cumulative;

  return {
    totalTrades: sorted.length,
    winningTrades: wins.length,
    losingTrades: losses.length,
    breakEvenTrades: breakEvens.length,
    winRate,
    totalR,
    avgR,
    avgWinR,
    avgLossR,
    largestWin,
    largestLoss,
    expectancy,
    profitFactor,
    currentStreak,
    currentDrawdown,
    maxDrawdown,
  };
}

export interface EquityPoint {
  date: string;
  cumulativeR: number;
}

export function computeEquityCurve(trades: JournalTrade[]): EquityPoint[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
  );
  let cumulative = 0;
  return sorted.map((t) => {
    cumulative += t.result_r;
    return { date: t.trade_date, cumulativeR: cumulative };
  });
}

export function groupStatsBy(
  trades: JournalTrade[],
  keyFn: (t: JournalTrade) => string
): { key: string; stats: JournalStats }[] {
  const groups = new Map<string, JournalTrade[]>();
  for (const t of trades) {
    const key = keyFn(t) || "—";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(t);
  }
  return Array.from(groups.entries())
    .map(([key, groupTrades]) => ({ key, stats: computeStats(groupTrades) }))
    .sort((a, b) => b.stats.totalR - a.stats.totalR);
}
