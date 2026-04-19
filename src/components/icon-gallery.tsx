"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  ArrowUpDown,
  Check,
  Heart,
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


  return (
    <div className="flex h-screen gap-4 bg-background p-4">
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
          <Topbar
            theme={theme}
            onToggleTheme={toggleTheme}
            query={query}
            onQueryChange={setQuery}
            total={all.length}
          />

          <main className="px-6 pb-24 sm:px-8">
            <div className="w-full">
              <section className="mt-6">
                {emptyState ?? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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

        {!emptyState && (
          <BottomBar
            items={filtered}
            basePath={basePath}
            sort={sort}
            onChangeSort={setSort}
          />
        )}
      </div>

      <CartPinboard />
      <FlyToCart />
    </div>
  );
}

function BottomBar({
  items,
  basePath,
  sort,
  onChangeSort,
}: {
  items: IconEntry[];
  basePath: string;
  sort: SortMode;
  onChangeSort: (m: SortMode) => void;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to top, var(--sidebar) 0%, var(--sidebar) 55%, transparent 100%)",
        }}
      />
      <div className="pointer-events-auto relative flex w-full items-center justify-center gap-3 px-6 pb-6 pt-10 sm:px-8">
        <RequestButton />
        <SortDropdown mode={sort} onChange={onChangeSort} />
        <AddAllButton items={items} basePath={basePath} />
      </div>
    </div>
  );
}

function RequestButton() {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      size="md"
      leadingIcon={Send}
      onClick={() => router.push("/request")}
      className="h-11 px-5 text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      request
    </Button>
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
        variant="ghost"
        size="md"
        leadingIcon={active.Icon}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="h-11 px-5 text-muted-foreground hover:bg-accent hover:text-foreground"
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
            className="absolute bottom-full left-0 mb-2 w-48 rounded-xl border border-border bg-card p-1 shadow-lg"
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
    const rect = el.getBoundingClientRect();
    const from = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      size: 20,
    };
    pending.forEach((icon, i) => {
      window.setTimeout(() => {
        add(
          { name: icon.name, file: icon.file, url: `${basePath}/icons/${icon.file}` },
          from,
          { compact: true }
        );
      }, i * 35);
    });
  };

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="md"
      leadingIcon={allAdded ? Trash2 : Plus}
      onClick={handleClick}
      disabled={items.length === 0}
      className="h-10 text-muted-foreground hover:bg-accent hover:text-foreground"
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
    <div className="grid place-items-center rounded-2xl bg-card py-24 text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </span>
        <div className="flex flex-col gap-1">
          <p className="text-[16px] font-medium text-foreground">{title}</p>
          <p className="text-[14px] text-muted-foreground">{hint}</p>
        </div>
      </div>
    </div>
  );
}
