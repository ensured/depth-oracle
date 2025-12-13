"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Use dynamic import with no SSR for Main (which contains WASM components)
const DynamicMain = dynamic(() => import("@/app/components/Main"), { ssr: false });
// Use dynamic import for HeroSection as well since it uses window (VideoJS, etc)
const DynamicHeroSection = dynamic(() => import("@/app/components/HeroSection"), {
  ssr: false,
});

export default function ClientWrapper() {
  const [showApp, setShowApp] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem("depth-oracle-app-active");
    if (savedState === "true") {
      setShowApp(true);
    }
    setIsLoaded(true);
  }, []);

  const handleSetShowApp = (show: boolean) => {
    setShowApp(show);
    if (show) {
      localStorage.setItem("depth-oracle-app-active", "true");
    } else {
      localStorage.removeItem("depth-oracle-app-active");
    }
  };

  // Prevent flash of Hero content by waiting for hydration/state check
  if (!isLoaded) {
    return null;
  }

  if (showApp) {
    return <DynamicMain />;
  }

  return <DynamicHeroSection setShowInputForm={handleSetShowApp} />;
}
