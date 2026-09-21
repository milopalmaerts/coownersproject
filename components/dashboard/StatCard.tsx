import { Card } from "@/components/ui/Card";

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <div className="text-xs text-tl-text-muted">{label}</div>
      <div className="mt-2 text-xl font-bold text-tl-text-primary tabular-nums">
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-tl-text-secondary">{hint}</div>}
    </Card>
  );
}
