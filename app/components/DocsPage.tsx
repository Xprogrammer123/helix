"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HelixField } from "@/components/HelixField";
import { cn } from "@/lib/utils";

const sections = [
  { id: "getting-started", label: "Getting Started" },
  { id: "cli", label: "CLI" },
  { id: "dashboard", label: "Dashboard" },
  { id: "pro", label: "Helix Pro" },
] as const;

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
    <div className="relative min-h-screen overflow-x-hidden bg-dark text-ink">
      <HelixField intensity="soft" className="fixed opacity-50" />

      <header className="fixed top-0 left-1/2 z-20 mt-3 w-[70%] -translate-x-1/2 rounded-full border border-white/10 bg-dark/70 px-6 py-3 backdrop-blur-xl backdrop-saturate-150">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="font-display text-lg font-bold tracking-tight">
              HELIX
            </span>
            <span className="text-sm text-ink/30">Docs</span>
          </Link>
          <Link
            href="/auth"
            className="text-sm text-ink/45 transition-colors hover:text-ink"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto mt-12 flex max-w-5xl gap-10 px-6 py-10">
        <aside className="fixed top-24 hidden h-fit w-44 shrink-0 md:block">
          <nav className="flex flex-col gap-1">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active === s.id
                    ? "bg-accent/15 text-accent"
                    : "text-ink/40 hover:text-ink/70"
                )}
              >
                {s.label}
              </a>
            ))}
          </nav>
        </aside>

        <article className="min-w-0 flex-1 space-y-16 pb-24 md:ml-64">
          <section id="getting-started" className="scroll-mt-28">
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Getting Started
            </h1>
            <p className="mt-3 text-ink/45">
              Helix gives your local app a public URL so you can share demos,
              test webhooks, or preview work without deploying.
            </p>

            <h2 className="mt-8 text-lg font-medium">1. Install the CLI</h2>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-ink/10 bg-surface p-4 font-mono text-sm text-accent">
              npm install -g helix
            </pre>

            <h2 className="mt-8 text-lg font-medium">2. Log in</h2>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-ink/10 bg-surface p-4 font-mono text-sm text-accent">
              helix login
            </pre>
            <p className="mt-3 text-sm text-ink/40">
              Enter your email, then the 6-digit code from your inbox. You can
              also sign in on the web at{" "}
              <Link
                href="/auth"
                className="text-ink/70 underline underline-offset-2"
              >
                /auth
              </Link>
              .
            </p>

            <h2 className="mt-8 text-lg font-medium">3. Start a tunnel</h2>
            <pre className="mt-3 overflow-x-auto rounded-xl border border-ink/10 bg-surface p-4 font-mono text-sm text-accent">
              helix myapp 3000
            </pre>
            <p className="mt-3 text-sm text-ink/40">
              Your server on{" "}
              <code className="font-mono text-ink/60">localhost:3000</code> is
              available at{" "}
              <code className="font-mono text-ink/60">/tunnel/myapp/</code> on
              the Helix host. Keep the CLI running while you need the tunnel.
            </p>
          </section>

          <section id="cli" className="scroll-mt-28">
            <h1 className="font-display text-4xl font-bold tracking-tight">
              CLI
            </h1>
            <p className="mt-3 text-ink/45">
              Create and run tunnels from the CLI. The dashboard is for viewing
              status and traffic.
            </p>

            <div className="mt-8 overflow-hidden rounded-xl border border-ink/10">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ink/10 bg-surface text-xs tracking-wide text-ink/30 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Command</th>
                    <th className="px-4 py-3 font-medium">What it does</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/8">
                  <tr>
                    <td className="px-4 py-3 font-mono text-accent">
                      helix login
                    </td>
                    <td className="px-4 py-3 text-ink/50">
                      Sign in with an email code and save your session on this
                      machine.
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-accent">
                      helix &lt;name&gt; &lt;port&gt;
                    </td>
                    <td className="px-4 py-3 text-ink/50">
                      Open a tunnel named{" "}
                      <code className="font-mono text-ink/70">name</code> to{" "}
                      <code className="font-mono text-ink/70">
                        localhost:port
                      </code>
                      .
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-mono text-accent">
                      helix &lt;name&gt; &lt;port&gt; --password=…
                    </td>
                    <td className="px-4 py-3 text-ink/50">
                      Same as above, with a password on the public URL (
                      <span className="text-accent">Pro</span>).
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 className="mt-8 text-lg font-medium">Tips</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-ink/45">
              <li>Start your local app before opening the tunnel.</li>
              <li>
                Leave the CLI process running for as long as you need the link.
              </li>
              <li>
                Free accounts can run one active tunnel at a time. Upgrade for
                more.
              </li>
            </ul>
          </section>

          <section id="dashboard" className="scroll-mt-28">
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="mt-3 text-ink/45">
              After you sign in, the dashboard shows your tunnels and recent
              request traffic.
            </p>

            <h2 className="mt-8 text-lg font-medium">Home</h2>
            <p className="mt-2 text-sm text-ink/40">
              Overview of your account and quick links to tunnels and billing.
            </p>

            <h2 className="mt-8 text-lg font-medium">Tunnels</h2>
            <p className="mt-2 text-sm text-ink/40">
              See every tunnel name you&apos;ve claimed, whether it&apos;s live,
              and how many requests it has received. Open a tunnel to inspect
              recent requests.
            </p>

            <h2 className="mt-8 text-lg font-medium">Billing</h2>
            <p className="mt-2 text-sm text-ink/40">
              Check your plan and upgrade to Helix Pro when you need longer
              sessions, more concurrent tunnels, or password protection.
            </p>
          </section>

          <section id="pro" className="scroll-mt-28">
            <h1 className="font-display text-4xl font-bold tracking-tight">
              Helix Pro
            </h1>
            <p className="mt-3 text-ink/45">
              Free is enough for quick demos. Pro is for work that needs the
              tunnel to stay up and scale with you.
            </p>

            <div className="mt-8 overflow-hidden rounded-xl border border-ink/10">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ink/10 bg-surface text-xs tracking-wide text-ink/30 uppercase">
                  <tr>
                    <th className="px-4 py-3 font-medium">Feature</th>
                    <th className="px-4 py-3 font-medium">Free</th>
                    <th className="px-4 py-3 font-medium">Pro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/8">
                  <tr>
                    <td className="px-4 py-3 text-ink/70">Active tunnels</td>
                    <td className="px-4 py-3 text-ink/50">1</td>
                    <td className="px-4 py-3 text-ink/50">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-ink/70">Request history</td>
                    <td className="px-4 py-3 text-ink/50">Recent only</td>
                    <td className="px-4 py-3 text-ink/50">Full history</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-ink/70">Idle timeout</td>
                    <td className="px-4 py-3 text-ink/50">Short</td>
                    <td className="px-4 py-3 text-ink/50">Long-lived</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-ink/70">
                      Password protection
                    </td>
                    <td className="px-4 py-3 text-ink/50">—</td>
                    <td className="px-4 py-3 text-ink/50">Yes</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="mt-6 text-sm text-ink/40">
              Upgrade from{" "}
              <Link
                href="/dashboard/upgrade"
                className="text-accent underline underline-offset-2"
              >
                Dashboard → Upgrade
              </Link>
              .
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}
