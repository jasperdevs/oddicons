"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Moon, ShoppingBag, Sun } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { useCart } from "@/lib/cart-context";

interface TopbarProps {
  theme: "dark" | "light";
  onToggleTheme: (origin?: { x: number; y: number }) => void;
}

export function Topbar({ theme, onToggleTheme }: TopbarProps) {
  const { items, setCartAnchor, setOpen, bumpCount } = useCart();
  const cartRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCartAnchor(cartRef.current);
    return () => setCartAnchor(null);
  }, [setCartAnchor]);

  const handleTheme = (e: React.MouseEvent<HTMLButtonElement>) => {
    onToggleTheme({ x: e.clientX, y: e.clientY });
  };

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-end bg-background px-4 sm:px-6">
      <div className="flex items-center gap-1">
        <Tooltip content={theme === "dark" ? "Light mode" : "Dark mode"}>
          <button
            type="button"
            onClick={handleTheme}
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
                ? { scale: [1, 1.14, 0.98, 1], rotate: [0, -4, 3, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative inline-flex h-9 items-center gap-1.5 rounded-md bg-foreground px-3 text-[13px] text-background transition-opacity hover:opacity-90"
          >
            <ShoppingBag size={14} strokeWidth={1.75} />
            <span className="tabular-nums">{items.length}</span>
          </motion.button>
        </Tooltip>
      </div>
    </header>
  );
}
