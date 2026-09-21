import { newsProvider } from "@/lib/providers";
import { NewsList } from "@/components/news/NewsList";

export async function LatestNewsSection() {
  const news = await newsProvider.getLatestNews(5).catch(() => null);

  return (
    <NewsList title="Latest News" news={news ?? []} unavailable={news === null} />
  );
}
