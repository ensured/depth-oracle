"use client";
import dynamic from "next/dynamic";

// Use dynamic import with no SSR for any component (which contains WASM components)/if using window
const DynamicHeroSection = dynamic(() => import("@/components/HeroSection"), {
  ssr: false,
});

export default function ClientWrapper() {
  return <DynamicHeroSection />;
}
