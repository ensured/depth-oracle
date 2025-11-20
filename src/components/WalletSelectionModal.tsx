"use client";

import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WalletSelectionModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WalletSelectionModal({
    open,
    onOpenChange,
}: WalletSelectionModalProps) {
    const network =
        process.env.NODE_ENV === "development"
            ? NetworkType.TESTNET
            : NetworkType.MAINNET;

    const { connect, installedExtensions } = useCardano({
        limitNetwork: network,
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm bg-zinc-900 border-zinc-800 text-zinc-100">
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">Select Wallet</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        {installedExtensions.map((provider) => (
                            <Button
                                key={provider}
                                variant="outline"
                                className="w-full justify-between bg-zinc-800/80 hover:bg-zinc-700 text-zinc-200 border-zinc-700/50 hover:text-zinc-100"
                                onClick={() => {
                                    connect(provider);
                                    onOpenChange(false);
                                }}
                            >
                                <span className="capitalize">
                                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                                </span>
                            </Button>
                        ))}
                        {installedExtensions.length === 0 && (
                            <div className="text-center text-zinc-400 text-sm py-4">
                                No wallets detected. Please install a Cardano wallet extension.
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
