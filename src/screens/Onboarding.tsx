import { useState } from "react";
import Button from "../components/Button";
import Logo from "../components/Logo";
import ConnectRings from "../components/ConnectRings";

type Step = "welcome" | "name" | "stage" | "invite" | "connected";
const STAGES = ["Dating", "Engaged", "Married", "Parenting together"];

type Props = { name: string; onName: (n: string) => void; onDone: () => void };

export default function Onboarding({ name, onName, onDone }: Props) {
  const [step, setStep] = useState<Step>("welcome");
  const [stage, setStage] = useState("Dating");
  const [joined, setJoined] = useState(false);

  return (
    <main className="screen onboard" key={step}>
      {step === "welcome" && (
        <>
          <Logo className="logo logo-static" />
          <h1 className="greeting">Tìshòk</h1>
          <p className="subline">Two hearts. One faith. A lifetime of growing together.</p>
          <Button onClick={() => setStep("name")}>Begin</Button>
        </>
      )}

      {step === "name" && (
        <>
          <h1 className="greeting">What should we call you?</h1>
          <p className="subline">Just your first name. Only you and your partner will see it.</p>
          <input className="field" value={name} onChange={(e) => onName(e.target.value)}
            placeholder="First name" aria-label="First name" autoComplete="given-name" />
          <p className="status">Prototype: sign-in is not connected yet, so nothing is saved to an account.</p>
          <div className="actions">
            <Button disabled={!name.trim()} onClick={() => setStep("stage")}>Continue</Button>
          </div>
        </>
      )}

      {step === "stage" && (
        <>
          <h1 className="greeting">Where are you in your story?</h1>
          <p className="subline">You can change this any time as your relationship grows.</p>
          <div className="choices" role="radiogroup" aria-label="Relationship stage">
            {STAGES.map((s) => (
              <button key={s} role="radio" aria-checked={stage === s}
                className="choice" onClick={() => setStage(s)}>{s}</button>
            ))}
          </div>
          <div className="actions"><Button onClick={() => setStep("invite")}>Continue</Button></div>
        </>
      )}

      {step === "invite" && (
        <>
          <ConnectRings joined={joined} />
          <h1 className="greeting">Invite your partner</h1>
          <p className="subline">They will choose whether to accept. Nothing is shared until they do.</p>
          <div className="card code">
            <span className="status">Demo code, not a real invitation</span>
            <strong className="code-text">TSHK · DEMO</strong>
          </div>
          <div className="actions">
            <Button onClick={() => { setJoined(true); setTimeout(() => setStep("connected"), 1700); }}>
              Preview the connection
            </Button>
            <Button variant="quiet" onClick={onDone}>Do this later</Button>
          </div>
        </>
      )}

      {step === "connected" && (
        <>
          <ConnectRings joined />
          <h1 className="greeting">Better together.</h1>
          <p className="subline">This was a preview. Real invitations arrive with accounts in the next phase.</p>
          <div className="actions"><Button onClick={onDone}>Enter Tìshòk</Button></div>
        </>
      )}
    </main>
  );
}
