import { EconomicCalendarProvider } from "@/lib/providers/types";
import { EconomicEvent } from "@/lib/types";

function hoursFromNow(hours: number): string {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

const DEMO_EVENTS: EconomicEvent[] = [
  {
    id: "demo-1",
    title: "Fed Interest Rate Decision",
    country: "USD",
    date: hoursFromNow(6),
    impact: "High",
    forecast: "4.25%",
    previous: "4.50%",
  },
  {
    id: "demo-2",
    title: "CPI m/m",
    country: "USD",
    date: hoursFromNow(-3),
    impact: "High",
    forecast: "0.2%",
    previous: "0.3%",
  },
  {
    id: "demo-3",
    title: "Non-Farm Employment Change",
    country: "USD",
    date: hoursFromNow(30),
    impact: "High",
    forecast: "180K",
    previous: "142K",
  },
  {
    id: "demo-4",
    title: "ECB President Speaks",
    country: "EUR",
    date: hoursFromNow(12),
    impact: "Medium",
    forecast: "",
    previous: "",
  },
  {
    id: "demo-5",
    title: "Unemployment Rate",
    country: "GBP",
    date: hoursFromNow(20),
    impact: "Medium",
    forecast: "4.1%",
    previous: "4.1%",
  },
  {
    id: "demo-6",
    title: "Retail Sales m/m",
    country: "USD",
    date: hoursFromNow(-20),
    impact: "Low",
    forecast: "0.3%",
    previous: "0.2%",
  },
];

export class DemoEconomicProvider implements EconomicCalendarProvider {
  async getEvents(): Promise<EconomicEvent[]> {
    return DEMO_EVENTS;
  }
}
