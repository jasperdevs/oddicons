"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Heart, HeartHandshake, Home } from "lucide-react";
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
  usageActive: boolean;
  donateActive: boolean;
  onOpenUsage: () => void;
  onOpenDonate: () => void;
}

interface Row {
  id: string;
  label: string;
  icon: React.ReactNode;
  count?: number;
  active: boolean;
  onSelect: () => void;
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col overflow-hidden rounded-2xl bg-sidebar md:flex">
      <SidebarBody {...props} />
    </aside>
  );
}

export function SidebarBody(props: SidebarProps) {
  const tagCategories = props.categories.filter((c) => c !== "All");
  const inGallery = !props.usageActive && !props.donateActive;
  const homeActive = inGallery && !props.onlyFavorites && props.selected === "All";
  const favActive = inGallery && props.onlyFavorites;

  const topRows: Row[] = [
    {
      id: "home",
      label: "home",
      icon: <Home size={16} strokeWidth={homeActive ? 2 : 1.5} />,
      count: props.totalCount,
      active: homeActive,
      onSelect: () => {
        if (props.onlyFavorites) props.onToggleFavorites();
        props.onSelect("All");
      },
    },
    {
      id: "favorites",
      label: "favorites",
      icon: (
        <Heart
          size={16}
          strokeWidth={favActive ? 2 : 1.5}
          className={favActive ? "fill-current" : ""}
        />
      ),
      count: props.favoriteCount,
      active: favActive,
      onSelect: props.onToggleFavorites,
    },
  ];

  const tagRows: Row[] = tagCategories.map((cat) => {
    const active = inGallery && !props.onlyFavorites && props.selected === cat;
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
      count: props.counts[cat] ?? 0,
      active,
      onSelect: () => {
        if (props.onlyFavorites) props.onToggleFavorites();
        props.onSelect(cat);
      },
    };
  });

  const infoRows: Row[] = [
    {
      id: "usage",
      label: "usage",
      icon: <BookOpen size={16} strokeWidth={props.usageActive ? 2 : 1.5} />,
      active: props.usageActive,
      onSelect: props.onOpenUsage,
    },
    {
      id: "donate",
      label: "donate",
      icon: (
        <HeartHandshake
          size={16}
          strokeWidth={props.donateActive ? 2 : 1.5}
          className={props.donateActive ? "fill-rose-500/20 text-rose-500" : ""}
        />
      ),
      active: props.donateActive,
      onSelect: props.onOpenDonate,
    },
  ];

  return (
    <SidebarBodyInner topRows={topRows} tagRows={tagRows} infoRows={infoRows} />
  );
}

function SidebarBodyInner({
  topRows,
  tagRows,
  infoRows,
}: {
  topRows: Row[];
  tagRows: Row[];
  infoRows: Row[];
}) {
  return (
    <>
      <div className="flex items-center justify-center gap-2.5 px-5 pb-8 pt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/sitelogo.png`}
          alt=""
          aria-hidden
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          className="h-9 w-9 shrink-0 select-none [-webkit-user-drag:none]"
        />
        <span className="text-[20px] font-semibold tracking-tight text-foreground">
          oddicons
        </span>
      </div>

      <ProximityNav rows={topRows} />

      <div className="flex items-center gap-2 px-5 pb-3 pt-8">
        <span className="text-[12px] font-medium text-muted-foreground">
          categories
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="scrollbar-custom min-h-0 flex-1 overflow-y-auto">
        <ProximityNav rows={tagRows} />
      </div>

      <div className="mt-4 flex items-center gap-2 px-5 pb-3">
        <span className="text-[12px] font-medium text-muted-foreground">
          info
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <div className="pb-5">
        <ProximityNav rows={infoRows} />
      </div>
    </>
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
            {row.count !== undefined && (
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
            )}
          </button>
        );
      })}
    </div>
  );
}
