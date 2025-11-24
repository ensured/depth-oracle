"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";

// TradingView Widget Configuration
declare global {
    interface Window {
        TradingView: {
            widget: new (config: TradingViewWidgetConfig) => void;
        };
    }
}

interface TradingViewWidgetConfig {
    autosize?: boolean;
    width?: number | string;
    height?: number | string;
    symbol: string;
    interval: string;
    timezone: string;
    theme: "light" | "dark";
    style: string;
    locale: string;
    toolbar_bg?: string;
    enable_publishing?: boolean;
    hide_side_toolbar?: boolean;
    allow_symbol_change?: boolean;
    container_id: string;
    studies?: string[];
    show_popup_button?: boolean;
    popup_width?: string;
    popup_height?: string;
}

interface Props {
    initialCandles: unknown;
    initialIndicators: unknown;
    symbol: string;
    timeframe: string;
}

interface AIAnalysisResult {
    position: "BUY" | "SELL" | "HOLD";
    signal: "BULLISH" | "BEARISH" | "NEUTRAL";
    confidence: number;
    reasoning: string;
    key_levels: {
        entry_zone: string;
        stop_loss: string;
        take_profit: string;
    };
    patterns?: {
        candlestick: string;
        chart_pattern: string;
        trend: string;
    };
}

// Map our symbols to TradingView symbols
const SYMBOL_MAP: Record<string, string> = {
    "ADA-USD": "BINANCE:ADAUSD",
    "BTC-USD": "BINANCE:BTCUSD",
    "ETH-USD": "BINANCE:ETHUSD",
    "SOL-USD": "BINANCE:SOLUSD",
};

// Map our timeframes to TradingView intervals
const TIMEFRAME_MAP: Record<string, string> = {
    "1m": "1",
    "5m": "5",
    "15m": "15",
    "1h": "60",
    "4h": "240",
    "1d": "D",
};

// Helper functions for AI analysis calculations
const calculateEMA = (data: number[], period: number): number[] => {
    if (data.length < period) return [];
    const k = 2 / (period + 1);
    let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
    const emaArray = [ema];

    for (let i = period; i < data.length; i++) {
        ema = data[i] * k + ema * (1 - k);
        emaArray.push(ema);
    }
    return emaArray;
};

const calculateSMA = (data: number[], period: number): number[] => {
    if (data.length < period) return [];
    const smaArray = [];
    for (let i = 0; i <= data.length - period; i++) {
        const sum = data.slice(i, i + period).reduce((a, b) => a + b, 0);
        smaArray.push(sum / period);
    }
    return smaArray;
};

const calculateOBV = (closes: number[], volumes: number[]): number[] => {
    if (!closes.length || !volumes.length) return [];
    const obv = [0];
    for (let i = 1; i < closes.length; i++) {
        const prevObv = obv[i - 1];
        if (closes[i] > closes[i - 1]) {
            obv.push(prevObv + volumes[i]);
        } else if (closes[i] < closes[i - 1]) {
            obv.push(prevObv - volumes[i]);
        } else {
            obv.push(prevObv);
        }
    }
    return obv;
};

export default function TAClientComponentWrapper({
    symbol: initialSymbol,
    timeframe: initialTimeframe,
}: Props) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const widgetRef = useRef<unknown>(null);

    const [symbol, setSymbol] = useState(initialSymbol);
    const [timeframe, setTimeframe] = useState(initialTimeframe);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const { theme } = useTheme();

    // Load TradingView script
    useEffect(() => {
        // Check if already loaded
        if (window.TradingView) {
            setScriptLoaded(true);
            return;
        }

        // Check if script tag already exists
        const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
        if (existingScript) {
            existingScript.addEventListener('load', () => setScriptLoaded(true));
            return;
        }

        // Create and load script
        const script = document.createElement("script");
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = () => {
            setScriptLoaded(true);
        };
        document.head.appendChild(script);

        return () => {
            // Don't remove script on cleanup - keep it loaded
        };
    }, []);

    // Initialize TradingView Widget
    useEffect(() => {
        if (!chartContainerRef.current || !scriptLoaded || !window.TradingView) {
            return;
        }

        // Clear previous widget
        chartContainerRef.current.innerHTML = "";

        const tradingViewSymbol = SYMBOL_MAP[symbol] || "BINANCE:ADAUSD";
        const tradingViewInterval = TIMEFRAME_MAP[timeframe] || "60";

        // Create widget
        try {
            widgetRef.current = new window.TradingView.widget({
                autosize: true,
                symbol: tradingViewSymbol,
                interval: tradingViewInterval,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                theme: theme === "dark" ? "dark" : "light",
                style: "1", // Candlestick
                locale: "en",
                toolbar_bg: theme === "dark" ? "#09090b" : "#ffffff",
                enable_publishing: false,
                hide_side_toolbar: false,
                allow_symbol_change: false,
                container_id: "tradingview_chart",
                studies: [
                    "STD;RSI",
                    "STD;MACD",
                    "STD;Bollinger_Bands",
                ],
                show_popup_button: true,
                popup_width: "1000",
                popup_height: "650",
            });
        } catch (error) {
            console.error("Error initializing TradingView widget:", error);
        }
    }, [symbol, timeframe, theme, scriptLoaded]);

    const generateAIAnalysis = useCallback(async () => {
        setIsAnalyzing(true);
        try {
            // Fetch fresh data for AI analysis
            const dataRes = await fetch(`/api/chart-data?symbol=${symbol}&timeframe=${timeframe}`);
            if (!dataRes.ok) throw new Error("Failed to fetch chart data");

            const { candles, indicators } = await dataRes.json();

            if (!candles || candles.length === 0) {
                throw new Error("No candle data available");
            }

            // Calculate EMAs
            const closes = candles.map((c: { close: number }) => c.close);
            const ema9 = calculateEMA(closes, 9);
            const ema21 = calculateEMA(closes, 21);

            // Calculate Volume Metrics
            const volumes = candles.map((c: { volume: number }) => c.volume);
            const obv = calculateOBV(closes, volumes);
            const volMA = calculateSMA(volumes, 20);
            const currentVol = volumes[volumes.length - 1];
            const currentVolMA = volMA[volMA.length - 1];
            const isVolumeSpike = currentVol > 2 * currentVolMA;

            // Calculate Local Support/Resistance
            const recent50 = candles.slice(-50);
            const localSupport = Math.min(...recent50.map((c: { low: number }) => c.low));
            const localResistance = Math.max(...recent50.map((c: { high: number }) => c.high));

            const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            const res = await fetch("/api/chart-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol,
                    timeframe,
                    timezone: userTimezone,
                    indicators: {
                        rsi: indicators.rsi,
                        macd: indicators.macd,
                        bb: indicators.bb,
                        ema: {
                            ema9: ema9[ema9.length - 1],
                            ema21: ema21[ema21.length - 1]
                        },
                        obv: {
                            current: obv[obv.length - 1],
                            trend: obv[obv.length - 1] > obv[obv.length - 5] ? "UP" : "DOWN"
                        }
                    },
                    marketContext: {
                        local_support: localSupport,
                        local_resistance: localResistance,
                        volume_spike: isVolumeSpike
                    },
                    price: candles[candles.length - 1]?.close,
                    volume: {
                        current: candles[candles.length - 1]?.volume,
                        average: candles.length >= 20
                            ? candles.slice(-20).reduce((sum: number, c: { volume: number }) => sum + c.volume, 0) / 20
                            : candles.reduce((sum: number, c: { volume: number }) => sum + c.volume, 0) / candles.length,
                        trend: candles.length >= 2
                            ? candles[candles.length - 1]?.volume > candles[candles.length - 2]?.volume
                                ? "Increasing"
                                : "Decreasing"
                            : "N/A"
                    },
                    recentCandles: candles.slice(-15).map((c: {
                        time: number;
                        open: number;
                        high: number;
                        low: number;
                        close: number;
                        volume: number;
                    }) => ({
                        time: c.time,
                        open: c.open,
                        high: c.high,
                        low: c.low,
                        close: c.close,
                        volume: c.volume
                    }))
                }),
            });

            if (res.status === 402) {
                window.dispatchEvent(new Event("open-wallet-modal"));
                throw new Error("Insufficient credits");
            }

            if (!res.ok) throw new Error("Failed to fetch analysis");

            const responseData = await res.json();
            setAiAnalysis(responseData.analysis);
        } catch (error) {
            console.error("Error generating analysis:", error);
        } finally {
            setIsAnalyzing(false);
        }
    }, [symbol, timeframe]);

    const getSignalColor = useCallback((signal: string) => {
        switch (signal) {
            case "BULLISH":
                return "bg-emerald-500 hover:bg-emerald-600";
            case "BEARISH":
                return "bg-red-500 hover:bg-red-600";
            default:
                return "bg-yellow-500 hover:bg-yellow-600";
        }
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
            {/* Main Chart Area */}
            <div className="lg:col-span-2 space-y-6 rounded-md">
                <Card className="rounded-md border-border">
                    <CardHeader className="flex flex-row items-center justify-center pb-2 gap-4 !mx-2 !px-2">
                        <div className="flex gap-2.5 flex-wrap justify-center items-center">
                            <Select value={symbol} onValueChange={setSymbol}>
                                <SelectTrigger className="w-[140px] border-black/30 dark:border-white/30">
                                    <SelectValue placeholder="Symbol" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ADA-USD">ADA-USD</SelectItem>
                                    <SelectItem value="BTC-USD">BTC-USD</SelectItem>
                                    <SelectItem value="ETH-USD">ETH-USD</SelectItem>
                                    <SelectItem value="SOL-USD">SOL-USD</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={timeframe} onValueChange={setTimeframe}>
                                <SelectTrigger className="w-[100px] border-black/30 dark:border-white/30">
                                    <SelectValue placeholder="Time" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1m">1m</SelectItem>
                                    <SelectItem value="5m">5m</SelectItem>
                                    <SelectItem value="15m">15m</SelectItem>
                                    <SelectItem value="1h">1h</SelectItem>
                                    <SelectItem value="4h">4h</SelectItem>
                                    <SelectItem value="1d">1d</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent className="p-2 flex flex-col rounded-md">
                        {/* TradingView Chart Container - Auto-Updates in Real-Time */}
                        <div id="tradingview_chart" ref={chartContainerRef} className="w-full rounded-md" style={{ height: "600px" }} />
                    </CardContent>
                </Card>
            </div>

            {/* AI Analysis Sidebar */}
            <div className="space-y-6">
                <Card className="h-full flex flex-col border-border">
                    <CardHeader className="bg-secondary mx-6 p-2 rounded-sm flex justify-center">
                        <CardTitle className="text-xl font-bold flex gap-2">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-700 dark:from-purple-400 dark:to-pink-600"
                            >
                                <span className="text-white">🤖</span> AI Analyst Pro
                            </motion.div>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col gap-6">
                        <Button
                            onClick={generateAIAnalysis}
                            disabled={isAnalyzing}
                            className="text-white w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 h-12 text-lg shadow-lg shadow-purple-900/20"
                        >
                            {isAnalyzing ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin mr-2" />
                                    Analyzing...
                                </div>
                            ) : (
                                "Generate New Signal"
                            )}
                        </Button>

                        {aiAnalysis && !isAnalyzing ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="space-y-6"
                            >
                                {/* Signal Badge */}
                                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border">
                                    <span className="text-sm uppercase tracking-wider">
                                        Signal Bias/Position
                                    </span>
                                    <div className="flex gap-2">
                                        <Badge className={`${getSignalColor(aiAnalysis.signal)} px-6 py-2 text-xl font-bold`}>
                                            {aiAnalysis.signal}
                                        </Badge>
                                        <Badge className={`${getSignalColor(aiAnalysis.position)} px-6 py-2 text-xl font-bold`}>
                                            {aiAnalysis.position}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Confidence Meter */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>AI Confidence</span>
                                        <span className="font-bold">{aiAnalysis.confidence}%</span>
                                    </div>
                                    <Progress value={aiAnalysis.confidence} className="h-2" />
                                </div>

                                {/* Key Levels */}
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold flex items-center gap-2">
                                        🎯 Key Levels
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2 text-sm">
                                        <div className="flex justify-between p-2 rounded border">
                                            <span>Entry Zone</span>
                                            <span className="text-blue-400 font-mono">
                                                {aiAnalysis.key_levels.entry_zone}
                                            </span>
                                        </div>
                                        <div className="flex justify-between p-2 rounded border">
                                            <span>Stop Loss</span>
                                            <span className="text-red-400 font-mono">
                                                {aiAnalysis.key_levels.stop_loss}
                                            </span>
                                        </div>
                                        <div className="flex justify-between p-2 rounded border">
                                            <span>Take Profit</span>
                                            <span className="text-emerald-400 font-mono">
                                                {aiAnalysis.key_levels.take_profit}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Patterns Detected */}
                                {aiAnalysis.patterns && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-semibold flex items-center gap-2">
                                            🕯️ Patterns Detected
                                        </h4>
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            <div className="flex justify-between p-2 rounded border bg-secondary/30">
                                                <span className="text-muted-foreground">Candlestick</span>
                                                <span className="font-medium">{aiAnalysis.patterns.candlestick}</span>
                                            </div>
                                            <div className="flex justify-between p-2 rounded border bg-secondary/30">
                                                <span className="text-muted-foreground">Chart Pattern</span>
                                                <span className="font-medium">{aiAnalysis.patterns.chart_pattern}</span>
                                            </div>
                                            <div className="flex justify-between p-2 rounded border bg-secondary/30">
                                                <span className="text-muted-foreground">Trend</span>
                                                <span className="font-medium">{aiAnalysis.patterns.trend}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Reasoning */}
                                <div className="p-4 rounded-xl border">
                                    <h4 className="text-sm font-semibold mb-2">📝 Analysis</h4>
                                    <p className="text-sm leading-relaxed">
                                        {aiAnalysis.reasoning}
                                    </p>
                                </div>
                            </motion.div>
                        ) : !isAnalyzing ? (
                            <div className="flex-1 flex flex-col items-center justify-center space-y-4 opacity-50">
                                <div className="text-4xl">📊</div>
                                <p className="text-center text-sm">
                                    Click &quot;Generate New Signal&quot; to analyze current market structure.
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <Skeleton className="flex-1 w-full" />
                                <Skeleton className="flex-1 w-full" />
                                <Skeleton className="flex-1 w-full" />
                                <Skeleton className="flex-1 w-full" />
                                <Skeleton className="flex-1 w-full" />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
