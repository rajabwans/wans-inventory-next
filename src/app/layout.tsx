import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WANPLAN - Inventory & Sales Management",
  description: "wanland planner - inventory & sales management",
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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="/wans/wanplan/vendor/bootstrap/bootstrap.min.css" rel="stylesheet" />
        <link href="/wans/wanplan/vendor/bootstrap-icons/bootstrap-icons.min.css" rel="stylesheet" />
        <link href="/wans/wanplan/style.css" rel="stylesheet" />
      </head>
      <body>
        {children}
        <script src="/wans/wanplan/vendor/bootstrap/bootstrap.bundle.min.js" />
      </body>
    </html>
  );
}