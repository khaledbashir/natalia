import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { cn } from "@/lib/utils";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "ANC Enterprise Estimator",
  description: "Professional LED screen estimation and proposal system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("bg-background font-sans antialiased", inter.variable)} suppressHydrationWarning={true}>
        <div className="flex h-screen overflow-hidden">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-background">
            {children}
          </main>
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
