"use client";

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
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal";

const INSTALL = "npm install -g helix";
const GITHUB = "https://github.com/thatcreativetayo/helix";

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
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-dark text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-size-[48px_48px] mask-[radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/logo.png"
            alt="Helix"
            width={100}
            height={36}
            className="h-8 w-auto"
            priority
          />
        </Link>
        <nav className="flex items-center gap-5 text-sm text-white/50">
          <Link href="/docs" className="transition-colors hover:text-white">
            Docs
          </Link>
          <a
            href={GITHUB}
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

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <section className="grid items-center gap-12 pt-16 pb-24 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
              <span className="size-1.5 rounded-full bg-white" />
              Self-hosted · path-based · open source
            </div>
            <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-white/50 sm:text-5xl lg:text-[3.25rem]">
              Share what&apos;s running on{" "}
              <span className="text-white">your machine.</span>
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/40">
              Helix is a self-hosted localhost tunnel. Point the CLI at a port,
              get a public path on your relay — no SaaS middleman.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#1a1a1a]/80 py-1.5 pr-1.5 pl-4 backdrop-blur">
                <HugeiconsIcon
                  icon={TerminalIcon}
                  size={16}
                  color="currentColor"
                  className="text-white/40"
                />
                <code className="font-mono text-sm text-white">{INSTALL}</code>
                <CopyButton value={INSTALL} label="Install command copied" />
              </div>
              <Link
                href="/docs"
                className="rounded-full px-4 py-2 text-sm text-white/50 transition-colors hover:text-white"
              >
                Read the docs →
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex justify-center lg:justify-end"
          >
            <Terminal className="max-w-md border-white/5 bg-[#1c1c1c]">
              <TypingAnimation className="text-white/80">
                {"> helix login"}
              </TypingAnimation>
              <AnimatedSpan className="text-white">
                ✔ Logged in via GitHub
              </AnimatedSpan>
              <TypingAnimation className="text-white/80">
                {"> helix myapp 3000"}
              </TypingAnimation>
              <AnimatedSpan className="text-white">
                ✔ Tunnel registered
              </AnimatedSpan>
              <AnimatedSpan className="text-sky-400">
                ℹ Public: /tunnel/myapp/
              </AnimatedSpan>
              <TypingAnimation className="text-white/40">
                Waiting for requests…
              </TypingAnimation>
            </Terminal>
          </motion.div>
        </section>

        <section className="border-t border-white/5 py-20">
          <div className="mb-10 max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Built for builders who ship demos
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/40">
              Inspired by the clarity of modern dev-tool landings — dense where
              it matters, quiet everywhere else.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.05 }}
                className="group rounded-2xl border border-white/[0.06] bg-[#161616]/80 p-6 transition-colors hover:border-white/10 hover:bg-[#1a1a1a]"
              >
                <div className="mb-4 flex size-9 items-center justify-center rounded-lg bg-white/10 text-white">
                  <HugeiconsIcon icon={f.icon} size={18} color="currentColor" />
                </div>
                <h3 className="text-[15px] font-medium text-white">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/40">
                  {f.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="border-t border-white/5 py-20">
          <div className="mb-10 max-w-xl">
            <h2 className="text-2xl font-semibold tracking-tight text-white">
              Helix Pro — when a tunnel is part of the job
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/40">
              Free covers solo dev work. Pro is for client demos, parallel webhook
              testing, and debugging sessions that outlast the free idle timeout.
            </p>
            <p className="mt-4 font-mono text-xl font-semibold text-white">
              ₦2,500/mo
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-accent/20 bg-accent/[0.04] p-6">
              <h3 className="text-[15px] font-medium text-white">
                Persistent demo links
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/40">
                No idle disconnect on Pro — your tunnel stays up through the client
                call. Password-protect the URL and send credentials separately.
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-[#161616]/80 p-6">
              <h3 className="text-[15px] font-medium text-white">
                Concurrent tunnels
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/40">
                Stripe webhooks on :3001, your app on :3000, mock API on :4000 — all
                tunneled at once. Free tier allows one active tunnel.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/upgrade"
            className="mt-8 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            Upgrade to Pro
          </Link>
        </section>

        <section className="border-t border-white/5 py-20">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            How it works
          </h2>
          <p className="mt-2 text-sm text-white/40">
            Three steps from localhost to a shareable path.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="relative rounded-2xl border border-white/[0.06] bg-[#161616] p-6"
              >
                <div className="font-mono text-xs text-white">{s.n}</div>
                <h3 className="mt-3 text-[15px] font-medium">{s.title}</h3>
                <p className="mt-2 text-sm text-white/40">{s.body}</p>
                {i < steps.length - 1 && (
                  <div className="pointer-events-none absolute top-1/2 -right-5 hidden h-px w-5 bg-white/10 sm:block" />
                )}
              </motion.div>
            ))}
          </div>
        </section>

        <section className="border-t border-white/5 pt-20">
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-[#141414] p-8 sm:p-10">
            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Ready to expose a port?
                </h2>
                <p className="mt-2 max-w-md text-sm text-white/40">
                  Install the CLI, log in with GitHub, and share a path — not a
                  subdomain.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 py-1.5 pr-1.5 pl-4">
                  <code className="font-mono text-sm text-white">{INSTALL}</code>
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
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-white/25">
          <span>Helix · path-based tunnels · self-hosted</span>
          <div className="flex gap-4">
            <Link href="/docs" className="hover:text-white/50">
              Docs
            </Link>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="hover:text-white/50">
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
