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
        {children}
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
