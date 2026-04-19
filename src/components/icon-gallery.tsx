"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import icons from "@/data/icons.json";
import { useFavorites } from "@/hooks/use-favorites";
import { useTheme } from "@/hooks/use-theme";
import { CartProvider, useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";
import { Topbar } from "@/components/topbar";
import { Sidebar } from "@/components/sidebar";
import { IconCard } from "@/components/icon-card";
import { CartPinboard } from "@/components/cart-pinboard";
import { FlyToCart } from "@/components/fly-to-cart";
import { RequestModal } from "@/components/request-modal";
import { ProgressiveBlur } from "@/components/progressive-blur";
import { Button } from "@/components/ui/button";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  Check,
  Heart,
  Home,
  Plus,
  SearchX,
  Send,
  Trash2,
} from "lucide-react";

interface IconEntry {
  name: string;
  file: string;
  category: string;
  tags: string[];
}

type SortMode = "default" | "asc" | "desc";

const ALL = "All";

export function IconGallery() {
  return (
    <CartProvider>
      <GalleryInner />
    </CartProvider>
  );
}

function GalleryInner() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { favorites, isFavorite, toggle: toggleFavorite } = useFavorites();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(ALL);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sort, setSort] = useState<SortMode>("default");
  const [requestOpen, setRequestOpen] = useState(false);
  const requestBtnRef = useRef<HTMLButtonElement>(null);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const all = icons as IconEntry[];

  const categories = useMemo(() => {
    const set = new Set<string>();
    all.forEach((i) => set.add(i.category));
    return [ALL, ...Array.from(set).sort()];
  }, [all]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { [ALL]: all.length };
    all.forEach((i) => {
      c[i.category] = (c[i.category] ?? 0) + 1;
    });
    return c;
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = all.filter((i) => {
      if (onlyFavorites && !favorites.includes(i.name)) return false;
      if (!onlyFavorites && category !== ALL && i.category !== category) return false;
      if (!q) return true;
      if (i.name.toLowerCase().includes(q)) return true;
      if (i.category.toLowerCase().includes(q)) return true;
      return i.tags.some((t) => t.toLowerCase().includes(q));
    });
    if (sort === "asc") return [...matched].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "desc") return [...matched].sort((a, b) => b.name.localeCompare(a.name));
    return matched;
  }, [all, query, category, onlyFavorites, favorites, sort]);

  const emptyState = (() => {
    if (filtered.length > 0) return null;
    if (onlyFavorites && favorites.length === 0) {
      return (
        <EmptyState
          icon={<Heart size={22} strokeWidth={1.75} />}
          title="no favorites yet"
          hint="tap the heart on any icon to save it here"
        />
      );
    }
    return (
      <EmptyState
        icon={<SearchX size={22} strokeWidth={1.75} />}
        title="nothing matches"
        hint="try a different word or clear the filter"
      />
    );
  })();


  return (
    <div className="flex h-[100dvh] gap-2 bg-background p-2 sm:gap-4 sm:p-4">
      <Sidebar
        categories={categories}
        selected={category}
        onSelect={setCategory}
        counts={counts}
        favoriteCount={favorites.length}
        onlyFavorites={onlyFavorites}
        onToggleFavorites={() => setOnlyFavorites((v) => !v)}
        totalCount={all.length}
      />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-sidebar">
        <div className="scrollbar-custom min-w-0 flex-1 overflow-y-auto">
          <main className="px-4 pt-32 pb-28 sm:px-8 sm:pt-20 sm:pb-24 md:pt-20">
            <MobileCategoryRail
              categories={categories}
              selected={category}
              onSelect={setCategory}
              counts={counts}
              favoriteCount={favorites.length}
              onlyFavorites={onlyFavorites}
              onToggleFavorites={() => setOnlyFavorites((v) => !v)}
              totalCount={all.length}
            />
            {emptyState ?? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                {filtered.map((icon) => (
                  <IconCard
                    key={icon.name}
                    name={icon.name}
                    file={icon.file}
                    category={icon.category}
                    basePath={basePath}
                    isFavorite={isFavorite(icon.name)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </main>
        </div>

        <Topbar
          theme={theme}
          onToggleTheme={toggleTheme}
          query={query}
          onQueryChange={setQuery}
          total={all.length}
        />

        {!emptyState && (
          <BottomBar
            items={filtered}
            basePath={basePath}
            sort={sort}
            onChangeSort={setSort}
            onOpenRequest={() => setRequestOpen((v) => !v)}
            requestBtnRef={requestBtnRef}
          />
        )}
      </div>

      <CartPinboard />
      <FlyToCart />
      <RequestModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        anchorRef={requestBtnRef}
      />
    </div>
  );
}

function BottomBar({
  items,
  basePath,
  sort,
  onChangeSort,
  onOpenRequest,
  requestBtnRef,
}: {
  items: IconEntry[];
  basePath: string;
  sort: SortMode;
  onChangeSort: (m: SortMode) => void;
  onOpenRequest: () => void;
  requestBtnRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
      <ProgressiveBlur direction="bottom" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "calc(100% + 1.5rem)",
          background:
            "linear-gradient(to top, var(--sidebar) 0%, transparent 100%)",
        }}
      />
      <div className="pointer-events-auto relative flex w-full flex-wrap items-center justify-center gap-1.5 px-3 pb-4 pt-10 sm:gap-2 sm:px-8 sm:pb-6">
        <Button
          ref={requestBtnRef}
          variant="secondary"
          size="lg"
          leadingIcon={Send}
          onClick={onOpenRequest}
          className="h-11 px-5 text-[14px]"
        >
          request
        </Button>
        <SortDropdown mode={sort} onChange={onChangeSort} />
        <AddAllButton items={items} basePath={basePath} />
      </div>
    </div>
  );
}

function MobileCategoryRail({
  categories,
  selected,
  onSelect,
  counts,
  favoriteCount,
  onlyFavorites,
  onToggleFavorites,
  totalCount,
}: {
  categories: string[];
  selected: string;
  onSelect: (c: string) => void;
  counts: Record<string, number>;
  favoriteCount: number;
  onlyFavorites: boolean;
  onToggleFavorites: () => void;
  totalCount: number;
}) {
  const homeActive = !onlyFavorites && selected === ALL;
  const tagCategories = categories.filter((c) => c !== ALL);

  const chipBase =
    "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[12.5px] font-medium transition-colors duration-[180ms]";
  const chipActive = "border-foreground bg-foreground text-background";
  const chipInactive =
    "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground";

  return (
    <div className="no-scrollbar -mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 md:hidden">
      <button
        type="button"
        onClick={() => {
          if (onlyFavorites) onToggleFavorites();
          onSelect(ALL);
        }}
        className={cn(chipBase, homeActive ? chipActive : chipInactive)}
      >
        <Home size={13} strokeWidth={homeActive ? 2 : 1.5} />
        <span>home</span>
        <span className="tabular-nums opacity-70">{totalCount}</span>
      </button>
      <button
        type="button"
        onClick={onToggleFavorites}
        className={cn(chipBase, onlyFavorites ? chipActive : chipInactive)}
      >
        <Heart
          size={13}
          strokeWidth={onlyFavorites ? 2 : 1.5}
          className={onlyFavorites ? "fill-current" : ""}
        />
        <span>favorites</span>
        <span className="tabular-nums opacity-70">{favoriteCount}</span>
      </button>
      {tagCategories.map((cat) => {
        const active = !onlyFavorites && selected === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => {
              if (onlyFavorites) onToggleFavorites();
              onSelect(cat);
            }}
            className={cn(chipBase, active ? chipActive : chipInactive)}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                active ? "bg-background" : "bg-muted-foreground/60"
              )}
            />
            <span>{cat.toLowerCase()}</span>
            <span className="tabular-nums opacity-70">{counts[cat] ?? 0}</span>
          </button>
        );
      })}
    </div>
  );
}

const SORT_OPTIONS: { mode: SortMode; label: string; Icon: typeof ArrowUpDown }[] = [
  { mode: "default", label: "default order", Icon: ArrowUpDown },
  { mode: "asc", label: "a to z", Icon: ArrowDownAZ },
  { mode: "desc", label: "z to a", Icon: ArrowUpAZ },
];

function SortDropdown({
  mode,
  onChange,
}: {
  mode: SortMode;
  onChange: (m: SortMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = SORT_OPTIONS.find((o) => o.mode === mode) ?? SORT_OPTIONS[0];

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        variant="secondary"
        size="lg"
        leadingIcon={active.Icon}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="h-11 px-5 text-[14px]"
      >
        {active.label}
      </Button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            role="listbox"
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: "bottom left" }}
            className="absolute bottom-full left-0 mb-2 w-48 rounded-xl border border-border bg-card p-1 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.6),_0_8px_16px_-6px_rgba(0,0,0,0.35)]"
          >
            {SORT_OPTIONS.map((opt) => {
              const selected = mode === opt.mode;
              const OptIcon = opt.Icon;
              return (
                <button
                  key={opt.mode}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(opt.mode);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[14px] transition-colors duration-[180ms]",
                    selected
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  )}
                >
                  <OptIcon size={14} strokeWidth={1.75} className="shrink-0" />
                  <span className="flex-1">{opt.label}</span>
                  {selected && <Check size={14} strokeWidth={2} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ADD_ALL_DURATION_MS = 2200;
const FLIGHT_DURATION_MS = 500;
const FIRE_WINDOW_MS = ADD_ALL_DURATION_MS - FLIGHT_DURATION_MS;
const MAX_FLIES = 22;

function AddAllButton({
  items,
  basePath,
}: {
  items: IconEntry[];
  basePath: string;
}) {
  const { add, has, remove } = useCart();
  const ref = useRef<HTMLButtonElement>(null);
  const pending = useMemo(() => items.filter((i) => !has(i.name)), [items, has]);
  const allAdded = items.length > 0 && pending.length === 0;

  const handleClick = () => {
    if (allAdded) {
      items.forEach((icon) => remove(icon.name));
      return;
    }
    const el = ref.current;
    if (!el) return;
    const btnRect = el.getBoundingClientRect();
    const fallback = {
      x: btnRect.left + btnRect.width / 2,
      y: btnRect.top + btnRect.height / 2,
      size: 72,
    };

    const visible: IconEntry[] = [];
    for (const icon of pending) {
      const card = document.querySelector<HTMLImageElement>(
        `[data-icon-card="${CSS.escape(icon.name)}"]`
      );
      if (!card) continue;
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      if (cy > 0 && cy < window.innerHeight && cx > 0 && cx < window.innerWidth) {
        visible.push(icon);
      }
    }

    for (let i = visible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [visible[i], visible[j]] = [visible[j], visible[i]];
    }

    const flyCount = Math.min(visible.length, MAX_FLIES);
    const flies = visible.slice(0, flyCount);
    const flySet = new Set(flies.map((i) => i.name));

    for (const icon of pending) {
      if (flySet.has(icon.name)) continue;
      add(
        { name: icon.name, file: icon.file, url: `${basePath}/icons/${icon.file}` },
        fallback,
        { silent: true }
      );
    }

    flies.forEach((icon, i) => {
      const t = flyCount > 1 ? i / (flyCount - 1) : 0;
      const eased = t * t;
      const delay = eased * FIRE_WINDOW_MS;
      window.setTimeout(() => {
        let from = fallback;
        const card = document.querySelector<HTMLImageElement>(
          `[data-icon-card="${CSS.escape(icon.name)}"]`
        );
        if (card) {
          const r = card.getBoundingClientRect();
          from = {
            x: r.left + r.width / 2,
            y: r.top + r.height / 2,
            size: r.width,
          };
        }
        add(
          { name: icon.name, file: icon.file, url: `${basePath}/icons/${icon.file}` },
          from,
          { compact: true }
        );
      }, delay);
    });
  };

  return (
    <Button
      ref={ref}
      variant="secondary"
      size="lg"
      leadingIcon={allAdded ? Trash2 : Plus}
      onClick={handleClick}
      disabled={items.length === 0}
      className="h-11 px-5 text-[14px]"
    >
      {allAdded ? `remove all (${items.length})` : `add all (${pending.length})`}
    </Button>
  );
}

function EmptyState({
  icon,
  title,
  hint,
}: {
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <div className="grid place-items-center py-28 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-muted-foreground">{icon}</span>
        <p className="text-[14px] font-medium text-foreground">{title}</p>
        <p className="text-[13px] text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}
