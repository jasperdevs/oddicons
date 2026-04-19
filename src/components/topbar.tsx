"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Moon, ShoppingBag, Sun } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useCart } from "@/lib/cart-context";

interface TopbarProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
}

export function Topbar({ theme, onToggleTheme }: TopbarProps) {
  const { items, setCartAnchor, setOpen, bumpCount } = useCart();
  const cartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCartAnchor(cartRef.current);
    return () => setCartAnchor(null);
  }, [setCartAnchor]);

  return (
    <header className="sticky top-0 z-40 w-full bg-background">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center justify-between px-4 sm:px-6">
        <a href="#" className="group inline-flex items-center gap-2">
          <span
            aria-hidden
            className="relative grid h-8 w-8 place-items-center rounded-lg bg-foreground text-background"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-background" />
            <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-background/70" />
          </span>
          <span className="text-[16px] font-semibold tracking-tight text-foreground">oddicons</span>
          <span className="hidden rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            beta
          </span>
        </a>

        <div className="flex items-center gap-1">
          <Tooltip content={theme === "dark" ? "Light mode" : "Dark mode"}>
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {theme === "dark" ? <Sun size={15} strokeWidth={1.75} /> : <Moon size={15} strokeWidth={1.75} />}
            </button>
          </Tooltip>

          <Tooltip content={items.length > 0 ? "Open cart" : "Cart is empty"}>
            <motion.button
              ref={cartRef}
              type="button"
              onClick={() => items.length > 0 && setOpen(true)}
              aria-label="Open cart"
              key={bumpCount}
              animate={
                bumpCount > 0
                  ? { scale: [1, 1.18, 0.96, 1], rotate: [0, -6, 4, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative inline-flex h-9 items-center gap-1.5 rounded-md bg-foreground px-3 text-[13px] text-background transition-opacity hover:opacity-90"
            >
              <ShoppingBag size={14} strokeWidth={1.75} />
              <span className="tabular-nums">{items.length}</span>
              {items.length > 0 && (
                <motion.span
                  key={`dot-${bumpCount}`}
                  className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-background"
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.4, 1] }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </motion.button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
