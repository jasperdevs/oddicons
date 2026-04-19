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

  return (
    <div className="flex min-h-screen">
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

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar theme={theme} onToggleTheme={toggleTheme} />

        <main className="relative min-w-0 flex-1 px-6 pb-28 sm:px-10">
          <div className="mx-auto w-full max-w-6xl">
            <div className="pt-2">
              <SearchBar
                value={query}
                onChange={setQuery}
                total={all.length}
                visible={filtered.length}
              />
            </div>

            <section className="mt-6">
              {filtered.length === 0 ? (
                <div className="grid place-items-center rounded-xl bg-muted/40 py-20 text-center">
                  <p className="text-[14px] text-muted-foreground">
                    {onlyFavorites && favorites.length === 0
                      ? "No favorites yet — tap the heart on any icon."
                      : "No icons match that search."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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

          <div
            aria-hidden
            className="pointer-events-none fixed inset-x-0 bottom-0 z-30 h-28 bg-gradient-to-t from-background via-background/80 to-transparent"
          />
        </main>
      </div>

      <CartDrawer />
      <FlyToCart />
    </div>
  );
}
