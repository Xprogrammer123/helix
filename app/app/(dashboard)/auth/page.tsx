"use client";

import Image from "next/image";
import Link from "next/link";
import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stars } from "@/components/Stars";
import { StarBackground } from "@/components/StarBackground";
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
    <div className="flex flex-col z-50 items-center justify-center w-full max-w-md px-6">
      <Image
        src="/logo.png"
        alt="Logo"
        width={1000}
        height={1000}
        className="h-auto mb-8 w-20"
      />
      <h1 className="font-semibold text-3xl md:text-4xl text-center text-white/50">
        Share what&apos;s running on <br /> your machine,{" "}
        <span className="text-white">instantly.</span>
      </h1>

      {!sent ? (
        <div className="w-full mt-8 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-white/25"
            onKeyDown={(e) => e.key === "Enter" && sendCode()}
          />
          <button
            onClick={sendCode}
            disabled={loading}
            className="bg-linear-to-b from-[#303030] text-white w-full flex items-center gap-3 justify-center p-2.5 cursor-pointer rounded-full text-lg font-medium to-[#212121] disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? (
              <span className="size-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {loading ? "Sending..." : "Continue with email"}
          </button>
        </div>
      ) : (
        <div className="w-full mt-8 space-y-3">
          <p className="text-center text-sm text-white/50 mb-2">
            Code sent to <span className="text-white">{email}</span>
          </p>
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-white tracking-widest placeholder:text-white/40 outline-none focus:border-white/25"
            onKeyDown={(e) => e.key === "Enter" && verify()}
          />
          <button
            onClick={verify}
            disabled={loading}
            className="bg-linear-to-b from-[#303030] text-white w-full flex items-center justify-center p-2.5 cursor-pointer rounded-full text-lg font-medium to-[#212121] disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? "Verifying..." : "Verify & sign in"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setCode("");
            }}
            className="w-full text-sm text-white/50 hover:text-white transition-colors"
          >
            Use a different email
          </button>
        </div>
      )}

      <p className="text-white/50 w-60 text-center mx-auto mt-6">
        By continuing, you agree to Helix&apos;s{" "}
        <Link href="/terms" className="text-white font-medium">
          Terms
        </Link>{" "}
        &{" "}
        <Link href="/privacy" className="text-white font-medium">
          Privacy Policy.
        </Link>
      </p>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="flex items-center justify-center">
      <span className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}

const AuthPage = () => {
  return (
    <div className="h-screen w-screen relative bg-dark flex flex-col items-center justify-center">
      <div className="bg-white h-7 w-160 rounded-full blur-[200px] absolute -top-12"></div>
      <Stars />
      <StarBackground />
      <Suspense fallback={<LoginFallback />}>
        <AuthCard />
      </Suspense>
    </div>
  );
};

export default AuthPage;
