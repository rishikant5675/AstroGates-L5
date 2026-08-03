"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Lock, Shield, Zap, TrendingUp } from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative isolate px-6 pt-14 lg:px-8 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
      {/* Hero Content */}
      <div className="text-center max-w-3xl animate-fade-in-up mt-10 md:mt-20">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-purple/10 border border-brand-purple/30 text-xs font-semibold text-brand-violet mb-6 animate-pulse-slow">
          <Zap className="w-3.5 h-3.5" />
          <span>Soroban Smart Contracts Integrated</span>
        </div>
        
        <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl leading-tight text-white mb-6">
          The Decoupled Web3 <span className="gradient-text-primary">Paywall</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10">
          Monetize downloads, newsletters, or premium links with zero middleman fees. Direct wallet-to-wallet transactions on the Stellar Network.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/dashboard" className="btn-glow-cyan">
            <span>Create a Paywall</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
          <a 
            href="#features" 
            className="px-6 py-3 font-medium text-slate-300 hover:text-white rounded-xl border border-slate-700 hover:border-slate-500 shadow-[0_0_15px_rgba(6,182,212,0.05)] hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all duration-200"
          >
            How it Works
          </a>
        </div>
      </div>

      {/* Visual representation of Gateway Lockscreen */}
      <div className="w-full max-w-4xl mt-20 relative rounded-2xl border border-brand-purple/20 bg-brand-dark/40 backdrop-blur-md p-1 shadow-2xl animate-pulse-slow">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-brand-purple/20 to-brand-cyan/20 opacity-30 blur-lg" />
        <div className="relative rounded-xl bg-brand-darker/90 p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <div className="w-12 h-12 rounded-lg bg-brand-purple/20 flex items-center justify-center text-brand-purple">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-2xl text-white">Example Locked Gateway</h3>
            <p className="text-slate-400 text-sm">
              Clicking this gateway checks for Freighter, performs direct Soroban payments, and automatically redirects the buyer safely.
            </p>
          </div>
          <div className="w-full md:w-auto flex-shrink-0">
            <div className="glass-panel p-6 rounded-xl border border-brand-cyan/30 text-center w-full md:w-[280px]">
              <span className="text-xs text-brand-cyan font-semibold tracking-wider uppercase block mb-1">Price</span>
              <span className="text-4xl font-extrabold text-white font-display block mb-4">10.0 <span className="text-lg text-slate-400">XLM</span></span>
              <Link href="/dashboard" className="w-full py-2.5 bg-brand-cyan text-brand-darker font-bold rounded-lg hover:bg-cyan-400 transition-colors duration-200 text-sm block">
                Unlock Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="w-full py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-brand-cyan">Highly Optimized Web3 Architecture</h2>
            <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Everything you need to launch in seconds
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col glass-panel p-8 rounded-2xl glass-panel-hover">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <Shield className="h-5 w-5 flex-none text-brand-purple" aria-hidden="true" />
                  Freighter Wallet Auth
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                  <p className="flex-auto text-sm">
                    Leverages `@stellar/freighter-api` to authenticate and authorize smart contract payments securely from any modern browser.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col glass-panel p-8 rounded-2xl glass-panel-hover">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <TrendingUp className="h-5 w-5 flex-none text-brand-cyan" aria-hidden="true" />
                  Fee-Free Transfers
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                  <p className="flex-auto text-sm">
                    No platform fees. The Soroban smart contract transfers tokens directly from the buyer to your designated payout address.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col glass-panel p-8 rounded-2xl glass-panel-hover">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <Zap className="h-5 w-5 flex-none text-brand-pink" aria-hidden="true" />
                  Analytics Tracking
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                  <p className="flex-auto text-sm">
                    Built-in tracking utility to log conversions, wallet triggers, and payouts so you can monitor your link performance.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
