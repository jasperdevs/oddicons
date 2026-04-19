"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Moon, ShoppingBag, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <header className="flex h-12 w-full shrink-0 items-center justify-end px-4 sm:px-6">
      <div className="flex items-center gap-1">
        <Tooltip content={theme === "dark" ? "Light mode" : "Dark mode"}>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleTheme}
            aria-label="Toggle theme"
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
              size="md"
              leadingIcon={ShoppingBag}
              onClick={() => items.length > 0 && setOpen(true)}
              aria-label="Open cart"
            >
              <span className="tabular-nums">{items.length}</span>
            </Button>
          </motion.div>
        </Tooltip>
      </div>
    </header>
  );
}
