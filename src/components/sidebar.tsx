"use client";

import { Heart, LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

interface SidebarProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
  counts: Record<string, number>;
  favoriteCount: number;
  onlyFavorites: boolean;
  onToggleFavorites: () => void;
}

export function Sidebar({
  categories,
  selected,
  onSelect,
  counts,
  favoriteCount,
  onlyFavorites,
  onToggleFavorites,
}: SidebarProps) {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 flex-col gap-5 self-start px-4 py-6 md:flex">
      <div className="flex items-center gap-2 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        <Sparkles size={12} strokeWidth={1.75} />
        <span>Browse</span>
      </div>

      <nav className="flex flex-col gap-0.5">
        {categories.map((cat) => {
          const active = selected === cat && !onlyFavorites;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => {
                if (onlyFavorites) onToggleFavorites();
                onSelect(cat);
              }}
              className={cn(
                "group relative flex h-9 items-center justify-between gap-2 rounded-md px-3 text-[13px] transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <LayoutGrid
                  size={13}
                  strokeWidth={active ? 2 : 1.5}
                  className={cn("transition-transform", active && "scale-110")}
                />
                <span>{cat}</span>
              </span>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] tabular-nums transition-colors",
                  active
                    ? "bg-background/20 text-background"
                    : "bg-muted text-muted-foreground group-hover:bg-background"
                )}
              >
                {counts[cat] ?? 0}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="mt-2 border-t border-border/40 pt-4">
        <Tooltip content={onlyFavorites ? "Show all icons" : "Only favorites"}>
          <button
            type="button"
            onClick={onToggleFavorites}
            aria-pressed={onlyFavorites}
            className={cn(
              "group flex h-9 w-full items-center justify-between gap-2 rounded-md px-3 text-[13px] transition-colors",
              onlyFavorites
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span className="flex items-center gap-2">
              <Heart
                size={13}
                strokeWidth={1.75}
                className={onlyFavorites ? "fill-background" : ""}
              />
              <span>Favorites</span>
            </span>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[10px] tabular-nums",
                onlyFavorites
                  ? "bg-background/20 text-background"
                  : "bg-muted text-muted-foreground group-hover:bg-background"
              )}
            >
              {favoriteCount}
            </span>
          </button>
        </Tooltip>
      </div>

      <div className="mt-auto rounded-lg bg-sidebar p-3 text-[11px] leading-relaxed text-muted-foreground">
        <p className="mb-1 font-medium text-foreground">free &amp; weird</p>
        <p>CC0 · copy the SVG or grab a PNG. no attribution required.</p>
      </div>
    </aside>
  );
}
