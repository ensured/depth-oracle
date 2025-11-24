"use client";

import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { useState, useEffect, useRef } from "react";
import { Emulator, Lucid, LucidEvolution, WalletApi } from "@lucid-evolution/lucid";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, Coins, Wallet } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { HybridTooltip } from "@/components/HybridTooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { network } from "@/types/network";

type PaymentMethod = "ADA" | "IAG" | "SNEK";

interface TransactionBuilderProps {
  creditsRemaining: number;
  onTransactionSuccess?: () => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}

export default function TransactionBuilder({ creditsRemaining, onTransactionSuccess, onProcessingChange }: TransactionBuilderProps) {
  const [txHash, setTxHash] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmations, setConfirmations] = useState<number>(0);
  const [isPolling, setIsPolling] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasNotifiedRef = useRef(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("ADA");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [totalIAG, setTotalIAG] = useState<bigint>(0n);
  const [totalSNEK, setTotalSNEK] = useState<bigint>(0n);
  const [lucid, setLucid] = useState<LucidEvolution | null>(null);
  const [api, setApi] = useState<WalletApi | null>(null);

  const { user } = useUser();

  const { isConnected, usedAddresses, enabledWallet, accountBalance } = useCardano({
    limitNetwork: network
  });

  // Notify parent of processing state changes
  useEffect(() => {
    onProcessingChange?.(isLoading || isPolling);
  }, [isLoading, isPolling, onProcessingChange]);

  // Poll for transaction confirmations
  useEffect(() => {
    const checkConfirmations = async () => {
      if (!txHash || hasNotifiedRef.current || !user?.id) return;

      setIsChecking(true);
      // Artificial delay to show "Checking..." state
      await new Promise((resolve) => setTimeout(resolve, 1000));

      try {
        const response = await fetch(
          `/api/tx-confirmations?txHash=${txHash}&userId=${user.id}`
        );

        if (response.ok) {
          const data = await response.json();
          setConfirmations(data.confirmations);

          // Show toast when we get at least 1 confirmation
          if (data.confirmations >= 1 && !hasNotifiedRef.current) {
            hasNotifiedRef.current = true;

            // Show different toast message based on whether credits were added
            if (data.credited) {
              toast.success("Transaction Confirmed!", {
                description: "100 credits have been added to your account! 🎉",
                duration: 5000,
                position: "top-center",
              });
              // Trigger success callback to refresh balance
              onTransactionSuccess?.();
            } else {
              toast.success("Transaction Confirmed!", {
                description: `Your transaction has ${data.confirmations} confirmation${data.confirmations > 1 ? "s" : ""}!`,
                duration: 5000,
                position: "top-center",
              });
            }

            // Stop polling after confirmation
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
              setIsPolling(false);
            }
          }
        } else if (response.status === 404) {
          // Transaction not yet on-chain, this is normal - keep polling
        } else {
          // Other errors
          console.error("Error checking confirmations:", response.statusText);
        }
      } catch (err) {
        console.error("Error checking confirmations:", err);
      } finally {
        setIsChecking(false);
      }
    };

    if (txHash && !hasNotifiedRef.current) {
      // Start polling immediately
      checkConfirmations();
      setIsPolling(true);

      // Then poll every 15 seconds
      pollingIntervalRef.current = setInterval(checkConfirmations, 15000);
    }

    // Cleanup on unmount or when txHash changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [txHash, user?.id, onTransactionSuccess]);

  // Check Token balances when wallet is connected
  useEffect(() => {
    const checkTokenBalances = async () => {
      if (!isConnected || !enabledWallet) {
        setTotalIAG(0n);
        setTotalSNEK(0n);
        return;
      }

      try {
        const api = await window.cardano[enabledWallet].enable();
        const lucid = await Lucid(new Emulator([]), "Mainnet");
        lucid.selectWallet.fromAPI(api);
        setLucid(lucid);
        setApi(api);

        const utxos = await lucid.wallet().getUtxos();

        // IAG Constants
        const IAG_POLICY_ID = "5d16cc1a177b5d9ba9cfa9793b07e60f1fb70fea1f8aef064415d114";
        const IAG_ASSET_NAME = "494147"; // "IAG" in hex
        const IAG_UNIT = IAG_POLICY_ID + IAG_ASSET_NAME;

        // SNEK Constants
        const SNEK_POLICY_ID = "279c909f348e533da5808898f87f9a14bb2c3dfbbacccd631d927a3f";
        const SNEK_ASSET_NAME = "534e454b"; // "SNEK" in hex
        const SNEK_UNIT = SNEK_POLICY_ID + SNEK_ASSET_NAME;

        let iagTotal = 0n;
        let snekTotal = 0n;

        for (const utxo of utxos) {
          Object.entries(utxo.assets).forEach(([unit, amount]) => {
            if (unit === IAG_UNIT) {
              iagTotal += amount;
            }
            if (unit === SNEK_UNIT) {
              snekTotal += amount;
            }
          });
        }
        setTotalIAG(iagTotal);
        setTotalSNEK(snekTotal);
      } catch (err) {
        console.error("Error checking token balances:", err);
        setTotalIAG(0n);
        setTotalSNEK(0n);
      }
    };

    checkTokenBalances();
  }, [isConnected, enabledWallet]);

  const handleBuildTransaction = async () => {
    if (!isConnected || !enabledWallet) {
      setError("Wallet not connected");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);
    setConfirmations(0);
    hasNotifiedRef.current = false;

    try {
      // Select wallet - this replaces Emulator with actual wallet provider
      if (!lucid || !api) {
        throw new Error("Lucid or API not initialized");
      }
      lucid.selectWallet.fromAPI(api);

      // Make API request to build transaction
      const response = await fetch("/api/transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: usedAddresses[0],
          walletBalance: accountBalance,
          paymentMethod: paymentMethod
        }),
      });

      const { tx, fee, error } = await response.json();
      if (error) {
        throw new Error(error);
      }

      // Sign transaction with wallet
      const signedTx = await lucid.fromTx(tx).sign.withWallet().complete();

      // Submit transaction
      const txHash = await signedTx.submit();
      if (!txHash) {
        throw new Error("Transaction failed");
      }

      setTxHash(txHash);
      setIsDialogOpen(false); // Close dialog on success

      // Show fee in toast
      if (fee) {
        toast.info("Transaction Fee", {
          description: `Network Fee: ${(Number(fee) / 1_000_000).toFixed(6)} ADA`,
          duration: 5000,
        });
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="px-5 py-8 flex items-center justify-center min-h-[150px]">
        <p className="text-xs text-zinc-500">Connect your wallet to continue</p>
      </div>
    );
  }

  return (
    <div className="px-5 py-4 space-y-4">
      {/* Main action button */}
      {creditsRemaining > 0 ? (
        <button className="text-zinc-100 w-full py-2.5 rounded-md text-xs font-medium transition-all bg-green-900/50 cursor-not-allowed border border-green-900/30">Use remaining {creditsRemaining} credits before buying more</button>
      ) : (
        <button
          className="text-zinc-100 w-full py-2.5 rounded-md text-xs font-medium transition-all focus:outline-none focus:ring-1 bg-green-900/90 hover:bg-green-800 border border-green-900/60 focus:ring-green-700/30"
          onClick={() => setIsDialogOpen(true)}
          disabled={!isConnected}
        >
          Buy 100 Credits
        </button>
      )}

      {/* Error state */}
      {
        error && (
          <div className="py-2 px-3 bg-red-500/10 dark:bg-red-950/30 border border-red-900/30 rounded-md text-xs">
            {error}
          </div>
        )
      }

      {/* Success state */}
      {
        txHash && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">


              {isPolling && confirmations === 0 ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-yellow-500" />
                  <HybridTooltip
                    content={
                      <div>
                        This usually takes less than a minute to confirm.
                      </div>
                    }
                  >
                    <span className="text-xs font-medium text-yellow-400 cursor-help border-b border-dotted border-yellow-400/50">
                      {isChecking ? "Checking for confirmation..." : "Waiting for confirmation..."}
                    </span>
                  </HybridTooltip>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs font-medium text-green-400">
                    Transaction Confirmed!
                  </span>
                </>
              )}
            </div>
            <div className=" border border-border rounded-md overflow-hidden">
              <div className="px-3 py-2 border-b border-border text-[10px] ">
                Transaction Hash
              </div>
              <div className="px-3 py-2 font-mono text-xs break-all">
                <Link
                  className="hover:underline"
                  target="_blank"
                  href={`https://preprod.cardanoscan.io/transaction/${txHash}`}
                >
                  {txHash}
                </Link>
              </div>
            </div>
          </div>
        )
      }

      {/* Payment Method Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Payment Method</DialogTitle>
            <DialogDescription>
              Select how you&apos;d like to pay for 100 credits
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            {/* ADA Payment Option */}
            <button
              onClick={() => setPaymentMethod("ADA")}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${paymentMethod === "ADA"
                ? "border-green-500 bg-green-500/10"
                : "border-border hover:border-green-500/50"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${paymentMethod === "ADA" ? "bg-green-500/20" : "bg-muted"
                    }`}>
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Pay with ADA</div>
                    <div className="text-xs text-muted-foreground">
                      {accountBalance != null
                        ? `${accountBalance.toLocaleString('en-US', { maximumFractionDigits: 0 })} ADA available`
                        : "Loading..."}
                    </div>
                  </div>
                </div>
                {paymentMethod === "ADA" && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>

            {/* IAG Payment Option */}
            <button
              onClick={() => setPaymentMethod("IAG")}
              disabled={totalIAG === 0n}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${paymentMethod === "IAG"
                ? "border-green-500 bg-green-500/10"
                : totalIAG === 0n
                  ? "border-border opacity-50 cursor-not-allowed"
                  : "border-border hover:border-green-500/50"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${paymentMethod === "IAG" ? "bg-green-500/20" : "bg-muted"
                    }`}>
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Pay with IAG</div>
                    <div className="text-xs text-muted-foreground">
                      {totalIAG === 0n
                        ? "No IAG tokens available"
                        : `${(Number(totalIAG) / 1_000_000).toFixed(2)} IAG available`
                      }
                    </div>
                  </div>
                </div>
                {paymentMethod === "IAG" && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>

            {/* SNEK Payment Option */}
            <button
              onClick={() => setPaymentMethod("SNEK")}
              disabled={totalSNEK === 0n}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${paymentMethod === "SNEK"
                ? "border-green-500 bg-green-500/10"
                : totalSNEK === 0n
                  ? "border-border opacity-50 cursor-not-allowed"
                  : "border-border hover:border-green-500/50"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${paymentMethod === "SNEK" ? "bg-green-500/20" : "bg-muted"
                    }`}>
                    <Coins className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Pay with SNEK</div>
                    <div className="text-xs text-muted-foreground">
                      {totalSNEK === 0n
                        ? "No SNEK tokens available"
                        : `${totalSNEK.toLocaleString()} SNEK available`
                      }
                    </div>
                  </div>
                </div>
                {paymentMethod === "SNEK" && (
                  <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
            </button>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              onClick={() => setIsDialogOpen(false)}
              className="px-4 py-2 text-sm rounded-md border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleBuildTransaction}
              disabled={isLoading}
              className="px-4 py-2 text-sm rounded-md bg-green-900/90 hover:bg-green-800 border border-green-900/60 text-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Confirm Purchase</span>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div >
  );
}
