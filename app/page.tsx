import Link from "next/link";
import { TickerTape } from "@/components/layout/TickerTape";
import { BootSequence } from "@/components/marketing/BootSequence";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Card } from "@/components/ui/Card";

const FEATURES = [
  {
    icon: "📊",
    title: "Market Intelligence",
    description:
      "Real-time prices, volume, market cap and volatility across major crypto assets.",
  },
  {
    icon: "🐋",
    title: "Whale Tracking",
    description:
      "Monitor large on-chain transactions with configurable thresholds per asset.",
  },
  {
    icon: "🔔",
    title: "Automated Alerts",
    description:
      "Price and round-number Discord alerts on BTC/ETH — no noise, no news spam.",
  },
  {
    icon: "📰",
    title: "Crypto News",
    description:
      "Aggregated news across Bitcoin, Ethereum, DeFi, regulation and more.",
  },
];

const MODULES = [
  { n: "01", title: "Market Data", detail: "Live prices, volume, volatility" },
  { n: "02", title: "Whale Watch", detail: "On-chain large-transaction scanner" },
  { n: "03", title: "Liquidation Flow", detail: "Live liquidation tape + funding/OI" },
  { n: "04", title: "Alert Engine", detail: "Automated Discord price alerts" },
  { n: "05", title: "News & Calendar", detail: "Aggregated headlines + macro events" },
  { n: "06", title: "Watchlist", detail: "Synced across devices with an account" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col tl-grid-bg">
      <TickerTape />
      <header className="flex items-center justify-between px-6 h-16 border-b border-tl-border bg-tl-bg/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="text-tl-accent text-xl">◆</span>
          <span className="tl-mono font-semibold tracking-wide">
            TRADING<span className="text-tl-accent">LEGENDS</span>
          </span>
          <span className="tl-label text-[10px] text-tl-text-muted hidden sm:inline ml-2">
            // SYS:OK
          </span>
        </div>
        <Link
          href="/dashboard"
          className="tl-mono text-xs font-medium px-4 py-2 rounded-md border border-tl-border hover:border-tl-accent hover:text-tl-accent transition-colors"
        >
          Open Dashboard
        </Link>
      </header>

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
          <BootSequence>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
              TRADING<span className="text-tl-accent">LEGENDS</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl text-tl-text-secondary">
              Crypto data. Alerts. Intelligence.
            </p>
            <p className="mt-3 max-w-2xl mx-auto text-tl-text-muted">
              Track markets, whale activity, news and real-time crypto events in
              one place — live data only, never fake.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/dashboard"
                className="tl-mono px-6 py-3 rounded-md bg-tl-accent text-black font-semibold hover:opacity-90 transition-opacity"
              >
                OPEN DASHBOARD →
              </Link>
              <Link
                href="/discord"
                className="tl-mono px-6 py-3 rounded-md border border-tl-border hover:border-tl-accent hover:text-tl-accent transition-colors font-semibold"
              >
                JOIN DISCORD
              </Link>
            </div>
          </BootSequence>
        </section>

        <ScrollReveal className="max-w-5xl mx-auto px-6 pb-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map((feature) => (
            <Card key={feature.title} brackets>
              <div className="text-2xl mb-3">{feature.icon}</div>
              <h3 className="tl-label text-xs text-tl-text-primary mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-tl-text-secondary">
                {feature.description}
              </p>
            </Card>
          ))}
        </ScrollReveal>

        <ScrollReveal delay={0.05} className="max-w-5xl mx-auto px-6 pb-20">
          <p className="tl-label text-xs text-tl-accent mb-4 text-center">
            // Inside the terminal
          </p>
          <div className="tl-window rounded-lg overflow-hidden">
            <div className="tl-window-bar">
              <span className="tl-window-dot" />
              <span className="tl-window-dot" />
              <span className="tl-window-dot" />
              <span className="ml-2">modules.sh</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-tl-border">
              {MODULES.map((m) => (
                <div key={m.n} className="p-4 flex items-center gap-4">
                  <span className="tl-mono text-tl-accent text-sm">{m.n}</span>
                  <div>
                    <div className="text-sm font-medium text-tl-text-primary">
                      {m.title}
                    </div>
                    <div className="text-xs text-tl-text-muted">{m.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1} className="max-w-3xl mx-auto px-6 pb-24 text-center text-xs text-tl-text-muted">
          TradingLegends is a research and information platform. It does not
          provide financial advice, and does not guarantee profits or future
          market performance.
        </ScrollReveal>
      </main>

      <footer className="border-t border-tl-border px-6 py-6 text-center text-xs text-tl-text-muted tl-mono">
        © {new Date().getFullYear()} TradingLegends. All rights reserved.
      </footer>
    </div>
  );
}
