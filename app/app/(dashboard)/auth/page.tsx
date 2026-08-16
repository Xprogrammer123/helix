"use client";

import Link from "next/link";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HelixField } from "@/components/HelixField";
import { toast } from "@heroui/react";

function AuthCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_failed") {
      toast("Something went wrong signing you in. Try again.");
    }
  }, [searchParams]);

  async function sendCode() {
    if (!email.trim()) {
      toast("Enter your email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email-code/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.error === "rate_limit_exceeded") {
          toast("Too many codes sent. Wait a few minutes and try again.");
        } else {
          toast(data.message || "Could not send code. Try again.");
        }
        return;
      }
      setSent(true);
      toast("Check your inbox for a 6-digit code.");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    if (!code.trim()) {
      toast("Enter the code from your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/email-code/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim() }),
      });
      if (res.ok) {
        router.push("/dashboard");
        return;
      }
      toast("Invalid or expired code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative z-10 flex w-full max-w-md flex-col items-center px-6">
      <Link href="/" className="font-display text-2xl font-bold tracking-tight text-ink">
        HELIX
      </Link>
      <h1 className="font-display mt-10 text-center text-3xl font-bold tracking-tight text-ink/45 md:text-4xl">
        Share what&apos;s running on
        <br />
        <span className="text-ink">your machine.</span>
      </h1>

      {!sent ? (
        <div className="mt-10 w-full space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-full border border-ink/10 bg-surface/80 px-5 py-3.5 text-ink placeholder:text-ink/35 outline-none backdrop-blur focus:border-accent/40"
            onKeyDown={(e) => e.key === "Enter" && sendCode()}
          />
          <button
            onClick={sendCode}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-full bg-accent p-3 text-lg font-medium text-dark transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="size-4.5 animate-spin rounded-full border-2 border-dark/30 border-t-dark" />
            ) : null}
            {loading ? "Sending..." : "Continue with email"}
          </button>
        </div>
      ) : (
        <div className="mt-10 w-full space-y-3">
          <p className="mb-2 text-center text-sm text-ink/45">
            Code sent to <span className="text-ink">{email}</span>
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            className="w-full rounded-full border border-ink/10 bg-surface/80 px-5 py-3.5 text-center font-mono text-lg tracking-[0.35em] text-ink placeholder:tracking-normal placeholder:text-ink/35 outline-none backdrop-blur focus:border-accent/40"
            onKeyDown={(e) => e.key === "Enter" && verify()}
          />
          <button
            onClick={verify}
            disabled={loading}
            className="flex w-full items-center justify-center rounded-full bg-accent p-3 text-lg font-medium text-dark transition-opacity disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify & sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setCode("");
            }}
            className="w-full text-sm text-ink/40 transition-colors hover:text-ink"
          >
            Use a different email
          </button>
        </div>
      )}

      <p className="mx-auto mt-8 w-60 text-center text-sm text-ink/40">
        By continuing, you agree to Helix&apos;s{" "}
        <Link href="/terms" className="font-medium text-ink">
          Terms
        </Link>{" "}
        &{" "}
        <Link href="/privacy" className="font-medium text-ink">
          Privacy Policy.
        </Link>
      </p>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex items-center justify-center">
      <span className="size-6 animate-spin rounded-full border-2 border-ink/20 border-t-accent" />
    </div>
  );
}

export default function AuthPage() {
  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-dark">
      <HelixField intensity="hero" />
      <Suspense fallback={<LoginFallback />}>
        <AuthCard />
      </Suspense>
    </div>
  );
}
