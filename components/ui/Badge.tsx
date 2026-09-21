import { ReactNode } from "react";

type BadgeTone = "positive" | "negative" | "warning" | "info" | "neutral";

const TONE_CLASSES: Record<BadgeTone, string> = {
  positive: "bg-tl-positive/10 text-tl-positive border-tl-positive/30",
  negative: "bg-tl-negative/10 text-tl-negative border-tl-negative/30",
  warning: "bg-tl-warning/10 text-tl-warning border-tl-warning/30",
  info: "bg-tl-info/10 text-tl-info border-tl-info/30",
  neutral: "bg-white/5 text-tl-text-secondary border-tl-border",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}

export function PctBadge({ value }: { value: number }) {
  const tone: BadgeTone = value > 0 ? "positive" : value < 0 ? "negative" : "neutral";
  const sign = value > 0 ? "+" : "";
  return <Badge tone={tone}>{`${sign}${value.toFixed(2)}%`}</Badge>;
}
