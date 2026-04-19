"use client";

import { useMemo, useRef, useState } from "react";
import icons from "@/data/icons.json";
import { useFavorites } from "@/hooks/use-favorites";
import { useTheme } from "@/hooks/use-theme";
import { CartProvider, useCart } from "@/lib/cart-context";
import { Topbar } from "@/components/topbar";
import { Sidebar } from "@/components/sidebar";
import { IconCard } from "@/components/icon-card";
import { CartPinboard } from "@/components/cart-pinboard";
import { FlyToCart } from "@/components/fly-to-cart";
import { Button } from "@/components/ui/button";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  Heart,
  Plus,
  SearchX,
} from "lucide-react";

interface IconEntry {
  name: string;
  file: string;
  category: string;
  tags: string[];
}

type SortMode = "default" | "asc" | "desc";

const ALL = "All";
const SORT_CYCLE: Record<SortMode, SortMode> = {
  default: "asc",
  asc: "desc",
  desc: "default",
};

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
          title="No favorites yet"
          hint="Tap the heart on any icon to save it here."
        />
      );
    }
    return (
      <EmptyState
        icon={<SearchX size={22} strokeWidth={1.75} />}
        title="Nothing matches"
        hint="Try a different word or clear the filter."
      />
    );
  })();

  const cycleSort = () => setSort((s) => SORT_CYCLE[s]);

  return (
    <div className="flex h-screen gap-3 bg-background p-3">
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
        <div className="scrollbar-custom fade-bottom min-w-0 flex-1 overflow-y-auto">
          <Topbar
            theme={theme}
            onToggleTheme={toggleTheme}
            query={query}
            onQueryChange={setQuery}
            total={all.length}
          />

          <main className="px-6 pb-12 sm:px-8">
            <div className="mx-auto w-full max-w-[1400px]">
              <section className="mt-3">
                {!emptyState && (
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="text-[11.5px] tabular-nums text-muted-foreground">
                      {filtered.length} icon{filtered.length === 1 ? "" : "s"}
                    </div>
                    <div className="flex items-center gap-2">
                      <SortButton mode={sort} onCycle={cycleSort} />
                      <AddAllButton items={filtered} basePath={basePath} />
                    </div>
                  </div>
                )}
                {emptyState ?? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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
              </section>
            </div>
          </main>
        </div>
      </div>

      <CartPinboard />
      <FlyToCart />
    </div>
  );
}

function SortButton({ mode, onCycle }: { mode: SortMode; onCycle: () => void }) {
  const label =
    mode === "asc" ? "Sort A-Z" : mode === "desc" ? "Sort Z-A" : "Sort default";
  const Icon = mode === "asc" ? ArrowDownAZ : mode === "desc" ? ArrowUpAZ : ArrowUpDown;
  return (
    <Button
      variant="ghost"
      size="md"
      leadingIcon={Icon}
      onClick={onCycle}
      className="bg-[var(--button)] text-foreground hover:bg-[var(--button)]/80 hover:text-foreground"
    >
      {label}
    </Button>
  );
}

function AddAllButton({
  items,
  basePath,
}: {
  items: IconEntry[];
  basePath: string;
}) {
  const { add, has } = useCart();
  const ref = useRef<HTMLButtonElement>(null);
  const pending = useMemo(() => items.filter((i) => !has(i.name)), [items, has]);
  const disabled = pending.length === 0;

  const handleClick = () => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const from = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      size: 36,
    };
    pending.forEach((icon, i) => {
      setTimeout(() => {
        add(
          { name: icon.name, file: icon.file, url: `${basePath}/icons/${icon.file}` },
          from
        );
      }, i * 45);
    });
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="md"
      leadingIcon={Plus}
      onClick={handleClick}
      disabled={disabled}
      className="bg-[var(--button)] text-foreground hover:bg-[var(--button)]/80 hover:text-foreground"
    >
      {disabled ? "All pinned" : `Pin ${pending.length}`}
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
    <div className="grid place-items-center rounded-xl bg-card/60 py-24 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-[14px] font-medium text-foreground">{title}</p>
          <p className="text-[12px] text-muted-foreground">{hint}</p>
        </div>
      </div>
    </div>
  );
}
