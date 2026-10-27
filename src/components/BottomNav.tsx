export type TabId = "home" | "word" | "prayer" | "together" | "memories";

const TABS: { id: TabId; label: string }[] = [
  { id: "home", label: "Home" },
  { id: "word", label: "Word" },
  { id: "prayer", label: "Prayer" },
  { id: "together", label: "Together" },
  { id: "memories", label: "Memories" },
];

export default function BottomNav({ current, onChange }: { current: TabId; onChange: (t: TabId) => void }) {
  return (
    <nav className="nav" aria-label="Main">
      {TABS.map((t) => (
        <button key={t.id} aria-current={current === t.id ? "page" : undefined} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </nav>
  );
}
