import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import Link from "next/link";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

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
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable)} suppressHydrationWarning={true}>
        <div className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex gap-2 font-bold text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"></path><path d="M12 12v9"></path><path d="m16 16-4-4-4 4"></path></svg>
                <span>ANC CPQ</span>
              </div>
              <nav className="flex items-center space-x-6 text-sm font-medium">
                <Link href="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground/60">Dashboard</Link>
                <Link href="/new-project" className="transition-colors hover:text-foreground/80 text-foreground/60">New Project</Link>
              </nav>
              <div className="ml-auto flex items-center space-x-4">
                 <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">v1.0.0-beta</span>
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
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
