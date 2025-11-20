"use client";

import { useState, useEffect } from "react";
import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";
import WalletConnect from "./WalletConnect";
import InputForm from "./InputForm";
import { WalletCreditsModal } from "./WalletCreditsModal";
import { getCreditUsageInfo } from "@/lib/token-usage";

export default function Main() {
  const network =
    process.env.NODE_ENV === "development"
      ? NetworkType.TESTNET
      : NetworkType.MAINNET;

  const { stakeAddress, isConnected } = useCardano({
    limitNetwork: network,
  });

  const [showWalletModal, setShowWalletModal] = useState(false);
  const [creditInfo, setCreditInfo] = useState<{
    used: number;
    remaining: number;
    total: number;
    plan: string;
    resetDate?: string;
    percentageUsed: number;
  } | null>(null);

  const fetchCreditInfo = async () => {
    if (stakeAddress) {
      try {
        const info = await getCreditUsageInfo(stakeAddress);
        setCreditInfo(info);
      } catch (error) {
        console.error("Failed to fetch credit info:", error);
      }
    }
  };

  useEffect(() => {
    if (!stakeAddress) {
      return;
    }
    fetchCreditInfo();
  }, [stakeAddress]);

  if (!isConnected || !stakeAddress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-8 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Connect Your Wallet</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please connect your Cardano wallet to access the Depth Oracle and manage your credits.
          </p>
        </div>
        <div className="p-4 border rounded-lg bg-card">
          <WalletConnect />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <InputForm
        userId={stakeAddress}
        creditInfo={creditInfo}
        onCreditsUsed={fetchCreditInfo}
        onOpenPricing={() => setShowWalletModal(true)}
      />
      <WalletCreditsModal
        open={showWalletModal}
        onOpenChange={setShowWalletModal}
        creditInfo={creditInfo}
        onSuccess={fetchCreditInfo}
      />
    </div>
  );
}
