import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ANC CPQ Engine",
  description: "Automated Proposal System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <header className="p-4 bg-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="font-bold">ANC CPQ</a>
            <nav className="space-x-4 text-sm opacity-90">
              <a href="/demo" className="hover:underline">Demo Project</a>
              <a href="/orgs" className="hover:underline">Organizations</a>
              <a href="/orgs/1/members" className="hover:underline">Org Members</a>
            </nav>
          </div>
          <div className="text-sm opacity-80">DEV ENV</div>
        </header>
        <main>{children}</main>
        <Script
          id="anythingllm-chat-widget"
          data-embed-id="0e54e5d4-77ee-4f53-b81a-a4d62a1613f6"
          data-base-api-url="https://basheer-everythingllm.x0uyzh.easypanel.host/api/embed"
          src="https://basheer-everythingllm.x0uyzh.easypanel.host/embed/anythingllm-chat-widget.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
