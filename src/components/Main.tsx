"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import InputForm from "./InputForm";
import { WalletCreditsModal } from "./WalletCreditsModal";
import { getCreditUsageInfo } from "@/lib/token-usage";

export default function Main() {
  const { user } = useUser();
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
    if (user?.id) {
      try {
        const info = await getCreditUsageInfo(user.id);
        setCreditInfo(info);
      } catch (error) {
        console.error("Failed to fetch credit info:", error);
      }
    }
  };

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    fetchCreditInfo();
  }, [user?.id]);

  if (!user) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <InputForm
        userId={user.id}
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
