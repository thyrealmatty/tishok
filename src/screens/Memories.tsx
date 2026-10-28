import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import GrowthWeek from "../components/GrowthWeek";
import { todayKey } from "../lib/devotionals";
import { supabase } from "../lib/supabase";
import { useGrowth } from "../lib/useGrowth";
import type { Couple } from "../lib/useCouple";

type Memory = {
  id: string; owner_id: string; title: string; body: string | null;
  memory_date: string; category: string; visibility: "private" | "shared"; photo_path: string | null;
};
const CATEGORIES = [
  ["moment", "Moment"], ["milestone", "Milestone"], ["testimony", "Testimony"],
  ["note", "Note to each other"], ["hope", "Future hope"], ["answered", "Answered prayer"],
] as const;

const BUCKET = "memory-photos";

// Checks the file, then shrinks it to at most 1600px and re-encodes as JPEG to save space.
async function preparePhoto(file: File): Promise<Blob> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Please choose a JPEG, PNG or WebP photo.");
  if (file.size > 15 * 1024 * 1024) throw new Error("That photo is too large. Choose one under 15 MB.");
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.82));
  if (!blob) throw new Error("That photo could not be processed.");
  return blob;
}

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
  const [file, setFile] = useState<File | null>(null);
  const [fileKey, setFileKey] = useState(0);
  const [urls, setUrls] = useState<Record<string, string>>({});

  const partner = couple.partner?.first_name ?? "your partner";
  const canShare = couple.status === "connected";

  const load = useCallback(async () => {
    if (!supabase || !userId) return;
    const { data, error } = await supabase.from("memories")
      .select("id, owner_id, title, body, memory_date, category, visibility, photo_path")
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

  // Photos are private. We ask for short-lived links that only work for people allowed to see the memory.
  useEffect(() => {
    const paths = (items ?? []).map((m) => m.photo_path).filter((x): x is string => Boolean(x));
    if (!supabase || paths.length === 0) return;
    supabase.storage.from(BUCKET).createSignedUrls(paths, 3600).then(({ data }) => {
      const map: Record<string, string> = {};
      data?.forEach((d) => { if (d.path && d.signedUrl) map[d.path] = d.signedUrl; });
      setUrls(map);
    });
  }, [items]);

  async function save() {
    if (!supabase || !userId || !title.trim()) return;
    setBusy(true); setMessage(null);
    let photoPath: string | null = null;
    try {
      if (file) {
        const blob = await preparePhoto(file);
        photoPath = `${userId}/${crypto.randomUUID()}.jpg`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(photoPath, blob, { contentType: "image/jpeg" });
        if (upErr) throw upErr;
      }
      const { error } = await supabase.from("memories").insert({
        title: title.trim(), body: body.trim() || null, memory_date: date, category,
        visibility: shared && canShare ? "shared" : "private", photo_path: photoPath,
      });
      if (error) {
        if (photoPath) await supabase.storage.from(BUCKET).remove([photoPath]);
        throw error;
      }
      setTitle(""); setBody(""); setFile(null); setFileKey((k) => k + 1);
      setMessage("Saved to your timeline.");
      await load();
    } catch (e) {
      // your words stay in the boxes if saving fails
      setMessage((e as { message?: string })?.message ?? "Something went wrong. Please try again.");
    }
    setBusy(false);
  }

  async function remove(id: string) {
    if (!supabase) return;
    const path = items?.find((m) => m.id === id)?.photo_path;
    const { error } = await supabase.from("memories").delete().eq("id", id);
    if (error) setMessage(error.message);
    else {
      if (path) await supabase.storage.from(BUCKET).remove([path]);
      setConfirmDelete(null);
      await load();
    }
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
        <input key={fileKey} className="field" type="file" accept="image/jpeg,image/png,image/webp"
          aria-label="Photo (optional)" style={{ marginTop: "0.75rem", paddingTop: "0.7rem" }}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <p className="status">Optional photo. It is stored privately and resized to save space.</p>
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
          {m.photo_path && urls[m.photo_path] && <img className="photo" src={urls[m.photo_path]} alt={m.title} loading="lazy" />}
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
