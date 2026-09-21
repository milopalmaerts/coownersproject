import { economicCalendarProvider } from "@/lib/providers";
import { HighImpactEvents } from "@/components/dashboard/HighImpactEvents";

export async function HighImpactEventsSection() {
  const events = await economicCalendarProvider.getEvents().catch(() => []);
  return <HighImpactEvents events={events} />;
}
