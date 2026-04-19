"use client";

import { Search, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type TopbarProps = {
  query: string;
  onQueryChange: (q: string) => void;
};

export function Topbar({ query, onQueryChange }: TopbarProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="sticky top-0 z-20 flex items-center gap-3 h-14 px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur">
      <label className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search icons..."
          className="w-full h-9 pl-9 pr-3 rounded-lg bg-secondary text-[13px] outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-ring transition-shadow"
        />
      </label>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setIsDark((v) => !v)}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun /> : <Moon />}
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="GitHub"
        asChild
        className="hidden sm:inline-flex"
      >
        <a
          href="https://github.com/jasperdevs/oddicons"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 .297a12 12 0 0 0-3.792 23.39c.6.113.82-.26.82-.577v-2.04c-3.338.725-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.755-1.333-1.755-1.09-.744.083-.729.083-.729 1.205.084 1.84 1.237 1.84 1.237 1.07 1.835 2.809 1.305 3.495.998.108-.776.42-1.306.76-1.606-2.665-.305-5.467-1.333-5.467-5.932 0-1.311.468-2.382 1.236-3.222-.124-.303-.535-1.525.117-3.176 0 0 1.008-.322 3.3 1.23a11.47 11.47 0 0 1 6.003 0c2.29-1.552 3.296-1.23 3.296-1.23.655 1.65.243 2.873.12 3.176.77.84 1.236 1.91 1.236 3.222 0 4.61-2.807 5.624-5.48 5.922.432.372.816 1.102.816 2.222v3.293c0 .319.216.694.825.576A12.001 12.001 0 0 0 12 .297" />
          </svg>
        </a>
      </Button>
    </div>
  );
}
