// The Tìshòk mark: two overlapping rings (two people) with a sprout between them (growth in faith).
export default function Logo({ className = "logo" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" role="img" aria-label="Tìshòk logo">
      <g fill="none" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <circle className="ring-a" cx="26" cy="36" r="15" stroke="#C98A8F" />
        <circle className="ring-b" cx="38" cy="36" r="15" stroke="#D8B77A" />
        <path className="sprout" d="M32 33 V19 M32 24 q-6 -1 -7 -7 q6 0 7 7 M32 22 q5 -1 6 -6 q-5 0 -6 6" stroke="#8FA37A" />
      </g>
    </svg>
  );
}
