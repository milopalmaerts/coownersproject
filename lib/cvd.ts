import { Candle } from "@/lib/types";

export interface CvdPoint {
  time: number;
  cvd: number;
}

// Cumulative Volume Delta: running sum of (buy volume - sell volume).
// Approximated from each candle's taker-buy volume (Binance klines expose
// this directly) since we don't hold a raw trade-by-trade feed — a candle
// with no taker-buy data contributes zero delta (neutral) rather than
// breaking the running total.
export function computeCvdSeries(candles: Candle[]): CvdPoint[] {
  let running = 0;
  return candles.map((c) => {
    const delta =
      c.takerBuyVolume !== undefined ? 2 * c.takerBuyVolume - c.volume : 0;
    running += delta;
    return { time: c.time, cvd: running };
  });
}

export type DivergenceType = "bullish" | "bearish";

export interface Divergence {
  type: DivergenceType;
  time: number; // the more recent (second) pivot's time
  index: number; // index of the more recent pivot into the candles/cvd arrays
  fromTime: number; // the earlier (first) pivot's time
  fromIndex: number; // index of the earlier pivot — together with `index`,
  // this is the exact pair being compared, so it can be drawn as a
  // connecting line on both the price chart and the CVD chart.
  description: string;
}

// A point is a pivot high/low if it's the extreme within `window` candles on
// both sides — the standard swing-point definition used by every manual
// divergence-drawing tool.
function findPivotIndices(values: number[], window: number, kind: "high" | "low"): number[] {
  const pivots: number[] = [];
  for (let i = window; i < values.length - window; i++) {
    const slice = values.slice(i - window, i + window + 1);
    const extreme = kind === "high" ? Math.max(...slice) : Math.min(...slice);
    if (values[i] === extreme) {
      pivots.push(i);
    }
  }
  return pivots;
}

// Regular divergence: price makes a new swing high/low that order flow
// (CVD) doesn't confirm — a classic early-reversal signal. Compares the two
// most recent swing highs (for bearish) and two most recent swing lows (for
// bullish); returns at most one of each, anchored to the more recent pivot.
export function detectDivergences(candles: Candle[], cvd: CvdPoint[], window = 3): Divergence[] {
  if (candles.length < window * 2 + 2) return [];

  const highs = candles.map((c) => c.high);
  const lows = candles.map((c) => c.low);
  const cvdValues = cvd.map((p) => p.cvd);

  const divergences: Divergence[] = [];

  const highPivots = findPivotIndices(highs, window, "high");
  if (highPivots.length >= 2) {
    const [i1, i2] = highPivots.slice(-2);
    const priceHigherHigh = highs[i2] > highs[i1];
    const cvdLowerHigh = cvdValues[i2] < cvdValues[i1];
    if (priceHigherHigh && cvdLowerHigh) {
      divergences.push({
        type: "bearish",
        time: candles[i2].time,
        index: i2,
        fromTime: candles[i1].time,
        fromIndex: i1,
        description: "Price higher high, CVD lower high — buying pressure not confirming the new high.",
      });
    }
  }

  const lowPivots = findPivotIndices(lows, window, "low");
  if (lowPivots.length >= 2) {
    const [i1, i2] = lowPivots.slice(-2);
    const priceLowerLow = lows[i2] < lows[i1];
    const cvdHigherLow = cvdValues[i2] > cvdValues[i1];
    if (priceLowerLow && cvdHigherLow) {
      divergences.push({
        type: "bullish",
        time: candles[i2].time,
        index: i2,
        fromTime: candles[i1].time,
        fromIndex: i1,
        description: "Price lower low, CVD higher low — selling pressure drying up on the new low.",
      });
    }
  }

  return divergences;
}
