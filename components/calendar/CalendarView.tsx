"use client";

import { useMemo, useState } from "react";
import { EconomicEvent, EventImpact } from "@/lib/types";
import { formatDateUtc } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { EconomicEventRow } from "@/components/calendar/EconomicEventRow";

type FilterTab = "all" | "medium-up" | "high";

const TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All impact" },
  { key: "medium-up", label: "Medium & High" },
  { key: "high", label: "High only" },
];

function matchesFilter(impact: EventImpact, tab: FilterTab): boolean {
  if (tab === "all") return true;
  if (tab === "medium-up") return impact === "Medium" || impact === "High";
  return impact === "High";
}

export function CalendarView({ events }: { events: EconomicEvent[] }) {
  const [tab, setTab] = useState<FilterTab>("medium-up");

  const groups = useMemo(() => {
    const filtered = events.filter((e) => matchesFilter(e.impact, tab));
    const byDay = new Map<string, EconomicEvent[]>();

    for (const event of filtered) {
      const dayKey = formatDateUtc(event.date);
      const existing = byDay.get(dayKey) ?? [];
      existing.push(event);
      byDay.set(dayKey, existing);
    }

    return Array.from(byDay.entries());
  }, [events, tab]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              tab === t.key
                ? "bg-tl-accent text-black border-tl-accent"
                : "border-tl-border text-tl-text-secondary hover:border-tl-accent/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {groups.length === 0 ? (
        <Card>
          <p className="text-sm text-tl-text-muted">
            No events match this filter this week.
          </p>
        </Card>
      ) : (
        groups.map(([day, dayEvents]) => (
          <Card key={day}>
            <CardHeader title={day} />
            <ul className="divide-y divide-tl-border">
              {dayEvents.map((event) => (
                <EconomicEventRow key={event.id} event={event} />
              ))}
            </ul>
          </Card>
        ))
      )}
    </div>
  );
}
