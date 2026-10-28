import { useEffect, useMemo, useState } from "react";
import Button from "./Button";
import { supabase } from "../lib/supabase";
import { FASTING, FOCUS, adviceFor, dayNumber, type CatKey } from "../lib/prayerFocus";
import type { Couple } from "../lib/useCouple";

type P = { id: string; owner_id: string; body: string; category: string; visibility: string; created_at: string };
const DEFAULT_POOL: CatKey[] = ["relationship", "growth", "gratitude", "work", "family", "health", "guidance"];
const FLAG = "tishok-fasting";
const readFlag = () => { try { return localStorage.getItem(FLAG) === "1"; } catch { return false; } };

export default function PrayerFocus({ userId, couple, onOpenPrayer }: { userId?: string; couple: Couple; onOpenPrayer?: () => void }) {
  const [prayers, setPrayers] = useState<P[]>([]);
  const [mode, setMode] = useState<"morning" | "evening">(() => {
    const h = new Date().getHours();
    return h >= 18 || h < 4 ? "evening" : "morning";
  });
  const [fasting, setFasting] = useState(readFlag);

  // Row Level Security means this only ever returns your own prayers plus ones your partner shared.
  useEffect(() => {
    if (!supabase || !userId) return;
    supabase.from("prayers").select("id, owner_id, body, category, visibility, created_at")
      .is("answered_at", null).order("created_at", { ascending: false })
      .then(({ data }) => setPrayers((data as P[] | null) ?? []));
  }, [userId]);

  const { cat, chosen } = useMemo(() => {
    const n = dayNumber(new Date());
    const present = [...new Set(prayers.map((p) => p.category))].filter((c): c is CatKey => c in FOCUS).sort();
    const extras = (["growth", "gratitude"] as CatKey[]).filter((c) => !present.includes(c));
    const pool = prayers.length ? [...present, ...extras] : DEFAULT_POOL;
    const cat = pool[n % pool.length];
    const matching = prayers.filter((p) => p.category === cat);
    return { cat, chosen: matching.length ? matching[n % matching.length] : null };
  }, [prayers]);

  const partner = couple.partner?.first_name ?? "your partner";
  const content = FOCUS[cat];
  const points = mode === "morning" ? content.morning : content.evening;
  const ageDays = chosen ? Math.floor((Date.now() - new Date(chosen.created_at).getTime()) / 86400000) : null;
  const advice = adviceFor(cat, ageDays, couple.status === "connected");
  const showFast = fasting && mode === "morning" && new Date().getDay() === 6; // Saturdays

  const who = chosen
    ? chosen.owner_id === userId ? (chosen.visibility === "shared" ? `Shared with ${partner}` : "Your prayer") : `From ${partner}`
    : "";
  const excerpt = chosen && (chosen.body.length > 140 ? chosen.body.slice(0, 140).trimEnd() + "…" : chosen.body);

  function toggleFasting() {
    const next = !fasting;
    setFasting(next);
    try { localStorage.setItem(FLAG, next ? "1" : "0"); } catch { /* ignore */ }
  }

  return (
    <section className={`card focus ${mode === "evening" ? "night" : ""}`} aria-labelledby="focus-h">
      <div className="row" role="group" aria-label="Time of day">
        <button className="choice" aria-pressed={mode === "morning"} onClick={() => setMode("morning")}>Morning</button>
        <button className="choice" aria-pressed={mode === "evening"} onClick={() => setMode("evening")}>Evening</button>
      </div>
      <h2 id="focus-h" style={{ marginTop: "1rem" }}>{mode === "morning" ? "Today’s prayer focus" : "Before you sleep"}</h2>
      <p className="focus-title">{content.title}</p>

      {chosen && (
        <p className="focus-quote"><span className="status">{who}</span><br />“{excerpt}”</p>
      )}

      <ol className="questions">{points.map((t) => <li key={t}>{t}</li>)}</ol>
      {advice && <p style={{ marginTop: "0.75rem" }}>{advice}</p>}

      {showFast && (
        <div className="fast">
          <h2>{FASTING.title}</h2>
          <p>{FASTING.body}</p>
          <p className="status" style={{ marginTop: "0.5rem" }}>{FASTING.care}</p>
        </div>
      )}

      <p className="status" style={{ marginTop: "0.75rem" }}>
        Written by Tìshòk as a guide. These are suggestions, not promises about outcomes.
      </p>
      <div className="row" style={{ marginTop: "0.5rem" }}>
        {onOpenPrayer && <Button variant="quiet" onClick={onOpenPrayer} style={{ paddingLeft: 0 }}>Open Prayer Room</Button>}
        <Button variant="quiet" onClick={toggleFasting}>{fasting ? "Turn off fasting suggestions" : "Turn on fasting suggestions"}</Button>
      </div>
    </section>
  );
}
