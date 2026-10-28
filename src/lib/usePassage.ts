import { useEffect, useState } from "react";

// Scripture text comes from bible-api.com, a free third-party service that serves the
// World English Bible (public domain). It has no uptime guarantee, so always handle "error".
type PassageState = { status: "loading" | "ready" | "error"; text?: string };
const cache = new Map<string, string>();

export function usePassage(ref: string): PassageState {
  const [state, setState] = useState<PassageState>(
    cache.has(ref) ? { status: "ready", text: cache.get(ref) } : { status: "loading" }
  );

  useEffect(() => {
    const hit = cache.get(ref);
    if (hit) { setState({ status: "ready", text: hit }); return; }
    let cancelled = false;
    setState({ status: "loading" });
    fetch(`https://bible-api.com/${ref.replace(/ /g, "+")}?translation=web`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("bad response"))))
      .then((d) => {
        const text = String(d.text ?? "").trim();
        if (!text) throw new Error("empty");
        cache.set(ref, text);
        if (!cancelled) setState({ status: "ready", text });
      })
      .catch(() => { if (!cancelled) setState({ status: "error" }); });
    return () => { cancelled = true; };
  }, [ref]);

  return state;
}
