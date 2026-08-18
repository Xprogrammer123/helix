import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { PlanProvider } from "@/components/dashboard/PlanContext";
import { LiveEventsProvider } from "@/components/dashboard/LiveEvents";
import { getSessionToken } from "@/lib/auth-server";
import { relayFetch, type UserProfile } from "@/lib/relay-server";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getSessionToken();
  if (!token) redirect("/auth");

  const me = await relayFetch("/api/me");
  const initialUser = me.ok ? (me.data as UserProfile) : null;

  return (
    <PlanProvider initialUser={initialUser}>
      <LiveEventsProvider>
        <div className="flex h-screen w-screen bg-dark p-3 text-ink">
          <Sidebar user={initialUser} />
          <main className="scrollbar-none flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-ink/8 bg-surface">
            {children}
          </main>
        </div>
      </LiveEventsProvider>
    </PlanProvider>
  );
}
