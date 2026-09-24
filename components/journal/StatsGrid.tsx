import { JournalStats } from "@/lib/journal/calculations";
import { Card } from "@/components/ui/Card";

function rColor(v: number): string {
  if (v > 0) return "text-tl-positive";
  if (v < 0) return "text-tl-negative";
  return "text-tl-text-secondary";
}

function StatTile({
  label,
  value,
  colorClass = "text-tl-text-primary",
  prominent = false,
}: {
  label: string;
  value: string;
  colorClass?: string;
  prominent?: boolean;
}) {
  return (
    <Card className={prominent ? "border-tl-accent/40" : ""}>
      <div className="text-xs text-tl-text-muted">{label}</div>
      <div className={`mt-1 font-bold tabular-nums tl-mono ${prominent ? "text-2xl" : "text-lg"} ${colorClass}`}>
        {value}
      </div>
    </Card>
  );
}

export function StatsGrid({ stats }: { stats: JournalStats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      <StatTile label="Total R" value={`${stats.totalR >= 0 ? "+" : ""}${stats.totalR.toFixed(2)}R`} colorClass={rColor(stats.totalR)} prominent />
      <StatTile label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} prominent />
      <StatTile label="Avg R / Trade" value={`${stats.avgR >= 0 ? "+" : ""}${stats.avgR.toFixed(2)}R`} colorClass={rColor(stats.avgR)} prominent />
      <StatTile label="Expectancy" value={`${stats.expectancy >= 0 ? "+" : ""}${stats.expectancy.toFixed(2)}R`} colorClass={rColor(stats.expectancy)} prominent />
      <StatTile label="Max Drawdown" value={`-${stats.maxDrawdown.toFixed(2)}R`} colorClass="text-tl-negative" prominent />

      <StatTile label="Total Trades" value={String(stats.totalTrades)} />
      <StatTile label="Wins" value={String(stats.winningTrades)} colorClass="text-tl-positive" />
      <StatTile label="Losses" value={String(stats.losingTrades)} colorClass="text-tl-negative" />
      <StatTile label="Break Even" value={String(stats.breakEvenTrades)} />
      <StatTile
        label="Profit Factor"
        value={stats.profitFactor === null ? "—" : stats.profitFactor.toFixed(2)}
      />

      <StatTile label="Avg Win" value={`+${stats.avgWinR.toFixed(2)}R`} colorClass="text-tl-positive" />
      <StatTile label="Avg Loss" value={`${stats.avgLossR.toFixed(2)}R`} colorClass="text-tl-negative" />
      <StatTile label="Largest Win" value={`+${stats.largestWin.toFixed(2)}R`} colorClass="text-tl-positive" />
      <StatTile label="Largest Loss" value={`${stats.largestLoss.toFixed(2)}R`} colorClass="text-tl-negative" />
      <StatTile
        label="Current Streak"
        value={
          stats.currentStreak.type === "none"
            ? "—"
            : `${stats.currentStreak.count} ${stats.currentStreak.type === "win" ? "win" : "loss"}${stats.currentStreak.count > 1 ? "s" : ""}`
        }
        colorClass={stats.currentStreak.type === "win" ? "text-tl-positive" : stats.currentStreak.type === "loss" ? "text-tl-negative" : undefined}
      />
    </div>
  );
}
