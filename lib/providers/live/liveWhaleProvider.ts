import { WhaleProvider } from "@/lib/providers/types";
import { WhaleTransaction } from "@/lib/types";
import { marketProvider } from "@/lib/providers";
import { fetchRecentBtcBlockTxs } from "@/lib/providers/live/whale/bitcoinExplorer";
import { fetchRecentEthBlockTxs } from "@/lib/providers/live/whale/ethereumExplorer";
import { fetchRecentStablecoinTransfers } from "@/lib/providers/live/whale/stablecoinTransfers";
import { lookupEthExchange } from "@/lib/providers/live/whale/exchangeAddresses";

const SATS_PER_BTC = 100_000_000;

// Whale thresholds — matches the lowest tier shown on the Whales page
// (lib/providers/demo/... thresholds card). Below this, a transaction isn't
// surfaced as a whale alert.
const BTC_THRESHOLD_USD = 1_000_000;
const ETH_THRESHOLD_USD = 500_000;
const STABLECOIN_THRESHOLD_USD = 500_000;

// Detects large transfers by scanning the most recent confirmed blocks on
// each chain. BTC addresses aren't labeled — exchanges rotate deposit
// addresses constantly, so we'd rather say "Unknown wallet" than guess
// wrong. ETH gets a small curated list of well-known, publicly documented
// exchange hot wallets (see exchangeAddresses.ts) — most ETH transfers still
// won't match anything and stay "Unknown wallet" too. usdValue is gross
// transaction output value (approximate), not a verified net transfer.
export class LiveWhaleProvider implements WhaleProvider {
  private async getBtcWhales(): Promise<WhaleTransaction[]> {
    const [txs, btcPrice] = await Promise.all([
      fetchRecentBtcBlockTxs(),
      marketProvider.getPrice("BTC"),
    ]);

    return txs
      .map((tx) => {
        const btc = tx.totalSats / SATS_PER_BTC;
        const usdValue = btc * btcPrice;
        return { tx, usdValue };
      })
      .filter(({ usdValue }) => usdValue >= BTC_THRESHOLD_USD)
      .map(({ tx, usdValue }): WhaleTransaction => ({
        id: `btc-${tx.txid}`,
        symbol: "BTC",
        usdValue,
        fromLabel: "Unknown wallet",
        toLabel: "Unknown wallet",
        fromType: "unknown",
        toType: "unknown",
        timestamp: new Date(tx.blockTimestamp * 1000).toISOString(),
        txUrl: `https://mempool.space/tx/${tx.txid}`,
      }));
  }

  private async getEthWhales(): Promise<WhaleTransaction[]> {
    if (!process.env.ETHERSCAN_API_KEY) {
      // ETH whale detection is an optional enhancement gated on a free key
      // the user hasn't set up yet — not an error, just less coverage.
      return [];
    }

    const [txs, ethPrice] = await Promise.all([
      fetchRecentEthBlockTxs(),
      marketProvider.getPrice("ETH"),
    ]);

    return txs
      .map((tx) => {
        const eth = Number(tx.wei / BigInt(1_000_000_000)) / 1e9; // wei -> gwei -> ETH, avoids float overflow
        const usdValue = eth * ethPrice;
        return { tx, usdValue };
      })
      .filter(({ usdValue }) => usdValue >= ETH_THRESHOLD_USD)
      .map(({ tx, usdValue }): WhaleTransaction => {
        const fromExchange = lookupEthExchange(tx.from);
        const toExchange = lookupEthExchange(tx.to);
        return {
          id: `eth-${tx.hash}`,
          symbol: "ETH",
          usdValue,
          fromLabel: fromExchange ?? "Unknown wallet",
          toLabel: toExchange ?? "Unknown wallet",
          fromType: fromExchange ? "exchange" : "unknown",
          toType: toExchange ? "exchange" : "unknown",
          timestamp: new Date(tx.blockTimestamp * 1000).toISOString(),
          txUrl: `https://etherscan.io/tx/${tx.hash}`,
        };
      });
  }

  private async getStablecoinWhales(): Promise<WhaleTransaction[]> {
    if (!process.env.ETHERSCAN_API_KEY) {
      return [];
    }

    const transfers = await fetchRecentStablecoinTransfers();

    return transfers
      .filter((t) => t.usdValue >= STABLECOIN_THRESHOLD_USD)
      .map((t): WhaleTransaction => {
        const fromExchange = lookupEthExchange(t.from);
        const toExchange = lookupEthExchange(t.to);
        return {
          id: `${t.symbol.toLowerCase()}-${t.txHash}`,
          symbol: t.symbol,
          usdValue: t.usdValue,
          fromLabel: fromExchange ?? "Unknown wallet",
          toLabel: toExchange ?? "Unknown wallet",
          fromType: fromExchange ? "exchange" : "unknown",
          toType: toExchange ? "exchange" : "unknown",
          timestamp: new Date(t.blockTimestamp * 1000).toISOString(),
          txUrl: `https://etherscan.io/tx/${t.txHash}`,
        };
      });
  }

  async getLargeTransactions(limit = 20): Promise<WhaleTransaction[]> {
    const [btc, eth, stablecoins] = await Promise.all([
      this.getBtcWhales(),
      this.getEthWhales().catch(() => []),
      this.getStablecoinWhales().catch(() => []),
    ]);

    // Round-robin across asset groups (each already sorted by size) before
    // truncating to `limit` — a pure global sort-by-value would let one
    // asset's naturally larger transfer sizes crowd out every other asset.
    const groups = [
      [...btc].sort((a, b) => b.usdValue - a.usdValue),
      [...eth].sort((a, b) => b.usdValue - a.usdValue),
      [...stablecoins].sort((a, b) => b.usdValue - a.usdValue),
    ];

    const merged: WhaleTransaction[] = [];
    let cursor = 0;
    while (merged.length < limit && groups.some((g) => cursor < g.length)) {
      for (const group of groups) {
        if (cursor < group.length) merged.push(group[cursor]);
      }
      cursor++;
    }

    return merged.slice(0, limit).sort((a, b) => b.usdValue - a.usdValue);
  }

  async getLargeTransactionsBySymbol(
    symbol: string,
    limit = 20
  ): Promise<WhaleTransaction[]> {
    const all = await this.getLargeTransactions(200);
    return all
      .filter((tx) => tx.symbol.toLowerCase() === symbol.toLowerCase())
      .slice(0, limit);
  }
}
