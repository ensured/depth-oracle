"use client";
import { WalletCreditsModal } from "@/components/WalletCreditsModal";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

export default function HeroSection() {
  return (
    <div className="relative flex items-center justify-center w-full my-4">
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Buy Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <WalletCreditsModal />
        </CardContent>
      </Card>
    </div>
  );
}

