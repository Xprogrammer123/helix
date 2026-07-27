"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "getting-started", label: "Getting Started" },
  { id: "cli", label: "CLI Reference" },
  { id: "self-hosting", label: "Self-Hosting" },
] as const;

const envVars = [
  {
    name: "RELAY_URL",
    desc: "Relay API URL (server-side proxy)",
  },
  {
    name: "NEXT_PUBLIC_RELAY_URL",
    desc: "Public relay URL shown in dashboard tunnel links",
  },
  {
    name: "NEXT_PUBLIC_APP_URL",
    desc: "Dashboard URL (OAuth return + billing callbacks)",
  },
  {
    name: "NEXT_PUBLIC_GITHUB_CLIENT_ID",
    desc: "GitHub OAuth App client ID (web login button)",
  },
  {
    name: "APPWRITE_ENDPOINT",
    desc: "Appwrite API endpoint URL",
  },
  {
    name: "APPWRITE_PROJECT_ID",
    desc: "Appwrite project ID",
  },
  {
    name: "APPWRITE_API_KEY",
    desc: "Appwrite API key with DB access",
  },
  {
    name: "APPWRITE_DB_ID",
    desc: "Appwrite database ID (users, tunnels, requests)",
  },
  {
    name: "PAYSTACK_SECRET_KEY",
    desc: "Paystack secret key (relay only — never expose client-side)",
  },
  {
    name: "PAYSTACK_PUBLIC_KEY",
    desc: "Paystack public key (reference only for dashboard)",
  },
  {
    name: "DASHBOARD_URL",
    desc: "Next.js app URL for OAuth redirect and billing callbacks",
  },
];

export function DocsPage() {
  const [active, setActive] = useState<string>(sections[0].id);

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] }
    );

    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-dark text-white">
      <header className="fixed w-screen top-0 z-20 border-b border-white/5 bg-dark/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo.png"
              alt="Helix"
              width={100}
              height={36}
              className="h-7 w-auto"
            />
            {/* <span className="font-semibold">Helix</span> */}
            <span className="ml-1 text-sm text-white/30">Docs</span>
          </Link>
          <Link
            href="/auth"
            className="text-sm text-white/45 transition-colors hover:text-white"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto flex max-w-5xl mt-12 gap-10 px-6 py-10">
        <aside className="fixed top-24 hidden h-fit w-44 shrink-0 md:block">
          <nav className="flex flex-col gap-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active === s.id
                    ? "bg-[#252525] text-white"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        <article className="min-w-0 md:ml-64 flex-1 space-y-16 pb-24">
          <section id="getting-started" className="scroll-mt-28">
            <h1 className="text-3xl font-semibold tracking-tight">
              Getting Started
            </h1>
            <p className="mt-3 text-white/45">
              Helix exposes a local port through your self-hosted relay at a
              path like{" "}
              <code className="font-mono text-white">
                /tunnel/&#123;name&#125;/
              </code>
              .
            </p>

            <h2 className="mt-8 text-lg font-medium">1. Install the CLI</h2>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-white/8 bg-[#161616] p-4 font-mono text-sm text-white">
              npm install -g helix
            </pre>

            <h2 className="mt-8 text-lg font-medium">2. Log in</h2>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-white/8 bg-[#161616] p-4 font-mono text-sm text-white">
              helix login
            </pre>
            <p className="mt-3 text-sm text-white/40">
              Opens GitHub OAuth. The CLI uses{" "}
              <code className="font-mono text-white/60">state=cli</code>; the
              dashboard uses{" "}
              <code className="font-mono text-white/60">state=web</code>. Same
              OAuth app, different callback handling.
            </p>

            <h2 className="mt-8 text-lg font-medium">3. Start a tunnel</h2>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-white/8 bg-[#161616] p-4 font-mono text-sm text-white">
              helix myapp 3000
            </pre>
            <p className="mt-3 text-sm text-white/40">
              First claim wins the name for your account. While the CLI is
              connected, traffic to{" "}
              <code className="font-mono text-white/60">
                /tunnel/myapp/
              </code>{" "}
              is proxied to{" "}
              <code className="font-mono text-white/60">localhost:3000</code>.
            </p>
          </section>

          <section id="cli" className="scroll-mt-28">
            <h1 className="text-3xl font-semibold tracking-tight">
              CLI Reference
            </h1>
            <p className="mt-3 text-white/45">
              Tunnels are created from the CLI only. The dashboard is read-only.
            </p>

            <div className="mt-8 overflow-hidden rounded-xl border border-white/8">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/8 bg-[#161616] text-xs uppercase tracking-wide text-white/30">
                  <tr>
                    <th className="px-4 py-3 font-medium">Command</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">
                      helix login
                    </td>
                    <td className="px-4 py-3 text-white/50">
                      Authenticate via GitHub OAuth and store a session token
                      locally.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-white">
                      helix &lt;name&gt; &lt;port&gt; [--password=xxx]
                    </td>
                    <td className="px-4 py-3 text-white/50">
                      Register{" "}
                      <code className="font-mono text-white/70">name</code> with
                      the relay and forward HTTP (and WebSocket upgrades) to{" "}
                      <code className="font-mono text-white/70">
                        localhost:port
                      </code>
                      . Optional{" "}
                      <code className="font-mono text-white/70">--password</code>{" "}
                      enables HTTP Basic Auth on the public URL (
                      <span className="text-accent">Pro only</span>).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="mt-8 text-lg font-medium">Environment</h2>
            <p className="mt-2 text-sm text-white/40">
              Optional:{" "}
              <code className="font-mono text-white/60">RELAY_URL</code> —
              WebSocket register URL (default{" "}
              <code className="font-mono text-white/60">
                wss://helix-t47s.onrender.com/register
              </code>
              ).
            </p>
          </section>

          <section id="self-hosting" className="scroll-mt-28">
            <h1 className="text-3xl font-semibold tracking-tight">
              Self-Hosting
            </h1>
            <p className="mt-3 text-white/45">
              Run{" "}
              <code className="font-mono text-white/70">relay/</code> as an
              Express + WebSocket server. It owns OAuth callbacks, tunnel
              registration, request logging, and path-based proxying.
            </p>

            <h2 className="mt-8 text-lg font-medium">Relay env vars</h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-white/8">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/8 bg-[#161616] text-xs uppercase tracking-wide text-white/30">
                  <tr>
                    <th className="px-4 py-3 font-medium">Variable</th>
                    <th className="px-4 py-3 font-medium">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {envVars.map((v) => (
                    <tr key={v.name}>
                      <td className="px-4 py-3 font-mono text-white whitespace-nowrap">
                        {v.name}
                      </td>
                      <td className="px-4 py-3 text-white/50">{v.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2 className="mt-8 text-lg font-medium">OAuth callback</h2>
            <p className="mt-2 text-sm text-white/40">
              Register the GitHub OAuth App callback as{" "}
              <code className="font-mono text-white/60">
                &#123;RELAY&#125;/auth/github/callback
              </code>
              . Web logins set an httpOnly{" "}
              <code className="font-mono text-white/60">helix_token</code> cookie
              and redirect to{" "}
              <code className="font-mono text-white/60">/dashboard</code>.
            </p>

            <h2 className="mt-8 text-lg font-medium">Appwrite collections</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/45">
              <li>
                <code className="font-mono text-white/70">users</code> —
                github_id, username, token, name, plan, plan_expires_at,
                paystack_customer_code, paystack_subscription_code
              </li>
              <li>
                <code className="font-mono text-white/70">tunnels</code> — name,
                user_id, password_hash (optional, Pro)
              </li>
              <li>
                <code className="font-mono text-white/70">requests</code> —
                tunnel_name, method, path, status, duration_ms, timestamp
              </li>
            </ul>
          </section>
        </article>
      </div>
    </div>
  );
}
