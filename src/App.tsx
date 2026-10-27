import { useState } from "react";
import BottomNav, { type TabId } from "./components/BottomNav";
import Logo from "./components/Logo";
import Home from "./screens/Home";
import Onboarding from "./screens/Onboarding";
import Placeholder from "./screens/Placeholder";

const FLAG = "tishok-onboarded";
const seen = () => { try { return localStorage.getItem(FLAG) === "1"; } catch { return false; } };
const markSeen = () => { try { localStorage.setItem(FLAG, "1"); } catch { /* ignore */ } };

export default function App() {
  const [tab, setTab] = useState<TabId>("home");
  const [onboarded, setOnboarded] = useState(seen);
  const [name, setName] = useState("");

  return (
    <div className="shell">
      <div className="ambient" aria-hidden="true" />
      <div className="splash" aria-hidden="true"><Logo /></div>

      {!onboarded ? (
        <Onboarding name={name} onName={setName} onDone={() => { markSeen(); setOnboarded(true); }} />
      ) : (
        <>
          <main className="screen" key={tab}>
            {tab === "home" && <Home name={name} />}
            {tab === "word" && <Placeholder title="The Word" note="Scripture journeys, daily devotions and your notes will live here." />}
            {tab === "prayer" && <Placeholder title="Prayer Room" note="Private and shared prayers, with answered-prayer moments." />}
            {tab === "together" && <Placeholder title="Together" note="Relationship exercises, your mentor and your future family journeys." />}
            {tab === "memories" && <Placeholder title="Memories" note="A timeline of moments, milestones and growth." />}
          </main>
          <BottomNav current={tab} onChange={setTab} />
        </>
      )}
    </div>
  );
}
