import { WhaleProvider } from "@/lib/providers/types";
import { WhaleTransaction } from "@/lib/types";

const DEMO_WHALE_TXS: WhaleTransaction[] = [
  {
    id: "w1",
    symbol: "BTC",
    usdValue: 5_420_000,
    fromLabel: "Unknown wallet",
    toLabel: "Exchange",
    fromType: "unknown",
    toType: "exchange",
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    txUrl: "https://example.com/tx/demo-btc-1",
  },
  {
    id: "w2",
    symbol: "ETH",
    usdValue: 2_150_000,
    fromLabel: "Exchange",
    toLabel: "Unknown wallet",
    fromType: "exchange",
    toType: "unknown",
    timestamp: new Date(Date.now() - 34 * 60 * 1000).toISOString(),
    txUrl: "https://example.com/tx/demo-eth-1",
  },
  {
    id: "w3",
    symbol: "BTC",
    usdValue: 2_400_000,
    fromLabel: "Unknown wallet",
    toLabel: "Exchange wallet",
    fromType: "unknown",
    toType: "exchange",
    timestamp: new Date(Date.now() - 61 * 60 * 1000).toISOString(),
    txUrl: "https://example.com/tx/demo-btc-2",
  },
  {
    id: "w4",
    symbol: "SOL",
    usdValue: 1_020_000,
    fromLabel: "Unknown wallet",
    toLabel: "Unknown wallet",
    fromType: "unknown",
    toType: "unknown",
    timestamp: new Date(Date.now() - 88 * 60 * 1000).toISOString(),
    txUrl: "https://example.com/tx/demo-sol-1",
  },
];

export class DemoWhaleProvider implements WhaleProvider {
  async getLargeTransactions(limit = 20): Promise<WhaleTransaction[]> {
    return DEMO_WHALE_TXS.slice(0, limit);
  }

  async getLargeTransactionsBySymbol(
    symbol: string,
    limit = 20
  ): Promise<WhaleTransaction[]> {
    return DEMO_WHALE_TXS.filter(
      (w) => w.symbol.toLowerCase() === symbol.toLowerCase()
    ).slice(0, limit);
  }
}
