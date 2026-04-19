"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Moon, ShoppingBag, Sun } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { SearchBar } from "@/components/search-bar";
import { useCart } from "@/lib/cart-context";

interface TopbarProps {
  theme: "dark" | "light";
  onToggleTheme: (origin?: { x: number; y: number }) => void;
  query: string;
  onQueryChange: (q: string) => void;
  total: number;
}

export function Topbar({
  theme,
  onToggleTheme,
  query,
  onQueryChange,
  total,
}: TopbarProps) {
  const { items, setCartAnchor, setOpen, bumpCount } = useCart();
  const cartRef = useRef<HTMLButtonElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const bumpControls = useAnimation();

  useEffect(() => {
    setCartAnchor(cartRef.current);
    return () => setCartAnchor(null);
  }, [setCartAnchor]);

  useEffect(() => {
    const scroller = wrapperRef.current?.parentElement;
    if (!scroller) return;
    const onScroll = () => setScrolled(scroller.scrollTop > 6);
    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

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
    <div ref={wrapperRef} className="sticky top-0 z-30 px-6 sm:px-8">
      <motion.div
        aria-hidden
        animate={{ opacity: scrolled ? 1 : 0 }}
        transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: "calc(100% + 2rem)",
          background:
            "linear-gradient(to bottom, var(--sidebar) 0%, var(--sidebar) 62%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto flex w-full items-center gap-3 py-4">
        <div className="min-w-0 flex-1">
          <SearchBar value={query} onChange={onQueryChange} total={total} />
        </div>

        <div className="flex h-10 items-center rounded-xl bg-muted">
          <Tooltip content={theme === "dark" ? "light mode" : "dark mode"}>
            <button
              type="button"
              onClick={handleTheme}
              aria-label="toggle theme"
              className="grid h-10 w-10 place-items-center overflow-hidden rounded-l-xl text-foreground transition-colors duration-[180ms] hover:bg-foreground/5"
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

          <Tooltip content={items.length > 0 ? "open cart" : "cart is empty"}>
            <motion.button
              ref={cartRef}
              type="button"
              animate={bumpControls}
              style={{ transformOrigin: "center" }}
              onClick={() => items.length > 0 && setOpen(true)}
              aria-label="open cart"
              className="flex h-10 items-center gap-2 rounded-r-xl px-3 text-[14px] font-medium text-foreground transition-colors duration-[180ms] hover:bg-foreground/5"
            >
              <ShoppingBag size={16} strokeWidth={1.75} />
              <span className="tabular-nums">{items.length}</span>
            </motion.button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
