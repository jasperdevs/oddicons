"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
  visible: number;
}

export function Topbar({
  theme,
  onToggleTheme,
  query,
  onQueryChange,
  total,
  visible,
}: TopbarProps) {
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
    <div className="sticky top-0 z-30 bg-sidebar/95 px-6 py-3 backdrop-blur-sm sm:px-8">
      <div className="mx-auto flex w-full max-w-[1400px] items-center gap-2">
        <div className="min-w-0 flex-1">
          <SearchBar
            value={query}
            onChange={onQueryChange}
            total={total}
            visible={visible}
          />
        </div>

        <Tooltip content={theme === "dark" ? "Light mode" : "Dark mode"}>
          <Button
            variant="secondary"
            size="icon-lg"
            onClick={handleTheme}
            aria-label="Toggle theme"
            className="bg-[var(--button)] hover:bg-[var(--button)]/80"
          >
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
        </Tooltip>

        <Tooltip content={items.length > 0 ? "Open cart" : "Cart is empty"}>
          <motion.div
            key={bumpCount}
            animate={
              bumpCount > 0
                ? { scale: [1, 1.14, 0.98, 1], rotate: [0, -4, 3, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Button
              ref={cartRef}
              variant="primary"
              size="lg"
              leadingIcon={ShoppingBag}
              onClick={() => items.length > 0 && setOpen(true)}
              aria-label="Open cart"
              className="h-11"
            >
              <span className="tabular-nums">{items.length}</span>
            </Button>
          </motion.div>
        </Tooltip>
      </div>
    </div>
  );
}
