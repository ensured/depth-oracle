"use client";

import Link from "next/link";
import ImagePreview from "@/app/components/ImagePreview";
import { Button } from "@/app/components/ui/button";
import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import WalletCreditsModal to avoid SSR issues
const WalletCreditsModal = dynamic(
    () => import("@/app/components/WalletCreditsModal").then(mod => ({ default: mod.WalletCreditsModal })),
    { ssr: false }
);

export default function ProAccessRequired() {
    const [showWalletModal, setShowWalletModal] = useState(false);

    return (
        <>
            <div className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center p-4 gap-20">
                <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 text-center shadow-2xl">
                    <div className="text-5xl mb-6">🔒</div>
                    <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        Pro Access Required
                    </h1>

                    <p className="text-gray-400 mb-8 text-lg">
                        The Real-Time AI Technical Analysis Dashboard is available exclusively to Pro subscribers.
                    </p>

                    <Button
                        onClick={() => setShowWalletModal(true)}
                        className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                        Upgrade to Pro
                    </Button>
                </div>
                <div className="flex items-center justify-center">
                    <ImagePreview src={"https://i.imgur.com/o2KlQCs.png"} alt="Preview" width={800} height={800} />
                </div>
            </div>

            <WalletCreditsModal open={showWalletModal} onOpenChange={setShowWalletModal} />
        </>
    );
}
