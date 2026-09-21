// Thrown when a symbol isn't one TradingLegends tracks at all (a real 404).
// Any other provider error (network failure, rate limit, invalid key, bad
// response) must NOT be caught as this — those are outages, not missing
// pages, and should surface as an error state instead of a misleading 404.
export class UnknownAssetError extends Error {
  constructor(symbol: string) {
    super(`Unknown asset: ${symbol}`);
    this.name = "UnknownAssetError";
  }
}
