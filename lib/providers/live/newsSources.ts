export interface NewsSource {
  name: string;
  feedUrl: string;
}

// Official RSS feeds only — each site publishes these for syndication, so
// pulling title/summary/link/date is expected use, not scraping. We only
// ever show the summary + a link back to the source, never the full article.
export const NEWS_SOURCES: NewsSource[] = [
  { name: "Cointelegraph", feedUrl: "https://cointelegraph.com/rss" },
  { name: "Decrypt", feedUrl: "https://decrypt.co/feed" },
  { name: "CoinDesk", feedUrl: "https://www.coindesk.com/arc/outboundfeeds/rss/" },
  { name: "CryptoSlate", feedUrl: "https://cryptoslate.com/feed/" },
];
