import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AstroGates — Modern Web3 Gateways",
  description: "Monetize your content instantly using Stellar and Soroban. Safe, fast, and fee-free direct creator payouts.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#020806] text-slate-100 min-h-screen flex flex-col justify-between selection:bg-brand-emerald selection:text-slate-900">
        {/* Glowing background meshes */}
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-hero-glow opacity-60 filter blur-[80px]" />
          <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-brand-emerald/10 rounded-full filter blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-brand-rose/10 rounded-full filter blur-[120px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
        </div>

        {/* Global Navigation Header */}
        <header className="sticky top-0 z-50 glass-panel border-b border-brand-emerald/10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-emerald to-brand-rose flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <span className="font-display font-extrabold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-brand-rose">
                Astro<span className="text-brand-emerald">Gates</span>
              </span>
            </a>

            <nav className="flex items-center gap-6">
              <a href="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-200">
                Dashboard
              </a>
              <a 
                href="/dashboard" 
                className="px-4 py-2 text-xs font-semibold text-brand-emerald border border-brand-emerald/30 rounded-lg hover:bg-brand-emerald/10 transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
              >
                Launch App
              </a>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-brand-emerald/10 bg-brand-darker/60 backdrop-blur-sm py-8 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-slate-400">
                Astro<span className="text-brand-rose">Gates</span>
              </span>
              <span className="text-xs text-slate-600">|</span>
              <span className="text-xs text-slate-500">Hackathon MVP</span>
            </div>
            <p className="text-xs text-slate-500">
              Built on Stellar & Soroban. Zero Platform Fees.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
