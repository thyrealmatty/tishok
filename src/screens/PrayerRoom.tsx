import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";
import type { Couple } from "../lib/useCouple";

type Prayer = {
  id: string; owner_id: string; body: string; category: string;
  visibility: "private" | "shared"; answered_at: string | null; created_at: string;
};
const CATEGORIES = [
  ["general", "General"], ["relationship", "Our relationship"], ["family", "Family"],
  ["gratitude", "Gratitude"], ["guidance", "Guidance"],
] as const;

const day = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default function PrayerRoom({ userId, couple }: { userId: string; couple: Couple }) {
  const [items, setItems] = useState<Prayer[] | null>(null);
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [shared, setShared] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const partner = couple.partner?.first_name ?? "your partner";
  const canShare = couple.status === "connected";

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from("prayers")
      .select("id, owner_id, body, category, visibility, answered_at, created_at")
      .order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    else setItems(data as Prayer[]);
  }, []);

  useEffect(() => {
    load();
    const onVisible = () => { if (document.visibilityState === "visible") load(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [load]);

  async function save() {
    if (!supabase || !body.trim()) return;
    setBusy(true); setMessage(null);
    const { error } = await supabase.from("prayers")
      .insert({ body: body.trim(), category, visibility: shared && canShare ? "shared" : "private" });
    if (error) setMessage(error.message); // your words stay in the box if saving fails
    else { setBody(""); setMessage("Saved."); await load(); }
    setBusy(false);
  }

  async function markAnswered(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("prayers").update({ answered_at: new Date().toISOString() }).eq("id", id);
    if (error) { setMessage(error.message); return; }
    setFlash(id); setTimeout(() => setFlash(null), 2600);
    await load();
  }

  async function remove(id: string) {
    if (!supabase) return;
    const { error } = await supabase.from("prayers").delete().eq("id", id);
    if (error) setMessage(error.message);
    else { setConfirmDelete(null); await load(); }
  }

  const who = (p: Prayer) =>
    p.owner_id !== userId ? `From ${partner}, shared with you`
      : p.visibility === "shared" ? `Shared with ${partner}` : "Only you";

  return (
    <>
      <h1 className="greeting">Prayer Room</h1>
      <p className="subline">A quiet place to bring things to God. Each prayer shows who can see it.</p>

      <section className="card">
        <textarea className="field" value={body} onChange={(e) => setBody(e.target.value)}
          placeholder="What is on your heart?" aria-label="Prayer" maxLength={2000} />
        <select className="field" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div className="choices" role="radiogroup" aria-label="Who can see this prayer">
          <button role="radio" aria-checked={!shared} className="choice" onClick={() => setShared(false)}>Only me</button>
          <button role="radio" aria-checked={shared && canShare} className="choice" disabled={!canShare}
            onClick={() => setShared(true)}>
            {canShare ? `Share with ${partner}` : "Share with your partner (connect first)"}
          </button>
        </div>
        {message && <p className="status" role="status" style={{ marginTop: "0.75rem" }}>{message}</p>}
        <div className="actions"><Button disabled={busy || !body.trim()} onClick={save}>Save prayer</Button></div>
      </section>

      {items === null && <div className="skeleton" aria-hidden="true" style={{ marginTop: "1rem" }} />}

      {items?.length === 0 && (
        <section className="card empty">
          <h2>Your first prayer</h2>
          <p>Write what you are carrying today. It stays private unless you choose to share it.</p>
        </section>
      )}

      {items?.map((p) => (
        <article key={p.id} className={`card prayer ${p.answered_at ? "answered" : ""} ${flash === p.id ? "flash" : ""}`}>
          <div className="meta">
            <span>{who(p)}</span>
            <span>{CATEGORIES.find(([v]) => v === p.category)?.[1]}</span>
            <span>{day(p.created_at)}</span>
            {p.answered_at && <span>Answered {day(p.answered_at)}</span>}
          </div>
          <p className="prayer-body">{p.body}</p>
          {p.owner_id === userId && (
            <div className="row" style={{ marginTop: "0.75rem" }}>
              {!p.answered_at && <Button variant="quiet" onClick={() => markAnswered(p.id)}>Mark as answered</Button>}
              {confirmDelete === p.id ? (
                <>
                  <Button variant="quiet" onClick={() => remove(p.id)}>Yes, delete</Button>
                  <Button variant="quiet" onClick={() => setConfirmDelete(null)}>Keep</Button>
                </>
              ) : (
                <Button variant="quiet" onClick={() => setConfirmDelete(p.id)}>Delete</Button>
              )}
            </div>
          )}
        </article>
      ))}
    </>
  );
}
