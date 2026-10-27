export default function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <>
      <h1 className="greeting">{title}</h1>
      <section className="card">
        <p>{note}</p>
        <p style={{ marginTop: "0.75rem" }}>
          <span className="status">Not yet built. Planned for a later phase.</span>
        </p>
      </section>
    </>
  );
}
