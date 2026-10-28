import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../components/Button";
import { todayKey } from "../lib/devotionals";
import { questionForDate } from "../lib/questions";
import { supabase } from "../lib/supabase";
import type { Couple } from "../lib/useCouple";

export default function Us({ userId, couple }: { userId?: string; couple: Couple }) {
  const q = useMemo(() => questionForDate(new Date()), []);
  const today = todayKey();
  const [answer, setAnswer] = useState("");
  const [shared, setShared] = useState(false);
  const [done, setDone] = useState(false);
  const [theirs, setTheirs] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const partner = couple.partner?.first_name ?? "your partner";
  const canShare = couple.status === "connected";

  const load = useCallback(async () => {
    if (!supabase || !userId) return;
    const { data } = await supabase.from("us_answers")
      .select("owner_id, answer, visibility").eq("entry_date", today);
    const mine = data?.find((a) => a.owner_id === userId);
    setDone(Boolean(mine));
    if (mine) { setAnswer((a) => a || mine.answer); setShared(mine.visibility === "shared"); }
    setTheirs(data?.find((a) => a.owner_id !== userId)?.answer ?? null);
  }, [userId, today]);

  useEffect(() => { load(); }, [load, couple.status]);

  async function save() {
    if (!supabase || !userId || !answer.trim()) return;
    setBusy(true); setMessage(null);
    const { error } = await supabase.from("us_answers").upsert({
      owner_id: userId, question_key: q.key, entry_date: today,
      answer: answer.trim(), visibility: shared && canShare ? "shared" : "private",
    }, { onConflict: "owner_id,entry_date" });
    if (error) setMessage(error.message); // your words stay in the box if saving fails
    else { setFlash(true); setTimeout(() => setFlash(false), 2600); await load(); }
    setBusy(false);
  }

  return (
    <>
      <h1 className="greeting">Together</h1>
      <p className="subline">Small, honest conversations. You decide what gets shared.</p>

      <section className={`card ${done ? "answered" : ""} ${flash ? "flash" : ""}`}>
        <p className="status">{q.kind} · today’s question</p>
        <p className="scripture-ref" style={{ marginTop: "0.5rem" }}>{q.text}</p>
        {userId ? (
          <>
            <textarea className="field" value={answer} onChange={(e) => setAnswer(e.target.value)}
              placeholder="Take your time. Write what is true for you." aria-label="Your answer" maxLength={4000} />
            <div className="choices" role="radiogroup" aria-label="Who can see this answer">
              <button role="radio" aria-checked={!shared} className="choice" onClick={() => setShared(false)}>Only me</button>
              <button role="radio" aria-checked={shared && canShare} className="choice" disabled={!canShare}
                onClick={() => setShared(true)}>
                {canShare ? `Share with ${partner}` : "Share with your partner (connect first)"}
              </button>
            </div>
            {message && <p className="status" role="status" style={{ marginTop: "0.75rem" }}>{message}</p>}
            {flash && <p style={{ marginTop: "0.75rem" }}>Saved. Thank you for being honest.</p>}
            <div className="actions">
              <Button disabled={busy || !answer.trim()} onClick={save}>{done ? "Update answer" : "Save answer"}</Button>
            </div>
          </>
        ) : (
          <p className="status">Sign in to answer.</p>
        )}
      </section>

      {canShare && theirs && done && (
        <section className="card">
          <h2>{partner}’s answer</h2>
          <p className="prayer-body">{theirs}</p>
        </section>
      )}
      {canShare && theirs && !done && (
        <section className="card empty">
          <p>{partner} has shared an answer. It appears once you have answered, so neither of you is influenced.</p>
        </section>
      )}
      {canShare && !theirs && done && (
        <section className="card empty">
          <p>{partner} has not shared an answer today. That is okay. Some things are better said out loud.</p>
        </section>
      )}

      <p className="status" style={{ margin: "1rem 0" }}>
        When you are both ready, take turns sharing. The listener repeats back what they heard before replying.
      </p>

      <details className="card">
        <summary>Active listening, about 10 minutes</summary>
        <ol className="questions">
          <li>Choose a calm time and a topic that is not an argument.</li>
          <li>One of you speaks for two or three minutes about how you feel, using “I” statements.</li>
          <li>The listener does not interrupt or fix, then says: “What I heard is…”</li>
          <li>The speaker says what was right and what was missed.</li>
          <li>Swap roles. Finish by thanking each other.</li>
        </ol>
      </details>

      <details className="card">
        <summary>Reconnecting after a hard conversation</summary>
        <ol className="questions">
          <li>If emotions are high, take a short break and agree when you will return.</li>
          <li>Pause for a minute of quiet or prayer, together or apart.</li>
          <li>Each name one thing you understand better about the other.</li>
          <li>Each own one thing you could have done differently.</li>
          <li>Agree on one small step, and end with a kind gesture.</li>
        </ol>
        <p className="status" style={{ marginTop: "0.75rem" }}>
          If conversations leave either of you afraid, controlled or silenced, these exercises are not the right tool.
          Talk with a trusted pastor, counsellor or friend, and seek urgent help if you are in danger.
        </p>
      </details>

      <p className="status">Your mentor and Future Family journeys are not built yet. They are planned for later phases.</p>
    </>
  );
}
