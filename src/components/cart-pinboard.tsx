"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { downloadAsZip, downloadPng } from "@/lib/png";

function deterministicRotation(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const n = ((h % 1000) / 1000 - 0.5) * 10;
  return Number(n.toFixed(2));
}

export function CartPinboard() {
  const { open, setOpen, items, remove, clear, getCartRect } = useCart();
  const [downloading, setDownloading] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const rect = getCartRect();
    if (rect) {
      setAnchor({
        top: rect.bottom + 14,
        right: Math.max(12, window.innerWidth - rect.right),
      });
    } else {
      setAnchor({ top: 72, right: 24 });
    }
  }, [open, getCartRect]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const rotations = useMemo(() => {
    const map: Record<string, number> = {};
    items.forEach((i) => (map[i.name] = deterministicRotation(i.name)));
    return map;
  }, [items]);

  const handleDownloadAll = async () => {
    if (items.length === 0 || downloading) return;
    setDownloading(true);
    try {
      if (items.length === 1) {
        await downloadPng(items[0].url, items[0].name.toLowerCase());
      } else {
        await downloadAsZip(items, `oddicons-${items.length}.zip`);
      }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && anchor && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-50 bg-background/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setOpen(false)}
          />

          <motion.div
            key="panel"
            role="dialog"
            aria-label="cart"
            className="fixed z-50 w-[min(28rem,calc(100vw-1.5rem))]"
            style={{
              top: anchor.top,
              right: anchor.right,
              transformOrigin: "top right",
            }}
            initial={{ opacity: 0, scale: 0.96, y: -6 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] },
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: -6,
              transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
            }}
          >
            <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7),_0_12px_24px_-8px_rgba(0,0,0,0.4)]">
              <div className="flex items-center justify-between px-4 pb-3 pt-4">
                <div>
                  <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
                    cart
                  </h2>
                  <p className="text-[12px] text-muted-foreground">
                    {items.length === 0
                      ? "nothing added yet"
                      : `${items.length} icon${items.length === 1 ? "" : "s"} · exports as png`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setOpen(false)}
                  aria-label="close"
                >
                  <X />
                </Button>
              </div>

              <div className="scrollbar-custom max-h-[52vh] overflow-y-auto px-4 pb-3">
                {items.length === 0 ? (
                  <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-6 text-center">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-muted text-muted-foreground">
                      <ShoppingBag size={18} strokeWidth={1.75} />
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="text-[14px] font-medium text-foreground">
                        cart is empty
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        tap the cart on any icon
                      </p>
                    </div>
                  </div>
                ) : (
                  <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                    <AnimatePresence mode="popLayout">
                      {items.map((item, i) => {
                        const rot = rotations[item.name] ?? 0;
                        return (
                          <motion.li
                            key={item.name}
                            layout
                            initial={{
                              opacity: 0,
                              scale: 0.3,
                              rotate: rot - 24,
                              y: -20,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              rotate: rot,
                              y: 0,
                              transition: {
                                type: "spring",
                                stiffness: 320,
                                damping: 20,
                                mass: 0.7,
                                delay: 0.1 + i * 0.03,
                              },
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.4,
                              rotate: rot + 30,
                              y: 40,
                              transition: { duration: 0.25, ease: [0.4, 0, 1, 1] },
                            }}
                            whileHover={{ rotate: 0, scale: 1.05, y: -2 }}
                            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-card p-3"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.url}
                              alt={item.name}
                              className="h-full w-full invert transition-transform duration-200 group-hover:scale-105 dark:invert-0"
                            />
                            <button
                              type="button"
                              onClick={() => remove(item.name)}
                              aria-label={`remove ${item.name}`}
                              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full text-muted-foreground opacity-0 transition-opacity duration-[180ms] hover:bg-muted hover:text-foreground group-hover:opacity-100"
                            >
                              <X size={11} strokeWidth={2} />
                            </button>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                )}
              </div>

              <div className="flex items-center gap-3 border-t border-border px-4 py-3">
                <Button
                  variant="tertiary"
                  size="md"
                  leadingIcon={Trash2}
                  onClick={clear}
                  disabled={items.length === 0}
                >
                  clear
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  leadingIcon={Download}
                  loading={downloading}
                  disabled={items.length === 0}
                  onClick={handleDownloadAll}
                  className="ml-auto flex-1"
                >
                  {items.length === 0
                    ? "download png"
                    : `download ${items.length} png${items.length === 1 ? "" : "s"}`}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
