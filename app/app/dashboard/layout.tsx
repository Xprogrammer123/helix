import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { getSessionToken } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getSessionToken();
  if (!token) redirect("/auth");

  return (
    <div className="flex h-screen w-screen bg-dark p-3 text-white">
      <Sidebar />
      <main className="scrollbar-none flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl bg-[#212121]">
        {children}
      </main>
    </div>
  );
}
