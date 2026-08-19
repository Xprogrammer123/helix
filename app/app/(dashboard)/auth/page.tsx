"use client";

import Link from "next/link";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { HelixField } from "@/components/HelixField";
import { toast } from "@heroui/react";

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-current">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
    </svg>
  );
}

function AuthCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [githubEnabled, setGithubEnabled] = useState(false);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error === "auth_failed") {
      toast("Something went wrong signing you in. Try again.");
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/auth/github/enabled")
      .then((res) => res.json())
      .then((data: { enabled?: boolean }) => setGithubEnabled(Boolean(data.enabled)))
      .catch(() => setGithubEnabled(false));
  }, []);

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
      toast(
        process.env.NODE_ENV === "development"
          ? "Dev mode: copy the code from the Next.js terminal."
          : "Check your inbox for a 6-digit code."
      );
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
          {githubEnabled ? (
            <>
              <a
                href="/api/auth/github/start"
                className="flex w-full items-center justify-center gap-3 rounded-full border border-ink/10 bg-surface/80 p-3 text-lg font-medium text-ink backdrop-blur transition-colors hover:border-ink/20"
              >
                <GitHubIcon />
                Continue with GitHub
              </a>
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-ink/10" />
                <span className="text-xs uppercase tracking-wider text-ink/35">
                  or
                </span>
                <div className="h-px flex-1 bg-ink/10" />
              </div>
            </>
          ) : null}
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
