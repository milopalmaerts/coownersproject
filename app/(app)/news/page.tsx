import { Suspense } from "react";
import { economicCalendarProvider, newsProvider } from "@/lib/providers";
import { NewsCalendarTabs } from "@/components/news/NewsCalendarTabs";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default async function NewsPage() {
  // Each source runs on its own error path, so one being down doesn't take
  // out the other tab.
  const newsPromise = newsProvider.getLatestNews(30).catch(() => null);
  const eventsPromise = economicCalendarProvider.getEvents().catch(() => []);

  const [news, events] = await Promise.all([newsPromise, eventsPromise]);

  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 07 · Intelligence</p>
        <h1 className="text-xl font-bold text-tl-text-primary">
          News &amp; Economic Calendar
        </h1>
        <p className="text-sm text-tl-text-secondary">
          Aggregated crypto headlines (linking to original sources) and
          macro events that tend to move crypto markets too.
        </p>
      </div>
      <ScrollReveal>
        <Suspense fallback={null}>
          <NewsCalendarTabs
            news={news ?? []}
            newsUnavailable={news === null}
            events={events}
          />
        </Suspense>
      </ScrollReveal>
    </div>
  );
}
