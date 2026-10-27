// Two rings drift together. `joined` triggers the gentle meeting animation.
export default function ConnectRings({ joined }: { joined: boolean }) {
  return (
    <svg className={`rings ${joined ? "is-joined" : ""}`} viewBox="0 0 120 80" role="img"
      aria-label={joined ? "Two rings joined together" : "Two rings, not yet connected"}>
      <g fill="none" strokeWidth="2.4">
        <circle className="r-a" cx="38" cy="44" r="22" stroke="#C98A8F" />
        <circle className="r-b" cx="82" cy="44" r="22" stroke="#D8B77A" />
        <path className="r-sprout" d="M60 40 V22 M60 29 q-8 -1 -9 -9 q8 0 9 9 M60 26 q7 -1 8 -8 q-7 0 -8 8"
          stroke="#8FA37A" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}
