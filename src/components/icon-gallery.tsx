"use client";

import { useMemo, useState } from "react";
import icons from "@/data/icons.json";
import { useFavorites } from "@/hooks/use-favorites";
import { useTheme } from "@/hooks/use-theme";
import { CartProvider } from "@/lib/cart-context";
import { Topbar } from "@/components/topbar";
import { SearchBar } from "@/components/search-bar";
import { Sidebar } from "@/components/sidebar";
import { IconCard } from "@/components/icon-card";
import { CartDrawer } from "@/components/cart-drawer";
import { FlyToCart } from "@/components/fly-to-cart";
import { Heart, SearchX } from "lucide-react";

interface IconEntry {
  name: string;
  file: string;
  category: string;
  tags: string[];
}

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
    return all.filter((i) => {
      if (onlyFavorites && !favorites.includes(i.name)) return false;
      if (!onlyFavorites && category !== ALL && i.category !== category) return false;
      if (!q) return true;
      if (i.name.toLowerCase().includes(q)) return true;
      if (i.category.toLowerCase().includes(q)) return true;
      return i.tags.some((t) => t.toLowerCase().includes(q));
    });
  }, [all, query, category, onlyFavorites, favorites]);

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
        <Topbar theme={theme} onToggleTheme={toggleTheme} />

        <main className="scrollbar-custom fade-bottom min-w-0 flex-1 overflow-y-auto px-6 pb-12 sm:px-8">
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="pt-1">
              <SearchBar
                value={query}
                onChange={setQuery}
                total={all.length}
                visible={filtered.length}
              />
            </div>

            <section className="mt-4">
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

      <CartDrawer />
      <FlyToCart />
    </div>
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
