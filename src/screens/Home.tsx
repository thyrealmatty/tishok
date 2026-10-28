import Button from "../components/Button";
import PrayerFocus from "../components/PrayerFocus";
import type { Couple } from "../lib/useCouple";
import { devotionalForDate } from "../lib/devotionals";
import { greetingFor } from "../lib/greeting";
import { usePassage } from "../lib/usePassage";

type Props = { name: string; onSignOut?: () => void; couple?: Couple; onConnect?: () => void; onOpenWord?: () => void; userId?: string; onOpenPrayer?: () => void };

export default function Home({ name, onSignOut, couple, onConnect, onOpenWord, userId, onOpenPrayer }: Props) {
  const { title, subline } = greetingFor();
  const d = devotionalForDate(new Date());
  const passage = usePassage(d.ref);
  const personal = name.trim() ? title.replace(/\.$/, `, ${name.trim()}.`) : title;

  return (
    <>
      <h1 className="greeting">{personal}</h1>
      <p className="subline">{subline}</p>

      {couple && couple.status !== "off" && couple.status !== "loading" && (
        <section className="card">
          {couple.status === "connected" ? (
            <>
              <h2>Connected with {couple.partner?.first_name ?? "your partner"}</h2>
              <p>Your shared space is ready.</p>
            </>
          ) : (
            <>
              <h2>{couple.status === "waiting" ? "Waiting for your partner" : "Connect with your partner"}</h2>
              <p>{couple.status === "waiting" ? "Your invitation is out. Nothing is shared until they accept." : "Invite them, or join with a code."}</p>
            </>
          )}
          <Button variant="quiet" onClick={onConnect} style={{ marginTop: "0.5rem", paddingLeft: 0 }}>
            {couple.status === "connected" ? "Manage connection" : "Open"}
          </Button>
        </section>
      )}

      <section className="card scripture" aria-labelledby="scripture-h">
        <h2 id="scripture-h">Today’s Scripture</h2>
        <p className="scripture-ref">{d.display}</p>
        {passage.status === "loading" && <div className="skeleton" aria-hidden="true" />}
        {passage.status === "ready" && (
          <>
            <p className="scripture-body" style={{ whiteSpace: "pre-line" }}>{passage.text}</p>
            <span className="status">World English Bible, public domain</span>
          </>
        )}
        {passage.status === "error" && <p className="scripture-body">Open your Bible to read this passage today.</p>}
      </section>

      {couple && <PrayerFocus userId={userId} couple={couple} onOpenPrayer={onOpenPrayer} />}

      <section className="card">
        <h2>Today’s devotional</h2>
        <p>{d.theme}. About five minutes.</p>
        {onOpenWord && <Button variant="quiet" onClick={onOpenWord} style={{ marginTop: "0.5rem", paddingLeft: 0 }}>Begin</Button>}
      </section>

      <section className="card">
        <h2>Your growth</h2>
        <div className="bar" role="img" aria-label="Sample progress: 3 of 7 days">
          <span style={{ width: "43%" }} />
        </div>
        <p style={{ marginTop: "0.75rem" }}>Three days this week. Every day counts, and missed days are fine.</p>
      </section>

      <section className="card empty">
        <h2>Your first shared memory</h2>
        <p>When you and your partner add a memory, it will live here. Start with a moment you are thankful for.</p>
      </section>
      {onSignOut && <Button variant="quiet" onClick={onSignOut} style={{ marginTop: "1.5rem" }}>Sign out</Button>}
    </>
  );
}
