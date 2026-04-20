"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Tooltip } from "@/components/ui/tooltip";
import { OddIcon } from "@/components/ui/odd-icon";
import { SearchBar } from "@/components/search-bar";
import { ProgressiveBlur } from "@/components/progressive-blur";
import { SettingsPopover } from "@/components/settings-popover";
import { GitHubStars } from "@/components/github-stars";
import { useCart } from "@/lib/cart-context";
import { springs } from "@/lib/springs";
import { cn } from "@/lib/utils";

interface IconEntry {
  name: string;
  file: string;
  category: string;
}

interface TopbarProps {
  theme: "dark" | "light";
  onToggleTheme: (origin?: { x: number; y: number }) => void;
  query: string;
  onQueryChange: (q: string) => void;
  total: number;
  items: IconEntry[];
  onOpenMenu?: () => void;
  hideSearch?: boolean;
  title?: string;
}

export function Topbar({
  theme,
  onToggleTheme,
  query,
  onQueryChange,
  total,
  items,
  onOpenMenu,
  hideSearch,
  title,
}: TopbarProps) {
  const { items: cartItems, setCartAnchor, setOpen, bumpCount } = useCart();
  const cartRef = useRef<HTMLButtonElement>(null);
  const bumpControls = useAnimation();

  useEffect(() => {
    setCartAnchor(cartRef.current);
    return () => setCartAnchor(null);
  }, [setCartAnchor]);

  useEffect(() => {
    if (bumpCount === 0) return;
    bumpControls.start({
      scale: [1, 1.14, 0.98, 1],
      transition: { duration: 0.4, ease: [0.2, 0.8, 0.2, 1] },
    });
  }, [bumpCount, bumpControls]);

  const handleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    onToggleTheme({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 sm:px-8">
      <ProgressiveBlur direction="top" strength={1.8} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10"
        style={{
          height: "calc(100% + 3rem)",
          background:
            "linear-gradient(to bottom, var(--sidebar) 0%, var(--sidebar) 35%, transparent 100%)",
        }}
      />

      <div className="pointer-events-auto relative mx-auto flex w-full items-center gap-1.5 py-4 sm:gap-3 sm:py-5">
        {onOpenMenu && (
          <Tooltip content="menu">
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="open menu"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground transition-colors duration-[180ms] hover:bg-foreground/5 md:hidden"
            >
              <OddIcon name="menu" size={20} />
            </button>
          </Tooltip>
        )}

        <div className="min-w-0 flex-1">
          {hideSearch ? (
            <div className="flex h-11 items-center">
              <span className="truncate text-[18px] font-semibold tracking-tight text-foreground">
                {title ?? ""}
              </span>
            </div>
          ) : (
            <SearchBar value={query} onChange={onQueryChange} total={total} items={items} />
          )}
        </div>

        <div className="relative flex h-11 shrink-0 items-center rounded-xl bg-muted">
          <Tooltip content={theme === "dark" ? "light mode" : "dark mode"}>
            <button
              type="button"
              onClick={handleTheme}
              aria-label="toggle theme"
              className="grid h-11 w-11 place-items-center overflow-hidden rounded-l-xl text-foreground transition-colors duration-[180ms] hover:bg-foreground/5"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -140, scale: 0.3, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 140, scale: 0.3, opacity: 0 }}
                  transition={springs.moderate}
                  className="inline-flex"
                >
                  {theme === "dark" ? <OddIcon name="sun" size={20} /> : <OddIcon name="moon" size={20} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </Tooltip>

          <GitHubStars />

          <SettingsPopover />

          <Tooltip content="open cart">
            <motion.button
              ref={cartRef}
              type="button"
              animate={bumpControls}
              style={{ transformOrigin: "center" }}
              onClick={() => setOpen(true)}
              aria-label="open cart"
              className="flex h-11 items-center gap-1.5 rounded-r-xl px-3 text-[14px] font-medium text-foreground transition-colors duration-[180ms] hover:bg-foreground/5 sm:gap-2 sm:px-4"
            >
              <OddIcon name="cart" size={20} />
              <span
                className={cn(
                  "tabular-nums transition-colors duration-[180ms]",
                  cartItems.length === 0 && "text-muted-foreground"
                )}
              >
                {cartItems.length}
              </span>
            </motion.button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
