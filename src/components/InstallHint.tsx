import { useEffect, useState } from "react";
import Button from "./Button";

type InstallEvent = Event & { prompt: () => Promise<void> };
const KEY = "tishok-install-dismissed";
const standalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
const dismissed = () => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } };

export default function InstallHint() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  const [hidden, setHidden] = useState(dismissed);
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setPrompt(e as InstallEvent); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (standalone() || hidden || (!ios && !prompt)) return null;

  function dismiss() {
    setHidden(true);
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
  }

  return (
    <section className="card">
      <h2>Add Tìshòk to your Home Screen</h2>
      {ios ? (
        <p>In Safari, tap the Share button, then “Add to Home Screen”. Opening it from there gives you the full-screen app, and it is needed for notifications later.</p>
      ) : (
        <p>Install Tìshòk so it opens like an app, straight from your home screen.</p>
      )}
      <div className="row" style={{ marginTop: "0.5rem" }}>
        {prompt && <Button onClick={() => prompt.prompt()}>Install</Button>}
        <Button variant="quiet" onClick={dismiss}>Not now</Button>
      </div>
    </section>
  );
}
