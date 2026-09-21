import { EconomicCalendarProvider } from "@/lib/providers/types";
import { EconomicEvent, EventImpact } from "@/lib/types";

// ForexFactory's own calendar, republished by their partner FairEconomy as a
// free, unauthenticated, cache-friendly JSON feed intended for third-party
// consumption (Cache-Control: public, served off Cloudflare) — this is the
// same data ForexFactory shows on forexfactory.com/calendar, not a scrape.
// Only a rolling "this week" feed exists; there's no ?next/?last variant.
const CALENDAR_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";

interface RawEvent {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
}

function normalizeImpact(impact: string): EventImpact {
  if (impact === "High" || impact === "Medium" || impact === "Low") {
    return impact;
  }
  return "Low";
}

export class LiveEconomicCalendarProvider implements EconomicCalendarProvider {
  async getEvents(): Promise<EconomicEvent[]> {
    const res = await fetch(CALENDAR_URL, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; TradingLegendsBot/1.0)" },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      throw new Error(`Economic calendar request failed: ${res.status}`);
    }

    const raw = (await res.json()) as RawEvent[];

    return raw
      .map((e, index) => ({
        id: `${e.date}-${e.country}-${e.title}-${index}`,
        title: e.title,
        country: e.country,
        date: new Date(e.date).toISOString(),
        impact: normalizeImpact(e.impact),
        forecast: e.forecast,
        previous: e.previous,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
}
