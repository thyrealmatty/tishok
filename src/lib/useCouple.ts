import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { Profile } from "./useAuth";

type State = { status: "off" | "loading" | "none" | "waiting" | "connected"; partner: Profile | null };
export type Couple = State & { refresh: () => Promise<void> };

// Reads the couple link. Row Level Security means we can only ever see our own couple.
export function useCouple(userId?: string): Couple {
  const [state, setState] = useState<State>({ status: userId ? "loading" : "off", partner: null });

  const refresh = useCallback(async () => {
    if (!supabase || !userId) { setState({ status: "off", partner: null }); return; }
    const { data, error } = await supabase.from("couple_members").select("user_id");
    if (error) return; // keep the last known state rather than guessing
    const ids = (data ?? []).map((m) => m.user_id as string);
    if (!ids.includes(userId)) { setState({ status: "none", partner: null }); return; }
    const partnerId = ids.find((i) => i !== userId);
    if (!partnerId) { setState({ status: "waiting", partner: null }); return; }
    const { data: p } = await supabase.from("profiles")
      .select("id, first_name, relationship_stage").eq("id", partnerId).maybeSingle();
    setState({ status: "connected", partner: (p as Profile | null) ?? null });
  }, [userId]);

  useEffect(() => {
    refresh();
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  return { ...state, refresh };
}
