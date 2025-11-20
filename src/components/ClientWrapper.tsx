"use client";
import { useState } from "react";
import dynamic from "next/dynamic";

// Use dynamic import with no SSR for Main (which contains WASM components)
const DynamicMain = dynamic(() => import("@/components/Main"), { ssr: false });
// Use dynamic import for HeroSection as well since it uses window (VideoJS, etc)
const DynamicHeroSection = dynamic(() => import("@/components/HeroSection"), {
  ssr: false,
});

export default function ClientWrapper() {
  const [showApp, setShowApp] = useState(false);

  if (showApp) {
    return <DynamicMain />;
  }

  return <DynamicHeroSection setShowInputForm={() => setShowApp(true)} />;
}
