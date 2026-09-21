import { EconomicEvent } from "@/lib/types";
import { formatEventCountdown, formatTimeUtc } from "@/lib/format";
import { countryFlag } from "@/lib/countryFlags";
import { ImpactBadge } from "@/components/calendar/ImpactBadge";

export function EconomicEventRow({ event }: { event: EconomicEvent }) {
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-lg shrink-0">{countryFlag(event.country)}</span>
        <div className="min-w-0">
          <div className="text-sm font-medium text-tl-text-primary truncate">
            {event.title}
          </div>
          <div className="text-xs text-tl-text-muted">
            {event.country} · {formatTimeUtc(event.date)}
            {(event.forecast || event.previous) && (
              <>
                {" · "}
                {event.forecast && `forecast ${event.forecast}`}
                {event.forecast && event.previous && " · "}
                {event.previous && `prev ${event.previous}`}
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-tl-text-muted tabular-nums">
          {formatEventCountdown(event.date)}
        </span>
        <ImpactBadge impact={event.impact} />
      </div>
    </li>
  );
}
