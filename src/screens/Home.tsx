import { greetingFor } from "../lib/greeting";

export default function Home() {
  const { title, subline } = greetingFor();
  return (
    <>
      <h1 className="greeting">{title}</h1>
      <p className="subline">{subline}</p>

      <section className="card" aria-labelledby="scripture-h">
        <h2 id="scripture-h">Today’s Scripture</h2>
        <p className="scripture-ref">Ecclesiastes 4:9–12</p>
        <p className="scripture-body">
          The passage text will appear here once a licensed Bible source is connected.
        </p>
        <span className="status">Sample mode. No Scripture text is stored yet.</span>
      </section>

      <section className="card">
        <h2>Pray together</h2>
        <p>Your shared prayer space opens once you and your partner are connected.</p>
      </section>
    </>
  );
}
