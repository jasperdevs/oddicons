"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProximityHover } from "@/hooks/use-proximity-hover";
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

interface Row {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  active: boolean;
  onSelect: () => void;
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

  const topRows: Row[] = [
    {
      id: "home",
      label: "home",
      icon: <Home size={16} strokeWidth={homeActive ? 2 : 1.5} />,
      count: totalCount,
      active: homeActive,
      onSelect: () => {
        if (onlyFavorites) onToggleFavorites();
        onSelect("All");
      },
    },
    {
      id: "favorites",
      label: "favorites",
      icon: (
        <Heart
          size={16}
          strokeWidth={onlyFavorites ? 2 : 1.5}
          className={onlyFavorites ? "fill-current" : ""}
        />
      ),
      count: favoriteCount,
      active: onlyFavorites,
      onSelect: onToggleFavorites,
    },
  ];

  const tagRows: Row[] = tagCategories.map((cat) => {
    const active = !onlyFavorites && selected === cat;
    return {
      id: `tag-${cat}`,
      label: cat.toLowerCase(),
      icon: (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            active ? "bg-foreground" : "bg-muted-foreground/60"
          )}
        />
      ),
      count: counts[cat] ?? 0,
      active,
      onSelect: () => {
        if (onlyFavorites) onToggleFavorites();
        onSelect(cat);
      },
    };
  });

  return (
    <aside className="hidden w-60 shrink-0 flex-col overflow-hidden rounded-2xl bg-sidebar md:flex">
      <div className="flex items-center gap-3 px-4 pb-6 pt-6">
        <span
          aria-hidden
          className="relative grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background"
        >
          <span className="h-2.5 w-2.5 rounded-full bg-background" />
          <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-background/70" />
        </span>
        <span className="font-display text-[22px] leading-none text-foreground">oddicons</span>
      </div>

      <ProximityNav rows={topRows} />

      <div className="px-4 pb-2 pt-6 text-[12px] font-medium tracking-[0.02em] text-muted-foreground">
        tags
      </div>

      <div className="scrollbar-custom flex-1 overflow-y-auto pb-4">
        <ProximityNav rows={tagRows} />
      </div>
    </aside>
  );
}

function ProximityNav({ rows }: { rows: Row[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    activeIndex,
    itemRects,
    handlers,
    registerItem,
    measureItems,
  } = useProximityHover<HTMLDivElement>(containerRef);

  useEffect(() => {
    measureItems();
  }, [rows.length, measureItems]);

  const activeRect =
    activeIndex !== null ? itemRects[activeIndex] : null;

  return (
    <div
      ref={containerRef}
      {...handlers}
      className="relative flex flex-col gap-1 px-2"
    >
      <AnimatePresence>
        {activeRect && (
          <motion.span
            key="hover"
            aria-hidden
            className="pointer-events-none absolute rounded-xl bg-accent"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              top: activeRect.top,
              left: activeRect.left,
              width: activeRect.width,
              height: activeRect.height,
            }}
            exit={{ opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 520,
              damping: 40,
              mass: 0.4,
              opacity: { duration: 0.12 },
            }}
          />
        )}
      </AnimatePresence>

      {rows.map((row, i) => {
        const isActive = row.active;
        const isHovered = activeIndex === i;
        return (
          <button
            key={row.id}
            type="button"
            ref={(el) => registerItem(i, el)}
            onClick={row.onSelect}
            className={cn(
              "relative z-10 flex h-10 items-center justify-between rounded-xl px-3 text-[14px] font-medium transition-colors duration-[180ms]",
              isActive
                ? "bg-foreground text-background"
                : isHovered
                  ? "text-foreground"
                  : "text-muted-foreground"
            )}
          >
            <span className="flex items-center gap-3">
              <span className="grid h-4 w-4 place-items-center">{row.icon}</span>
              <span>{row.label}</span>
            </span>
            <Badge
              variant="solid"
              size="sm"
              color="gray"
              className={cn(
                "tabular-nums transition-colors",
                isActive && "bg-background/15! text-background!"
              )}
            >
              {row.count}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}
