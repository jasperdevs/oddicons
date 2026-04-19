"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Menu, Moon, ShoppingBag, Sun } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { SearchBar } from "@/components/search-bar";
import { ProgressiveBlur } from "@/components/progressive-blur";
import { SettingsPopover } from "@/components/settings-popover";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";

interface TopbarProps {
  theme: "dark" | "light";
  onToggleTheme: (origin?: { x: number; y: number }) => void;
  query: string;
  onQueryChange: (q: string) => void;
  total: number;
  onOpenMenu?: () => void;
}

export function Topbar({
  theme,
  onToggleTheme,
  query,
  onQueryChange,
  total,
  onOpenMenu,
}: TopbarProps) {
  const { items, setCartAnchor, setOpen, bumpCount } = useCart();
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
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    });
  }, [bumpCount, bumpControls]);

  const handleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    onToggleTheme({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 px-3 sm:px-8">
      <ProgressiveBlur direction="top" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10"
        style={{
          height: "calc(100% + 1.5rem)",
          background:
            "linear-gradient(to bottom, var(--sidebar) 0%, transparent 100%)",
        }}
      />

      <div className="pointer-events-auto relative mx-auto flex w-full items-center gap-2 py-4 sm:gap-3 sm:py-5">
        {onOpenMenu && (
          <Tooltip content="menu">
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="open menu"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground transition-colors duration-[180ms] hover:bg-foreground/5 md:hidden"
            >
              <Menu size={18} strokeWidth={1.75} />
            </button>
          </Tooltip>
        )}

        <div className="min-w-0 flex-1">
          <SearchBar value={query} onChange={onQueryChange} total={total} />
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
                  transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                  className="inline-flex"
                >
                  {theme === "dark" ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </Tooltip>

          <SettingsPopover />

          <Tooltip content="open cart">
            <motion.button
              ref={cartRef}
              type="button"
              animate={bumpControls}
              style={{ transformOrigin: "center" }}
              onClick={() => setOpen(true)}
              aria-label="open cart"
              className="flex h-11 items-center gap-2 rounded-r-xl px-4 text-[14px] font-medium text-foreground transition-colors duration-[180ms] hover:bg-foreground/5"
            >
              <ShoppingBag size={16} strokeWidth={1.75} />
              <span
                className={cn(
                  "tabular-nums transition-colors duration-[180ms]",
                  items.length === 0 && "text-muted-foreground"
                )}
              >
                {items.length}
              </span>
            </motion.button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
