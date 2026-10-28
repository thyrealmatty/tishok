import { useState } from "react";
import FutureFamily from "./FutureFamily";
import Us from "./Us";
import type { Couple } from "../lib/useCouple";

export default function Together({ userId, couple }: { userId?: string; couple: Couple }) {
  const [view, setView] = useState<"us" | "future">("us");
  return (
    <>
      <div className="row seg" role="group" aria-label="Section">
        <button className="choice" aria-pressed={view === "us"} onClick={() => setView("us")}>Us</button>
        <button className="choice" aria-pressed={view === "future"} onClick={() => setView("future")}>Future Family</button>
      </div>
      {view === "us" ? <Us userId={userId} couple={couple} /> : <FutureFamily userId={userId} couple={couple} />}
    </>
  );
}
