import { EventImpact } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

const IMPACT_TONE = {
  High: "negative",
  Medium: "warning",
  Low: "neutral",
} as const;

export function ImpactBadge({ impact }: { impact: EventImpact }) {
  return <Badge tone={IMPACT_TONE[impact]}>{impact}</Badge>;
}
