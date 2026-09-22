import { Candle } from "@/lib/types";

export interface VolumeProfileBin {
  priceLow: number;
  priceHigh: number;
  volume: number;
}

export interface VolumeProfileResult {
  bins: VolumeProfileBin[];
  maxVolume: number;
  pocIndex: number; // index of the bin with the most volume (Point of Control)
}

// Volume profile from OHLCV candles (not raw trades — we don't have a tick
// feed): each candle's volume is spread evenly across every price bin its
// high-low range touches. This is the same approximation every free/no-tick
// volume-profile implementation uses; it's a distribution estimate, not an
// exact per-price record.
export function computeVolumeProfile(candles: Candle[], binCount = 24): VolumeProfileResult | null {
  if (candles.length === 0) return null;

  const low = Math.min(...candles.map((c) => c.low));
  const high = Math.max(...candles.map((c) => c.high));
  if (!(high > low)) return null;

  const binSize = (high - low) / binCount;
  const bins: VolumeProfileBin[] = Array.from({ length: binCount }, (_, i) => ({
    priceLow: low + i * binSize,
    priceHigh: low + (i + 1) * binSize,
    volume: 0,
  }));

  for (const candle of candles) {
    const candleLow = Math.min(candle.low, candle.high);
    const candleHigh = Math.max(candle.low, candle.high);
    const firstBin = Math.max(0, Math.floor((candleLow - low) / binSize));
    const lastBin = Math.min(binCount - 1, Math.floor((candleHigh - low) / binSize));
    const spanBins = lastBin - firstBin + 1;
    const volumePerBin = candle.volume / spanBins;
    for (let i = firstBin; i <= lastBin; i++) {
      bins[i].volume += volumePerBin;
    }
  }

  let pocIndex = 0;
  let maxVolume = 0;
  bins.forEach((bin, i) => {
    if (bin.volume > maxVolume) {
      maxVolume = bin.volume;
      pocIndex = i;
    }
  });

  return { bins, maxVolume, pocIndex };
}
