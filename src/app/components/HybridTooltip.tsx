"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";

interface HybridTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function HybridTooltip({
  children,
  content,
  side = "top",
  align = "center",
}: HybridTooltipProps) {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    // Check if device is mobile using pointer media query
    const mediaQuery = window.matchMedia("(pointer: coarse)");
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsMobile(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <span className="inline-flex items-center gap-1 cursor-help text-foreground hover:text-indigo-600 transition-colors">
            {children}
          </span>
        </PopoverTrigger>
        <PopoverContent
          className="max-w-sm text-sm leading-relaxed bg-background text-foreground"
          side={side}
          align={align}
        >
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Tooltip delayDuration={100}>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 cursor-help text-foreground hover:text-indigo-600 transition-colors">
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent
        className="max-w-sm text-sm leading-relaxed  bg-background  text-foreground"
        side={side}
        align={align}
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
