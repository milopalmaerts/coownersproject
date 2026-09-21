import { WhaleProvider } from "@/lib/providers/types";
import { WhaleTransaction } from "@/lib/types";
import { marketProvider } from "@/lib/providers";
import { fetchLatestBtcBlockTxs } from "@/lib/providers/live/whale/bitcoinExplorer";
import { fetchLatestEthBlockTxs } from "@/lib/providers/live/whale/ethereumExplorer";

const SATS_PER_BTC = 100_000_000;

// Whale thresholds — matches the lowest tier shown on the Whales page
// (lib/providers/demo/... thresholds card). Below this, a transaction isn't
// surfaced as a whale alert.
const BTC_THRESHOLD_USD = 1_000_000;
const ETH_THRESHOLD_USD = 500_000;

// Detects large transfers by scanning the most recent confirmed block on
// each chain — no address-clustering database, so unlike Whale Alert we
// can't label a wallet as "exchange" vs personal; both sides are reported
// as "Unknown wallet" rather than guessing. usdValue is gross transaction
// output value (approximate), not a verified net transfer amount.
export class LiveWhaleProvider implements WhaleProvider {
  private async getBtcWhales(): Promise<WhaleTransaction[]> {
    const [txs, btcPrice] = await Promise.all([
      fetchLatestBtcBlockTxs(),
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
      fetchLatestEthBlockTxs(),
      marketProvider.getPrice("ETH"),
    ]);

    return txs
      .map((tx) => {
        const eth = Number(tx.wei / BigInt(1_000_000_000)) / 1e9; // wei -> gwei -> ETH, avoids float overflow
        const usdValue = eth * ethPrice;
        return { tx, usdValue };
      })
      .filter(({ usdValue }) => usdValue >= ETH_THRESHOLD_USD)
      .map(({ tx, usdValue }): WhaleTransaction => ({
        id: `eth-${tx.hash}`,
        symbol: "ETH",
        usdValue,
        fromLabel: "Unknown wallet",
        toLabel: "Unknown wallet",
        fromType: "unknown",
        toType: "unknown",
        timestamp: new Date(tx.blockTimestamp * 1000).toISOString(),
        txUrl: `https://etherscan.io/tx/${tx.hash}`,
      }));
  }

  async getLargeTransactions(limit = 20): Promise<WhaleTransaction[]> {
    const [btc, eth] = await Promise.all([
      this.getBtcWhales(),
      this.getEthWhales(),
    ]);

    return [...btc, ...eth]
      .sort((a, b) => b.usdValue - a.usdValue)
      .slice(0, limit);
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
