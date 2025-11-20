"use client";

import { useCardano } from "@cardano-foundation/cardano-connect-with-wallet";
import { NetworkType } from "@cardano-foundation/cardano-connect-with-wallet-core";
import { useState } from "react";
import { WalletSelectionModal } from "./WalletSelectionModal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Wallet, LogOut } from "lucide-react";

export default function WalletConnect() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const network =
    process.env.NODE_ENV === "development"
      ? NetworkType.TESTNET
      : NetworkType.MAINNET;

  const {
    isConnected,
    stakeAddress,
    disconnect,
    accountBalance,
  } = useCardano({
    limitNetwork: network,
  });

  return (
    <div className="flex items-center">
      {isConnected ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 h-9 px-3 bg-background/50 backdrop-blur-sm border-zinc-700/50 hover:bg-zinc-800/50">
              <Wallet className="h-4 w-4 text-indigo-400" />
              <span className="hidden sm:inline-block font-mono text-sm">
                {accountBalance} <span className="text-sm">₳</span>
              </span>
              <ChevronDown className="h-3 w-3 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-zinc-900 border-zinc-800 text-zinc-100">
            <DropdownMenuLabel>My Wallet</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <div className="px-2 py-2 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Balance</span>
                <span className="font-mono font-medium text-indigo-400">{accountBalance} ₳</span>
              </div>
              <div className="space-y-1.5">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Address</span>
                <div className="p-2 bg-zinc-950/50 rounded border border-zinc-800/50">
                  <p className="font-mono text-xs text-zinc-300 break-all leading-relaxed">
                    {stakeAddress}
                  </p>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-zinc-800" />
            <DropdownMenuItem
              onClick={() => disconnect()}
              className="text-red-400 focus:text-red-300 focus:bg-red-950/30 cursor-pointer flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Disconnect</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 border-0"
        >
          Connect Wallet
        </Button>
      )}

      <WalletSelectionModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}
