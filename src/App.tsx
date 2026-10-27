import { useState } from "react";
import BottomNav, { type TabId } from "./components/BottomNav";
import Logo from "./components/Logo";
import Auth from "./screens/Auth";
import Connect from "./screens/Connect";
import Home from "./screens/Home";
import Onboarding from "./screens/Onboarding";
import Placeholder from "./screens/Placeholder";
import { supabase } from "./lib/supabase";
import { useAuth } from "./lib/useAuth";
import { useCouple } from "./lib/useCouple";

const FLAG = "tishok-onboarded";
const seen = () => { try { return localStorage.getItem(FLAG) === "1"; } catch { return false; } };
const markSeen = () => { try { localStorage.setItem(FLAG, "1"); } catch { /* ignore */ } };
const STAGE_VALUE: Record<string, string> = {
  Dating: "dating", Engaged: "engaged", Married: "married", "Parenting together": "parenting",
};

function MainApp({ name, onSignOut, userId }: { name: string; onSignOut?: () => void; userId?: string }) {
  const [tab, setTab] = useState<TabId>("home");
  const [showConnect, setShowConnect] = useState(false);
  const couple = useCouple(userId);
  return (
    <>
      <main className="screen" key={showConnect ? "connect" : tab}>
        {showConnect ? <Connect couple={couple} onClose={() => setShowConnect(false)} /> : <>
        {tab === "home" && <Home name={name} onSignOut={onSignOut} couple={couple} onConnect={() => setShowConnect(true)} />}
        {tab === "word" && <Placeholder title="The Word" note="Scripture journeys, daily devotions and your notes will live here." />}
        {tab === "prayer" && <Placeholder title="Prayer Room" note="Private and shared prayers, with answered-prayer moments." />}
        {tab === "together" && <Placeholder title="Together" note="Relationship exercises, your mentor and your future family journeys." />}
        {tab === "memories" && <Placeholder title="Memories" note="A timeline of moments, milestones and growth." />}
        </>}
      </main>
      <BottomNav current={tab} onChange={(t) => { setShowConnect(false); setTab(t); }} />
    </>
  );
}

export default function App() {
  const { session, profile, saveProfile, signOut } = useAuth();
  const [protoDone, setProtoDone] = useState(seen);
  const [name, setName] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);

  let body;
  if (!supabase) {
    // Prototype mode: Supabase keys are not set, so nothing is saved to an account.
    body = protoDone
      ? <MainApp name={name} />
      : <Onboarding name={name} onName={setName} onDone={() => { markSeen(); setProtoDone(true); }} />;
  } else if (session === undefined || (session && profile === undefined)) {
    body = null;
  } else if (!session) {
    body = <Auth />;
  } else if (!profile) {
    body = (
      <>
        <Onboarding real name={name} onName={setName}
          onDone={async (n, stage) => setSaveError(await saveProfile(n, STAGE_VALUE[stage] ?? "dating"))} />
        {saveError && <p className="status" role="alert" style={{ position: "relative", zIndex: 2, margin: "0 1.5rem" }}>{saveError}</p>}
      </>
    );
  } else {
    body = <MainApp name={profile.first_name} onSignOut={signOut} userId={session.user.id} />;
  }

  return (
    <div className="shell">
      <div className="ambient" aria-hidden="true" />
      <div className="splash" aria-hidden="true"><Logo /></div>
      {body}
    </div>
  );
}
