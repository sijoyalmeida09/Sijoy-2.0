"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "phone" | "email" | "password";
type Phase = "input" | "otp" | "sending";
type FormMode = "signin" | "signup";

export function LoginForm({ redirectTo = "/dashboard" }: { redirectTo?: string }) {
  const [mode, setMode] = useState<Mode>("password");
  const [phase, setPhase] = useState<Phase>("input");
  const [formMode, setFormMode] = useState<FormMode>("signin");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const supabase = createClient();

  function switchMode(m: FormMode) {
    setFormMode(m);
    setError("");
    setSuccessMsg("");
    setPhase("input");
  }

  async function signInWithGoogle() {
    setError("");
    setGoogleLoading(true);
    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        queryParams: { access_type: "offline", prompt: "consent" }
      }
    });
    if (googleError) {
      setError(googleError.message);
      setGoogleLoading(false);
    }
  }

  async function sendPhoneOtp() {
    setError("");
    const cleaned = phone.replace(/\s+/g, "");
    if (!cleaned.startsWith("+")) {
      setError("Include country code, e.g. +91 98765 43210");
      return;
    }
    setPhase("sending");
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: cleaned });
    if (otpError) { setError(otpError.message); setPhase("input"); return; }
    setPhase("otp");
  }

  async function verifyOtp() {
    setError("");
    setPhase("sending");
    const cleaned = phone.replace(/\s+/g, "");
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: cleaned, token: otp, type: "sms"
    });
    if (verifyError) { setError(verifyError.message); setPhase("otp"); return; }
    window.location.href = redirectTo;
  }

  async function sendMagicLink() {
    setError("");
    if (!email) return;
    setPhase("sending");
    const { error: linkError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}` }
    });
    if (linkError) { setError(linkError.message); setPhase("input"); return; }
    setSuccessMsg("Magic link sent! Check your email.");
    setPhase("input");
  }

  async function signInWithPassword() {
    setError("");
    if (!email || !password) return;
    setPhase("sending");
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) { setError(signInError.message); setPhase("input"); return; }
    window.location.href = redirectTo;
  }

  async function signUpWithPassword() {
    setError("");
    if (!email || !password || !fullName) return;
    setPhase("sending");
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`
      }
    });
    if (signUpError) { setError(signUpError.message); setPhase("input"); return; }
    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, email, full_name: fullName, role: "client" });
    }
    setSuccessMsg("Account created! Check your email to confirm, then sign in.");
    setFormMode("signin");
    setPhase("input");
  }

  const inputCls = "w-full rounded-lg border border-blue-700 bg-[#0f1a31] px-3 py-2 text-white outline-none ring-joshoBlue focus:ring-2 placeholder:text-blue-700/60";
  const tabActive = "bg-joshoBlue text-white";
  const tabInactive = "border border-blue-800/40 text-blue-300";

  return (
    <div className="mt-5 space-y-4">

      {/* Sign In / Sign Up toggle */}
      <div className="flex gap-1 rounded-xl border border-blue-800/40 p-1">
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${formMode === "signin" ? tabActive : tabInactive}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${formMode === "signup" ? tabActive : tabInactive}`}
        >
          Create Account
        </button>
      </div>

      {/* Google */}
      <button
        type="button"
        onClick={signInWithGoogle}
        disabled={googleLoading}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-blue-800/40 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        {googleLoading ? "Redirecting..." : `${formMode === "signup" ? "Sign up" : "Continue"} with Google`}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-blue-800/40" />
        <span className="text-xs text-blue-400">or</span>
        <div className="h-px flex-1 bg-blue-800/40" />
      </div>

      {/* Method tabs — only for sign in */}
      {formMode === "signin" && (
        <div className="flex gap-2">
          {(["password", "phone", "email"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setPhase("input"); setError(""); setSuccessMsg(""); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium ${mode === m ? tabActive : tabInactive}`}
            >
              {m === "password" ? "Password" : m === "phone" ? "Phone OTP" : "Magic Link"}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      {error && <p className="rounded-lg bg-red-900/40 p-3 text-sm text-red-200">{error}</p>}
      {successMsg && <p className="rounded-lg bg-green-900/30 p-3 text-sm text-green-200">{successMsg}</p>}

      {/* ── SIGN UP FORM ─────────────────────────── */}
      {formMode === "signup" && (
        <form onSubmit={(e) => { e.preventDefault(); signUpWithPassword(); }} className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-blue-100">Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name" className={inputCls} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-blue-100">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com" className={inputCls} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-blue-100">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 6 characters" className={inputCls} required minLength={6} />
          </div>
          <button type="submit" disabled={phase === "sending" || !email || !password || !fullName}
            className="w-full rounded-lg bg-joshoBlue px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {phase === "sending" ? "Creating account..." : "Create Account"}
          </button>
          <p className="text-center text-xs text-blue-400">
            Are you a musician?{" "}
            <a href="/join" className="text-joshoBlue underline-offset-2 hover:underline">Join as Artist →</a>
          </p>
        </form>
      )}

      {/* ── SIGN IN: PASSWORD ─────────────────────── */}
      {formMode === "signin" && mode === "password" && (
        <form onSubmit={(e) => { e.preventDefault(); signInWithPassword(); }} className="space-y-3">
          <div>
            <label htmlFor="email-pw" className="mb-1 block text-sm text-blue-100">Email</label>
            <input id="email-pw" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@gmail.com" className={inputCls} />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm text-blue-100">Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password" className={inputCls} />
          </div>
          <button type="submit" disabled={phase === "sending" || !email || !password}
            className="w-full rounded-lg bg-joshoBlue px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {phase === "sending" ? "Signing in..." : "Sign In"}
          </button>
        </form>
      )}

      {/* ── SIGN IN: PHONE OTP ────────────────────── */}
      {formMode === "signin" && mode === "phone" && phase !== "otp" && (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-blue-100">Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210" className={inputCls} />
          </div>
          <button type="button" onClick={sendPhoneOtp} disabled={phase === "sending" || !phone}
            className="w-full rounded-lg bg-joshoBlue px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {phase === "sending" ? "Sending..." : "Send OTP"}
          </button>
        </div>
      )}

      {formMode === "signin" && mode === "phone" && phase === "otp" && (
        <div className="space-y-3">
          <p className="text-sm text-blue-200">Enter the 6-digit code sent to {phone}</p>
          <input type="text" inputMode="numeric" maxLength={6} value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full rounded-lg border border-blue-700 bg-[#0f1a31] px-3 py-2 text-center text-2xl tracking-[0.3em] text-white outline-none ring-joshoBlue focus:ring-2" />
          <button type="button" onClick={verifyOtp} disabled={otp.length < 6}
            className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50">
            Verify OTP
          </button>
          <button type="button" onClick={() => { setPhase("input"); setOtp(""); }}
            className="w-full text-sm text-blue-300 hover:text-white">
            Change number
          </button>
        </div>
      )}

      {/* ── SIGN IN: MAGIC LINK ───────────────────── */}
      {formMode === "signin" && mode === "email" && (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm text-blue-100">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com" className={inputCls} />
          </div>
          <button type="button" onClick={sendMagicLink} disabled={phase === "sending" || !email}
            className="w-full rounded-lg bg-joshoBlue px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
            {phase === "sending" ? "Sending..." : "Send Magic Link"}
          </button>
        </div>
      )}

      {/* Footer */}
      {formMode === "signin" && (
        <p className="text-center text-xs text-blue-400">
          New here?{" "}
          <button onClick={() => switchMode("signup")} className="text-joshoBlue underline-offset-2 hover:underline">
            Create an account
          </button>
          {" · "}
          <a href="/join" className="underline-offset-2 hover:underline hover:text-blue-200">Join as Artist</a>
        </p>
      )}
    </div>
  );
}
