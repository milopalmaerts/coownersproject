import { Card, CardHeader } from "@/components/ui/Card";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/tickers",
    description: "Live price, 24h change, volume, market cap for all tracked assets.",
    example: `{
  "tickers": [
    { "symbol": "BTC", "name": "Bitcoin", "price": 85960, "change24hPct": 1.33, "volume24h": 52600000000, "marketCap": 1726500000000, "high24h": 87330, "low24h": 84830, "volatility24hPct": 2.1 }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/whales",
    description:
      "Recent large on-chain transactions (BTC, native ETH, USDT/USDC on Ethereum). Both sides show \"Unknown wallet\" unless matched against a small curated list of known exchange addresses.",
    example: `{
  "transactions": [
    { "id": "btc-...", "symbol": "BTC", "usdValue": 1234567, "fromLabel": "Unknown wallet", "toLabel": "Unknown wallet", "fromType": "unknown", "toType": "unknown", "timestamp": "2026-09-24T10:00:00.000Z", "txUrl": "https://mempool.space/tx/..." }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/public/funding",
    description: "Live funding rate and open interest per asset, from Hyperliquid perpetuals.",
    example: `{
  "rates": [
    { "symbol": "BTC", "fundingRatePct": 0.0013, "openInterest": 3900000000 }
  ]
}`,
  },
];

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="tl-label text-xs text-tl-accent mb-1">// 14 · API</p>
        <h1 className="text-xl font-bold text-tl-text-primary">Public API</h1>
        <p className="text-sm text-tl-text-secondary">
          The same data this site runs on, as read-only JSON. Free, no key,
          rate-limited to 30 requests/min per IP. Use it for personal
          projects or your own bots — an attribution link back is
          appreciated but not required. No uptime guarantee, no SLA — this
          is a free hobby project, not a commercial API.
        </p>
      </div>

      {ENDPOINTS.map((ep) => (
        <Card key={ep.path} label={ep.path}>
          <div className="flex items-center gap-2 mb-2">
            <span className="tl-mono text-xs px-2 py-0.5 rounded bg-tl-accent-soft text-tl-accent">
              {ep.method}
            </span>
            <code className="tl-mono text-sm text-tl-text-primary">{ep.path}</code>
          </div>
          <p className="text-sm text-tl-text-secondary mb-3">{ep.description}</p>
          <pre className="tl-mono text-xs bg-tl-bg-card border border-tl-border rounded-lg p-3 overflow-x-auto text-tl-text-secondary">
            {ep.example}
          </pre>
        </Card>
      ))}
    </div>
  );
}
