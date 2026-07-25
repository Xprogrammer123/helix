"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FlashIcon,
  LockIcon,
  Route01Icon,
  ServerStack01Icon,
  TerminalIcon,
} from "@hugeicons/core-free-icons";
import { CopyButton } from "@/components/CopyButton";

const INSTALL = "npm install -g helix";

const demoLines = [
  { prompt: true, text: "helix login" },
  { prompt: false, text: "Logged in as thatcreativetayo" },
  { prompt: true, text: "helix myapp 3000" },
  {
    prompt: false,
    text: "Public: http://helix01.vercel.app/tunnel/myapp/",
    accent: true,
  },
];

const features = [
  {
    icon: Route01Icon,
    title: "Path-based tunnels",
    body: "Every tunnel lives at /tunnel/{name}/ — no DNS, no subdomain gymnastics.",
  },
  {
    icon: FlashIcon,
    title: "CLI-first",
    body: "Authenticate once, then helix <name> <port>. The dashboard only watches.",
  },
  {
    icon: LockIcon,
    title: "GitHub OAuth",
    body: "One OAuth app for web and CLI. Namespaces are claimed per account.",
  },
  {
    icon: ServerStack01Icon,
    title: "Self-hosted relay",
    body: "Run the Express + WebSocket relay on your own box. Your traffic, your metal.",
  },
];

const steps = [
  { n: "01", title: "Login", body: "helix login — GitHub OAuth in the browser" },
  { n: "02", title: "Expose", body: "helix myapp 3000 — claim a name, open a port" },
  { n: "03", title: "Share", body: "Hit /tunnel/myapp/ on your relay host" },
];

export function LandingPage() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % demoLines.length);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_60%)]" />

      <header className="relative z-10 mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Helix"
            width={100}
            height={36}
            className="h-8 w-auto"
            priority
          />
          {/* <span className="text-lg font-semibold">Helix</span> */}
        </Link>
        <nav className="flex items-center gap-5 text-sm text-white/50">
          <Link href="/docs" className="transition-colors hover:text-white">
            Docs
          </Link>
          <a
            href="https://github.com/thatcreativetayo/helix"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            GitHub
          </a>
          <Link
            href="/auth"
            className="rounded-full bg-linear-to-b from-[#303030] to-[#212121] px-4 py-1.5 font-medium text-white transition-opacity hover:opacity-90"
          >
            Dashboard
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6 pb-24">
        <section className="grid items-center gap-12 pt-16 pb-20 lg:grid-cols-2">
          <div>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white/50 sm:text-5xl">
              Share what&apos;s running on{" "}
              <span className="text-white">your machine.</span>
            </h1>
            <p className="mt-4 max-w-md text-base text-white/40">
              Self-hosted localhost tunneling. Point the CLI at a port, get a
              public path on your relay.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#1a1a1a] py-1.5 pr-1.5 pl-4">
                <HugeiconsIcon
                  icon={TerminalIcon}
                  size={16}
                  color="currentColor"
                  className="text-white/40"
                />
                <code className="font-mono text-sm text-accent">{INSTALL}</code>
                <CopyButton value={INSTALL} label="Install command copied" />
              </div>
              <Link
                href="/docs"
                className="rounded-full px-4 py-2 text-sm text-white/50 transition-colors hover:text-white"
              >
                Read the docs →
              </Link>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-2xl border border-white/10 bg-[#161616]"
          >
            <div className="flex items-center gap-1.5 border-b border-white/5 px-4 py-3">
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="size-2.5 rounded-full bg-white/15" />
              <span className="ml-3 font-mono text-xs text-white/30">
                terminal
              </span>
            </div>
            <div className="space-y-2 p-5 font-mono text-sm leading-relaxed">
              {demoLines.map((line, i) => (
                <motion.div
                  key={line.text}
                  initial={false}
                  animate={{ opacity: i <= step ? 1 : 0.15 }}
                  className="flex gap-2"
                >
                  {line.prompt ? (
                    <>
                      <span className="text-accent">$</span>
                      <span className="text-white/80">{line.text}</span>
                    </>
                  ) : (
                    <span
                      className={
                        line.accent ? "text-accent" : "text-white/40"
                      }
                    >
                      {line.text}
                    </span>
                  )}
                </motion.div>
              ))}
              <span className="inline-block h-4 w-2 animate-pulse bg-accent/80" />
            </div>
          </motion.div>
        </section>

        <section className="border-t border-white/5 py-16">
          <h2 className="text-xl font-semibold text-white">Why Helix</h2>
          <p className="mt-1 text-sm text-white/40">
            Built for local demos and self-hosted relays — not another SaaS tunnel.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="flex gap-3">
                <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-accent">
                  <HugeiconsIcon icon={f.icon} size={16} color="currentColor" />
                </div>
                <div>
                  <h3 className="text-[15px] font-medium text-white">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-white/40">
                    {f.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-white/5 py-16">
          <h2 className="text-xl font-semibold text-white">How it works</h2>
          <p className="mt-1 text-sm text-white/40">
            Three steps from localhost to a shareable path.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.n}
                className="relative rounded-xl border border-white/8 bg-[#161616] p-5"
              >
                <div className="font-mono text-xs text-accent">{s.n}</div>
                <h3 className="mt-2 text-[15px] font-medium">{s.title}</h3>
                <p className="mt-1 text-sm text-white/40">{s.body}</p>
                {i < steps.length - 1 && (
                  <div className="pointer-events-none absolute top-1/2 -right-6.25 hidden h-px w-6 bg-white/10 sm:block" />
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-white/5 pt-16">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-white/8 bg-[#161616] p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold">Get started</h2>
              <p className="mt-1 text-sm text-white/40">
                Install the CLI, log in, expose a port.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 py-1.5 pr-1.5 pl-4">
                <code className="font-mono text-sm text-accent">{INSTALL}</code>
                <CopyButton value={INSTALL} label="Install command copied" />
              </div>
              <Link
                href="/auth"
                className="rounded-full bg-linear-to-b from-[#303030] to-[#212121] px-5 py-2 text-sm font-medium"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 px-6 py-8 text-center text-xs text-white/25">
        Helix · path-based tunnels · self-hosted
      </footer>
    </div>
  );
}
