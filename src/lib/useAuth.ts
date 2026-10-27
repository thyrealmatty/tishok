import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type Profile = { id: string; first_name: string; relationship_stage: string };

// undefined = still loading, null = none.
export function useAuth() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || session === undefined) return;
    if (session === null) { setProfile(null); return; }
    setProfile(undefined);
    supabase.from("profiles").select("id, first_name, relationship_stage")
      .eq("id", session.user.id).maybeSingle()
      .then(({ data }) => setProfile((data as Profile | null) ?? null));
  }, [session]);

  async function saveProfile(first_name: string, relationship_stage: string): Promise<string | null> {
    if (!supabase || !session) return "Not signed in";
    const row = { id: session.user.id, first_name: first_name.trim(), relationship_stage };
    const { error } = await supabase.from("profiles").upsert(row);
    if (error) return error.message;
    setProfile(row);
    return null;
  }

  async function signOut() { await supabase?.auth.signOut(); }

  return { session, profile, saveProfile, signOut };
}
