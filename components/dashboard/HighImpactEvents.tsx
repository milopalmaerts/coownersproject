import Link from "next/link";
import { EconomicEvent } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { EconomicEventRow } from "@/components/calendar/EconomicEventRow";

export function HighImpactEvents({ events }: { events: EconomicEvent[] }) {
  const now = Date.now();
  const upcoming = events
    .filter((e) => e.impact === "High" && new Date(e.date).getTime() >= now)
    .slice(0, 5);

  return (
    <Card>
      <CardHeader
        title="High-Impact Events"
        action={
          <Link
            href="/news?view=calendar"
            className="text-xs text-tl-accent hover:underline"
          >
            Full calendar
          </Link>
        }
      />
      {upcoming.length === 0 ? (
        <p className="text-sm text-tl-text-muted">
          No high-impact events coming up this week.
        </p>
      ) : (
        <ul className="divide-y divide-tl-border">
          {upcoming.map((event) => (
            <EconomicEventRow key={event.id} event={event} />
          ))}
        </ul>
      )}
    </Card>
  );
}
