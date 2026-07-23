import Sidebar from "@/components/Sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
   <html lang="en" className="dark">
      <body>
        <div className="w-screen bg-dark text-white h-screen p-3 flex">
          <Sidebar />
          <div className="w-full rounded-xl bg-[#212121]">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
