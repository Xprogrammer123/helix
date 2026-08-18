"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  FlashIcon,
  LockIcon,
  Route01Icon,
  ServerStack01Icon,
  TerminalIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { CopyButton } from "@/components/CopyButton";
import { HelixField } from "@/components/HelixField";
import { TunnelFlow } from "@/components/TunnelFlow";
import { BorderBeam } from "@/components/ui/border-beam";
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
    title: "Paths, not subdomains",
    body: "Every tunnel lives at /tunnel/{name}/ — claim it, keep it, share it.",
  },
  {
    icon: FlashIcon,
    title: "CLI is the product",
    body: "helix login. helix myapp 3000. The dashboard only watches the wire.",
  },
  {
    icon: LockIcon,
    title: "Email codes, done",
    body: "Passwordless sign-in. Same account on web and CLI.",
  },
  {
    icon: ServerStack01Icon,
    title: "Your relay, your rules",
    body: "Self-host the relay. Traffic stays on metal you control.",
  },
];

const steps = [
  { n: "01", title: "Login", cmd: "helix login", body: "Email code. Session saved." },
  { n: "02", title: "Expose", cmd: "helix myapp 3000", body: "Claim a name. Open a port." },
  { n: "03", title: "Share", cmd: "/tunnel/myapp/", body: "Send the path. Stay live." },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-dark text-ink">
      <header className="fixed top-0 left-0 z-20 w-full rounded-none border-b border-white/10 px-4 py-3 backdrop-blur-xl backdrop-saturate-150 sm:left-1/2 sm:mt-3 sm:w-[70%] sm:-translate-x-1/2 sm:rounded-full sm:border sm:border-white/10 sm:px-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="font-display text-lg font-bold tracking-tight text-ink">
            HELIX
          </Link>
          <nav className="flex items-center gap-6 text-sm text-ink/45">
            <Link href="/docs" className="transition-colors hover:text-ink">
              Docs
            </Link>
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ink"
            >
              GitHub
            </a>
            <Link
              href="/auth"
              className="rounded-full bg-accent px-4 py-1.5 font-medium text-dark transition-opacity hover:opacity-90"
            >
              Open app
            </Link>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero — one composition: brand + line + CTA + full-bleed field */}
        <section className="relative flex min-h-screen flex-col justify-end overflow-hidden pb-16 pt-24 sm:justify-center sm:pb-24">
          <HelixField intensity="hero" />

          <div className="relative z-10 mx-auto w-full max-w-6xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-4xl"
            >
              <p className="mb-4 font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
                Localhost tunneling
              </p>
              <h1 className="font-display text-[clamp(4.5rem,18vw,11rem)] leading-[0.82] font-bold text-ink">
                HELIX
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink/50 sm:text-xl">
                Punch a hole from your laptop to the internet. Persistent paths.
                No middleman theater.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <div className="relative flex items-center gap-2.5 overflow-hidden rounded-full border border-accent/25 bg-surface/80 py-2 pr-2 pl-5 backdrop-blur-md">
                  <BorderBeam
                    size={90}
                    duration={7}
                    borderWidth={1}
                    colorFrom="#ffffff"
                    colorTo="rgba(255,255,255,0.15)"
                  />
                  <HugeiconsIcon
                    icon={TerminalIcon}
                    size={16}
                    color="currentColor"
                    className="text-accent"
                  />
                  <code className="font-mono text-sm text-ink">{INSTALL}</code>
                  <CopyButton value={INSTALL} label="Install command copied" />
                </div>
                <Link
                  href="/auth"
                  className="rounded-full border border-ink/15 bg-ink/5 px-5 py-2.5 text-sm font-medium text-ink/70 backdrop-blur transition-colors hover:border-ink/30 hover:text-ink"
                >
                  Sign in →
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Flow */}
        <section className="relative border-t border-ink/8 py-24">
          <HelixField intensity="soft" className="opacity-40" />
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-10 max-w-xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Localhost in. Path out.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/40">
                Your CLI holds the wire. The relay routes the signal.
              </p>
            </div>
            <TunnelFlow />
          </div>
        </section>

        {/* Terminal proof — below fold */}
        <section className="border-t border-ink/8 py-24">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                In the terminal
              </p>
              <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Two commands.
                <br />
                One public path.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink/40">
                Authenticate once. Expose any port. Share{" "}
                <code className="font-mono text-accent">/tunnel/myapp/</code>{" "}
                instead of a disposable subdomain.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-[2rem] bg-accent/10 blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-accent/20 bg-surface shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
                <BorderBeam
                  size={140}
                  duration={10}
                  borderWidth={1}
                  colorFrom="#ffffff"
                  colorTo="transparent"
                />
                <Terminal className="max-h-none max-w-none rounded-3xl border-0 bg-transparent [&_pre]:p-6 sm:[&_pre]:p-8">
                  <TypingAnimation className="text-ink/70">
                    {"> helix login"}
                  </TypingAnimation>
                  <AnimatedSpan className="text-accent">
                    ✔ Logged in via email
                  </AnimatedSpan>
                  <TypingAnimation className="text-ink/70">
                    {"> helix myapp 3000"}
                  </TypingAnimation>
                  <AnimatedSpan className="text-ink">
                    ✔ Tunnel registered
                  </AnimatedSpan>
                  <AnimatedSpan className="text-accent">
                    ℹ Public: /tunnel/myapp/
                  </AnimatedSpan>
                  <TypingAnimation className="text-ink/35">
                    Waiting for requests…
                  </TypingAnimation>
                </Terminal>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features — editorial rows, not card grid noise */}
        <section className="border-t border-ink/8 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
              Why Helix
            </p>
            <h2 className="font-display mt-3 max-w-xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Built like infrastructure. Feels like a tool.
            </h2>
            <ul className="mt-14 divide-y divide-ink/8 border-y border-ink/8">
              {features.map((f, i) => (
                <motion.li
                  key={f.title}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group grid gap-4 py-8 sm:grid-cols-[3rem_1fr_1.2fr] sm:items-center"
                >
                  <div className="flex size-10 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-colors group-hover:bg-white group-hover:text-dark">
                    <HugeiconsIcon icon={f.icon} size={18} color="currentColor" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-ink">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-ink/40">{f.body}</p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>

        {/* Steps */}
        <section className="border-t border-ink/8 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Three beats.
            </h2>
            <ol className="mt-12 grid gap-6 sm:grid-cols-3">
              {steps.map((s, i) => (
                <motion.li
                  key={s.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="relative"
                >
                  <span className="font-display text-5xl font-bold text-accent/25">
                    {s.n}
                  </span>
                  <h3 className="mt-2 text-lg font-medium text-ink">{s.title}</h3>
                  <p className="mt-1 text-sm text-ink/40">{s.body}</p>
                  <code className="mt-4 inline-block font-mono text-xs text-accent">
                    {s.cmd}
                  </code>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pricing — stripped */}
        <section className="border-t border-ink/8 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                  Pricing
                </p>
                <h2 className="font-display mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  Free to ship.
                  <br />
                  Pro when it&apos;s work.
                </h2>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-ink/10 bg-surface p-7">
                  <p className="text-sm text-ink/40">Free</p>
                  <p className="font-display mt-2 text-4xl font-bold text-ink">₦0</p>
                  <ul className="mt-6 space-y-2.5 text-sm text-ink/50">
                    {[
                      "1 live tunnel",
                      "Path-based URLs",
                      "Email sign-in",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          size={14}
                          color="currentColor"
                          className="text-accent"
                        />
                        {t}
                      </li>
                    ))}
                    <li className="flex items-center gap-2 text-ink/30">
                      <HugeiconsIcon
                        icon={Cancel01Icon}
                        size={14}
                        color="currentColor"
                      />
                      Idle timeout
                    </li>
                  </ul>
                </div>
                <div className="relative overflow-hidden rounded-3xl border border-accent/35 bg-accent/[0.07] p-7">
                  <BorderBeam
                    size={100}
                    duration={9}
                    borderWidth={1}
                    colorFrom="#ffffff"
                    colorTo="rgba(255,255,255,0.2)"
                  />
                  <p className="text-sm text-accent">Pro</p>
                  <p className="font-display mt-2 text-4xl font-bold text-ink">
                    ₦2,500
                    <span className="text-base font-normal text-ink/40">/mo</span>
                  </p>
                  <ul className="mt-6 space-y-2.5 text-sm text-ink/70">
                    {[
                      "Concurrent tunnels",
                      "Long-lived links",
                      "Password protection",
                      "Full request history",
                    ].map((t) => (
                      <li key={t} className="flex items-center gap-2">
                        <HugeiconsIcon
                          icon={Tick02Icon}
                          size={14}
                          color="currentColor"
                          className="text-accent"
                        />
                        {t}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/dashboard/upgrade"
                    className="mt-8 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-dark transition-opacity hover:opacity-90"
                  >
                    Upgrade
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Closing */}
        <section className="relative overflow-hidden border-t border-ink/8">
          <HelixField intensity="soft" />
          <div className="relative mx-auto flex max-w-6xl flex-col items-start px-6 py-28 sm:items-center sm:text-center">
            <h2 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-6xl">
              Open a port.
              <br />
              <span className="text-accent">Own the path.</span>
            </h2>
            <div className="mt-10 flex flex-wrap items-center gap-3 sm:justify-center">
              <div className="relative flex items-center gap-2 overflow-hidden rounded-full border border-accent/25 bg-surface/90 py-2 pr-2 pl-5">
                <BorderBeam
                  size={70}
                  duration={8}
                  borderWidth={1}
                  colorFrom="#ffffff"
                  colorTo="rgba(255,255,255,0.2)"
                />
                <code className="font-mono text-sm text-ink">{INSTALL}</code>
                <CopyButton value={INSTALL} label="Install command copied" />
              </div>
              <Link
                href="/auth"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-dark transition-opacity hover:opacity-90"
              >
                Open dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-ink/8 px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-xs text-ink/30">
          <span className="font-display tracking-wide">HELIX</span>
          <div className="flex gap-5">
            <Link href="/docs" className="hover:text-ink/60">
              Docs
            </Link>
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink/60"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
