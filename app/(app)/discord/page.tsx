import { Card, CardHeader } from "@/components/ui/Card";

const CHANNELS = [
  { name: "#market-alerts", description: "Automated market movement alerts" },
  { name: "#whale-alerts", description: "Large on-chain transaction alerts" },
  { name: "#crypto-news", description: "Aggregated crypto news headlines" },
  { name: "#liquidations", description: "Derivatives liquidation events" },
  { name: "#general", description: "Community discussion" },
  { name: "#bot-commands", description: "Run TradingLegends Bot commands" },
];

const COMMANDS = [
  { cmd: "/price BTC", description: "Get the current price of an asset" },
  { cmd: "/market BTC", description: "Full market snapshot for an asset" },
  { cmd: "/news", description: "Latest crypto news headlines" },
  { cmd: "/whales", description: "Recent large on-chain transactions" },
  { cmd: "/liquidations", description: "Recent liquidation activity" },
  { cmd: "/alerts", description: "Show recently fired automated alerts" },
  { cmd: "/watchlist", description: "View your watchlist" },
  { cmd: "/help", description: "List all available commands" },
];

export default function DiscordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-tl-text-primary">
          TradingLegends Discord
        </h1>
        <p className="text-sm text-tl-text-secondary">
          Join our community and connect the TradingLegends Bot to your
          server channels.
        </p>
      </div>

      <Card>
        <CardHeader title="Community" />
        <p className="text-sm text-tl-text-secondary mb-4">
          The TradingLegends Discord server is where market alerts, whale
          activity, crypto news and liquidation events get delivered in
          real time.
        </p>
        <a
          href="#"
          className="inline-block text-sm font-medium px-4 py-2 rounded-lg bg-tl-accent text-black hover:opacity-90 transition-opacity"
        >
          Join TradingLegends Discord
        </a>
        <p className="text-xs text-tl-text-muted mt-2">
          Invite link will be configured once the server is connected.
        </p>
      </Card>

      <Card>
        <CardHeader title="Channels" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHANNELS.map((c) => (
            <li
              key={c.name}
              className="rounded-lg border border-tl-border p-3"
            >
              <div className="font-medium text-tl-accent text-sm">
                {c.name}
              </div>
              <div className="text-xs text-tl-text-secondary mt-1">
                {c.description}
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardHeader title="TradingLegends Bot Commands" />
        <ul className="divide-y divide-tl-border">
          {COMMANDS.map((c) => (
            <li
              key={c.cmd}
              className="py-2.5 flex items-center justify-between text-sm"
            >
              <code className="text-tl-accent font-mono">{c.cmd}</code>
              <span className="text-tl-text-secondary">{c.description}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
