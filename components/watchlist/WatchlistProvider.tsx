"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { createClient, hasSupabaseConfig } from "@/lib/supabase/client";

const STORAGE_KEY = "tradinglegends.watchlist";
const DEFAULT_WATCHLIST = ["BTC", "ETH", "SOL", "LINK", "AVAX"];

function loadLocalWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_WATCHLIST;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_WATCHLIST;
  } catch {
    return DEFAULT_WATCHLIST;
  }
}

interface WatchlistContextValue {
  symbols: string[];
  hydrated: boolean;
  isWatched: (symbol: string) => boolean;
  add: (symbol: string) => void;
  remove: (symbol: string) => void;
  toggle: (symbol: string) => void;
}

const WatchlistContext = createContext<WatchlistContextValue | null>(null);

// A single provider holds the watchlist state for the whole app, so every
// star button and the /watchlist page itself share one source of truth.
// Signed-in users (userId set) get a real, cross-device watchlist backed by
// Supabase Postgres; signed-out visitors keep the original localStorage
// behavior unchanged — no account required to use the feature at all.
export function WatchlistProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string | null;
}) {
  const [symbols, setSymbols] = useState<string[]>(DEFAULT_WATCHLIST);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (userId && hasSupabaseConfig) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("watchlist_items")
          .select("symbol")
          .eq("user_id", userId);

        if (!cancelled) {
          if (error) {
            console.error("[watchlist] failed to load from Supabase", error);
            setSymbols([]);
          } else {
            setSymbols(data.map((row) => row.symbol));
          }
          setHydrated(true);
        }
        return;
      }

      if (!cancelled) {
        setSymbols(loadLocalWatchlist());
        setHydrated(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!hydrated || userId) return; // signed-in users persist via Supabase directly, not this effect
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(symbols));
    } catch {
      // localStorage unavailable — watchlist stays session-only
    }
  }, [symbols, hydrated, userId]);

  const add = (symbol: string) => {
    setSymbols((prev) => (prev.includes(symbol) ? prev : [...prev, symbol]));
    if (userId && hasSupabaseConfig) {
      createClient()
        .from("watchlist_items")
        .insert({ user_id: userId, symbol })
        .then(({ error }) => {
          if (error) console.error("[watchlist] failed to save", error);
        });
    }
  };

  const remove = (symbol: string) => {
    setSymbols((prev) => prev.filter((s) => s !== symbol));
    if (userId && hasSupabaseConfig) {
      createClient()
        .from("watchlist_items")
        .delete()
        .eq("user_id", userId)
        .eq("symbol", symbol)
        .then(({ error }) => {
          if (error) console.error("[watchlist] failed to remove", error);
        });
    }
  };

  const toggle = (symbol: string) => {
    if (symbols.includes(symbol)) {
      remove(symbol);
    } else {
      add(symbol);
    }
  };

  const value: WatchlistContextValue = {
    symbols,
    hydrated,
    isWatched: (symbol) => symbols.includes(symbol),
    add,
    remove,
    toggle,
  };

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist(): WatchlistContextValue {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return ctx;
}
