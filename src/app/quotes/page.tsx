import type { Metadata } from "next";
import QuotesGallery from "./QuotesGallery";

export const metadata: Metadata = {
    title: "Jungian Wisdom | Depth Oracle",
    description:
        "Explore a curated collection of Carl Jung's most profound quotes on shadow work, dreams, and the unconscious.",
};

export default function QuotesPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-linear-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent pb-1">
                        Echoes of the Unconscious
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        "Until you make the unconscious conscious, it will direct your life
                        and you will call it fate."
                    </p>
                </div>
                <QuotesGallery />
            </div>
        </div>
    );
}