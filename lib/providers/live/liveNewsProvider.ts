import { NewsProvider } from "@/lib/providers/types";
import { NewsItem } from "@/lib/types";
import { NEWS_SOURCES } from "@/lib/providers/live/newsSources";
import { fetchFeed } from "@/lib/providers/live/rss";

function dedupeByUrl(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

// Aggregates several official RSS feeds (see newsSources.ts) into one
// sorted, deduped list. A single feed being down doesn't take the others
// with it (Promise.allSettled) — but if every feed fails, that's a real
// outage and we throw rather than silently show nothing was wrong.
export class LiveNewsProvider implements NewsProvider {
  private async fetchAll(): Promise<NewsItem[]> {
    const results = await Promise.allSettled(NEWS_SOURCES.map(fetchFeed));

    const items = results
      .filter((r): r is PromiseFulfilledResult<NewsItem[]> => r.status === "fulfilled")
      .flatMap((r) => r.value);

    if (items.length === 0) {
      const firstError = results.find(
        (r): r is PromiseRejectedResult => r.status === "rejected"
      );
      throw new Error(
        `All news sources failed${firstError ? `: ${firstError.reason}` : ""}`
      );
    }

    return dedupeByUrl(items).sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  async getLatestNews(limit = 20): Promise<NewsItem[]> {
    const items = await this.fetchAll();
    return items.slice(0, limit);
  }

  async getNewsBySymbol(symbol: string, limit = 20): Promise<NewsItem[]> {
    const items = await this.fetchAll();
    return items
      .filter((item) =>
        item.relatedSymbols.some((s) => s.toLowerCase() === symbol.toLowerCase())
      )
      .slice(0, limit);
  }
}
