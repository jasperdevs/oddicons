"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Moon, ShoppingBag, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      scale: [1, 1.18, 0.96, 1],
      rotate: [0, -6, 4, 0],
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
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
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: "calc(100% + 2.5rem)",
          background:
            "linear-gradient(to bottom, var(--sidebar) 0%, var(--sidebar) 62%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto flex w-full max-w-[1400px] items-center gap-2 py-3">
        <div className="min-w-0 flex-1">
          <SearchBar value={query} onChange={onQueryChange} total={total} />
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-[var(--button)] p-1">
          <Tooltip content={theme === "dark" ? "Light mode" : "Dark mode"}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleTheme}
              aria-label="Toggle theme"
              className="relative h-9 w-9 overflow-hidden text-foreground hover:bg-foreground/10"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -140, scale: 0.3, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 140, scale: 0.3, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="inline-flex"
                >
                  {theme === "dark" ? <Sun /> : <Moon />}
                </motion.span>
              </AnimatePresence>
            </Button>
          </Tooltip>

          <div className="h-5 w-px bg-border/70" aria-hidden />

          <Tooltip content={items.length > 0 ? "Open cart" : "Cart is empty"}>
            <motion.div animate={bumpControls} style={{ transformOrigin: "center" }}>
              <Button
                ref={cartRef}
                variant="ghost"
                size="md"
                leadingIcon={ShoppingBag}
                onClick={() => items.length > 0 && setOpen(true)}
                aria-label="Open cart"
                className="h-9 text-foreground hover:bg-foreground/10 hover:text-foreground"
              >
                <span className="tabular-nums">{items.length}</span>
              </Button>
            </motion.div>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
