import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { TickerTape } from "@/components/layout/TickerTape";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { MobileNav } from "@/components/layout/MobileNav";
import { WatchlistProvider } from "@/components/watchlist/WatchlistProvider";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { isDemoMode } from "@/lib/providers";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();

  return (
    <WatchlistProvider userId={user?.id ?? null}>
      <div className="flex h-full min-h-screen w-full">
        <Sidebar isDemoMode={isDemoMode} />
        <div className="flex-1 flex flex-col min-w-0">
          <TickerTape />
          <DemoBanner />
          <Topbar userEmail={user?.email ?? null} />
          <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6">{children}</main>
          <MobileNav />
        </div>
      </div>
      <CommandPalette />
    </WatchlistProvider>
  );
}
