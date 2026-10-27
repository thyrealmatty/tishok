import { useState } from "react";
import Button from "../components/Button";
import Logo from "../components/Logo";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [mode, setMode] = useState<"in" | "up">("up");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit() {
    if (!supabase) return;
    setBusy(true);
    setMessage(null);
    if (mode === "up") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else if (!data.session) setMessage("Check your email to confirm your address, then sign in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
    }
    setBusy(false);
  }

  return (
    <main className="screen onboard">
      <Logo className="logo logo-static" />
      <h1 className="greeting">{mode === "up" ? "Create your account" : "Welcome back"}</h1>
      <p className="subline">Your account is yours alone. Your partner joins with their own.</p>
      <input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
        placeholder="Email" aria-label="Email" autoComplete="email" />
      <input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
        placeholder="Password (8 or more characters)" aria-label="Password"
        autoComplete={mode === "up" ? "new-password" : "current-password"} />
      {message && <p className="status" role="alert">{message}</p>}
      <div className="actions">
        <Button disabled={busy || !email || password.length < 8} onClick={submit}>
          {mode === "up" ? "Create account" : "Sign in"}
        </Button>
        <Button variant="quiet" onClick={() => { setMode(mode === "up" ? "in" : "up"); setMessage(null); }}>
          {mode === "up" ? "I already have an account" : "Create a new account"}
        </Button>
      </div>
    </main>
  );
}
