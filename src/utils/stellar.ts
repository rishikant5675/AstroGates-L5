import {
  isConnected,
  requestAccess,
  getAddress,
  getNetworkDetails,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import {
  rpc,
  Contract,
  TransactionBuilder,
  Address,
  nativeToScVal,
} from "@stellar/stellar-sdk";

import albedo from "@albedo-link/intent";

// Load Environment variables with safe Testnet fallbacks
export const SOROBAN_RPC_URL = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || "https://soroban-testnet.stellar.org";
export const STELLAR_NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE || "Test SDF Network ; September 2015";
export const HORIZON_URL = process.env.NEXT_PUBLIC_HORIZON_URL || "https://horizon-testnet.stellar.org";
export const ASTROGATES_CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID || "CDKURYTMIMKTQSNFSMGCQI75DZ4JRGFNM7CTPR56H7X62SCPQNSHXSUW";

// Default SAC Token contract ID on Testnet (Native XLM SAC)
export const NATIVE_XLM_SAC = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

// Transaction timeout configuration
export const TX_TIMEOUT_SECONDS = 120;

/**
 * Checks if Freighter browser extension is installed.
 */
export async function isFreighterAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const res = await isConnected();
    return !!(res && res.isConnected);
  } catch (e) {
    return false;
  }
}

/**
 * Connects wallet (Freighter or Albedo), returning the user's public address or error.
 */
export async function connectWallet(walletType: string = "freighter"): Promise<{ address: string; error?: string }> {
  if (walletType === "albedo") {
    try {
      const res = await albedo.publicKey({});
      if (!res.pubkey) {
        return { address: "", error: "Failed to connect Albedo wallet." };
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem("stellar_wallet_type", "albedo");
        window.localStorage.setItem("stellar_wallet_address", res.pubkey);
        window.localStorage.removeItem("stellar_wallet_disconnected");
      }
      return { address: res.pubkey };
    } catch (e: any) {
      return { address: "", error: e.message || "Albedo wallet connection rejected." };
    }
  }

  const available = await isFreighterAvailable();
  if (!available) {
    return { address: "", error: "Freighter wallet extension not found. Please install it." };
  }

  try {
    const res = await requestAccess();
    if (res && res.error) {
      return { address: "", error: res.error };
    }
    const pubKey = res?.address;
    if (!pubKey) {
      return { address: "", error: "Access was denied or public key could not be retrieved." };
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("stellar_wallet_type", "freighter");
      window.localStorage.setItem("stellar_wallet_address", pubKey);
      window.localStorage.removeItem("stellar_wallet_disconnected");
    }
    return { address: pubKey };
  } catch (e: any) {
    return { address: "", error: e.message || "Failed to connect Freighter." };
  }
}

/**
 * Re-checks an existing wallet connection without prompt, returning public address.
 */
export async function checkExistingConnection(): Promise<{ address: string; error?: string }> {
  const walletType = typeof window !== "undefined" ? window.localStorage.getItem("stellar_wallet_type") : "freighter";

  if (walletType === "albedo") {
    const cachedAddress = typeof window !== "undefined" ? window.localStorage.getItem("stellar_wallet_address") : "";
    if (cachedAddress) {
      return { address: cachedAddress };
    }
    return { address: "" };
  }

  const available = await isFreighterAvailable();
  if (!available) return { address: "" };

  try {
    const res = await getAddress();
    if (res && res.error) {
      return { address: "", error: res.error };
    }
    const pubKey = res?.address || "";
    if (pubKey && typeof window !== "undefined") {
      window.localStorage.setItem("stellar_wallet_address", pubKey);
    }
    return { address: pubKey };
  } catch (e: any) {
    return { address: "", error: e.message || "Failed to check existing Freighter wallet address." };
  }
}

/**
 * Verifies that the connected wallet is active on Stellar Testnet.
 */
export async function checkWalletNetwork(): Promise<{ onTestnet: boolean; error?: string }> {
  const walletType = typeof window !== "undefined" ? window.localStorage.getItem("stellar_wallet_type") : "freighter";
  if (walletType === "albedo") {
    return { onTestnet: true }; // Albedo automatically supports testnet based on transaction intent parameters
  }

  const available = await isFreighterAvailable();
  if (!available) {
    return { onTestnet: false, error: "Freighter wallet not found." };
  }

  try {
    const details = await getNetworkDetails();
    if (details && details.error) {
      return { onTestnet: false, error: details.error };
    }
    
    console.log("Freighter network details:", details);
    // Check if network passphrase matches our testnet passphrase or name is TESTNET
    const isTestnet = 
      details?.networkPassphrase === STELLAR_NETWORK_PASSPHRASE || 
      details?.network === "TESTNET";
      
    return { onTestnet: !!isTestnet };
  } catch (e: any) {
    return { onTestnet: false, error: e.message || "Failed to retrieve network passphrase details." };
  }
}

/**
 * Invokes the Soroban smart contract's `pay_creator` function on Stellar Testnet.
 * 
 * Flow:
 * 1. Initialize RPC connection.
 * 2. Fetch sequence number of buyer's account.
 * 3. Convert contract arguments into Soroban ScVal formatting.
 * 4. Run prepares/simulations to append footprints and fees.
 * 5. Sign the transaction envelope via Freighter wallet.
 * 6. Send the transaction and poll status.
 */
export async function payCreatorViaContract(params: {
  buyerAddress: string;
  creatorAddress: string;
  amount: number;
  tokenAddress: string;
  contractAddress: string;
  onStep?: (step: string) => void;
}): Promise<{ success: boolean; txHash?: string; error?: string }> {
  console.log("Initiating live payment transfer:", params);
  params.onStep?.("Connecting to Stellar Testnet RPC node...");

  const server = new rpc.Server(SOROBAN_RPC_URL);

  // 1. Fetch Source Account from RPC
  params.onStep?.("Fetching buyer account details from Testnet...");
  let sourceAccount;
  try {
    sourceAccount = await server.getAccount(params.buyerAddress);
  } catch (err: any) {
    console.error("Failed to load source account:", err);
    return {
      success: false,
      error: "Account details not found on Testnet. Please ensure your wallet address has been funded via Friendbot."
    };
  }

  // 2. Scale amount by 10^7 (dec: 7 for XLM)
  params.onStep?.("Converting price into Stroops (7 decimal places)...");
  const stroops = BigInt(Math.round(params.amount * 10_000_000));

  // 3. Build Contract Arguments
  params.onStep?.("Preparing contract payload arguments...");
  
  let tokenAddress = params.tokenAddress;
  if (
    tokenAddress === "CDLZFC3SYJYDZT7K6UGVNDMWNZ5KWJZCG6JGWZOHZWB34AEOZ6674HNS" ||
    tokenAddress === "CC4EF6ICBEYOGQTHEH4ODOCUH5IB6JSZCVSTYKCC2OOI7VHBLPYJEONV"
  ) {
    tokenAddress = NATIVE_XLM_SAC;
  }

  const args = [
    new Address(params.buyerAddress).toScVal(),
    new Address(params.creatorAddress).toScVal(),
    nativeToScVal(stroops, { type: "i128" }),
    new Address(tokenAddress).toScVal(),
  ];

  // 4. Construct Contract call
  const contract = new Contract(params.contractAddress);
  const operation = contract.call("pay_creator", ...args);

  // 5. Build initial transaction
  let tx = new TransactionBuilder(sourceAccount, {
    fee: "100000",
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  })
    .addOperation(operation)
    .setTimeout(TX_TIMEOUT_SECONDS)
    .build();

  // 6. Simulate Transaction
  params.onStep?.("Simulating transaction (preparing footprint ledger reads/writes & fees)...");
  try {
    tx = await server.prepareTransaction(tx);
  } catch (err: any) {
    console.error("Simulation failed:", err);
    return {
      success: false,
      error: `Transaction simulation failed: ${err.message || "Ensure you have sufficient testnet funds."}`
    };
  }

  // 7. Request signature from configured wallet
  const walletType = typeof window !== "undefined" ? window.localStorage.getItem("stellar_wallet_type") : "freighter";
  params.onStep?.(`Awaiting signature approval from ${walletType === "albedo" ? "Albedo" : "Freighter"} wallet...`);
  let signedTxXdr: string;
  try {
    if (walletType === "albedo") {
      const signResult = await albedo.tx({
        xdr: tx.toXDR(),
        network: "testnet"
      });
      signedTxXdr = signResult.signed_envelope_xdr;
      if (!signedTxXdr) {
        return { success: false, error: "Albedo wallet did not return signed transaction XDR." };
      }
    } else {
      const signResult = await freighterSignTransaction(tx.toXDR(), {
        networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
      });

      if (signResult.error) {
        return { success: false, error: `Freighter signature request denied: ${signResult.error}` };
      }
      
      signedTxXdr = signResult.signedTxXdr;
      if (!signedTxXdr) {
        return { success: false, error: "Freighter wallet did not return signed transaction XDR." };
      }
    }
  } catch (err: any) {
    console.error("Signing failed:", err);
    return { success: false, error: `Wallet signature aborted: ${err.message || err}` };
  }

  // 8. Submit signed transaction
  params.onStep?.("Submitting transaction to Stellar Testnet...");
  let sendTxResponse;
  try {
    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, STELLAR_NETWORK_PASSPHRASE);
    sendTxResponse = await server.sendTransaction(signedTx);
  } catch (err: any) {
    console.error("RPC Submission error:", err);
    return { success: false, error: `RPC Node Submission Error: ${err.message || err}` };
  }

  if (sendTxResponse.status === "ERROR") {
    return {
      success: false,
      error: `RPC Submission rejected: ${JSON.stringify(sendTxResponse)}`
    };
  }

  const txHash = sendTxResponse.hash;
  params.onStep?.(`Transaction submitted! Hash: ${txHash.slice(0, 10)}... Polling ledger confirmation...`);

  // 9. Poll transaction status
  let attempts = 0;
  const maxAttempts = 30;
  while (attempts < maxAttempts) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    try {
      const txStatus = await server.getTransaction(txHash);
      params.onStep?.(`Polling status (attempt ${attempts}/30): ${txStatus.status}`);

      if (txStatus.status === "SUCCESS") {
        params.onStep?.("Success! Payment settled on Stellar Ledger.");
        return {
          success: true,
          txHash,
        };
      } else if (txStatus.status === "FAILED") {
        return {
          success: false,
          error: `Transaction failed on-chain: ${JSON.stringify(txStatus.resultXdr)}`
        };
      }
    } catch (e: any) {
      console.warn("Polling error (retrying):", e.message);
    }
  }

  return {
    success: false,
    error: "Transaction submission timed out. Please check your address on Stellar Expert."
  };
}
