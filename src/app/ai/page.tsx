import React from "react";
import TAClientComponentWrapper from "./TAClientComponentWrapper";
import { fetchCandles } from "@/lib/data-fetcher";
import { calculateIndicators } from "@/lib/ta";
import { isProSubscribed } from "@/app/ai/actions";
import Link from "next/link";

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function AIChartPage() {
    const isPro = await isProSubscribed();

    if (!isPro) {
        return (
            <div className="min-h-screen  flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 text-center shadow-2xl">
                    <div className="text-5xl mb-6">🔒</div>
                    <h1 className="text-3xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        Pro Access Required
                    </h1>
                    <p className="text-gray-400 mb-8 text-lg">
                        The Real-Time AI Technical Analysis Dashboard is available exclusively to Pro subscribers.
                    </p>
                    <Link
                        href="/?openCreditsModal=true" // Assuming there is a pricing page, or wherever they upgrade
                        className="inline-block px-8 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-400 hover:to-orange-500 text-black font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                    >
                        Upgrade to Pro
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch initial data on the server
    // Using ADA-USD as default for this Cardano app, but can be changed
    const symbol = "ADA-USD";
    const timeframe = "5m";

    const candles = await fetchCandles(symbol, timeframe);
    const indicators = calculateIndicators(candles);

    return (
        <div className="min-h-screen ">
            <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                    Real-Time AI Technical Analysis
                </h1>
                <TAClientComponentWrapper
                    initialCandles={candles}
                    initialIndicators={indicators}
                    symbol={symbol}
                    timeframe={timeframe}
                />
            </div>
        </div>
    );
}