"use client";
import { motion } from "framer-motion";
import { HelpCircle, Play, TrendingUp, BarChart3, Zap, LineChart, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HybridTooltip } from "@/components/HybridTooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import VideoJS from "@/components/VideoJS";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import videojs from "video.js";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { isProSubscribed } from "./app/actions";

// Dynamically import WalletCreditsModal to avoid SSR issues with Cardano wallet
const WalletCreditsModal = dynamic(
    () => import("@/components/WalletCreditsModal").then(mod => ({ default: mod.WalletCreditsModal })),
    { ssr: false }
);

export default function AILandingPage() {
    const [showWalletModal, setShowWalletModal] = useState(false);
    const [isPro, setIsPro] = useState(false);

    const videoJsOptions: Parameters<typeof videojs>[1] = {
        autoplay: true,
        controls: true,
        responsive: true,
        fluid: true,
        sources: [
            {
                src: "/demo.mp4",
                type: "video/mp4",
            },
        ],
    };


    useEffect(() => {
        const getProStatus = async () => {
            const isPro = await isProSubscribed();
            return isPro;
        };
        getProStatus().then((isPro) => {
            setIsPro(isPro);
        });
    }, []);

    const handlePlayerReady = (player: ReturnType<typeof videojs>) => {
        if (!player) {
            console.error("Player is not available");
            return;
        }
        player.requestFullscreen?.();

        setTimeout(() => {
            try {
                if (player.readyState() >= 1) {
                    player.muted(true);
                    player.play()?.catch((error) => {
                        console.error("Autoplay failed:", error);
                    });
                }
            } catch (error) {
                console.error("Error in autoplay:", error);
            }
        }, 1000);
    };

    return (
        <section className="relative flex items-center justify-center w-full min-h-screen">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-50"></div>

            <div className="relative z-10 w-full max-w-6xl mx-auto px-4 text-center pb-20 pt-12">
                {/* Hero Title */}
                <motion.div
                    key="hero-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-8 flex flex-col items-center justify-center"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <TrendingUp className="h-16 w-16 text-blue-500" />
                        <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600">
                            AI-Powered Cardano Trading
                        </h1>
                    </div>
                    <p className="text-2xl md:text-3xl font-semibold text-muted-foreground">
                        Make Smarter Trades with Real-Time Analysis
                    </p>
                </motion.div>

                {/* Subtitle: Value Proposition */}
                <motion.p
                    key="hero-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="mx-auto mb-12 text-xl leading-relaxed text-muted-foreground md:text-2xl max-w-3xl"
                >
                    Get instant AI-driven insights on Cardano (ADA) with live technical analysis,
                    {" "}
                    <HybridTooltip
                        content={
                            <div>
                                Our AI analyzes multiple technical indicators including RSI (Relative Strength Index),
                                MACD (Moving Average Convergence Divergence), and price patterns to provide
                                actionable trading recommendations in real-time.
                            </div>
                        }
                    >
                        <span className="inline-flex items-center gap-1 cursor-help hover:text-blue-400 text-blue-500 transition-colors font-semibold">
                            advanced indicators
                            <HelpCircle className="h-4 w-4 opacity-60 hover:opacity-100 transition-opacity" />
                        </span>
                    </HybridTooltip>
                    , and professional-grade charts. Never miss a trading opportunity again.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    key="hero-buttons"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    className="flex mb-16 w-full justify-center gap-4 sm:flex-row flex-col pt-8 items-center"
                >
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button
                                variant="outline"
                                size="lg"
                                className="text-lg h-14 px-8 cursor-pointer bg-gradient-to-r text-white hover:text-white select-none from-blue-600 to-purple-600 shadow-lg hover:from-blue-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                            >
                                Start Trading Smarter <span className="text-base">📈</span>
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <div className="flex flex-col sm:flex-row gap-4 items-center">
                            {isPro ? (
                                <Link href="/ai-trader/app">
                                    <Button
                                        size="lg"
                                        className="group relative text-lg h-14 px-8 w-auto cursor-pointer select-none shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 text-white border border-white/20 hover:border-white/40 shadow-cyan-500/30 hover:shadow-cyan-500/50 font-semibold tracking-wide overflow-hidden"
                                    >
                                        <span className="relative z-10 flex items-center gap-2">
                                            View AI Dashboard <span className="text-base">📊</span>
                                        </span>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                    </Button>
                                </Link>
                            ) : (
                                <Button
                                    size="lg"
                                    className="group relative text-lg h-14 px-8 w-auto cursor-pointer select-none shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500 text-white border border-white/20 hover:border-white/40 shadow-cyan-500/30 hover:shadow-cyan-500/50 font-semibold tracking-wide overflow-hidden"
                                    onClick={() => setShowWalletModal(true)}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Upgrade to Pro <span className="text-2xl drop-shadow-md group-hover:rotate-12 transition-transform duration-300 pb-1">⚡</span>
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                </Button>
                            )}
                        </div>
                    </SignedIn>

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="lg"
                                className="flex items-center justify-center text-lg h-14 w-38 cursor-pointer bg-gradient-to-r text-white hover:text-white select-none from-indigo-600 to-purple-600 shadow-lg hover:from-indigo-700 hover:to-purple-700 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                            >
                                <span>Watch Demo</span>
                                <Play className="size-4.5 mt-0.5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="!max-w-[90vw] border !border-border">
                            <DialogHeader>
                                <DialogTitle>AI Technical Analysis Demo</DialogTitle>
                                <DialogDescription>See our AI in action analyzing Cardano price movements</DialogDescription>
                            </DialogHeader>
                            <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
                        </DialogContent>
                    </Dialog>
                </motion.div>

                {/* Screenshot Preview */}
                <motion.div
                    key="screenshot"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
                    className="mb-16 max-w-4xl mx-auto"
                >
                    <div className="rounded-xl overflow-hidden border border-border shadow-2xl">
                        <Image
                            src="https://i.imgur.com/o2KlQCs.png"
                            alt="AI Dashboard Preview"
                            width={1200}
                            height={675}
                            className="w-full h-auto"
                        />
                    </div>
                </motion.div>

                {/* Key Features Section */}
                <motion.div
                    key="hero-features"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
                >
                    <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all">
                        <div className="text-4xl mb-3">🤖</div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">AI-Powered Insights</h3>
                        <p className="text-muted-foreground">Advanced algorithms analyze market patterns and generate actionable trading signals every 2 minutes</p>
                    </div>
                    <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all">
                        <div className="text-4xl mb-3">📊</div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">Technical Indicators</h3>
                        <p className="text-muted-foreground">Track RSI, MACD, moving averages, and more with professional-grade charting tools</p>
                    </div>
                    <div className="p-6 rounded-lg bg-gradient-to-br from-pink-500/10 to-blue-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all">
                        <div className="text-4xl mb-3">⚡</div>
                        <h3 className="text-xl font-bold mb-2 text-foreground">Real-Time Updates</h3>
                        <p className="text-muted-foreground">Live price data and instant analysis updates keep you ahead of market movements</p>
                    </div>
                </motion.div>

                {/* Additional Features */}
                <motion.div
                    key="features-grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
                    className="mb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto"
                >
                    <div className="p-4 rounded-lg border border-border bg-card/50 backdrop-blur">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-6 w-6 text-blue-500 flex-shrink-0" />
                            <h4 className="font-semibold">Live Charts</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">Interactive candlestick charts with zoom and pan</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card/50 backdrop-blur">
                        <div className="flex items-center gap-2 mb-2">
                            <LineChart className="h-6 w-6 text-purple-500 flex-shrink-0" />
                            <h4 className="font-semibold">Multi-Timeframe</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">Analyze 5m, 15m, 1h, and 4h timeframes</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card/50 backdrop-blur">
                        <div className="flex items-center gap-2 mb-2">
                            <BarChart3 className="h-6 w-6 text-pink-500 flex-shrink-0" />
                            <h4 className="font-semibold">Price Alerts</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">Get notified of significant price movements</p>
                    </div>
                    <div className="p-4 rounded-lg border border-border bg-card/50 backdrop-blur">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap className="h-6 w-6 text-cyan-500 flex-shrink-0" />
                            <h4 className="font-semibold">Instant Analysis</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">AI processes data in milliseconds</p>
                    </div>
                </motion.div>

                {/* Why Choose Us */}
                <motion.div
                    key="hero-why"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
                    className="mb-8 text-lg text-muted-foreground max-w-3xl mx-auto"
                >
                    <p className="py-6">
                        <strong className="text-2xl text-foreground">Why Choose Our AI Analyst?</strong>
                        <br /><br />
                        Stop second-guessing your trades. Our AI continuously monitors Cardano&apos;s price action,
                        analyzes multiple timeframes, and delivers clear buy/sell/hold recommendations backed by
                        proven technical indicators. Whether you&apos;re a seasoned trader or just starting out,
                        get the insights you need to trade with confidence.
                    </p>
                </motion.div>

                {/* Final CTA */}
                <motion.div
                    key="final-cta"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
                    className="pt-8"
                >
                    <SignedOut>
                        <SignInButton mode="modal">
                            <Button
                                size="lg"
                                className="text-xl h-16 px-12 cursor-pointer bg-gradient-to-r text-white hover:text-white select-none from-blue-600 via-purple-600 to-pink-600 shadow-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                            >
                                Get Started Free <span className="text-2xl ml-2">🚀</span>
                            </Button>
                        </SignInButton>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/ai-trader/app">
                            <Button
                                size="lg"
                                className="text-xl h-16 px-12 cursor-pointer bg-gradient-to-r text-white hover:text-white select-none from-blue-600 via-purple-600 to-pink-600 shadow-lg hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                            >
                                Open Dashboard <span className="text-2xl ml-2">📊</span>
                            </Button>
                        </Link>
                    </SignedIn>
                </motion.div>
            </div>

            <WalletCreditsModal open={showWalletModal} onOpenChange={setShowWalletModal} />
        </section>
    );
}
