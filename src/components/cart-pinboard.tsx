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
  const n = ((h % 1000) / 1000 - 0.5) * 6;
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
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-[2px]"
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
              <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
                      cart
                    </h2>
                    {items.length > 0 && (
                      <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 text-[11px] font-semibold tabular-nums text-background">
                        {items.length}
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-muted-foreground">
                    {items.length === 0
                      ? "tap the cart icon on any tile to add it"
                      : items.length === 1
                        ? "exports as a 512px png"
                        : "exports as a zipped set of 512px pngs"}
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

              <div className="scrollbar-custom max-h-[52vh] overflow-y-auto px-5 pb-4">
                {items.length === 0 ? (
                  <div className="flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-sidebar/30 px-6 py-10 text-center">
                    <div className="relative grid place-items-center">
                      <span className="absolute inset-0 -m-2.5 rounded-full bg-foreground/[0.02]" />
                      <span className="absolute inset-0 -m-1 rounded-full bg-foreground/[0.03]" />
                      <span className="relative grid h-12 w-12 place-items-center rounded-full border border-border bg-card text-foreground">
                        <ShoppingBag size={18} strokeWidth={1.75} />
                      </span>
                    </div>
                    <div className="flex max-w-[240px] flex-col gap-1.5">
                      <p className="text-[14px] font-semibold tracking-tight text-foreground">
                        cart is empty
                      </p>
                      <p className="text-[12px] leading-[1.55] text-muted-foreground">
                        add icons one at a time, or hit{" "}
                        <span className="font-medium text-foreground">add all</span> at the bottom of the grid
                      </p>
                    </div>
                  </div>
                ) : (
                  <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    <AnimatePresence mode="popLayout">
                      {items.map((item, i) => {
                        const rot = rotations[item.name] ?? 0;
                        return (
                          <motion.li
                            key={item.name}
                            layout
                            initial={{
                              opacity: 0,
                              scale: 0.4,
                              rotate: rot - 18,
                              y: -16,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              rotate: rot,
                              y: 0,
                              transition: {
                                type: "spring",
                                stiffness: 360,
                                damping: 22,
                                mass: 0.6,
                                delay: 0.06 + i * 0.02,
                              },
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.4,
                              rotate: rot + 24,
                              y: 30,
                              transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
                            }}
                            whileHover={{ rotate: 0, scale: 1.06, y: -3 }}
                            className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-sidebar p-2.5 transition-colors duration-[180ms] hover:border-foreground/30"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.url}
                              alt={item.name}
                              className="h-full w-full invert transition-transform duration-200 group-hover:scale-105 dark:invert-0"
                            />
                            <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-sidebar via-sidebar/80 to-transparent px-2 pb-1 pt-4 text-center text-[10px] font-medium text-foreground opacity-0 transition-opacity duration-[180ms] group-hover:opacity-100">
                              {item.name.toLowerCase()}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                remove(item.name);
                              }}
                              aria-label={`remove ${item.name}`}
                              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-card/90 text-muted-foreground opacity-0 shadow transition-all duration-[180ms] hover:bg-foreground hover:text-background group-hover:opacity-100"
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

              <div className="flex items-center gap-2 border-t border-border bg-sidebar/40 px-5 py-3">
                <Button
                  variant="ghost"
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
                    ? "download"
                    : items.length === 1
                      ? "download png"
                      : `download zip (${items.length})`}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
