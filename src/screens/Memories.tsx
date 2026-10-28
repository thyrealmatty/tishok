import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import GrowthWeek from "../components/GrowthWeek";
import { todayKey } from "../lib/devotionals";
import { supabase } from "../lib/supabase";
import { useGrowth } from "../lib/useGrowth";
import type { Couple } from "../lib/useCouple";

type Memory = {
  id: string; owner_id: string; title: string; body: string | null;
  memory_date: string; category: string; visibility: "private" | "shared";
};
const CATEGORIES = [
  ["moment", "Moment"], ["milestone", "Milestone"], ["testimony", "Testimony"],
  ["note", "Note to each other"], ["hope", "Future hope"], ["answered", "Answered prayer"],
] as const;

const fmt = (d: string) =>
  new Date(`${d}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });

export default function Memories({ userId, couple }: { userId?: string; couple: Couple }) {
  const growth = useGrowth(userId);
  const [items, setItems] = useState<Memory[] | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState(todayKey());
  const [category, setCategory] = useState("moment");
  const [shared, setShared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const partner = couple.partner?.first_name ?? "your partner";
  const canShare = couple.status === "connected";

  const load = useCallback(async () => {
    if (!supabase || !userId) return;
    const { data, error } = await supabase.from("memories")
      .select("id, owner_id, title, body, memory_date, category, visibility")
      .order("memory_date", { ascending: false }).order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    else setItems(data as Memory[]);
  }, [userId]);

  useEffect(() => {
    load();
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  async function save() {
    if (!supabase || !title.trim()) return;
    setBusy(true); setMessage(null);
    const { error } = await supabase.from("memories").insert({
      title: title.trim(), body: body.trim() || null, memory_date: date, category,
      visibility: shared && canShare ? "shared" : "private",
    });
    if (error) setMessage(error.message); // your words stay in the box if saving fails
    else { setTitle(""); setBody(""); setMessage("Saved to your timeline."); await load(); }
    setBusy(false);
  }

  async function remove(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (error) setMessage(error.message);
    else { setConfirmDelete(null); await load(); }
  }

  const who = (m: Memory) =>
    m.owner_id !== userId ? `From ${partner}, shared with you`
      : m.visibility === "shared" ? `Shared with ${partner}` : "Only you";

  if (!userId) {
    return (
      <>
        <h1 className="greeting">Memories</h1>
        <p className="status">Sign in to keep memories.</p>
      </>
    );
  }

  return (
    <>
      <h1 className="greeting">Memories</h1>
      <p className="subline">Moments worth keeping, and how you are growing.</p>

      <GrowthWeek growth={growth} />

      <section className="card">
        <h2>Add a memory</h2>
        <input className="field" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Title" aria-label="Title" maxLength={120} />
        <textarea className="field" value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="Optional. Describe the moment." aria-label="Details" maxLength={4000} />
        <input className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Date" />
        <select className="field" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div className="choices" role="radiogroup" aria-label="Who can see this memory">
          <button role="radio" aria-checked={!shared} className="choice" onClick={() => setShared(false)}>Only me</button>
          <button role="radio" aria-checked={shared && canShare} className="choice" disabled={!canShare}
            onClick={() => setShared(true)}>
            {canShare ? `Share with ${partner}` : "Share with your partner (connect first)"}
          </button>
        </div>
        {message && <p className="status" role="status" style={{ marginTop: "0.75rem" }}>{message}</p>}
        <p className="status" style={{ marginTop: "0.5rem" }}>Photos are not available yet.</p>
        <div className="actions"><Button disabled={busy || !title.trim() || !date} onClick={save}>Save memory</Button></div>
      </section>

      {items === null && <div className="skeleton" aria-hidden="true" style={{ marginTop: "1rem" }} />}

      {items?.length === 0 && (
        <section className="card empty">
          <h2>Your first memory</h2>
          <p>Start with a moment you are thankful for. It stays private unless you choose to share it.</p>
        </section>
      )}

      {items?.map((m) => (
        <article key={m.id} className="card memory">
          <p className="timeline-date">{fmt(m.memory_date)}</p>
          <div className="prayer meta" style={{ marginTop: "0.25rem" }}>
            <span>{CATEGORIES.find(([v]) => v === m.category)?.[1]}</span>
            <span>{who(m)}</span>
          </div>
          <h2 style={{ marginTop: "0.5rem" }}>{m.title}</h2>
          {m.body && <p className="prayer-body">{m.body}</p>}
          {m.owner_id === userId && (
            <div className="row" style={{ marginTop: "0.5rem" }}>
              {confirmDelete === m.id ? (
                <>
                  <Button variant="quiet" onClick={() => remove(m.id)}>Yes, delete</Button>
                  <Button variant="quiet" onClick={() => setConfirmDelete(null)}>Keep</Button>
                </>
              ) : (
                <Button variant="quiet" onClick={() => setConfirmDelete(m.id)} style={{ paddingLeft: 0 }}>Delete</Button>
              )}
            </div>
          )}
        </article>
      ))}
    </>
  );
}
