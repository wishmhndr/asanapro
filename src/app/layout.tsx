import type { Metadata } from "next";
// import 'bootstrap/dist/css/bootstrap.min.css'; // Don't import here if using CDN in head, but better to import package if installed.
// We installed bootstrap package, so we should import it.
import 'bootstrap/dist/css/bootstrap.min.css';
import "./globals.css";
import Script from "next/script";
import { PWASessionManager } from "@/components/PWASessionManager";

export const metadata: Metadata = {
  title: "AsanaPro 2026 — Property Agency Manager",
  description: "Mobile-first: Listing, CRM, Professional Link (WhatsApp).",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-light">
        <PWASessionManager />
        {children}
        <Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
        <Script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js" strategy="lazyOnload" />
        <Script id="ionicons-nomodule" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
