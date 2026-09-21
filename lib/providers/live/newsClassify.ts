import { NewsCategory } from "@/lib/types";

// Keyword -> tracked symbol, used to tag which assets a headline relates to.
// Matched as whole words against title + description.
const SYMBOL_KEYWORDS: Record<string, string[]> = {
  BTC: ["bitcoin", "btc"],
  ETH: ["ethereum", "eth", "ether"],
  SOL: ["solana", "sol"],
  LINK: ["chainlink"],
  AVAX: ["avalanche"],
  XRP: ["xrp", "ripple"],
  DOGE: ["dogecoin"],
  ADA: ["cardano"],
};

// Ordered most-specific-first: the first category whose keywords match wins,
// so e.g. a Bitcoin ETF regulatory story is filed under Regulation, not
// Bitcoin, and a DeFi hack under Security, not DeFi.
const CATEGORY_KEYWORDS: [NewsCategory, string[]][] = [
  ["Security", ["hack", "exploit", "breach", "vulnerability", "rug pull", "scam", "stolen"]],
  ["Regulation", ["sec ", "regulat", "lawsuit", "congress", "senator", "compliance", "law "]],
  ["NFT", ["nft", "non-fungible"]],
  ["Macro", ["federal reserve", "fed ", "inflation", "interest rate", "cpi", "recession", "macro"]],
  ["DeFi", ["defi", "liquidity pool", "yield farm", "lending protocol", "dex "]],
  ["Bitcoin", ["bitcoin", "btc"]],
  ["Ethereum", ["ethereum", "ether "]],
];

function wordMatch(haystack: string, needle: string): boolean {
  if (needle.endsWith(" ")) {
    return haystack.includes(needle);
  }
  const pattern = new RegExp(`\\b${needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  return pattern.test(haystack);
}

export function detectRelatedSymbols(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase();
  return Object.entries(SYMBOL_KEYWORDS)
    .filter(([, keywords]) => keywords.some((kw) => wordMatch(text, kw)))
    .map(([symbol]) => symbol);
}

export function detectCategory(title: string, description: string): NewsCategory {
  const text = `${title} ${description}`.toLowerCase();
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => wordMatch(text, kw))) {
      return category;
    }
  }
  return "Markets";
}
