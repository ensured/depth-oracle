"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";
import { quotes } from "@/lib/jung-quotes";
import { Switch } from "@/app/components/ui/switch";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Button } from "@/app/components/ui/button";
import {
  Check,
  Sparkles,
  Info,
  Clock,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";
import { EyesIcon } from "./ui/EyesIcon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { cn } from "@/lib/utils";

export function QuoteToast() {
  const [isToggled, setIsToggled] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("quoteToggle") === "true";
    }
    return false;
  });

  const [quoteTitle, setQuoteTitle] = useState("Periodic Quotes");
  const [quoteInterval, setQuoteInterval] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const savedInterval = localStorage.getItem("quoteIntervalMinutes");
      return savedInterval ? parseInt(savedInterval, 10) : 3; // Default to 3 minutes
    }
    return 3;
  });
  const titleRef = useRef<HTMLSpanElement>(null);

  // Load saved preference from local storage on component mount
  useEffect(() => {
    const savedPreference = localStorage.getItem("quoteToastEnabled");
    if (savedPreference !== null) {
      setIsToggled(JSON.parse(savedPreference));
    } else {
      // Default to true if no preference is set
      setIsToggled(true);
      localStorage.setItem("quoteToastEnabled", "true");
    }
  }, []);

  // Save preference to local storage when it changes
  const handleToggleChange = (checked: boolean) => {
    setIsToggled(checked);
    localStorage.setItem("quoteToastEnabled", String(checked));
  };

  useEffect(() => {
    const showRandomQuote = () => {
      toast.dismiss();
      const randomIndex = Math.floor(Math.random() * quotes.length);
      const randomQuote = quotes[randomIndex];

      toast("Carl Jung", {
        description: randomQuote.quote,
        duration: 10000, // 10 seconds
        position: "top-center",
        action: {
          label: <X className="h-4 w-4" />,
          onClick: () => toast.dismiss(),
        },
      });
    };

    if (isToggled) {
      // Show quotes at the configured interval (converting minutes to milliseconds)
      const interval = setInterval(showRandomQuote, quoteInterval * 60 * 1000);

      // Clean up timers on unmount
      return () => {
        clearInterval(interval);
      };
    } else {
      toast.dismiss();
    }
  }, [isToggled, quoteInterval]);

  return (
    <TooltipProvider>
      <div className="flex items-center">
        <Dialog>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <button
                  className={cn(
                    "p-2 rounded-full transition-all hover:bg-accent hover:text-accent-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    isToggled && "text-primary "
                  )}
                  aria-label="Quote settings"
                >
                  <div className="relative">
                    <EyesIcon className="h-6 w-12" />
                    {isToggled && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-500"></span>
                    )}
                  </div>
                </button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="flex items-center gap-1">
              {isToggled ? "Disable" : "Enable"} inspirational quotes
              {isToggled && <Sparkles className="h-3 w-3 text-primary" />}
            </TooltipContent>
          </Tooltip>

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <EyesIcon className="h-6 w-12 flex-shrink-0" />
                <span className="font-medium text-primary">Quote Settings</span>
              </DialogTitle>
              <DialogDescription>
                Customize how and when you receive inspirational quotes from
                Carl Jung.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-accent/50">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 font-medium">
                    <span
                      ref={titleRef}
                      contentEditable
                      suppressContentEditableWarning={true}
                      onBlur={(e) =>
                        setQuoteTitle(
                          e.currentTarget.textContent || "Periodic Quotes"
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      className="outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 rounded px-1 -ml-1"
                    >
                      {quoteTitle}
                    </span>
                  </div>
                </div>
                <Switch
                  id="quote-toggle"
                  checked={isToggled}
                  onCheckedChange={handleToggleChange}
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted-foreground/30 dark:data-[state=checked]:bg-amber-400"
                />
                <Label htmlFor="quote-toggle" className="sr-only">
                  Toggle quotes
                </Label>
                {isToggled ? (
                  <span className="flex items-center gap-1 text-xs dark:text-amber-400">
                    <Check className="h-3 w-3" /> Active
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                    <X className="h-3 w-3" /> Inactive
                  </span>
                )}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <div className="relative">
                        <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          value={quoteInterval}
                          onChange={(e) => {
                            const value = Math.min(
                              60,
                              Math.max(1, parseInt(e.target.value) || 1)
                            );
                            setQuoteInterval(value);
                            localStorage.setItem(
                              "quoteIntervalMinutes",
                              value.toString()
                            );
                          }}
                          className="w-20 pl-8 pr-10 py-1.5 h-9 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none rounded-r-none border-r-0"
                        />
                        <span className="absolute right-2.5 top-2 text-sm text-muted-foreground pointer-events-none">
                          min
                        </span>
                      </div>
                      <div className="flex flex-col h-9 border border-l-0 rounded-r-md overflow-hidden">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-1/2 w-6 p-0 hover:bg-accent/50 rounded-none border-b flex items-center justify-center"
                          onClick={() => {
                            const newValue = Math.min(60, quoteInterval + 1);
                            setQuoteInterval(newValue);
                            localStorage.setItem(
                              "quoteIntervalMinutes",
                              newValue.toString()
                            );
                          }}
                          disabled={quoteInterval >= 60}
                        >
                          <span className="sr-only">Increase by 1 minute</span>
                          <ChevronUp className="h-3 w-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-1/2 w-6 p-0 hover:bg-accent/50 rounded-none flex items-center justify-center"
                          onClick={() => {
                            const newValue = Math.max(1, quoteInterval - 1);
                            setQuoteInterval(newValue);
                            localStorage.setItem(
                              "quoteIntervalMinutes",
                              newValue.toString()
                            );
                          }}
                          disabled={quoteInterval <= 1}
                        >
                          <span className="sr-only">Decrease by 1 minute</span>
                          <ChevronDown className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="mt-4 rounded-lg bg-accent/20 border border-border p-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary dark:text-amber-400" />
                  <div>
                    <p className="font-medium text-foreground mb-1">
                      Inspiration on Your Schedule
                    </p>
                    <p className="text-sm">
                      Get a new quote every {quoteInterval}{" "}
                      {quoteInterval === 1 ? "minute" : "minutes"} when enabled.
                      Adjust the timing or disable it anytime from this menu.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
