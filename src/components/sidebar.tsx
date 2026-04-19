"use client";

import { Heart, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
  counts: Record<string, number>;
  favoriteCount: number;
  onlyFavorites: boolean;
  onToggleFavorites: () => void;
  totalCount: number;
}

export function Sidebar({
  categories,
  selected,
  onSelect,
  counts,
  favoriteCount,
  onlyFavorites,
  onToggleFavorites,
  totalCount,
}: SidebarProps) {
  const tagCategories = categories.filter((c) => c !== "All");
  const homeActive = !onlyFavorites && selected === "All";

  return (
    <aside className="hidden w-60 shrink-0 flex-col overflow-hidden rounded-2xl bg-sidebar md:flex">
      <div className="flex items-center gap-2 px-5 pb-4 pt-5">
        <span
          aria-hidden
          className="relative grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-background" />
          <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-background/70" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-foreground">oddicons</span>
      </div>

      <nav className="flex flex-col gap-0.5 px-3">
        <SidebarItem
          icon={<Home size={14} strokeWidth={homeActive ? 2 : 1.5} />}
          label="Home"
          count={totalCount}
          active={homeActive}
          onClick={() => {
            if (onlyFavorites) onToggleFavorites();
            onSelect("All");
          }}
        />
        <SidebarItem
          icon={
            <Heart
              size={14}
              strokeWidth={onlyFavorites ? 2 : 1.5}
              className={onlyFavorites ? "fill-current" : ""}
            />
          }
          label="Favorites"
          count={favoriteCount}
          active={onlyFavorites}
          onClick={onToggleFavorites}
        />
      </nav>

      <div className="mx-5 my-4 h-px bg-border/40" />

      <div className="px-5 pb-2 text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground/70">
        Tags
      </div>

      <nav className="scrollbar-custom flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-4">
        {tagCategories.map((cat) => {
          const active = !onlyFavorites && selected === cat;
          return (
            <SidebarItem
              key={cat}
              icon={
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    active ? "bg-background" : "bg-muted-foreground/50"
                  )}
                />
              }
              label={cat}
              count={counts[cat] ?? 0}
              active={active}
              onClick={() => {
                if (onlyFavorites) onToggleFavorites();
                onSelect(cat);
              }}
            />
          );
        })}
      </nav>
    </aside>
  );
}

function SidebarItem({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex h-9 items-center justify-between rounded-md px-3 text-[13px] transition-colors",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <span className="flex items-center gap-2.5">
        <span className="grid h-4 w-4 place-items-center">{icon}</span>
        <span>{label}</span>
      </span>
      <span
        className={cn(
          "rounded px-1.5 py-0.5 text-[10px] tabular-nums transition-colors",
          active ? "text-background/70" : "text-muted-foreground/70"
        )}
      >
        {count}
      </span>
    </button>
  );
}
