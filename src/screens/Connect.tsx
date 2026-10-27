import { useState } from "react";
import Button from "../components/Button";
import ConnectRings from "../components/ConnectRings";
import { supabase } from "../lib/supabase";
import type { Couple } from "../lib/useCouple";

export default function Connect({ couple, onClose }: { couple: Couple; onClose: () => void }) {
  const [code, setCode] = useState<string | null>(null);
  const [entered, setEntered] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [justJoined, setJustJoined] = useState(false);

  async function createCode() {
    if (!supabase) return;
    setBusy(true); setMessage(null);
    const { data, error } = await supabase.rpc("create_invitation");
    if (error) setMessage(error.message);
    else { setCode(data as string); await couple.refresh(); }
    setBusy(false);
  }

  async function join() {
    if (!supabase) return;
    setBusy(true); setMessage(null);
    const { error } = await supabase.rpc("accept_invitation", { p_code: entered.replace(/[\s-]/g, "") });
    if (error) setMessage(error.message);
    else { setJustJoined(true); await couple.refresh(); }
    setBusy(false);
  }

  async function leave() {
    if (!supabase) return;
    setBusy(true); setMessage(null);
    const { error } = await supabase.rpc("leave_couple");
    if (error) setMessage(error.message);
    else { setCode(null); setConfirmLeave(false); setJustJoined(false); await couple.refresh(); }
    setBusy(false);
  }

  async function copy() {
    try { await navigator.clipboard.writeText(code ?? ""); setMessage("Copied."); }
    catch { setMessage("Copy didn’t work. Select the code and copy it by hand."); }
  }

  const pretty = code?.match(/.{1,4}/g)?.join(" ") ?? "";
  const { status, partner } = couple;

  return (
    <>
      <Button variant="quiet" onClick={onClose}>← Back</Button>
      {message && <p className="status" role="status">{message}</p>}

      {status === "connected" && (
        <>
          <ConnectRings joined />
          <h1 className="greeting">{justJoined ? "Better together." : `Connected with ${partner?.first_name ?? "your partner"}`}</h1>
          <p className="subline">Your shared space holds only what each of you chooses to share. Everything else stays private to its owner.</p>
          {!confirmLeave ? (
            <Button variant="quiet" onClick={() => setConfirmLeave(true)}>Disconnect</Button>
          ) : (
            <div className="card">
              <p>Disconnecting ends sharing between you. Nothing either of you has written is deleted.</p>
              <div className="actions">
                <Button disabled={busy} onClick={leave}>Yes, disconnect</Button>
                <Button variant="quiet" onClick={() => setConfirmLeave(false)}>Keep connection</Button>
              </div>
            </div>
          )}
        </>
      )}

      {status !== "connected" && (
        <>
          <ConnectRings joined={false} />
          <h1 className="greeting">Connect with your partner</h1>
          <p className="subline">Nothing is shared until your partner chooses to accept.</p>

          {code && (
            <div className="card code">
              <span className="status">Shown once. Expires in 48 hours.</span>
              <strong className="code-text">{pretty}</strong>
              <Button variant="quiet" onClick={copy}>Copy code</Button>
            </div>
          )}

          {status === "waiting" && !code && <p className="subline">Your invitation is waiting. Codes are shown only once, so create a new one if you lost it.</p>}

          <div className="actions">
            <Button disabled={busy} onClick={createCode}>{status === "waiting" ? "Create a new code" : "Invite my partner"}</Button>
            {status === "waiting" && <Button variant="quiet" disabled={busy} onClick={leave}>Cancel invitation</Button>}
          </div>

          {status === "none" && (
            <>
              <h2 className="greeting" style={{ fontSize: "1.5rem", marginTop: "2.5rem" }}>Have a code?</h2>
              <input className="field" value={entered} onChange={(e) => setEntered(e.target.value)}
                placeholder="Invitation code" aria-label="Invitation code" autoCapitalize="characters" autoComplete="off" />
              <p className="status">By joining, you agree to share only what you each choose to.</p>
              <div className="actions">
                <Button disabled={busy || entered.replace(/[\s-]/g, "").length < 6} onClick={join}>Accept and connect</Button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
