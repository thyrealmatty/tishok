import { useEffect, useState } from "react";

// Honest offline notice. Tìshòk does not queue changes yet, so saving needs a connection.
export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  if (online) return null;
  return (
    <div className="offline" role="status">
      You are offline. You can read what has loaded, but saving needs a connection.
    </div>
  );
}
