import type { Growth } from "../lib/useGrowth";

export default function GrowthWeek({ growth }: { growth: Growth }) {
  if (!growth.ready) return <div className="skeleton" aria-hidden="true" style={{ marginTop: "1rem" }} />;
  const n = growth.days.filter((d) => d.on).length;
  const { devotionals, prayers, conversations } = growth.counts;
  return (
    <section className="card">
      <h2>Your week</h2>
      <ul className="week" aria-label="Your last seven days">
        {growth.days.map((d, i) => (
          <li key={i} className={`day ${d.on ? "on" : ""}`} aria-label={d.on ? "You showed up" : "Rest day"}>
            <i aria-hidden="true" />{d.label}
          </li>
        ))}
      </ul>
      <p>
        {n === 0
          ? "A fresh week. Begin whenever you are ready."
          : `You showed up on ${n} of the last 7 days. Every day counts, and rest days are fine.`}
      </p>
      <p className="status" style={{ marginTop: "0.5rem" }}>
        Devotionals {devotionals} · Prayers {prayers} · Conversations {conversations}. Only you see this.
      </p>
    </section>
  );
}
