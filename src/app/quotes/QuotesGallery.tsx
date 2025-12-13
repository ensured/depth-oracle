"use client";

import { useState, useMemo } from "react";
import { quotes, type Quote } from "@/lib/jung-quotes";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
} from "@/app/components/ui/card";
import { Search, Copy, Check, Quote as QuoteIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function QuotesGallery() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTopic, setActiveTopic] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<number | null>(null);

    // Extract unique topics and sort them
    const allTopics = useMemo(() => {
        const topics = new Set<string>();
        quotes.forEach((q) => q.topics.forEach((t) => topics.add(t)));
        return Array.from(topics).sort();
    }, []);

    // Filter quotes based on search and active topic
    const filteredQuotes = useMemo(() => {
        return quotes.filter((q) => {
            const matchesSearch =
                q.quote.toLowerCase().includes(searchQuery.toLowerCase()) ||
                q.topics.some((t) =>
                    t.toLowerCase().includes(searchQuery.toLowerCase())
                );
            const matchesTopic = activeTopic ? q.topics.includes(activeTopic) : true;
            return matchesSearch && matchesTopic;
        });
    }, [searchQuery, activeTopic]);

    const handleCopy = (text: string, id: number) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success("Quote copied to clipboard");
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="space-y-8">
            {/* Sticky Header for Controls */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md py-4 -mx-4 px-4 border-b border-border/40">
                <div className="max-w-7xl mx-auto space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search wisdom..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-background/50"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="hidden sm:block text-sm text-muted-foreground font-medium">
                            {filteredQuotes.length} {filteredQuotes.length === 1 ? "quote" : "quotes"} found
                        </div>
                    </div>

                    {/* Topics Scroll Area */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mask-fade-sides">
                        <Button
                            variant={activeTopic === null ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveTopic(null)}
                            className="rounded-full shrink-0"
                        >
                            All
                        </Button>
                        {allTopics.map((topic) => (
                            <Button
                                key={topic}
                                variant={activeTopic === topic ? "default" : "outline"}
                                size="sm"
                                onClick={() => setActiveTopic(topic === activeTopic ? null : topic)}
                                className="rounded-full shrink-0"
                            >
                                {topic}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
                <AnimatePresence mode="popLayout">
                    {filteredQuotes.map((q) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            key={q.id}
                        >
                            <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-300 border-border/50 bg-linear-to-br from-card to-secondary/10 dark:from-card dark:to-secondary/5 group">
                                <CardHeader className="pb-3 pt-6 px-6">
                                    <div className="flex flex-wrap gap-2">
                                        {q.topics.slice(0, 3).map((t) => (
                                            <Badge
                                                key={t}
                                                variant="secondary"
                                                className="text-[10px] uppercase tracking-wider font-semibold opacity-70 group-hover:opacity-100 transition-opacity bg-background/50 backdrop-blur-sm"
                                            >
                                                {t}
                                            </Badge>
                                        ))}
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1 px-6 pb-6 pt-0">
                                    <div className="relative">
                                        <QuoteIcon className="absolute -top-2 -left-2 h-8 w-8 text-primary/10 -z-10 transform -scale-x-100" />
                                        <p className="font-serif text-lg md:text-xl leading-relaxed text-foreground/90 italic">
                                            {q.quote}
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="px-6 py-4 bg-muted/20 border-t border-border/30 flex justify-between items-center mt-auto">
                                    <div className="text-xs text-muted-foreground font-medium truncate max-w-[70%]" title={q.source || "Carl Jung"}>
                                        — {q.source ? q.source.split("(")[0].trim() : "Carl Jung"}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-primary transition-colors"
                                        onClick={() => handleCopy(q.quote, q.id)}
                                    >
                                        {copiedId === q.id ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">Copy quote</span>
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredQuotes.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-xl text-muted-foreground font-serif italic">
                        "We cannot change anything unless we accept it."
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        No quotes found matching your criteria. Try adjusting your search.
                    </p>
                    <Button
                        variant="link"
                        onClick={() => {
                            setSearchQuery("");
                            setActiveTopic(null);
                        }}
                        className="mt-4"
                    >
                        Clear all filters
                    </Button>
                </div>
            )}
        </div>
    );
}
