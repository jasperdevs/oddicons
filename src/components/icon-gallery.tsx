"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@base-ui/react";
import icons from "@/data/icons.json";
import { useFavorites } from "@/hooks/use-favorites";
import { useTheme } from "@/hooks/use-theme";
import { CartProvider, useCart } from "@/lib/cart-context";
import { SettingsProvider } from "@/lib/settings-context";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slug";
import { Topbar } from "@/components/topbar";
import { Sidebar } from "@/components/sidebar";
import { MobileDrawer } from "@/components/mobile-drawer";
import { IconCard } from "@/components/icon-card";
import { CartPinboard } from "@/components/cart-pinboard";
import { FlyToCart } from "@/components/fly-to-cart";
import { RequestModal } from "@/components/request-modal";
import { UsageContent } from "@/components/usage-content";
import { DonateContent } from "@/components/donate-content";
import { ProgressiveBlur } from "@/components/progressive-blur";
import { Button, type ButtonProps } from "@/components/ui/button";
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

export type View =
  | { type: "all" }
  | { type: "favorites" }
  | { type: "category"; slug: string }
  | { type: "usage" }
  | { type: "donate" };

const ALL = "All";

export function IconGallery({ view = { type: "all" } }: { view?: View }) {
  return (
    <SettingsProvider>
      <CartProvider>
        <GalleryInner view={view} />
      </CartProvider>
    </SettingsProvider>
  );
}

function GalleryInner({ view }: { view: View }) {
  const router = useRouter();
  const { theme, toggle: toggleTheme } = useTheme();
  const { favorites, isFavorite, toggle: toggleFavorite } = useFavorites();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("default");
  const [requestOpen, setRequestOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const requestBtnRef = useRef<HTMLButtonElement>(null);

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const all = icons as IconEntry[];

  const categories = useMemo(() => {
    const set = new Set<string>();
    all.forEach((i) => set.add(i.category));
    return [ALL, ...Array.from(set).sort()];
  }, [all]);

  const onlyFavorites = view.type === "favorites";
  const isUsage = view.type === "usage";
  const isDonate = view.type === "donate";
  const isInfoView = isUsage || isDonate;
  const category = useMemo(() => {
    if (view.type !== "category") return ALL;
    const match = categories.find((c) => slugify(c) === view.slug);
    return match ?? ALL;
  }, [view, categories]);

  const selectCategory = (cat: string) => {
    if (cat === ALL) router.push("/");
    else router.push(`/category/${slugify(cat)}/`);
  };

  const goFavorites = () => router.push("/favorites/");
  const goHome = () => router.push("/");
  const goUsage = () => router.push("/usage/");
  const goDonate = () => router.push("/donate/");

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
        onSelect={selectCategory}
        counts={counts}
        favoriteCount={favorites.length}
        onlyFavorites={onlyFavorites}
        onToggleFavorites={onlyFavorites ? goHome : goFavorites}
        totalCount={all.length}
        usageActive={isUsage}
        donateActive={isDonate}
        onOpenUsage={goUsage}
        onOpenDonate={goDonate}
      />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-sidebar">
        <div className="scrollbar-custom min-w-0 flex-1 overflow-y-auto">
          <main
            className={cn(
              "px-4 sm:px-8",
              isInfoView
                ? "pt-24 pb-10 sm:pt-24 md:pt-24"
                : "pt-24 pb-28 sm:pt-20 sm:pb-24 md:pt-20"
            )}
          >
            {isUsage ? (
              <UsageContent />
            ) : isDonate ? (
              <DonateContent />
            ) : (
              emptyState ?? (
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
              )
            )}
          </main>
        </div>

        <Topbar
          theme={theme}
          onToggleTheme={toggleTheme}
          query={query}
          onQueryChange={setQuery}
          total={all.length}
          onOpenMenu={() => setMenuOpen(true)}
          hideSearch={isInfoView}
          title={isUsage ? "usage" : isDonate ? "donate" : undefined}
        />

        {!isInfoView && !emptyState && (
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

      <MobileDrawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        categories={categories}
        selected={category}
        onSelect={selectCategory}
        counts={counts}
        favoriteCount={favorites.length}
        onlyFavorites={onlyFavorites}
        onToggleFavorites={onlyFavorites ? goHome : goFavorites}
        totalCount={all.length}
        usageActive={isUsage}
        donateActive={isDonate}
        onOpenUsage={goUsage}
        onOpenDonate={goDonate}
      />

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
  const active = SORT_OPTIONS.find((o) => o.mode === mode) ?? SORT_OPTIONS[0];
  const ActiveIcon = active.Icon;

  return (
    <Select.Root value={mode} onValueChange={(v) => onChange(v as SortMode)}>
      <Select.Trigger
        render={(props) => (
          <Button
            {...(props as ButtonProps)}
            type="button"
            variant="secondary"
            size="lg"
            leadingIcon={ActiveIcon}
            className="h-11 px-5 text-[14px]"
          >
            {active.label}
          </Button>
        )}
      />
      <Select.Portal>
        <Select.Positioner side="top" align="start" sideOffset={8} className="z-[60]">
          <Select.Popup
            className={cn(
              "min-w-[var(--anchor-width)] rounded-xl border border-border bg-card p-1 text-foreground",
              "shadow-[0_24px_48px_-16px_rgba(0,0,0,0.6),_0_8px_16px_-6px_rgba(0,0,0,0.35)]",
              "origin-[var(--transform-origin)] outline-none",
              "transition-all duration-[180ms] ease-out",
              "data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:translate-y-1",
              "data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.97] data-[ending-style]:translate-y-1"
            )}
          >
            {SORT_OPTIONS.map((opt) => {
              const OptIcon = opt.Icon;
              return (
                <Select.Item
                  key={opt.mode}
                  value={opt.mode}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center gap-2 rounded-lg py-2 pl-3 pr-8 text-[14px] text-muted-foreground outline-none",
                    "data-[highlighted]:bg-accent data-[highlighted]:text-foreground",
                    "data-[selected]:text-foreground"
                  )}
                >
                  <OptIcon size={14} strokeWidth={1.75} className="shrink-0" />
                  <Select.ItemText className="flex-1">{opt.label}</Select.ItemText>
                  <Select.ItemIndicator className="absolute right-2 inline-flex">
                    <Check size={14} strokeWidth={2} />
                  </Select.ItemIndicator>
                </Select.Item>
              );
            })}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
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
