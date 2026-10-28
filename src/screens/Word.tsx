import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import { devotionalForDate, todayKey } from "../lib/devotionals";
import { supabase } from "../lib/supabase";
import { usePassage } from "../lib/usePassage";
import type { Couple } from "../lib/useCouple";

export default function Word({ userId, couple }: { userId?: string; couple: Couple }) {
  const d = useMemo(() => devotionalForDate(new Date()), []);
  const today = todayKey();
  const passage = usePassage(d.ref);
  const [reflection, setReflection] = useState("");
  const [shared, setShared] = useState(false);
  const [done, setDone] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [partnerNote, setPartnerNote] = useState<string | null>(null);

  const partner = couple.partner?.first_name ?? "your partner";
  const canShare = couple.status === "connected";

  const load = useCallback(async () => {
    if (!supabase || !userId) return;
    const { data } = await supabase.from("devotional_entries")
      .select("owner_id, reflection, visibility").eq("entry_date", today);
    const mine = data?.find((e) => e.owner_id === userId);
    const theirs = data?.find((e) => e.owner_id !== userId && e.reflection);
    setDone(Boolean(mine));
    if (mine) { setReflection((r) => r || mine.reflection || ""); setShared(mine.visibility === "shared"); }
    setPartnerNote(theirs?.reflection ?? null);
  }, [userId, today]);

  useEffect(() => { load(); }, [load, couple.status]);

  async function complete() {
    if (!supabase || !userId) return;
    setBusy(true); setMessage(null);
    const { error } = await supabase.from("devotional_entries").upsert({
      owner_id: userId, devotional_key: d.key, entry_date: today,
      reflection: reflection.trim() || null, visibility: shared && canShare ? "shared" : "private",
    }, { onConflict: "owner_id,entry_date" });
    if (error) setMessage(error.message); // your reflection stays in the box if saving fails
    else {
      setCelebrate(true); setTimeout(() => setCelebrate(false), 2600);
      await load();
    }
    setBusy(false);
  }

  return (
    <>
      <p className="status">Today’s devotional</p>
      <h1 className="greeting">{d.theme}</h1>

      <section className="card scripture">
        <h2>Scripture</h2>
        <p className="scripture-ref">{d.display}</p>
        {passage.status === "loading" && <div className="skeleton" aria-hidden="true" />}
        {passage.status === "ready" && <p className="scripture-body" style={{ whiteSpace: "pre-line" }}>{passage.text}</p>}
        {passage.status === "error" && (
          <p className="scripture-body">The passage text could not be loaded right now. You can read {d.display} in your own Bible.</p>
        )}
        <span className="status">World English Bible, public domain, via bible-api.com</span>
      </section>

      <section className="card">
        <h2>Background</h2>
        <p>{d.context}</p>
        <p className="status" style={{ marginTop: "0.75rem" }}>Written by Tìshòk. This is context, not Scripture.</p>
      </section>

      <section className="card">
        <h2>Reflection</h2>
        <p>{d.message}</p>
        <p className="status" style={{ marginTop: "0.75rem" }}>Written by Tìshòk. This is one interpretation to think about, not Scripture.</p>
      </section>

      <section className="card">
        <h2>Questions to sit with</h2>
        <ol className="questions">{d.questions.map((q) => <li key={q}>{q}</li>)}</ol>
        <h2 style={{ marginTop: "1.25rem" }}>For today</h2>
        <p>{d.action}</p>
        <h2 style={{ marginTop: "1.25rem" }}>Prayer prompt</h2>
        <p>{d.prayer}</p>
      </section>

      {partnerNote && (
        <section className="card">
          <h2>{partner} shared a reflection</h2>
          <p className="prayer-body">{partnerNote}</p>
        </section>
      )}

      {userId ? (
        <section className={`card ${done ? "answered" : ""} ${celebrate ? "flash" : ""}`}>
          <h2>{done ? "Completed today" : "Your reflection"}</h2>
          <textarea className="field" value={reflection} onChange={(e) => setReflection(e.target.value)}
            placeholder="Optional. Write what stood out to you." aria-label="Your reflection" maxLength={4000} />
          <div className="choices" role="radiogroup" aria-label="Who can see this reflection">
            <button role="radio" aria-checked={!shared} className="choice" onClick={() => setShared(false)}>Only me</button>
            <button role="radio" aria-checked={shared && canShare} className="choice" disabled={!canShare}
              onClick={() => setShared(true)}>
              {canShare ? `Share with ${partner}` : "Share with your partner (connect first)"}
            </button>
          </div>
          {message && <p className="status" role="status" style={{ marginTop: "0.75rem" }}>{message}</p>}
          {celebrate && <p style={{ marginTop: "0.75rem" }}>Well done. There is no streak to lose. Come back whenever you can.</p>}
          <div className="actions">
            <Button disabled={busy} onClick={complete}>{done ? "Update reflection" : "Complete today’s devotional"}</Button>
          </div>
        </section>
      ) : (
        <p className="status">Sign in to save reflections.</p>
      )}
    </>
  );
}
