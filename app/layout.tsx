import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "@/design/tokens.css";
import "./globals.css";
import { ServiceWorker } from "@/components/ServiceWorker";

// Fonts are downloaded at build time and served from this app, so they work offline.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display", weight: ["400", "600", "700", "800"], display: "swap" });

export const metadata: Metadata = {
  title: "hackX Media",
  description: "Grand Finals media system — hackX 11.0 & hackX Jr 9.0",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/icon-192.png" },
};

export const viewport: Viewport = { themeColor: "#010814" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
