import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Helix",
  description: "Self-hosted localhost tunneling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark text-white antialiased">{children}</body>
    </html>
  );
}
