"use client";

import React, { useState, useEffect } from "react";
import { 
  Plus, Copy, Trash2, ExternalLink, Wallet, DollarSign, 
  Activity, BarChart3, Link2, Check, RefreshCw, AlertCircle,
  Zap, ChevronRight
} from "lucide-react";
import { 
  getLinks, createLink, deleteLink, getDashboardStats, 
  DashboardStats, AstroGatesLink 
} from "@/utils/localDb";
import { analytics, AnalyticsRecord } from "@/utils/analytics";
import { 
  connectWallet, isFreighterAvailable, checkExistingConnection, 
  NATIVE_XLM_SAC 
} from "@/utils/stellar";

export default function Dashboard() {
  const [links, setLinks] = useState<AstroGatesLink[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenueXLM: 0,
    totalRevenueUSDC: 0,
    totalClicks: 0,
    totalLinks: 0
  });
  const [telemetryEvents, setTelemetryEvents] = useState<AnalyticsRecord[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [longUrl, setLongUrl] = useState("");
  const [payoutAddress, setPayoutAddress] = useState("");
  const [price, setPrice] = useState("");
  const [token, setToken] = useState<'XLM' | 'USDC'>("XLM");
  const [webhookUrl, setWebhookUrl] = useState("");

  // Wallet Connection State
  const [walletAddress, setWalletAddress] = useState("");
  const [isFreighterInst, setIsFreighterInst] = useState(false);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    refreshData();
    checkFreighter();
  }, []);

  const checkFreighter = async () => {
    const available = await isFreighterAvailable();
    setIsFreighterInst(available);
    
    // Prevent auto-connecting if the user clicked disconnect explicitly
    const isManuallyDisconnected = typeof window !== 'undefined' && 
      window.localStorage.getItem("stellar_wallet_disconnected") === "true";

    if (available && !isManuallyDisconnected) {
      const conn = await checkExistingConnection();
      if (conn.address) {
        setWalletAddress(conn.address);
        if (!payoutAddress) {
          setPayoutAddress(conn.address);
        }
      }
    }
  };

  const refreshData = () => {
    setLinks(getLinks());
    setStats(getDashboardStats());
    setTelemetryEvents(analytics.getEvents());
  };

  const handleConnectWallet = () => {
    setShowWalletModal(true);
  };

  const selectWalletAndConnect = async (walletType: string) => {
    setShowWalletModal(false);
    setIsLoadingWallet(true);
    setErrorMsg("");
    try {
      const res = await connectWallet(walletType);
      if (res.error) {
        throw new Error(res.error);
      }
      setWalletAddress(res.address);
      if (!payoutAddress) {
        setPayoutAddress(res.address);
      }
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem("stellar_wallet_disconnected");
      }
      analytics.track("Wallet Connected", { walletAddress: res.address, walletType });
      refreshData();
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || `Failed to connect ${walletType} wallet.`);
    } finally {
      setIsLoadingWallet(false);
    }
  };

  const handleDisconnectWallet = () => {
    setWalletAddress("");
    if (typeof window !== 'undefined') {
      window.localStorage.setItem("stellar_wallet_disconnected", "true");
    }
  };

  const handleCreatePaywall = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!title.trim() || !longUrl.trim() || !payoutAddress.trim() || !price) {
      setErrorMsg("Please fill out all required fields.");
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg("Price must be a valid positive number.");
      return;
    }

    if (!payoutAddress.startsWith("G") || payoutAddress.length !== 56) {
      setErrorMsg("Invalid Stellar public key format (should start with 'G' and be 56 characters).");
      return;
    }

    // Set XLM SAC or USDC testnet address
    const tokenId = token === "XLM" 
      ? NATIVE_XLM_SAC 
      : "CA5K2YZKED3W65Z7X6T3Z4J6GXZH7C4OJG7W4O6H4P5V2N3X4Y5Z6A7B"; // Testnet USDC mock

    try {
      const newLink = createLink({
        title,
        longUrl,
        creatorAddress: payoutAddress,
        price: priceNum,
        token,
        tokenId,
        webhookUrl: webhookUrl.trim() || undefined
      });

      // Track event
      analytics.track("Link Created", {
        linkId: newLink.id,
        price: priceNum,
        token,
        longUrl: newLink.longUrl
      });

      setTitle("");
      setLongUrl("");
      setPrice("");
      setWebhookUrl("");
      refreshData();
    } catch (e: any) {
      setErrorMsg(e.message || "Failed to create gateway link.");
    }
  };

  const handleDelete = (id: string) => {
    deleteLink(id);
    refreshData();
  };

  const copyToClipboard = (id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const gateUrl = `${origin}/p/${id}`;
    navigator.clipboard.writeText(gateUrl);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-brand-emerald/10">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Creator Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Generate locked gateways, review conversions, and manage wallet addresses.
          </p>
        </div>

        {/* Freighter Integration Block */}
        <div className="flex items-center gap-4">
          {walletAddress ? (
            <div className="flex items-center gap-3 bg-brand-emerald/10 border border-brand-emerald/20 px-4 py-2 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-slate-300">
                {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 6)}
              </span>
              <button
                onClick={handleDisconnectWallet}
                className="text-[10px] font-bold text-red-400 hover:text-red-300 hover:underline border-l border-brand-emerald/20 pl-3 ml-1 uppercase tracking-wider transition-colors duration-150"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={isLoadingWallet}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-900 bg-brand-rose hover:bg-rose-400 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-[0_0_10px_rgba(16, 185, 129, 0.15)] hover:shadow-[0_0_25px_rgba(253, 164, 175, 0.5)]"
            >
              <Wallet className="w-4 h-4" />
              <span>{isLoadingWallet ? "Connecting..." : "Connect Freighter"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Onboarding Wizard Tutorial */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border-brand-rose/20 bg-gradient-to-r from-brand-darker/60 to-brand-dark/60 backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-rose/5 rounded-bl-full pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-rose" />
              <span>Stellar Creator Onboarding Guide</span>
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              Complete these simple steps to set up your profile, fund your wallet, and deploy a secure Web3 paywall gateway in under 2 minutes.
            </p>
          </div>
          
          <a
            href="https://lab.stellar.org/#account-creator"
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 text-xs font-semibold text-brand-rose border border-brand-rose/30 hover:border-brand-rose hover:bg-brand-rose/10 px-4 py-2 rounded-xl transition-all duration-200 self-start lg:self-center"
          >
            Open Stellar Lab Friendbot
          </a>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 pt-6 border-t border-brand-emerald/10">
          {/* Step 1: Install Freighter */}
          <div className={`p-4 rounded-xl border transition-all duration-200 ${
            isFreighterInst 
              ? "bg-emerald-950/20 border-emerald-500/20 text-slate-300" 
              : "bg-amber-950/20 border-amber-500/20 text-slate-400"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 1</span>
              {isFreighterInst ? (
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Installed
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider animate-pulse">Required</span>
              )}
            </div>
            <h3 className="font-display font-bold text-sm text-white mb-1.5">Install Freighter</h3>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {isFreighterInst 
                ? "Wallet extension detected. You are ready to interact with Stellar smart contracts."
                : "Install the official browser extension to sign transactions."
              }
            </p>
            {!isFreighterInst && (
              <a
                href="https://www.freighter.app/"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block text-[10px] font-bold text-brand-rose hover:underline uppercase tracking-wider"
              >
                Get Freighter &rarr;
              </a>
            )}
          </div>

          {/* Step 2: Connect Wallet */}
          <div className={`p-4 rounded-xl border transition-all duration-200 ${
            walletAddress 
              ? "bg-emerald-950/20 border-emerald-500/20 text-slate-300" 
              : isFreighterInst
                ? "bg-brand-emerald/5 border-brand-emerald/20 text-slate-400 animate-pulse-slow"
                : "bg-slate-900/40 border-slate-800/80 text-slate-500"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 2</span>
              {walletAddress ? (
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Connected
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending</span>
              )}
            </div>
            <h3 className="font-display font-bold text-sm text-white mb-1.5">Connect Wallet</h3>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {walletAddress 
                ? `Authorized as: ${walletAddress.slice(0, 5)}...${walletAddress.slice(-5)}`
                : "Connect your wallet so we can automatically suggest payout routing addresses."
              }
            </p>
            {!walletAddress && isFreighterInst && (
              <button
                type="button"
                onClick={handleConnectWallet}
                className="mt-3 text-[10px] font-bold text-brand-rose hover:underline uppercase tracking-wider text-left"
              >
                Connect Now &rarr;
              </button>
            )}
          </div>

          {/* Step 3: Fund Testnet Account */}
          <div className={`p-4 rounded-xl border transition-all duration-200 ${
            walletAddress 
              ? "bg-brand-emerald/5 border-brand-emerald/20 text-slate-400"
              : "bg-slate-900/40 border-slate-800/80 text-slate-500"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 3</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Info</span>
            </div>
            <h3 className="font-display font-bold text-sm text-white mb-1.5">Fund via Friendbot</h3>
            <p className="text-[11px] leading-relaxed text-slate-400">
              New to Stellar Testnet? Your account must hold at least 2 XLM to exist. Use Stellar Lab Friendbot to instantly fund it with 10,000 free test tokens.
            </p>
          </div>

          {/* Step 4: Deploy Gateway */}
          <div className={`p-4 rounded-xl border transition-all duration-200 ${
            links.length > 0 
              ? "bg-emerald-950/20 border-emerald-500/20 text-slate-300"
              : walletAddress
                ? "bg-brand-emerald/5 border-brand-emerald/20 text-slate-400"
                : "bg-slate-900/40 border-slate-800/80 text-slate-500"
          }`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Step 4</span>
              {links.length > 0 ? (
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Created
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ready</span>
              )}
            </div>
            <h3 className="font-display font-bold text-sm text-white mb-1.5">Deploy first Gateway</h3>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Use the builder form below to generate a new gateway link. Share it with your audience to receive direct P2P payouts.
            </p>
          </div>
        </div>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-brand-emerald/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-emerald/5 rounded-bl-full pointer-events-none" />
          <BarChart3 className="w-5 h-5 text-brand-emerald mb-4" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block cursor-help" title="The total number of paywall gateways you have created">Total Gateways</span>
          <span className="text-3xl font-extrabold text-white font-display mt-2 block">{stats.totalLinks}</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-brand-rose/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-rose/5 rounded-bl-full pointer-events-none" />
          <Activity className="w-5 h-5 text-brand-rose mb-4" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block cursor-help" title="The total number of times your astrogates links have been clicked by visitors">Gate Clicks</span>
          <span className="text-3xl font-extrabold text-white font-display mt-2 block">{stats.totalClicks}</span>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-brand-rose/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-rose/5 rounded-bl-full pointer-events-none" />
          <DollarSign className="w-5 h-5 text-brand-rose mb-4" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block cursor-help" title="The total revenue received directly in XLM">Earnings (XLM)</span>
          <span className="text-3xl font-extrabold text-white font-display mt-2 block">
            {stats.totalRevenueXLM.toFixed(2)} <span className="text-sm font-normal text-slate-400">XLM</span>
          </span>
        </div>

        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
          <DollarSign className="w-5 h-5 text-emerald-500 mb-4" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block cursor-help" title="The total revenue received directly in USDC">Earnings (USDC)</span>
          <span className="text-3xl font-extrabold text-white font-display mt-2 block">
            {stats.totalRevenueUSDC.toFixed(2)} <span className="text-sm font-normal text-slate-400">USDC</span>
          </span>
        </div>
      </div>

      {/* Grid: Form & Analytics logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl relative border-brand-emerald/20">
            <div className="absolute top-0 left-0 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-brand-emerald to-transparent" />
            <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-rose" />
              <span>Create New Gateway Link</span>
            </h2>

            <form onSubmit={handleCreatePaywall} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Content Title</label>
                <input
                  type="text"
                  placeholder="e.g. Premium Photography Ebook"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="custom-input text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Destination URL (Locked content)</label>
                <input
                  type="url"
                  placeholder="https://example.com/downloads/ebook.pdf"
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  className="custom-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Price Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="e.g. 5.5"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="custom-input text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Payout Token</label>
                  <select
                    value={token}
                    onChange={(e) => setToken(e.target.value as 'XLM' | 'USDC')}
                    className="custom-input text-sm text-slate-300"
                  >
                    <option value="XLM">XLM (Native Stellar Asset)</option>
                    <option value="USDC">USDC (Stablecoin)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Payout Wallet (Stellar G Address)</label>
                  {walletAddress && (
                    <button
                      type="button"
                      onClick={() => setPayoutAddress(walletAddress)}
                      className="text-[10px] font-bold text-brand-rose hover:underline uppercase tracking-wider"
                    >
                      Use Connected Wallet
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="G..."
                  value={payoutAddress}
                  onChange={(e) => setPayoutAddress(e.target.value)}
                  className="custom-input text-xs font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Webhook Payout URL (Optional)</label>
                <input
                  type="url"
                  placeholder="e.g. https://myapi.com/webhooks/paywall"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="custom-input text-sm"
                />
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {!isFreighterInst && (
                <div className="flex items-center gap-2 p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Freighter extension not detected. Transactions will compile in Simulation Mode.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-glow-emerald flex items-center justify-center font-bold text-sm"
              >
                <span>Generate Smart Paywall Link</span>
                <Link2 className="w-4 h-4 ml-2" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Analytics Telemetry Event Logs */}
        <div className="glass-panel p-6 rounded-2xl relative border-brand-emerald/20 flex flex-col h-[480px]">
          <div className="flex items-center justify-between pb-4 border-b border-brand-emerald/10 mb-4">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-rose" />
              <span>Telemetry Event Log</span>
            </h2>
            <div className="flex items-center gap-2.5">
              {telemetryEvents.length > 0 && (
                <button
                  type="button"
                  onClick={() => analytics.exportToCSV(telemetryEvents)}
                  className="text-[10px] font-bold text-brand-rose hover:underline uppercase tracking-wider flex items-center gap-1"
                  title="Export telemetry log to CSV"
                >
                  Export CSV
                </button>
              )}
              <button 
                onClick={refreshData}
                className="text-slate-400 hover:text-white transition-colors duration-200"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3.5 pr-2">
            {telemetryEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
                <BarChart3 className="w-8 h-8 stroke-[1.5] mb-2 opacity-50" />
                <p className="text-xs">No telemetry events logged yet.</p>
              </div>
            ) : (
              telemetryEvents.map((evt) => (
                <div 
                  key={evt.id} 
                  className="bg-brand-darker/60 border border-brand-emerald/10 rounded-xl p-3.5 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold tracking-wider text-[10px] uppercase px-2 py-0.5 rounded-full ${
                      evt.eventName === "Payment Success" ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/20" :
                      evt.eventName === "Payment Failure" ? "bg-red-950/60 text-red-400 border border-red-500/20" :
                      evt.eventName === "Payment Triggered" ? "bg-blue-950/60 text-blue-400 border border-blue-500/20" :
                      evt.eventName === "Link Created" ? "bg-purple-950/60 text-purple-400 border border-purple-500/20" :
                      "bg-cyan-950/60 text-rose-400 border border-cyan-500/20"
                    }`}>
                      {evt.eventName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(evt.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  {evt.properties.walletAddress && (
                    <div className="text-[10px] text-slate-400 font-mono">
                      Wallet: {evt.properties.walletAddress.slice(0,6)}...{evt.properties.walletAddress.slice(-4)}
                    </div>
                  )}
                  {evt.properties.price && (
                    <div className="text-slate-300 font-medium">
                      Amount: {evt.properties.price} {evt.properties.token}
                    </div>
                  )}
                  {evt.properties.error && (
                    <div className="text-red-400 font-medium leading-normal mt-1">
                      Err: {evt.properties.error}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Section: Active paywalls List */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative border-brand-emerald/20">
        <h2 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-brand-rose" />
          <span>Active Gateway Links</span>
        </h2>

        {links.length === 0 ? (
          <div className="py-12 text-center text-slate-500 border border-dashed border-brand-emerald/20 rounded-xl bg-brand-darker/20">
            <Link2 className="w-10 h-10 mx-auto stroke-[1.5] opacity-50 mb-3" />
            <p className="text-sm">Create your first link using the form above to deploy a gateway.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-brand-emerald/10 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-4">Content</th>
                  <th className="py-4 px-4">Target Destination</th>
                  <th className="py-4 px-4">Price / Token</th>
                  <th className="py-4 px-4">Clicks</th>
                  <th className="py-4 px-4">Earnings</th>
                  <th className="py-4 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-emerald/5 text-sm text-slate-300">
                {links.map((link) => {
                  const origin = typeof window !== "undefined" ? window.location.origin : "";
                  const gateUrl = `${origin}/p/${link.id}`;
                  return (
                    <tr key={link.id} className="hover:bg-brand-emerald/5 transition-colors duration-200">
                      <td className="py-4 px-4 font-semibold text-white max-w-[200px] truncate">
                        {link.title}
                      </td>
                      <td className="py-4 px-4 max-w-[250px] truncate text-xs text-slate-500">
                        <a href={link.longUrl} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                          <span>{link.longUrl}</span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </td>
                      <td className="py-4 px-4 font-mono font-medium">
                        {link.price} {link.token}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {link.clicks}
                      </td>
                      <td className="py-4 px-4 font-mono font-medium text-emerald-400">
                        {link.earnings.toFixed(2)} {link.token}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => copyToClipboard(link.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-rose/10 text-brand-rose hover:bg-brand-rose/20 border border-brand-rose/20 transition-all duration-200"
                          >
                            {copiedId === link.id ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Link</span>
                              </>
                            )}
                          </button>
                          <a
                            href={`/p/${link.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors duration-200"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(link.id)}
                            className="p-1.5 rounded-lg bg-red-950/40 text-red-400 border border-red-500/20 hover:bg-red-900/40 transition-colors duration-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showWalletModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel p-6 sm:p-8 rounded-2xl border-brand-rose/25 bg-gradient-to-b from-slate-900 to-brand-dark max-w-md w-full mx-4 shadow-2xl relative">
            <h2 className="font-display font-extrabold text-xl text-white mb-2">Connect your Stellar Wallet</h2>
            <p className="text-slate-400 text-xs mb-6 font-sans">Select your preferred wallet connection to authorize AstroGates links.</p>
            
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => selectWalletAndConnect("freighter")}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-brand-rose/30 transition-all duration-150 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-rose/10 flex items-center justify-center text-brand-rose font-bold text-sm">FR</div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-brand-rose transition-colors duration-150">Freighter Wallet</h4>
                    <span className="text-[10px] text-slate-500">Browser Extension (Recommended)</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-rose transition-colors duration-150" />
              </button>

              <button
                type="button"
                onClick={() => selectWalletAndConnect("albedo")}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 hover:border-brand-rose/30 transition-all duration-150 text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-emerald/10 flex items-center justify-center text-brand-emerald font-bold text-sm">AL</div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-brand-emerald transition-colors duration-150">Albedo Wallet</h4>
                    <span className="text-[10px] text-slate-500">Safe Web-based wallet (No install)</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-brand-emerald transition-colors duration-150" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowWalletModal(false)}
              className="mt-6 w-full text-center text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-wider transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
