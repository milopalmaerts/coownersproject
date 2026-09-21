"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { EconomicEvent, NewsItem } from "@/lib/types";
import { NewsList } from "@/components/news/NewsList";
import { CalendarView } from "@/components/calendar/CalendarView";

type View = "news" | "calendar";

export function NewsCalendarTabs({
  news,
  newsUnavailable,
  events,
}: {
  news: NewsItem[];
  newsUnavailable: boolean;
  events: EconomicEvent[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view: View = searchParams.get("view") === "calendar" ? "calendar" : "news";

  const setView = (next: View) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "news") {
      params.delete("view");
    } else {
      params.set("view", next);
    }
    const query = params.toString();
    router.push(`/news${query ? `?${query}` : ""}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={() => setView("news")}
          className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
            view === "news"
              ? "bg-tl-accent text-black border-tl-accent"
              : "border-tl-border text-tl-text-secondary hover:border-tl-accent/50"
          }`}
        >
          📰 News
        </button>
        <button
          onClick={() => setView("calendar")}
          className={`text-sm font-medium px-4 py-2 rounded-lg border transition-colors ${
            view === "calendar"
              ? "bg-tl-accent text-black border-tl-accent"
              : "border-tl-border text-tl-text-secondary hover:border-tl-accent/50"
          }`}
        >
          🗓️ Economic Calendar
        </button>
      </div>

      {view === "news" ? (
        <NewsList news={news} unavailable={newsUnavailable} />
      ) : (
        <CalendarView events={events} />
      )}
    </div>
  );
}
