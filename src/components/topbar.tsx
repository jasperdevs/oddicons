"use client";

import { Heart, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TopbarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  showingFavorites: boolean;
  onToggleFavorites: () => void;
  favoriteCount: number;
}

export function Topbar({
  theme,
  onToggleTheme,
  showingFavorites,
  onToggleFavorites,
  favoriteCount,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#" className="group inline-flex items-center gap-2">
          <span
            aria-hidden
            className="relative grid h-7 w-7 place-items-center rounded-md bg-foreground text-background"
          >
            <span className="h-2 w-2 rounded-full bg-background" />
            <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-background/70" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">oddicons</span>
          <span className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            beta
          </span>
        </a>

        <div className="flex items-center gap-1.5">
          <Tooltip content={showingFavorites ? "Show all" : "Show favorites"}>
            <button
              type="button"
              onClick={onToggleFavorites}
              aria-pressed={showingFavorites}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md border px-2.5 text-[13px] transition-colors",
                showingFavorites
                  ? "border-foreground/20 bg-foreground text-background"
                  : "border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Heart
                size={14}
                strokeWidth={1.75}
                className={showingFavorites ? "fill-background" : ""}
              />
              <span className="tabular-nums">{favoriteCount}</span>
            </button>
          </Tooltip>

          <Tooltip content={theme === "dark" ? "Light mode" : "Dark mode"}>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </Button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
