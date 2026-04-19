"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ShoppingBag, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart-context";
import { downloadPng, svgToPngBlob, downloadBlob } from "@/lib/png";

function deterministicRotation(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  // Result in range [-5, 5] degrees
  const n = ((h % 1000) / 1000 - 0.5) * 10;
  return Number(n.toFixed(2));
}

export function CartPinboard() {
  const { open, setOpen, items, remove, clear, getCartPoint } = useCart();
  const [downloading, setDownloading] = useState(false);
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setOrigin(getCartPoint() ?? { x: window.innerWidth - 40, y: 40 });
    }
  }, [open, getCartPoint]);

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
        for (const item of items) {
          const blob = await svgToPngBlob(item.url);
          downloadBlob(blob, `${item.name.toLowerCase()}.png`);
          await new Promise((r) => setTimeout(r, 120));
        }
      }
    } finally {
      setDownloading(false);
    }
  };

  // Panel expands from the cart button as its origin.
  const anchorX = origin?.x ?? 40;
  const anchorY = origin?.y ?? 40;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          />

          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-label="Your icon cart"
            className="fixed inset-0 z-50 grid place-items-center p-4"
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.div
              className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-sidebar shadow-[0_24px_60px_-12px_rgba(0,0,0,0.45)]"
              variants={{
                open: {
                  opacity: 1,
                  scale: 1,
                  x: 0,
                  y: 0,
                  transition: { type: "spring", stiffness: 320, damping: 28, mass: 0.7 },
                },
                closed: {
                  opacity: 0,
                  scale: 0.4,
                  // Spring from the cart button's position (approximate delta to screen center)
                  x: anchorX - window.innerWidth / 2,
                  y: anchorY - window.innerHeight / 2,
                  transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
                },
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 pb-4 pt-5">
                <div>
                  <h2 className="text-[17px] font-semibold tracking-tight text-foreground">
                    Pinboard
                  </h2>
                  <p className="text-[12px] text-muted-foreground">
                    {items.length === 0
                      ? "nothing pinned yet"
                      : `${items.length} icon${items.length === 1 ? "" : "s"} · exports as PNG`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  aria-label="Close cart"
                >
                  <X />
                </Button>
              </div>

              <div className="scrollbar-custom relative max-h-[60vh] overflow-y-auto px-4 pb-4">
                {items.length === 0 ? (
                  <div className="flex min-h-[300px] items-center justify-center px-6">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
                        <ShoppingBag size={20} strokeWidth={1.75} />
                      </span>
                      <div className="flex flex-col gap-1">
                        <p className="text-[14px] font-medium text-foreground">
                          Pinboard is empty
                        </p>
                        <p className="text-[12px] text-muted-foreground">
                          Tap the cart on any icon to pin it here.
                        </p>
                      </div>
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
                              scale: 0.2,
                              rotate: rot - 18,
                              y: -30,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              rotate: rot,
                              y: 0,
                              transition: {
                                type: "spring",
                                stiffness: 260,
                                damping: 18,
                                mass: 0.8,
                                delay: i * 0.04,
                              },
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.3,
                              rotate: rot + 30,
                              y: 60,
                              transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
                            }}
                            whileHover={{ rotate: 0, scale: 1.04, y: -2 }}
                            className="group relative aspect-square overflow-hidden rounded-xl border border-border/50 bg-card p-4"
                          >
                            {/* pin dot */}
                            <span
                              aria-hidden
                              className="absolute left-1/2 top-2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-foreground/40"
                            />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.url}
                              alt={item.name}
                              className="h-full w-full invert transition-transform duration-200 group-hover:scale-105 dark:invert-0"
                            />
                            <button
                              type="button"
                              onClick={() => remove(item.name)}
                              aria-label={`Remove ${item.name}`}
                              className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
                            >
                              <X size={12} strokeWidth={2} />
                            </button>
                            <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-card to-transparent px-2 pb-1.5 pt-5 text-center text-[11px] text-muted-foreground">
                              {item.name}
                            </span>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-border/40 px-4 py-4">
                <Button
                  variant="ghost"
                  size="md"
                  leadingIcon={Trash2}
                  onClick={clear}
                  disabled={items.length === 0}
                >
                  Clear
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
                    ? "Download PNG"
                    : `Download ${items.length} PNG${items.length === 1 ? "" : "s"}`}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
