import Parser from "rss-parser";
import { NewsItem } from "@/lib/types";
import { NewsSource } from "@/lib/providers/live/newsSources";
import { detectCategory, detectRelatedSymbols } from "@/lib/providers/live/newsClassify";

const parser = new Parser();

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  "#039": "'",
};

// CryptoSlate/CoinDesk sometimes double-encode entities (e.g. "S&#038;P" for
// "S&P", where &#038; is itself the numeric form of &amp;), so titles need
// decoding too, not just the HTML-stripped description.
function decodeEntities(text: string): string {
  return text.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    if (entity[0] === "#") {
      const codePoint =
        entity[1]?.toLowerCase() === "x"
          ? parseInt(entity.slice(2), 16)
          : parseInt(entity.slice(1), 10);
      return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
    }
    return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
  });
}

function stripHtml(html: string | undefined): string {
  if (!html) return "";
  return decodeEntities(
    html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  );
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function fetchFeed(source: NewsSource): Promise<NewsItem[]> {
  const res = await fetch(source.feedUrl, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; TradingLegendsBot/1.0)" },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    throw new Error(`RSS feed request failed: ${res.status} ${source.feedUrl}`);
  }

  const xml = await res.text();
  const feed = await parser.parseString(xml);

  return (feed.items ?? [])
    .filter((item) => item.title && item.link)
    .map((item) => {
      const title = decodeEntities(item.title!.trim());
      const description = truncate(
        stripHtml(item.contentSnippet || item.content || item.summary),
        220
      );
      const publishedAt = item.isoDate ?? new Date(item.pubDate ?? Date.now()).toISOString();

      return {
        id: item.guid ?? item.link!,
        title,
        description,
        source: source.name,
        url: item.link!,
        publishedAt,
        relatedSymbols: detectRelatedSymbols(title, description),
        category: detectCategory(title, description),
      } satisfies NewsItem;
    });
}
