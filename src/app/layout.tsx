import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWA from "@/components/PWA";

export const metadata: Metadata = {
  title: "WANPLAN - Inventory Management",
  description: "Multi-tenant SaaS inventory management system",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#4338ca",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900">
        {children}
        <PWA />
      </body>
    </html>
  );
}
