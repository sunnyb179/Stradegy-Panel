import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Whisp",
  description:
    "Whisp is an AI-assisted market analysis MVP for exploring options data, liquidity, volatility, and risk.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-white/10 bg-ink/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="text-lg font-semibold tracking-wide text-white">
              Whisp
            </Link>
            <div className="hidden text-sm text-slate-400 sm:block">
              Catch the signal before it fades.
            </div>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
