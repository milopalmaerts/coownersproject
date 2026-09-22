import { runHealthChecks } from "@/lib/healthCheck";
import { hasEtherscanApiKey } from "@/lib/providers";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

// Its own Suspense-wrapped section (like the dashboard's whale/news blocks)
// since each ping has its own timeout and the whole set can take a couple
// seconds — the rest of Settings shouldn't wait on that.
export async function ProviderHealthSection() {
  const results = await runHealthChecks(hasEtherscanApiKey);

  return (
    <Card label="health.sh">
      <CardHeader title="System Health" />
      <p className="text-xs text-tl-text-muted mb-3">
        Live pings, checked just now — not cached or stored, so this always
        reflects the current moment, not a stale last-known-good.
      </p>
      <ul className="space-y-2 text-sm">
        {results.map((r) => (
          <li key={r.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge tone={r.ok ? "positive" : "negative"}>{r.ok ? "OK" : "DOWN"}</Badge>
              <span className="text-tl-text-secondary">{r.name}</span>
            </div>
            <span className="tl-mono text-xs text-tl-text-muted">
              {r.ok ? `${r.latencyMs}ms` : r.detail}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
