import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Mood-Mantra | Mindful AI Companion",
  description: "A peaceful, empathetic voice companion for mental wellness and mindful conversations.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a1929",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} ${playfair.variable} bg-linear-to-br from-slate-950 via-indigo-950/30 to-slate-950 text-slate-100 antialiased`}>
        {/* Subtle gradient overlay */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.55_0.22_183.61/.05),transparent,transparent)] pointer-events-none"></div>
        <main className="relative min-h-screen overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}