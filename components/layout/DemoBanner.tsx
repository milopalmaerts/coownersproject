import { isDemoMode } from "@/lib/providers";

export function DemoBanner() {
  if (!isDemoMode) return null;

  return (
    <div className="w-full bg-tl-warning/10 border-b border-tl-warning/30 text-tl-warning text-xs md:text-sm px-4 py-2 text-center">
      <span className="font-semibold">DEMO MODE</span> — Showing sample data,
      not live market data.
    </div>
  );
}
