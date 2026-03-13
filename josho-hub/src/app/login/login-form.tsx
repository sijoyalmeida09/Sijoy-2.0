"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "phone" | "email";
type Phase = "input" | "otp" | "sending";

export function LoginForm() {
  const [mode, setMode] = useState<Mode>("phone");
  const [phase, setPhase] = useState<Phase>("input");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const supabase = createClient();

  async function sendPhoneOtp() {
    setError("");
    const cleaned = phone.replace(/\s+/g, "");
    if (!cleaned.startsWith("+")) {
      setError("Include country code, e.g. +91 98765 43210");
      return;
    }
    setPhase("sending");
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone: cleaned });
    if (otpError) {
      setError(otpError.message);
      setPhase("input");
      return;
    }
    setPhase("otp");
  }

  async function verifyOtp() {
    setError("");
    setPhase("sending");
    const cleaned = phone.replace(/\s+/g, "");
    const { error: verifyError } = await supabase.auth.verifyOtp({
      phone: cleaned,
      token: otp,
      type: "sms"
    });
    if (verifyError) {
      setError(verifyError.message);
      setPhase("otp");
      return;
    }
    window.location.href = "/dashboard";
  }

  async function sendMagicLink() {
    setError("");
    if (!email) return;
    setPhase("sending");
    const appUrl = window.location.origin;
    const { error: linkError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${appUrl}/auth/callback` }
    });
    if (linkError) {
      setError(linkError.message);
      setPhase("input");
      return;
    }
    window.location.href = "/login?sent=1";
  }

  return (
    <div className="mt-5 space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => { setMode("phone"); setPhase("input"); setError(""); }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            mode === "phone" ? "bg-joshoBlue text-white" : "border border-blue-800/40 text-blue-300"
          }`}
        >
          Phone OTP
        </button>
        <button
          type="button"
          onClick={() => { setMode("email"); setPhase("input"); setError(""); }}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            mode === "email" ? "bg-joshoBlue text-white" : "border border-blue-800/40 text-blue-300"
          }`}
        >
          Email Link
        </button>
      </div>

      {error && <p className="rounded-lg bg-red-900/40 p-3 text-sm text-red-200">{error}</p>}

      {mode === "phone" && phase !== "otp" && (
        <div className="space-y-3">
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm text-blue-100">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full rounded-lg border border-blue-700 bg-[#0f1a31] px-3 py-2 text-white outline-none ring-joshoBlue focus:ring-2"
            />
          </div>
          <button
            type="button"
            onClick={sendPhoneOtp}
            disabled={phase === "sending" || !phone}
            className="w-full rounded-lg bg-joshoBlue px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {phase === "sending" ? "Sending..." : "Send OTP"}
          </button>
        </div>
      )}

      {mode === "phone" && phase === "otp" && (
        <div className="space-y-3">
          <p className="text-sm text-blue-200">Enter the 6-digit code sent to {phone}</p>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="w-full rounded-lg border border-blue-700 bg-[#0f1a31] px-3 py-2 text-center text-2xl tracking-[0.3em] text-white outline-none ring-joshoBlue focus:ring-2"
          />
          <button
            type="button"
            onClick={verifyOtp}
            disabled={otp.length < 6}
            className="w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50"
          >
            Verify OTP
          </button>
          <button
            type="button"
            onClick={() => { setPhase("input"); setOtp(""); }}
            className="w-full text-sm text-blue-300 hover:text-white"
          >
            Change number
          </button>
        </div>
      )}

      {mode === "email" && (
        <div className="space-y-3">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-blue-100">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="w-full rounded-lg border border-blue-700 bg-[#0f1a31] px-3 py-2 text-white outline-none ring-joshoBlue focus:ring-2"
            />
          </div>
          <button
            type="button"
            onClick={sendMagicLink}
            disabled={phase === "sending" || !email}
            className="w-full rounded-lg bg-joshoBlue px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {phase === "sending" ? "Sending..." : "Send Magic Link"}
          </button>
        </div>
      )}
    </div>
  );
}
