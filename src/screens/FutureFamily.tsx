import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import { JOURNEYS } from "../lib/journeys";
import { supabase } from "../lib/supabase";
import type { Couple } from "../lib/useCouple";

type Row = { journey_key: string; step_key: string; owner_id: string; answer: string; visibility: string };

function Step({ n, prompt, mine, theirs, partner, canShare, onSave }: {
  n: number; prompt: string; mine?: Row; theirs?: Row; partner: string; canShare: boolean;
  onSave: (answer: string, visibility: "private" | "shared") => Promise<string | null>;
}) {
  const [text, setText] = useState(mine?.answer ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function go(v: "private" | "shared") {
    setBusy(true);
    const err = await onSave(text.trim(), v);
    setMsg(err ?? "Saved.");
    setBusy(false);
  }

  return (
    <section className={`card ${mine ? "answered" : ""}`}>
      <p className="status">Question {n}</p>
      <p className="scripture-ref" style={{ marginTop: "0.5rem" }}>{prompt}</p>
      <textarea className="field" value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Take your time." aria-label={`Your answer to question ${n}`} maxLength={4000} />
      {mine && <p className="status">{mine.visibility === "shared" ? `Saved · shared with ${partner}` : "Saved · only you"}</p>}
      {msg && <p className="status" role="status">{msg}</p>}
      <div className="row" style={{ marginTop: "0.75rem" }}>
        <Button disabled={busy || !text.trim()} onClick={() => go("private")}>Save privately</Button>
        <Button variant="quiet" disabled={busy || !text.trim() || !canShare} onClick={() => go("shared")}>
          {canShare ? `Save and share with ${partner}` : "Connect to share"}
        </Button>
      </div>
      {theirs && mine && <p className="prayer-body" style={{ marginTop: "1rem" }}><span className="status">{partner}’s answer</span><br />{theirs.answer}</p>}
      {theirs && !mine && <p className="status" style={{ marginTop: "0.75rem" }}>{partner} has shared an answer. It appears once you have answered.</p>}
    </section>
  );
}

export default function FutureFamily({ userId, couple }: { userId?: string; couple: Couple }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const partner = couple.partner?.first_name ?? "your partner";
  const canShare = couple.status === "connected";

  const load = useCallback(async () => {
    if (!supabase || !userId) return;
    const { data } = await supabase.from("journey_answers").select("journey_key, step_key, owner_id, answer, visibility");
    setRows((data as Row[] | null) ?? []);
  }, [userId]);

  useEffect(() => { load(); }, [load, couple.status]);

  async function save(journey: string, step: string, answer: string, visibility: "private" | "shared") {
    if (!supabase || !userId) return "Not signed in";
    const { error } = await supabase.from("journey_answers").upsert(
      { owner_id: userId, journey_key: journey, step_key: step, answer, visibility },
      { onConflict: "owner_id,journey_key,step_key" });
    if (error) return error.message; // your words stay in the box if saving fails
    await load();
    return null;
  }

  if (!userId) return <p className="status">Sign in to explore the journeys.</p>;
  if (rows === null) return <div className="skeleton" aria-hidden="true" />;

  const journey = JOURNEYS.find((j) => j.key === openKey);

  if (journey) {
    return (
      <>
        <Button variant="quiet" onClick={() => setOpenKey(null)} style={{ paddingLeft: 0 }}>← All journeys</Button>
        <h1 className="greeting">{journey.title}</h1>
        <p className="subline">{journey.intro}</p>
        {journey.steps.map((s, i) => (
          <Step key={`${journey.key}-${s.key}`} n={i + 1} prompt={s.prompt} partner={partner} canShare={canShare}
            mine={rows.find((r) => r.journey_key === journey.key && r.step_key === s.key && r.owner_id === userId)}
            theirs={rows.find((r) => r.journey_key === journey.key && r.step_key === s.key && r.owner_id !== userId)}
            onSave={(a, v) => save(journey.key, s.key, a, v)} />
        ))}
      </>
    );
  }

  return (
    <>
      <h1 className="greeting">Future Family</h1>
      <p className="subline">A hopeful look ahead. Nothing here is a decision. It is a conversation, at your own pace.</p>
      {JOURNEYS.map((j) => {
        const done = j.steps.filter((s) => rows.some((r) => r.journey_key === j.key && r.step_key === s.key && r.owner_id === userId)).length;
        return (
          <section key={j.key} className="card">
            <h2>{j.title}</h2>
            <p>{j.intro}</p>
            <p className="status" style={{ marginTop: "0.5rem" }}>
              {done === 0 ? "Not started" : `${done} of ${j.steps.length} answered`}
            </p>
            <Button variant="quiet" onClick={() => setOpenKey(j.key)} style={{ paddingLeft: 0 }}>
              {done === 0 ? "Begin" : "Continue"}
            </Button>
          </section>
        );
      })}
    </>
  );
}
