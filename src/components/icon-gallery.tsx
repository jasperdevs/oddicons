"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { useRouter } from "next/navigation";
import { Select } from "@base-ui/react";
import icons from "@/data/icons.json";
import { OddIcon, oddIconComponent } from "@/components/ui/odd-icon";
import { useFavorites } from "@/hooks/use-favorites";
import { useTheme } from "@/hooks/use-theme";
import { CartProvider, useCart } from "@/lib/cart-context";
import { SettingsProvider, useSettings } from "@/lib/settings-context";
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
import { fontWeights } from "@/lib/font-weight";
import { springs } from "@/lib/springs";
import { iconMiniUrl } from "@/lib/icon-url";
const PlusIcon = oddIconComponent("plus");
const TrashIcon = oddIconComponent("trash");
const SendIcon = oddIconComponent("send");
const SortIcon = oddIconComponent("sort");
const SortAzIcon = oddIconComponent("sort-az");
const SortAzAscendingIcon = oddIconComponent("sort-az-ascending");

interface IconEntry {
  name: string;
  file: string;
  category: string;
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    const urls = all.map((icon) => iconMiniUrl(icon.file));
    const preload = () => {
      let index = 0;
      const loadNext = () => {
        if (cancelled || index >= urls.length) return;
        const img = new Image();
        img.decoding = "async";
        img.src = urls[index];
        index += 1;
        window.setTimeout(loadNext, 18);
      };
      loadNext();
    };
    const idle = window.requestIdleCallback?.(preload, { timeout: 1200 });
    const fallback = idle === undefined ? window.setTimeout(preload, 600) : undefined;
    return () => {
      cancelled = true;
      if (idle !== undefined) window.cancelIdleCallback?.(idle);
      if (fallback !== undefined) window.clearTimeout(fallback);
    };
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = all.filter((i) => {
      if (onlyFavorites && !favorites.includes(i.name)) return false;
      if (!onlyFavorites && category !== ALL && i.category !== category) return false;
      if (!q) return true;
      if (i.name.toLowerCase().includes(q)) return true;
      return i.category.toLowerCase().includes(q);
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
          icon={<OddIcon name="heart" size={48} />}
          title="no favorites yet"
          hint="tap the heart on any icon to save it here"
        />
      );
    }
    return (
      <EmptyState
        icon={<OddIcon name="search" size={48} />}
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
                : "pt-24 pb-44 min-[390px]:pb-36 sm:pt-20 sm:pb-24 md:pt-20"
            )}
          >
            {isUsage ? (
              <UsageContent />
            ) : isDonate ? (
              <DonateContent />
            ) : (
              emptyState ?? (
                <LazyGrid
                  items={filtered}
                  basePath={basePath}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                />
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
          items={all}
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
            onOpenRequest={() => setRequestOpen((value) => !value)}
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

const LAZY_INITIAL = 36;
const LAZY_STEP = 36;

function LazyGrid({
  items,
  basePath,
  isFavorite,
  onToggleFavorite,
}: {
  items: IconEntry[];
  basePath: string;
  isFavorite: (name: string) => boolean;
  onToggleFavorite: (name: string) => void;
}) {
  const [limit, setLimit] = useState(LAZY_INITIAL);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLimit(LAZY_INITIAL);
  }, [items]);

  useEffect(() => {
    if (limit >= items.length) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLimit((l) => Math.min(l + LAZY_STEP, items.length));
        }
      },
      { rootMargin: "600px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [limit, items.length]);

  const visible = items.slice(0, limit);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
        {visible.map((icon) => (
          <IconCard
            key={icon.name}
            name={icon.name}
            file={icon.file}
            category={icon.category}
            basePath={basePath}
            isFavorite={isFavorite(icon.name)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
      {limit < items.length && (
        <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
      )}
    </>
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
          type="button"
          variant="secondary"
          size="lg"
          leadingIcon={SendIcon}
          onClick={onOpenRequest}
          className="h-10 px-3 text-[13px] sm:h-11 sm:px-5 sm:text-[14px]"
        >
          request
        </Button>
        <SortDropdown mode={sort} onChange={onChangeSort} />
        <AddAllButton items={items} basePath={basePath} />
      </div>
    </div>
  );
}

const SORT_OPTIONS: { mode: SortMode; label: string; Icon: typeof PlusIcon }[] = [
  { mode: "default", label: "default order", Icon: SortIcon },
  { mode: "asc", label: "a to z", Icon: SortAzIcon },
  { mode: "desc", label: "z to a", Icon: SortAzAscendingIcon },
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
            className="h-10 px-3 text-[13px] sm:h-11 sm:px-5 sm:text-[14px]"
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
              "shadow-[0_8px_20px_-8px_rgba(0,0,0,0.4),_0_2px_4px_-2px_rgba(0,0,0,0.2)]",
              "origin-[var(--transform-origin)] outline-none",
              "transition-[opacity,transform,filter] duration-[150ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]",
              "data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.94] data-[starting-style]:translate-y-2 data-[starting-style]:blur-[6px]",
              "data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.97] data-[ending-style]:translate-y-1 data-[ending-style]:blur-[3px]"
            )}
          >
            {SORT_OPTIONS.map((opt) => {
              const OptIcon = opt.Icon;
              return (
                <Select.Item
                  key={opt.mode}
                  value={opt.mode}
                  render={(props, state) => (
                    <div
                      {...props}
                      className={cn(
                        "relative flex cursor-pointer select-none items-center gap-2 rounded-lg py-2 pl-3 pr-8 text-[14px] outline-none transition-[color,background-color,font-variation-settings] duration-[140ms]",
                        state.highlighted
                          ? "bg-accent text-foreground"
                          : state.selected
                            ? "text-foreground"
                            : "text-muted-foreground"
                      )}
                      style={{
                        fontVariationSettings: state.selected
                          ? fontWeights.semibold
                          : state.highlighted
                            ? fontWeights.medium
                            : fontWeights.normal,
                      }}
                    >
                      <OptIcon
                        size={14}
                        strokeWidth={state.selected || state.highlighted ? 2 : 1.5}
                        className="shrink-0 transition-[stroke-width] duration-[140ms]"
                      />
                      <Select.ItemText className="flex-1">{opt.label}</Select.ItemText>
                      <Select.ItemIndicator className="absolute right-2 inline-flex">
                        <OddIcon name="check" size={14} />
                      </Select.ItemIndicator>
                    </div>
                  )}
                />
              );
            })}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

const ADD_ALL_SHOW_MS = 1800;
const ADD_ALL_VISIBLE_FLIGHTS = 72;
const RINGS = [0, 1, 2, 3];
const SPARK_COUNT = 16;

function AddAllButton({
  items,
  basePath,
}: {
  items: IconEntry[];
  basePath: string;
}) {
  const { add, has, remove } = useCart();
  const { settings } = useSettings();
  const ref = useRef<HTMLButtonElement>(null);
  const bumpControls = useAnimation();
  const rumbleControls = useAnimation();
  const flashControls = useAnimation();
  const [burstId, setBurstId] = useState<number | null>(null);
  const pending = useMemo(() => items.filter((i) => !has(i.name)), [items, has]);
  const allAdded = items.length > 0 && pending.length === 0;

  const sparks = useMemo(() => {
    if (burstId === null) return [];
    return Array.from({ length: SPARK_COUNT }, (_, i) => {
      const base = (i / SPARK_COUNT) * Math.PI * 2;
      const angle = base + (Math.random() - 0.5) * 0.45;
      const distance = 42 + Math.random() * 46;
      const delay = Math.random() * 0.05;
      return { id: i, angle, distance, delay };
    });
  }, [burstId]);

  const handleClick = () => {
    if (allAdded) {
      items.forEach((icon) => remove(icon.name));
      bumpControls.start({
        scale: [1, 0.9, 1.06, 1],
        transition: { duration: 0.34, ease: [0.2, 0.8, 0.2, 1] },
      });
      return;
    }
    const el = ref.current;
    if (!el) return;
    const btnRect = el.getBoundingClientRect();
    const origin = {
      x: btnRect.left + btnRect.width / 2,
      y: btnRect.top + btnRect.height / 2,
      size: Math.max(56, btnRect.height * 1.1),
    };

    const shuffled = pending.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    if (shuffled.length === 0) return;

    setBurstId(Date.now());
    bumpControls.start({
      scale: [1, 0.8, 1.2, 0.92, 1.07, 1],
      transition: {
        duration: 0.68,
        times: [0, 0.14, 0.36, 0.6, 0.82, 1],
        ease: [0.2, 0.8, 0.2, 1],
      },
    });
    flashControls.start({
      opacity: [0, 0.55, 0],
      transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
    });

    const rumbleSteps = 24;
    const rumbleX: number[] = [0];
    const rumbleY: number[] = [0];
    for (let i = 0; i < rumbleSteps; i++) {
      const fade = 1 - i / rumbleSteps;
      rumbleX.push((Math.random() - 0.5) * 1.2 * fade);
      rumbleY.push((Math.random() - 0.5) * 1.2 * fade);
    }
    rumbleX.push(0);
    rumbleY.push(0);
    rumbleControls.start({
      x: rumbleX,
      y: rumbleY,
      transition: { duration: ADD_ALL_SHOW_MS / 1000, ease: "linear" },
    });

    const visibleNames = new Set(
      shuffled.slice(0, ADD_ALL_VISIBLE_FLIGHTS).map((icon) => icon.name)
    );

    shuffled.forEach((icon, i) => {
      const t = shuffled.length > 1 ? i / (shuffled.length - 1) : 0;
      const baseDelay = t * ADD_ALL_SHOW_MS;
      const jitter = (Math.random() - 0.5) * 28;
      const delay = Math.max(0, Math.min(ADD_ALL_SHOW_MS, baseDelay + jitter));
      const visible = visibleNames.has(icon.name);
      const angle = Math.random() * Math.PI * 2;
      const radius = 4 + Math.random() * 18;
      const from = {
        x: origin.x + Math.cos(angle) * radius,
        y: origin.y + Math.sin(angle) * radius,
        size: 48,
      };
      window.setTimeout(() => {
        add(
          {
            name: icon.name,
            file: icon.file,
            url: `${basePath}/icons/${icon.file}`,
            monochrome: settings.monochrome,
          },
          from,
          { compact: true, silent: !visible }
        );
      }, delay);
    });
  };

  return (
    <motion.div
      className="relative"
      animate={bumpControls}
      style={{ transformOrigin: "center" }}
    >
      <AnimatePresence onExitComplete={() => setBurstId(null)}>
        {burstId !== null && (
          <motion.span
            key={burstId}
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {RINGS.map((idx) => (
              <motion.span
                key={`ring-${idx}`}
                className="absolute left-1/2 top-1/2 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/50 shadow-[0_0_24px_rgba(255,255,255,0.22)]"
                initial={{ scale: 0.55, opacity: 0.9 - idx * 0.18 }}
                animate={{ scale: 2.25 + idx * 0.62, opacity: 0 }}
                transition={{
                  duration: 0.72 + idx * 0.12,
                  delay: idx * 0.09,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            ))}
            <motion.span
              className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background shadow-[0_0_0_1px_rgba(255,255,255,0.18),_0_0_36px_rgba(255,255,255,0.28)]"
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{ scale: [0.2, 1.05, 0.45, 0.9, 0], opacity: [0, 0.9, 0.7, 0.5, 0] }}
              transition={{ duration: ADD_ALL_SHOW_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
            />
            {sparks.map((s) => (
              <motion.span
                key={`spark-${s.id}`}
                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-[0_0_12px_currentColor]"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                animate={{
                  x: Math.cos(s.angle) * s.distance,
                  y: Math.sin(s.angle) * s.distance,
                  opacity: [0, 1, 1, 0],
                  scale: [0.4, 1, 0.9, 0.2],
                }}
                transition={{
                  duration: 0.58,
                  delay: s.delay,
                  times: [0, 0.18, 0.6, 1],
                  ease: [0.33, 0.98, 0.43, 1],
                }}
              />
            ))}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl bg-foreground mix-blend-overlay"
        initial={{ opacity: 0 }}
        animate={flashControls}
      />
      <motion.div animate={rumbleControls}>
        <Button
          ref={ref}
          variant="secondary"
          size="lg"
          leadingIcon={allAdded ? TrashIcon : PlusIcon}
          onClick={handleClick}
          disabled={items.length === 0}
          className="h-10 px-3 text-[13px] sm:h-11 sm:px-5 sm:text-[14px]"
        >
          {allAdded ? `remove all (${items.length})` : `add all (${pending.length})`}
        </Button>
      </motion.div>
    </motion.div>
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
