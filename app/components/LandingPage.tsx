"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  FlashIcon,
  Link01Icon,
  LockIcon,
  Route01Icon,
  ServerStack01Icon,
  TerminalIcon,
  Tick02Icon,
  TimeQuarterPassIcon,
} from "@hugeicons/core-free-icons";
import { CopyButton } from "@/components/CopyButton";
import { TunnelFlow } from "@/components/TunnelFlow";
import { BorderBeam } from "@/components/ui/border-beam";
import { DotPattern } from "@/components/ui/dot-pattern";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal";
import { cn } from "@/lib/utils";

const INSTALL = "npm install -g helix";
const GITHUB = "https://github.com/thatcreativetayo/helix";

const features = [
  {
    icon: Route01Icon,
    title: "Path-based tunnels",
    body: "Every tunnel lives at /tunnel/{name}/ — no DNS, no subdomain gymnastics.",
    visual: "path" as const,
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    icon: FlashIcon,
    title: "CLI-first",
    body: "Authenticate once, then helix <name> <port>. The dashboard only watches.",
    visual: "cli" as const,
    span: "lg:col-span-1",
  },
  {
    icon: LockIcon,
    title: "Email sign-in",
    body: "Passwordless email codes via Radon — no separate account system to maintain.",
    visual: "auth" as const,
    span: "lg:col-span-1",
  },
  {
    icon: ServerStack01Icon,
    title: "Self-hosted relay",
    body: "Run the Express + WebSocket relay on your own box. Your traffic, your metal.",
    visual: "relay" as const,
    span: "lg:col-span-2",
  },
];

const steps = [
  {
    n: "01",
    title: "Login",
    body: "Verify once with an email code.",
    cmd: "helix login",
  },
  {
    n: "02",
    title: "Expose",
    body: "Claim a name and open a local port.",
    cmd: "helix myapp 3000",
  },
  {
    n: "03",
    title: "Share",
    body: "Send the path — not a random subdomain.",
    cmd: "/tunnel/myapp/",
  },
];

const freeFeatures = [
  { ok: true, text: "1 live tunnel" },
  { ok: true, text: "Path-based public URLs" },
  { ok: false, text: "Idle timeout disconnects" },
  { ok: false, text: "No concurrent tunnels" },
];

const proFeatures = [
  { ok: true, text: "Concurrent tunnels" },
  { ok: true, text: "No idle disconnect" },
  { ok: true, text: "Password-protected links" },
  { ok: true, text: "Built for client demos" },
];
export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-dark text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_-10%,rgba(34,197,94,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_20%,rgba(255,255,255,0.06),transparent)]" />
      <DotPattern
        width={28}
        height={28}
        cr={1}
        className="opacity-40 mask-[radial-gradient(ellipse_65%_55%_at_50%_20%,black,transparent)]"
      />

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

      <main className="relative z-10">
        {/* Hero — brand first, one headline, one line, CTA, full-bleed terminal */}
        <section className="relative mx-auto flex min-h-[calc(100vh-4.5rem)] max-w-6xl flex-col px-6 pt-10 pb-16 sm:pt-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-3xl text-center"
          >
            <Image
              src="/logo.png"
              alt="Helix"
              width={220}
              height={72}
              className="mx-auto h-14 w-auto sm:h-16"
              priority
            />
            <h1 className="mt-8 text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
              Your machine,{" "}
              <span className="text-white/45">on a path.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-white/40">
              Self-hosted localhost tunnels. Point the CLI at a port, get a
              public path on your relay — no SaaS middleman.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <div className="relative flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-[#1a1a1a]/90 py-1.5 pr-1.5 pl-4 backdrop-blur">
                <BorderBeam
                  size={60}
                  duration={8}
                  borderWidth={1}
                  colorFrom="#22c55e"
                  colorTo="#86efac"
                />
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
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12 }}
            className="relative mt-14 flex flex-1 items-end justify-center"
          >
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(ellipse_at_bottom,rgba(34,197,94,0.15),transparent_70%)]" />
            <div className="relative w-full max-w-3xl">
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-[0_40px_80px_-40px_rgba(0,0,0,0.8)]">
                <BorderBeam
                  size={120}
                  duration={10}
                  borderWidth={1}
                  colorFrom="#22c55e"
                  colorTo="transparent"
                />
                <Terminal className="max-h-none max-w-none rounded-2xl border-0 bg-transparent">
                  <TypingAnimation className="text-white/80">
                    {"> helix login"}
                  </TypingAnimation>
                  <AnimatedSpan className="text-white">
                    ✔ Logged in via email
                  </AnimatedSpan>
                  <TypingAnimation className="text-white/80">
                    {"> helix myapp 3000"}
                  </TypingAnimation>
                  <AnimatedSpan className="text-white">
                    ✔ Tunnel registered
                  </AnimatedSpan>
                  <AnimatedSpan className="text-accent">
                    ℹ Public: /tunnel/myapp/
                  </AnimatedSpan>
                  <TypingAnimation className="text-white/40">
                    Waiting for requests…
                  </TypingAnimation>
                </Terminal>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Flow diagram — Magic UI animated beam */}
        <section className="border-t border-white/5 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-6 max-w-xl text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                Localhost in. Path out.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/40">
                Traffic hops through your relay — you keep the metal, Helix keeps
                the route.
              </p>
            </div>
            <TunnelFlow />
          </div>
        </section>

        {/* Features — bento with live visuals */}
        <section className="border-t border-white/5 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-14 max-w-2xl">
              <p className="font-mono text-xs tracking-wide text-accent">
                WHY HELIX
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Built for builders who ship demos
              </h2>
              <p className="mt-3 text-base leading-relaxed text-white/40">
                Dense where it matters, quiet everywhere else — tunnels that feel
                like part of your stack, not a SaaS detour.
              </p>
            </div>

            <div className="grid auto-rows-[minmax(11rem,auto)] gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn(
                    "group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#161616] p-5",
                    f.span
                  )}
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.08),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <div className="relative flex items-center gap-2.5">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-accent">
                      <HugeiconsIcon
                        icon={f.icon}
                        size={16}
                        color="currentColor"
                      />
                    </div>
                    <h3 className="text-[15px] font-medium text-white">
                      {f.title}
                    </h3>
                  </div>
                  <p className="relative mt-3 max-w-sm text-sm leading-relaxed text-white/40">
                    {f.body}
                  </p>
                  <FeatureVisual kind={f.visual} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pro — Free vs Pro comparison */}
        <section className="relative border-t border-white/5 py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_70%_50%,rgba(34,197,94,0.07),transparent)]" />
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="mb-14 max-w-2xl">
              <p className="font-mono text-xs tracking-wide text-accent">
                PRICING
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Free for shipping. Pro when it&apos;s the job.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-white/40">
                Solo demos stay free. Upgrade when you need parallel tunnels and
                links that survive the call.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-3xl border border-white/8 bg-[#151515] p-7 sm:p-8"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-lg font-medium text-white">Free</h3>
                  <p className="font-mono text-2xl font-semibold text-white/80">
                    ₦0
                  </p>
                </div>
                <p className="mt-2 text-sm text-white/35">
                  Enough for a single live tunnel while you build.
                </p>
                <ul className="mt-8 space-y-3">
                  {freeFeatures.map((item) => (
                    <li
                      key={item.text}
                      className="flex items-center gap-3 text-sm text-white/50"
                    >
                      <HugeiconsIcon
                        icon={item.ok ? Tick02Icon : Cancel01Icon}
                        size={16}
                        color="currentColor"
                        className={item.ok ? "text-accent" : "text-white/25"}
                      />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className="relative overflow-hidden rounded-3xl border border-accent/30 bg-accent/[0.05] p-7 sm:p-8"
              >
                <BorderBeam
                  size={90}
                  duration={11}
                  borderWidth={1}
                  colorFrom="#22c55e"
                  colorTo="#86efac"
                />
                <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-accent/15 blur-3xl" />
                <div className="relative flex items-baseline justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-white">Pro</h3>
                    <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-accent uppercase">
                      Recommended
                    </span>
                  </div>
                  <p className="font-mono text-2xl font-semibold text-white">
                    ₦2,500
                    <span className="text-sm font-normal text-white/40">/mo</span>
                  </p>
                </div>
                <p className="relative mt-2 text-sm text-white/45">
                  Client demos, webhooks, and sessions that outlast idle.
                </p>
                <ul className="relative mt-8 space-y-3">
                  {proFeatures.map((item) => (
                    <li
                      key={item.text}
                      className="flex items-center gap-3 text-sm text-white/70"
                    >
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        size={16}
                        color="currentColor"
                        className="text-accent"
                      />
                      {item.text}
                    </li>
                  ))}
                </ul>
                <div className="relative mt-8 flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/45">
                    <HugeiconsIcon
                      icon={TimeQuarterPassIcon}
                      size={14}
                      color="currentColor"
                    />
                    No idle kill
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white/45">
                    <HugeiconsIcon
                      icon={Link01Icon}
                      size={14}
                      color="currentColor"
                    />
                    Password links
                  </div>
                </div>
                <Link
                  href="/dashboard/upgrade"
                  className="relative mt-8 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
                >
                  Upgrade to Pro
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How it works — timeline */}
        <section className="border-t border-white/5 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-14 max-w-2xl">
              <p className="font-mono text-xs tracking-wide text-accent">
                WORKFLOW
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Three commands. One path.
              </h2>
              <p className="mt-3 text-base leading-relaxed text-white/40">
                From email login to a shareable URL — without leaving the terminal.
              </p>
            </div>

            <ol className="relative grid gap-4 sm:grid-cols-3">
              <div className="pointer-events-none absolute top-[2.15rem] right-[16%] left-[16%] hidden h-px bg-linear-to-r from-transparent via-accent/40 to-transparent sm:block" />
              {steps.map((s, i) => (
                <motion.li
                  key={s.n}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex flex-col items-start rounded-2xl border border-white/8 bg-[#141414] p-6"
                >
                  <div className="flex size-10 items-center justify-center rounded-full border border-accent/30 bg-accent/10 font-mono text-sm text-accent">
                    {s.n}
                  </div>
                  <h3 className="mt-5 text-lg font-medium text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/40">
                    {s.body}
                  </p>
                  <code className="mt-5 inline-flex rounded-lg border border-white/8 bg-black/50 px-3 py-2 font-mono text-xs text-accent">
                    {s.cmd}
                  </code>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* Closing CTA — full-bleed */}
        <section className="relative overflow-hidden border-t border-white/5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_100%,rgba(34,197,94,0.14),transparent_60%)]" />
          <DotPattern
            width={24}
            height={24}
            cr={1}
            className="opacity-30 mask-[radial-gradient(ellipse_at_bottom,black,transparent_70%)]"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center px-6 py-28 text-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl"
            >
              <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Ready to expose a port?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base text-white/40">
                Install the CLI, log in with your email, and share a path — not a
                subdomain.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <div className="relative flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-[#1a1a1a] py-1.5 pr-1.5 pl-4">
                  <BorderBeam
                    size={70}
                    duration={9}
                    borderWidth={1}
                    colorFrom="#22c55e"
                    colorTo="#86efac"
                  />
                  <code className="font-mono text-sm text-white">{INSTALL}</code>
                  <CopyButton value={INSTALL} label="Install command copied" />
                </div>
                <Link
                  href="/auth"
                  className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
                >
                  Open dashboard
                </Link>
              </div>
            </motion.div>
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
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/50"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureVisual({
  kind,
}: {
  kind: "path" | "cli" | "auth" | "relay";
}) {
  if (kind === "path") {
    return (
      <div className="relative mt-auto flex flex-1 flex-col justify-end pt-8">
        <div className="rounded-xl border border-white/8 bg-black/40 p-4 font-mono text-xs leading-relaxed">
          <p className="text-white/30"># public path</p>
          <p className="mt-2 text-accent">
            https://relay.example/tunnel/
            <span className="text-white">myapp</span>/
          </p>
          <div className="mt-4 space-y-1.5 text-white/35">
            <p>
              <span className="text-sky-400">GET</span> /api/health → 200
            </p>
            <p>
              <span className="text-sky-400">POST</span> /webhooks → 201
            </p>
            <p className="text-white/20">Waiting for requests…</p>
          </div>
        </div>
      </div>
    );
  }

  if (kind === "cli") {
    return (
      <div className="relative mt-6 rounded-xl border border-white/8 bg-black/40 px-3 py-2.5 font-mono text-[11px] text-white/50">
        <span className="text-white/25">$</span> helix myapp{" "}
        <span className="text-accent">3000</span>
      </div>
    );
  }

  if (kind === "auth") {
    return (
      <div className="relative mt-6 flex items-center gap-2">
        {["4", "8", "2", "1", "9", "0"].map((d, i) => (
          <span
            key={i}
            className="flex size-8 items-center justify-center rounded-lg border border-white/10 bg-black/40 font-mono text-sm text-white"
          >
            {d}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="relative mt-6 flex items-end gap-2 pt-2">
      {[40, 64, 52].map((h, i) => (
        <div
          key={i}
          className="flex w-14 flex-col items-center gap-1.5"
          style={{ height: h }}
        >
          <div className="w-full flex-1 rounded-t-md border border-white/10 bg-linear-to-t from-accent/20 to-white/5" />
          <span className="font-mono text-[9px] text-white/30">
            :{3000 + i}
          </span>
        </div>
      ))}
      <p className="mb-4 ml-2 font-mono text-[10px] text-white/25">
        your metal
      </p>
    </div>
  );
}
