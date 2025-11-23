"use client";

import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
    createChart,
    ColorType,
    IChartApi,
    // ISeriesApi,
    Time,
    CandlestickSeries,
    LineSeries,
    HistogramSeries,
} from "lightweight-charts";
import useSWR from "swr";
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
import { Eye, EyeOff, Loader2, MinusCircle, PlusCircle } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";


const CHART_HEIGHT = {
    main: 400,
    indicator: 150,
} as const;

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Helper functions
const convertTimestamp = (timestamp: number): Time => {
    return (timestamp > 10000000000 ? Math.floor(timestamp / 1000) : timestamp) as Time;
};

const filterValidData = <T extends { time?: Time | number; value?: number }>(data: T[]) => {
    return data.filter((d) =>
        d.time !== undefined &&
        d.value !== undefined &&
        !isNaN(d.value)
    ) as Array<T & { time: Time; value: number }>;
};

const calculateOffset = (totalLength: number, indicatorLength: number): number => {
    return totalLength - indicatorLength;
};

const calculateEMA = (data: number[], period: number): number[] => {
    if (data.length < period) return [];
    const k = 2 / (period + 1);
    // Start with SMA for the first EMA value
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

export interface Candle {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

interface BollingerBand {
    upper: number;
    lower: number;
    middle: number;
}

interface MACDValue {
    MACD?: number;
    signal?: number;
    histogram?: number;
}

interface Indicators {
    bb?: BollingerBand[];
    rsi?: number[];
    macd?: MACDValue[];
}

interface Props {
    initialCandles: Candle[];
    initialIndicators: Indicators;
    symbol: string;
    timeframe: string;
}

interface AIAnalysisResult {
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

export default function TAClientComponentWrapper({
    initialCandles,
    initialIndicators,
    symbol: initialSymbol,
    timeframe: initialTimeframe,
}: Props) {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);

    const [symbol, setSymbol] = useState(initialSymbol);
    const [timeframe, setTimeframe] = useState(initialTimeframe);
    const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [toggleRsi, setToggleRsi] = useState(true);
    const [toggleMacd, setToggleMacd] = useState(true);
    const [toggleBB, setToggleBB] = useState(true);
    const [toggleVolume, setToggleVolume] = useState(true);
    const [toggleObv, setToggleObv] = useState(false);

    const { theme } = useTheme();

    const CHART_COLORS = {
        background: theme === "dark" ? "#09090b" : "#ffffff",
        text: theme === "dark" ? "#a1a1aa" : "#000000",
        grid: theme === "dark" ? "#27272a" : "#e5e7eb",
        bullish: "#10b981",
        bearish: "#ef4444",
        bb: "#3b82f6",
        rsi: "#a855f7",
        macd: "#3b82f6",
        signal: "#f97316",
        white: "#ffffff",
    } as const;
    // Auto-refresh every 5 minutes
    const { data } = useSWR(
        `/api/chart-data?symbol=${symbol}&timeframe=${timeframe}`,
        fetcher,
        {
            refreshInterval: REFRESH_INTERVAL,
            fallbackData: { candles: initialCandles, indicators: initialIndicators },
            keepPreviousData: true,
        }
    );

    const candles = useMemo(() => data?.candles || [], [data?.candles]);
    const indicators = data?.indicators || {};

    // --- Memoized Data Transformations ---
    const candleData = useMemo(() => {
        if (!candles.length) return [];
        return candles.map((candle: Candle) => ({
            time: convertTimestamp(candle.time),
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
        }));
    }, [candles]);

    const bbData = useMemo(() => {
        if (!indicators.bb || !candles.length) return null;
        const offset = calculateOffset(candles.length, indicators.bb.length);

        const upper = indicators.bb
            .map((v: BollingerBand, i: number) => ({
                time: convertTimestamp(candles[i + offset]?.time),
                value: v.upper,
            }));

        const lower = indicators.bb
            .map((v: BollingerBand, i: number) => ({
                time: convertTimestamp(candles[i + offset]?.time),
                value: v.lower,
            }));

        return {
            upper: filterValidData(upper),
            lower: filterValidData(lower),
        };
    }, [candles, indicators.bb]);

    const rsiData = useMemo(() => {
        if (!indicators.rsi || !candles.length) return null;
        const offset = calculateOffset(candles.length, indicators.rsi.length);

        const series = indicators.rsi.map((v: number, i: number) => ({
            time: convertTimestamp(candles[i + offset]?.time),
            value: v,
        }));

        const validSeries = filterValidData(series);

        return {
            series: validSeries,
            overbought: validSeries.map((d) => ({ time: d.time, value: 70 })),
            oversold: validSeries.map((d) => ({ time: d.time, value: 30 })),
        };
    }, [candles, indicators.rsi]);

    const macdData = useMemo(() => {
        if (!indicators.macd || !candles.length) return null;
        const offset = calculateOffset(candles.length, indicators.macd.length);

        const macd = indicators.macd.map((v: MACDValue, i: number) => ({
            time: convertTimestamp(candles[i + offset]?.time),
            value: v.MACD,
        }));

        const signal = indicators.macd.map((v: MACDValue, i: number) => ({
            time: convertTimestamp(candles[i + offset]?.time),
            value: v.signal,
        }));

        const histogram = indicators.macd.map((v: MACDValue, i: number) => ({
            time: convertTimestamp(candles[i + offset]?.time),
            value: v.histogram,
            color: (v.histogram ?? 0) > 0 ? CHART_COLORS.bullish : CHART_COLORS.bearish,
        }));

        return {
            macd: filterValidData(macd),
            signal: filterValidData(signal),
            histogram: filterValidData(histogram),
        };
    }, [candles, indicators.macd]);

    const volumeData = useMemo(() => {
        if (!candles.length) return null;

        // Calculate Volume MA (20)
        const volumes = candles.map((c: Candle) => c.volume);
        const volMA = calculateSMA(volumes, 20);
        const offset = calculateOffset(candles.length, volMA.length);

        return {
            histogram: candles.map((candle: Candle, i: number) => {
                const isSpike = i >= 20 && candle.volume > 2 * (volMA[i - offset] || 0);
                return {
                    time: convertTimestamp(candle.time),
                    value: candle.volume,
                    color: isSpike
                        ? "#FACC15" // Yellow for spikes
                        : candle.close >= candle.open
                            ? CHART_COLORS.bullish
                            : CHART_COLORS.bearish,
                };
            }),
            ma: volMA.map((v, i) => ({
                time: convertTimestamp(candles[i + offset]?.time),
                value: v
            }))
        };
    }, [candles]);

    const obvData = useMemo(() => {
        if (!candles.length) return null;
        const closes = candles.map((c: Candle) => c.close);
        const volumes = candles.map((c: Candle) => c.volume);
        const obv = calculateOBV(closes, volumes);

        return obv.map((v, i) => ({
            time: convertTimestamp(candles[i]?.time),
            value: v
        }));
    }, [candles]);

    // --- Single Chart with Multiple Panes ---
    useEffect(() => {
        if (!chartContainerRef.current || !candleData.length) return;

        // Calculate total height based on enabled panes
        const paneCount = 1 + (toggleRsi ? 1 : 0) + (toggleMacd ? 1 : 0) + (toggleObv ? 1 : 0);
        const totalHeight = CHART_HEIGHT.main + ((paneCount - 1) * CHART_HEIGHT.indicator);

        // Create single chart instance
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: CHART_COLORS.background },
                textColor: CHART_COLORS.text,
            },
            grid: {
                vertLines: { color: CHART_COLORS.grid },
                horzLines: { color: CHART_COLORS.grid }
            },
            width: chartContainerRef.current.clientWidth,
            height: totalHeight,
            timeScale: {
                timeVisible: true,
                secondsVisible: false
            },
        });

        chartRef.current = chart;

        // Main price pane (pane 0 - candlesticks + BB)
        const candleSeries = chart.addSeries(CandlestickSeries, {
            upColor: CHART_COLORS.bullish,
            downColor: CHART_COLORS.bearish,
            borderVisible: false,
            wickUpColor: CHART_COLORS.bullish,
            wickDownColor: CHART_COLORS.bearish,
        }, 0); // Pane index 0
        candleSeries.setData(candleData);

        // Add Bollinger Bands to main pane
        if (toggleBB && bbData) {
            const bbUpper = chart.addSeries(LineSeries, {
                color: CHART_COLORS.bb,
                lineWidth: 1,
                priceScaleId: "right",
                title: "upper bb",
            }, 0); // Pane index 0
            const bbLower = chart.addSeries(LineSeries, {
                color: CHART_COLORS.bb,
                lineWidth: 1,
                priceScaleId: "right",
                title: "lower bb",
            }, 0); // Pane index 0
            bbUpper.setData(bbData.upper);
            bbLower.setData(bbData.lower);
        }

        // Volume pane (pane 0 - overlaid on main pane)
        if (toggleVolume && volumeData) {
            const volumeSeries = chart.addSeries(HistogramSeries, {
                priceFormat: {
                    type: 'volume',
                },
                priceScaleId: 'volume',
            }, 0); // Pane index 0

            chart.priceScale('volume').applyOptions({
                scaleMargins: {
                    top: 0.8, // Highest volume bar will be at 80% from top (occupying bottom 20%)
                    bottom: 0,
                },
            });

            volumeSeries.setData(volumeData.histogram);

            // Volume MA Line
            const volMASeries = chart.addSeries(LineSeries, {
                color: "#FACC15",
                lineWidth: 1,
                priceScaleId: 'volume',
                title: "Vol MA (20)",
            }, 0);
            volMASeries.setData(volumeData.ma);
        }

        // RSI pane (pane 1 - separate pane below main)
        if (toggleRsi && rsiData) {
            const rsiPaneIndex = 1;
            const rsiSeries = chart.addSeries(LineSeries, {
                color: CHART_COLORS.rsi,
                lineWidth: 2,
                title: "RSI",
            }, rsiPaneIndex);
            rsiSeries.setData(rsiData.series);

            const overboughtLine = chart.addSeries(LineSeries, {
                color: CHART_COLORS.white,
                lineWidth: 1,
                lineStyle: 2,
                title: "Overbought",
            }, rsiPaneIndex);
            const oversoldLine = chart.addSeries(LineSeries, {
                color: CHART_COLORS.white,
                lineWidth: 1,
                lineStyle: 2,
                title: "Oversold",
            }, rsiPaneIndex);
            overboughtLine.setData(rsiData.overbought);
            oversoldLine.setData(rsiData.oversold);
        }

        // MACD pane
        if (toggleMacd && macdData) {
            const macdPaneIndex = toggleRsi ? 2 : 1;

            const macdSeries = chart.addSeries(LineSeries, {
                color: CHART_COLORS.macd,
                lineWidth: 2,
                title: "MACD",
            }, macdPaneIndex);

            const signalSeries = chart.addSeries(LineSeries, {
                color: CHART_COLORS.signal,
                lineWidth: 2,
                title: "Signal",
            }, macdPaneIndex);

            const histogramSeries = chart.addSeries(HistogramSeries, {
                title: "Histogram",
            }, macdPaneIndex);

            macdSeries.setData(macdData.macd);
            signalSeries.setData(macdData.signal);
            histogramSeries.setData(macdData.histogram);
        }

        // OBV pane
        if (toggleObv && obvData) {
            const obvPaneIndex = 1 + (toggleRsi ? 1 : 0) + (toggleMacd ? 1 : 0);
            const obvSeries = chart.addSeries(LineSeries, {
                color: "#3B82F6", // Blue
                lineWidth: 2,
                title: "OBV",
            }, obvPaneIndex);
            obvSeries.setData(obvData);
        }

        // Resize observer
        const resizeObserver = new ResizeObserver((entries) => {
            if (entries[0]?.contentRect) {
                chart.applyOptions({ width: entries[0].contentRect.width });
            }
        });
        resizeObserver.observe(chartContainerRef.current);

        return () => {
            resizeObserver.disconnect();
            chart.remove();
            chartRef.current = null;
        };
    }, [candleData, bbData, toggleBB, volumeData, toggleVolume, rsiData, toggleRsi, macdData, toggleMacd, obvData, toggleObv, theme]);

    const generateAIAnalysis = useCallback(async () => {
        if (!candles.length) return;

        setIsAnalyzing(true);
        try {
            // Calculate EMAs on the fly
            const closes = candles.map((c: Candle) => c.close);
            const ema9 = calculateEMA(closes, 9);
            const ema21 = calculateEMA(closes, 21);

            // Calculate Volume Metrics
            const volumes = candles.map((c: Candle) => c.volume);
            const obv = calculateOBV(closes, volumes);
            const volMA = calculateSMA(volumes, 20);
            const currentVol = volumes[volumes.length - 1];
            const currentVolMA = volMA[volMA.length - 1];
            const isVolumeSpike = currentVol > 2 * currentVolMA;

            // Calculate Local Support/Resistance (Last 50 candles)
            const recent50 = candles.slice(-50);
            const localSupport = Math.min(...recent50.map((c: Candle) => c.low));
            const localResistance = Math.max(...recent50.map((c: Candle) => c.high));

            const res = await fetch("/api/chart-analysis", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol,
                    timeframe,
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
                            ? candles.slice(-20).reduce((sum: number, c: Candle) => sum + c.volume, 0) / 20
                            : candles.reduce((sum: number, c: Candle) => sum + c.volume, 0) / candles.length,
                        trend: candles.length >= 2
                            ? candles[candles.length - 1]?.volume > candles[candles.length - 2]?.volume
                                ? "Increasing"
                                : "Decreasing"
                            : "N/A"
                    },
                    recentCandles: candles.slice(-15).map((c: Candle) => ({
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
    }, [symbol, timeframe, indicators, candles]);

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

    const hasAnyIndicator = toggleRsi || toggleMacd || toggleBB;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart Area */}
            <div className="lg:col-span-2 space-y-6 rounded-md">
                <Card className="pt-6 pb-0 rounded-md border-border">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 gap-4">
                        <CardTitle className="text-xl font-bold flex items-center gap-2 shrink-0">
                            {symbol}
                        </CardTitle>

                        <div className="flex gap-2 flex-wrap">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="flex gap-2 border-black/30 dark:border-white/30"
                                    >
                                        {hasAnyIndicator ? (
                                            <div className="flex justify-center items-center">
                                                <MinusCircle className="text-red-600/85 dark:text-red-400/70" />
                                                <PlusCircle className="text-green-600/85 dark:text-green-400/70" />
                                            </div>
                                        ) : (
                                            <PlusCircle />
                                        )}
                                        Indicators
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="border-border">
                                    <DropdownMenuItem>
                                        <Button
                                            variant="outline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setToggleMacd(!toggleMacd);
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                {toggleMacd ? <EyeOff /> : <Eye />}
                                                MACD
                                            </div>
                                        </Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Button
                                            variant="outline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setToggleBB(!toggleBB);
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                {toggleBB ? <EyeOff /> : <Eye />}
                                                Bollinger Bands
                                            </div>
                                        </Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Button
                                            variant="outline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setToggleRsi(!toggleRsi);
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                {toggleRsi ? <EyeOff /> : <Eye />}
                                                RSI
                                            </div>
                                        </Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Button
                                            variant="outline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setToggleVolume(!toggleVolume);
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                {toggleVolume ? <EyeOff /> : <Eye />}
                                                Volume
                                            </div>
                                        </Button>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <Button
                                            variant="outline"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setToggleObv(!toggleObv);
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                {toggleObv ? <EyeOff /> : <Eye />}
                                                OBV
                                            </div>
                                        </Button>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Select value={symbol} onValueChange={setSymbol}>
                                <SelectTrigger className="w-[120px] border-black/30 dark:border-white/30">
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
                    <CardContent className="p-0 flex flex-col rounded-md">
                        {/* Single Chart Container with Multiple Panes */}
                        <div className="relative w-full rounded-md">
                            <div ref={chartContainerRef} className="w-full rounded-md" />
                        </div>
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
                            disabled={isAnalyzing || !candles.length}
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
                                        Signal Bias
                                    </span>
                                    <Badge className={`${getSignalColor(aiAnalysis.signal)} px-6 py-2 text-xl font-bold`}>
                                        {aiAnalysis.signal}
                                    </Badge>
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
                            <div className="flex-1 flex flex-col gap-4">
                                <Skeleton className="flex-1 w-full" />
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
        </div>
    );
}
