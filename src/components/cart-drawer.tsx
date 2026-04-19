"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Trash2, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { downloadPng, svgToPngBlob, downloadBlob } from "@/lib/png";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const { open, setOpen, items, remove, clear, getCartPoint } = useCart();
  const [origin, setOrigin] = useState<{ x: number; y: number } | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (open) setOrigin(getCartPoint());
  }, [open, getCartPoint]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const handleDownloadAll = async () => {
    if (items.length === 0 || downloading) return;
    setDownloading(true);
    try {
      if (items.length === 1) {
        await downloadPng(items[0].url, items[0].name.toLowerCase());
      } else {
        // Sequential downloads with small gap; browsers may prompt once.
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

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-50 bg-foreground/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            key="drawer"
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-background shadow-[0_0_0_1px_var(--border)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 40, mass: 0.9 }}
            role="dialog"
            aria-label="Your icon cart"
          >
            <div className="flex items-center justify-between px-6 pb-4 pt-5">
              <div>
                <h2 className="text-[18px] font-semibold tracking-tight text-foreground">Your cart</h2>
                <p className="text-[12px] text-muted-foreground">
                  {items.length === 0
                    ? "nothing here yet"
                    : `${items.length} icon${items.length === 1 ? "" : "s"} · exports as PNG`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close cart"
                className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-4">
              {items.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-center text-[13px] text-muted-foreground">
                    tap the cart on any icon to send it here.
                  </p>
                </div>
              ) : (
                <motion.ul
                  className="grid grid-cols-3 gap-3"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: {},
                    visible: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
                  }}
                >
                  {items.map((item, i) => {
                    const originX = origin?.x ?? window.innerWidth;
                    const originY = origin?.y ?? 0;
                    return (
                      <motion.li
                        key={item.name}
                        variants={{
                          hidden: {
                            opacity: 0,
                            scale: 0.2,
                            rotate: -30 + (i % 5) * 18,
                            x: originX - window.innerWidth + 320,
                            y: originY - 200,
                          },
                          visible: {
                            opacity: 1,
                            scale: 1,
                            rotate: 0,
                            x: 0,
                            y: 0,
                            transition: {
                              type: "spring",
                              stiffness: 260,
                              damping: 22,
                              mass: 0.8,
                            },
                          },
                        }}
                        className={cn(
                          "group relative aspect-square overflow-hidden rounded-lg bg-card p-4"
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.url}
                          alt={item.name}
                          className="h-full w-full invert dark:invert-0"
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
                </motion.ul>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-border/40 px-6 py-4">
              <button
                type="button"
                onClick={clear}
                disabled={items.length === 0}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md px-3 text-[13px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <Trash2 size={13} strokeWidth={1.75} />
                <span>Clear</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadAll}
                disabled={items.length === 0 || downloading}
                className="ml-auto inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-[13px] font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                <Download size={14} strokeWidth={2} />
                <span>
                  {downloading
                    ? "Downloading…"
                    : items.length === 0
                      ? "Download PNG"
                      : `Download ${items.length} PNG${items.length === 1 ? "" : "s"}`}
                </span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
