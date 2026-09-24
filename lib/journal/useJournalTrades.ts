"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { JournalTrade } from "@/lib/journal/types";

export function useJournalTrades(userId: string | null) {
  const [trades, setTrades] = useState<JournalTrade[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!userId) {
      setTrades([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    createClient()
      .from("journal_trades")
      .select("*")
      .eq("user_id", userId)
      .order("trade_date", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error("[journal] failed to load trades", error);
        setTrades(data ?? []);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function addTrade(trade: Partial<JournalTrade>): Promise<{ error: string | null }> {
    if (!userId) return { error: "Not signed in" };
    const { data, error } = await createClient()
      .from("journal_trades")
      .insert({ ...trade, user_id: userId })
      .select("*")
      .single();
    if (error) return { error: error.message };
    setTrades((prev) => [data, ...prev]);
    return { error: null };
  }

  async function updateTrade(id: string, patch: Partial<JournalTrade>): Promise<{ error: string | null }> {
    const { data, error } = await createClient()
      .from("journal_trades")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();
    if (error) return { error: error.message };
    setTrades((prev) => prev.map((t) => (t.id === id ? data : t)));
    return { error: null };
  }

  async function deleteTrade(id: string): Promise<{ error: string | null }> {
    const { error } = await createClient().from("journal_trades").delete().eq("id", id);
    if (error) return { error: error.message };
    setTrades((prev) => prev.filter((t) => t.id !== id));
    return { error: null };
  }

  return { trades, loading, addTrade, updateTrade, deleteTrade, reload };
}
