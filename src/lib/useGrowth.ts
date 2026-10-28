import { useCallback, useEffect, useState } from "react";
import { todayKey } from "./devotionals";
import { supabase } from "./supabase";

export type Growth = {
  days: { label: string; on: boolean }[];
  counts: { devotionals: number; prayers: number; conversations: number };
  ready: boolean;
};
const empty: Growth = { days: [], counts: { devotionals: 0, prayers: 0, conversations: 0 }, ready: false };

// Counts only YOUR OWN activity over the last 7 days. It never compares you with your partner.
export function useGrowth(userId?: string): Growth {
  const [g, setG] = useState<Growth>(empty);

  const load = useCallback(async () => {
    if (!supabase || !userId) return;
    const keys: { key: string; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      keys.push({ key: todayKey(d), label: d.toLocaleDateString(undefined, { weekday: "narrow" }) });
    }
    const start = keys[0].key;
    const startIso = new Date(`${start}T00:00:00`).toISOString();
    const [dev, us, pr] = await Promise.all([
      supabase.from("devotional_entries").select("entry_date, owner_id").gte("entry_date", start),
      supabase.from("us_answers").select("entry_date, owner_id").gte("entry_date", start),
      supabase.from("prayers").select("created_at, owner_id").gte("created_at", startIso),
    ]);
    const mine = (rows: { owner_id: string }[] | null) => (rows ?? []).filter((r) => r.owner_id === userId);
    const devs = mine(dev.data) as { entry_date: string }[];
    const uss = mine(us.data) as { entry_date: string }[];
    const prs = mine(pr.data) as { created_at: string }[];
    const active = new Set<string>([
      ...devs.map((x) => x.entry_date), ...uss.map((x) => x.entry_date),
      ...prs.map((x) => todayKey(new Date(x.created_at))),
    ]);
    setG({
      days: keys.map((k) => ({ label: k.label, on: active.has(k.key) })),
      counts: { devotionals: devs.length, prayers: prs.length, conversations: uss.length },
      ready: true,
    });
  }, [userId]);

  useEffect(() => {
    load();
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  return g;
}
