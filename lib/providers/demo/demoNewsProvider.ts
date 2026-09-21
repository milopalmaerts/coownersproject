import { NewsProvider } from "@/lib/providers/types";
import { NewsItem } from "@/lib/types";

const DEMO_NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "Bitcoin market update: consolidation above key support",
    description:
      "BTC trades in a tight range as traders await the next macro catalyst.",
    source: "Example News",
    url: "https://example.com/news/bitcoin-market-update",
    publishedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    relatedSymbols: ["BTC"],
    category: "Bitcoin",
  },
  {
    id: "n2",
    title: "Ethereum layer-2 activity hits new high",
    description:
      "Rollup transaction counts surge as fees remain low across major L2 networks.",
    source: "Example News",
    url: "https://example.com/news/ethereum-l2-activity",
    publishedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    relatedSymbols: ["ETH"],
    category: "Ethereum",
  },
  {
    id: "n3",
    title: "Regulators outline new framework for stablecoin issuers",
    description:
      "Proposed rules would require reserve audits and disclosure standards.",
    source: "Example News",
    url: "https://example.com/news/stablecoin-framework",
    publishedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    relatedSymbols: [],
    category: "Regulation",
  },
  {
    id: "n4",
    title: "DeFi protocol TVL rebounds as lending rates normalize",
    description:
      "Total value locked across major lending markets climbs for the third week.",
    source: "Example News",
    url: "https://example.com/news/defi-tvl-rebound",
    publishedAt: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    relatedSymbols: ["ETH"],
    category: "DeFi",
  },
  {
    id: "n5",
    title: "Solana network throughput sets fresh record",
    description:
      "Validators report record transaction throughput amid rising DEX volume.",
    source: "Example News",
    url: "https://example.com/news/solana-throughput-record",
    publishedAt: new Date(Date.now() - 210 * 60 * 1000).toISOString(),
    relatedSymbols: ["SOL"],
    category: "Altcoins",
  },
  {
    id: "n6",
    title: "Exchange discloses security audit results",
    description:
      "A major exchange published the results of its latest third-party security audit.",
    source: "Example News",
    url: "https://example.com/news/exchange-security-audit",
    publishedAt: new Date(Date.now() - 260 * 60 * 1000).toISOString(),
    relatedSymbols: [],
    category: "Security",
  },
];

export class DemoNewsProvider implements NewsProvider {
  async getLatestNews(limit = 20): Promise<NewsItem[]> {
    return DEMO_NEWS.slice(0, limit);
  }

  async getNewsBySymbol(symbol: string, limit = 20): Promise<NewsItem[]> {
    return DEMO_NEWS.filter((n) =>
      n.relatedSymbols.some((s) => s.toLowerCase() === symbol.toLowerCase())
    ).slice(0, limit);
  }
}
