import TAClientComponentWrapper from "./TAWrapperClient";
import { fetchCandles } from "@/lib/data-fetcher";
import { calculateIndicators } from "@/lib/ta";
import { isProSubscribed } from "@/app/ai/app/actions";
import ProAccessRequired from "./ProAccessRequired";

// Revalidate every 5 minutes
export const revalidate = 300;

export default async function AIChartPage() {
    const isPro = await isProSubscribed();

    if (!isPro) {
        return <ProAccessRequired />;
    }

    // Fetch initial data on the server
    // Using ADA-USD as default for this Cardano app, but can be changed
    const symbol = "ADA-USD";
    const timeframe = "5m";

    const candles = await fetchCandles(symbol, timeframe);
    const indicators = calculateIndicators(candles);

    return (
        <div className="min-h-[calc(100vh-57px)] flex flex-col items-center justify-center w-full">
            <h1 className="flex justify-center pt-6 w-full text-3xl font-bold mb-10 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                Real-Time AI Technical Analysis
            </h1>
            <TAClientComponentWrapper
                initialCandles={candles}
                initialIndicators={indicators}
                symbol={symbol}
                timeframe={timeframe}
            />
        </div>
    );
}