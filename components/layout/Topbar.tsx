import Link from "next/link";
import { isDemoMode } from "@/lib/providers";
import { CommandPaletteButton } from "@/components/layout/CommandPaletteButton";
import { AccountMenu } from "@/components/auth/AccountMenu";

export function Topbar({ userEmail }: { userEmail: string | null }) {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 md:px-6 border-b border-tl-border bg-tl-bg/80 backdrop-blur">
      <div className="flex items-center gap-2 md:hidden">
        <span className="text-tl-accent text-lg">◆</span>
        <span className="tl-mono font-semibold text-sm">
          TRADING<span className="text-tl-accent">LEGENDS</span>
        </span>
      </div>

      <div className="hidden md:flex items-center gap-4">
        <span className="tl-mono text-xs text-tl-text-secondary flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full ${isDemoMode ? "bg-tl-warning" : "bg-tl-positive animate-pulse"}`} />
          {isDemoMode ? "DEMO DATA" : "LIVE"}
        </span>
        <CommandPaletteButton />
      </div>

      <div className="flex items-center gap-3">
        {isDemoMode && (
          <span className="tl-mono text-[11px] font-medium px-2.5 py-1 rounded-full bg-tl-warning/15 text-tl-warning border border-tl-warning/30">
            DEMO MODE
          </span>
        )}
        <Link
          href="/discord"
          className="tl-mono text-xs font-medium px-3 py-1.5 rounded-md bg-tl-accent text-black hover:opacity-90 transition-opacity"
        >
          Join Discord
        </Link>
        <AccountMenu email={userEmail} />
      </div>
    </header>
  );
}
