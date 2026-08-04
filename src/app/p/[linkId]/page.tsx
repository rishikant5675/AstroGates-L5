"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Lock, Unlock, ArrowRight, Wallet, AlertCircle, 
  ShieldCheck, RefreshCw, ExternalLink 
} from "lucide-react";
import { getLinkById, updateLinkStats } from "@/utils/localDb";
import { analytics } from "@/utils/analytics";
import { 
  connectWallet, 
  payCreatorViaContract, 
  ASTROGATES_CONTRACT_ID, 
  isFreighterAvailable, 
  checkWalletNetwork 
} from "@/utils/stellar";
import confetti from "canvas-confetti";

export default function GatewayPage() {
  const params = useParams();
  const linkId = params.linkId as string;

  const [link, setLink] = useState<any>(null);
  const [buyerAddress, setBuyerAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "connecting" | "paying" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [countdown, setCountdown] = useState(8);
  const [mounted, setMounted] = useState(false);
  
  // Wallet and network availability states
  const [hasFreighter, setHasFreighter] = useState(true);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [txLogs, setTxLogs] = useState<string[]>([]);
  const [txHash, setTxHash] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    checkWalletAvailability();
    
    const foundLink = getLinkById(linkId);
    if (foundLink) {
      setLink(foundLink);
      
      // Increment clicks in database
      updateLinkStats(linkId, { clicks: 1 });
      
      // Track Telemetry
      analytics.track("Link Viewed", { 
        linkId, 
        price: foundLink.price, 
        token: foundLink.token 
      });
    } else {
      setStatus("error");
      setErrorMsg("This gateway link does not exist or has been removed by the creator.");
    }
  }, [linkId]);

  // Handle redirect timer countdown
  useEffect(() => {
    if (status === "success" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === "success" && countdown === 0 && link) {
      window.location.href = link.longUrl;
    }
  }, [status, countdown, link]);

  const checkWalletAvailability = async () => {
    const available = await isFreighterAvailable();
    setHasFreighter(available);
  };

  const addLog = (msg: string) => {
    setTxLogs((prev) => [...prev, `> ${msg}`]);
  };

  const handlePayment = async () => {
    if (!link) return;
    setLoading(true);
    setErrorMsg("");
    setTxLogs([]);
    setIsWrongNetwork(false);
    setStatus("connecting");

    analytics.track("Payment Triggered", { 
      linkId, 
      price: link.price, 
      token: link.token 
    });

    try {
      addLog("Verifying Freighter wallet installation...");
      const available = await isFreighterAvailable();
      if (!available) {
        setHasFreighter(false);
        throw new Error("Freighter wallet extension not found.");
      }

      // Check Network configuration
      addLog("Verifying wallet network details...");
      const netStatus = await checkWalletNetwork();
      if (netStatus.error) {
        throw new Error(`Network Check: ${netStatus.error}`);
      }
      if (!netStatus.onTestnet) {
        setIsWrongNetwork(true);
        throw new Error("Connected to the wrong network. Please switch to Testnet in Freighter.");
      }

      // Request wallet access
      addLog("Awaiting Freighter wallet connection permission...");
      const res = await connectWallet();
      if (res.error) {
        throw new Error(res.error);
      }
      setBuyerAddress(res.address);
      
      setStatus("paying");

      // Execute on-chain Soroban contract call
      const result = await payCreatorViaContract({
        buyerAddress: res.address,
        creatorAddress: link.creatorAddress,
        amount: link.price,
        tokenAddress: link.tokenId,
        contractAddress: ASTROGATES_CONTRACT_ID,
        onStep: addLog
      });

      if (result.success && result.txHash) {
        setTxHash(result.txHash);
        
        // Update earnings in database
        updateLinkStats(linkId, { earnings: link.price });
        
        analytics.track("Payment Success", {
          linkId,
          price: link.price,
          token: link.token,
          walletAddress: res.address,
          txHash: result.txHash
        });

        setStatus("success");
        
        confetti({
          particleCount: 100,
          spread: 75,
          origin: { y: 0.6 }
        });
      } else {
        throw new Error(result.error || "Transaction compilation error.");
      }
    } catch (e: any) {
      console.error("Payment flow failure:", e);
      setErrorMsg(e.message || "Failed to settle payment transaction. Please try again.");
      setStatus("error");
      addLog(`CRITICAL ERROR: ${e.message || "Transaction aborted."}`);
      
      analytics.track("Payment Failure", {
        linkId,
        price: link.price,
        token: link.token,
        error: e.message || "Transaction aborted"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  // Blocking wrong network banner
  const wrongNetworkBanner = isWrongNetwork && (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-650 bg-red-900 border-b border-red-500/20 py-3.5 px-4 text-center backdrop-blur-md flex items-center justify-center gap-3 text-red-100 text-sm font-semibold shadow-[0_4px_30px_rgba(0,0,0,0.4)] animate-bounce">
      <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-200" />
      <span>Wrong Network! Switch Freighter setting to **Testnet** to proceed.</span>
      <button 
        onClick={handlePayment} 
        className="px-3 py-1 bg-red-950/60 border border-red-500/30 rounded-lg text-xs hover:bg-red-800 transition-colors uppercase tracking-wider font-bold"
      >
        Retry Check
      </button>
    </div>
  );

  // Link not found fallback UI
  if (status === "error" && !link) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in-up">
        <div className="glass-panel p-8 rounded-2xl border-red-500/20 space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto border border-red-500/20">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white">Gateway Link Error</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {errorMsg}
          </p>
          <a
            href="/"
            className="w-full inline-flex items-center justify-center px-6 py-3 font-semibold text-slate-900 bg-brand-rose hover:bg-rose-400 rounded-xl transition-all duration-200"
          >
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 sm:py-24 animate-fade-in-up relative">
      {wrongNetworkBanner}

      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden text-center border-brand-emerald/20 space-y-8">
        
        {/* Animated locked/unlocked indicator */}
        <div className="relative mx-auto w-20 h-20">
          {status === "success" ? (
            <div className="w-full h-full rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-pulse">
              <Unlock className="w-9 h-9" />
            </div>
          ) : (
            <div className="w-full h-full rounded-full bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30 flex items-center justify-center">
              <Lock className="w-9 h-9" />
            </div>
          )}
          
          <div className={`absolute inset-0 rounded-full filter blur-md opacity-30 -z-10 ${
            status === "success" ? "bg-emerald-500" : "bg-brand-emerald"
          }`} />
        </div>

        {/* Real Testnet Validation Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-brand-rose/30 text-[10px] font-mono text-brand-rose mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-rose animate-pulse" />
          <span>REAL TESTNET GATEWAY V2.0</span>
        </div>

        {/* Lock screen text context */}
        {status !== "success" ? (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-rose">Stellar Secured Gateway</span>
            <h2 className="font-display font-extrabold text-2xl text-white leading-tight">
              {link?.title}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pay the required amount below using Freighter wallet to unlock the link.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Success! Content Unlocked</span>
            <h2 className="font-display font-extrabold text-2xl text-white leading-tight">
              Preparing Redirect...
            </h2>
            <p className="text-xs text-slate-400">
              You will be automatically redirected to your destination link in {countdown} seconds.
            </p>
          </div>
        )}

        {/* Payment details box */}
        <div className="bg-brand-darker/60 border border-brand-emerald/10 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-brand-emerald/5">
            <span className="text-slate-400">Recipient Payout Address</span>
            <span className="font-mono text-slate-300">
              {link?.creatorAddress.slice(0, 6)}...{link?.creatorAddress.slice(-6)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-3 border-b border-brand-emerald/5">
            <span className="text-slate-400">Network Fee</span>
            <span className="font-semibold text-emerald-400 uppercase">0.00 XLM (Fee-Free)</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-slate-300">Total Price</span>
            <span className="text-2xl font-extrabold text-white font-display">
              {link?.price} <span className="text-sm text-slate-400 font-normal">{link?.token}</span>
            </span>
          </div>
        </div>

        {/* Live Transaction logs panel */}
        {txLogs.length > 0 && (
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-left font-mono text-[11px] text-brand-rose space-y-1.5 max-h-[140px] overflow-y-auto shadow-inner">
            {txLogs.map((log, index) => (
              <div key={index} className="leading-relaxed whitespace-pre-wrap">
                {log}
              </div>
            ))}
          </div>
        )}

        {/* Action Button states / Inline Wallet Prompts */}
        {!hasFreighter ? (
          <div className="flex flex-col items-center gap-3.5 p-4 bg-amber-950/40 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-center font-medium leading-relaxed">
              Freighter Wallet extension is not installed in your browser. Install it to pay.
            </span>
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-brand-rose hover:bg-rose-400 text-slate-900 font-bold rounded-lg transition-colors text-[10px] uppercase tracking-wider shadow-[0_0_15px_rgba(253, 164, 175, 0.3)]"
            >
              Install Freighter Wallet
            </a>
          </div>
        ) : (
          <>
            {status === "idle" && (
              <button
                onClick={handlePayment}
                className="w-full btn-glow-rose flex items-center justify-center font-bold text-sm"
              >
                <span>Unlock Content</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}

            {status === "connecting" && (
              <button
                disabled
                className="w-full py-3 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4 animate-spin text-brand-rose" />
                <span>Connecting Freighter...</span>
              </button>
            )}

            {status === "paying" && (
              <button
                disabled
                className="w-full py-3 bg-slate-800 text-slate-400 border border-slate-700 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold cursor-not-allowed"
              >
                <RefreshCw className="w-4 h-4 animate-spin text-brand-emerald" />
                <span>Processing Soroban Transfer...</span>
              </button>
            )}

            {status === "success" && (
              <div className="space-y-4">
                <button
                  onClick={() => { window.location.href = link.longUrl; }}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 text-sm shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <span>Go to Destination Now</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSfDmockGoogleFormURL1076/viewform"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-brand-rose/10 hover:bg-brand-rose/20 border border-brand-rose/30 hover:border-brand-rose/50 text-brand-rose font-bold rounded-xl flex items-center justify-center gap-2 text-xs transition-all duration-200"
                >
                  <span>Rate Your Experience & Win $150</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {link?.webhookUrl && (
                  <div className="bg-slate-950/95 border border-slate-800 rounded-xl p-4 text-left font-mono text-[10px] space-y-2 mt-4 text-brand-emerald">
                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider pb-1.5 border-b border-brand-emerald/5">
                      <span>Webhook Delivery Simulator</span>
                      <span className="text-emerald-400">POST 200 OK</span>
                    </div>
                    <div className="text-slate-400 leading-normal">
                      Sent to: <span className="text-brand-rose select-all break-all">{link.webhookUrl}</span>
                    </div>
                    <pre className="text-slate-300 overflow-x-auto whitespace-pre-wrap select-all bg-brand-darker/60 p-2 rounded-lg border border-brand-emerald/10 max-h-[140px]">
                      {JSON.stringify({
                        event: "astrogates.unlock_success",
                        timestamp: Date.now(),
                        linkId: link.id,
                        title: link.title,
                        price: link.price,
                        token: link.token,
                        txHash: txHash,
                        buyer: buyerAddress || "GBFD6...SZXDRG"
                      }, null, 2)}
                    </pre>
                  </div>
                )}
                
                {txHash && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 text-xs text-brand-rose hover:underline mt-1 w-full font-semibold"
                  >
                    <span>Verify on Stellar Expert</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            {status === "error" && (
              <div className="space-y-4">
                <div className="flex items-start gap-2 text-left p-3.5 bg-red-950/40 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
                
                <button
                  onClick={handlePayment}
                  className="w-full btn-glow-emerald flex items-center justify-center font-bold text-sm"
                >
                  <span>Retry Payment</span>
                  <RefreshCw className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Security / Verification Badging */}
        <div className="space-y-2.5 pt-2 border-t border-brand-emerald/10">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
            <ShieldCheck className="w-4 h-4 text-brand-rose" />
            <span>Soroban Verified Contract Payout</span>
          </div>
          <div className="text-[9px] font-mono text-slate-500 break-all select-all hover:text-slate-400 cursor-pointer" title="Click to copy Contract ID">
            Contract: {ASTROGATES_CONTRACT_ID}
          </div>
        </div>
      </div>
    </div>
  );
}
