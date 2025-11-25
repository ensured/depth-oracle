"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border backdrop-blur bg-background/80">
      <div className=" flex px-3 sm:px-4 md:px-5 lg:px-6 xl:px-7 h-14 items-center justify-between">
        <div className="flex items-center gap-6 select-none">
          <Link href="/" className="hover:underline flex items-center gap-1">
            <h1 className="font-bold text-lg">
              Logo/Title
            </h1>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header >
  );
}
