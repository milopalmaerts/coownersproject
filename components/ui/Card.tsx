import { ReactNode } from "react";

export function Card({
  children,
  className = "",
  label,
  brackets = false,
}: {
  children: ReactNode;
  className?: string;
  /** Renders a terminal window title bar (dots + label) above the content. */
  label?: string;
  /** Adds accent corner-bracket decoration, like a highlighted readout. */
  brackets?: boolean;
}) {
  return (
    <div
      className={`tl-window rounded-lg ${brackets ? "tl-brackets" : ""} ${
        label ? "" : "p-4"
      } ${className}`}
    >
      {label && (
        <div className="tl-window-bar rounded-t-lg">
          <span className="tl-window-dot" />
          <span className="tl-window-dot" />
          <span className="tl-window-dot" />
          <span className="ml-2">{label}</span>
        </div>
      )}
      <div className={label ? "p-4" : ""}>{children}</div>
    </div>
  );
}

export function CardHeader({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 className="tl-label text-xs text-tl-text-secondary flex items-center gap-2">
        <span className="text-tl-accent">▸</span>
        {title}
      </h3>
      {action}
    </div>
  );
}
