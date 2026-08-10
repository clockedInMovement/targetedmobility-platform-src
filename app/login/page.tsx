"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setBusy(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="login-shell">
      <div className="card login-card">
        <h1>
          Targeted<span style={{ color: "var(--accent2)" }}>Mobility</span>
        </h1>
        {sent ? (
          <>
            <p>
              <strong style={{ color: "var(--text)" }}>Check your email.</strong>
              <br />
              We sent a sign-in link to {email}. Click it and you will land
              inside the members area.
            </p>
            <p className="small">
              Nothing arrived after a couple of minutes? Check spam, or try
              again.
            </p>
          </>
        ) : (
          <>
            <p>
              Sign in with the <strong style={{ color: "var(--text)" }}>same email you used to purchase</strong> -
              that is what unlocks your access. No password needed.
            </p>
            <form onSubmit={sendLink}>
              <input
                className="field"
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="btn" disabled={busy} style={{ width: "100%" }}>
                {busy ? "Sending..." : "Email me a sign-in link"}
              </button>
            </form>
            {error && (
              <p className="small" style={{ color: "var(--accent2)", marginTop: 12 }}>
                {error}
              </p>
            )}
            <p className="small" style={{ marginTop: 20 }}>
              Not a member yet?{" "}
              <a href="https://targetedmobility.com" style={{ color: "var(--gold)" }}>
                Claim a founding spot
              </a>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
