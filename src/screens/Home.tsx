import { greetingFor } from "../lib/greeting";

export default function Home({ name }: { name: string }) {
  const { title, subline } = greetingFor();
  const personal = name.trim() ? title.replace(/\.$/, `, ${name.trim()}.`) : title;

  return (
    <>
      <h1 className="greeting">{personal}</h1>
      <p className="subline">{subline}</p>

      <section className="card scripture" aria-labelledby="scripture-h">
        <h2 id="scripture-h">Today’s Scripture</h2>
        <p className="scripture-ref">Ecclesiastes 4:9–12</p>
        <p className="scripture-body">
          The passage text will appear here once a licensed Bible source is connected.
        </p>
        <span className="status">Sample mode. No Scripture text is stored yet.</span>
      </section>

      <section className="card">
        <h2>Today’s devotional</h2>
        <p>Loving when it is difficult. About five minutes.</p>
        <p className="status" style={{ marginTop: "0.75rem" }}>Sample. Devotionals are not built yet.</p>
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
    </>
  );
}
