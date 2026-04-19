"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Download, Trash2, X } from "lucide-react";
import { OddIcon } from "@/components/ui/odd-icon";
import { iconThumbUrl } from "@/lib/icon-url";
import { Button } from "@/components/ui/button";
import { PopoverTail } from "@/components/ui/popover-tail";
import { useCart } from "@/lib/cart-context";
import { useSettings } from "@/lib/settings-context";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/springs";
import { downloadAsZip, downloadPng, fetchProcessedIconBlob } from "@/lib/png";

function deterministicRotation(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const n = ((h % 1000) / 1000 - 0.5) * 6;
  return Number(n.toFixed(2));
}

async function copyIconToClipboard(
  url: string,
  opts: { size: number; monochrome: boolean }
): Promise<boolean> {
  try {
    const blob = await fetchProcessedIconBlob(url, opts);
    if (blob.type === "image/svg+xml" || url.endsWith(".svg")) {
      const text = await blob.text();
      await navigator.clipboard.writeText(text);
      return true;
    }
    if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function CartPinboard() {
  const { open, setOpen, items, remove, clear, getCartRect } = useCart();
  const { settings } = useSettings();
  const [downloading, setDownloading] = useState(false);
  const [copiedName, setCopiedName] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<{ top: number; right: number; tailRight: number } | null>(null);

  const handleCopy = async (name: string, url: string) => {
    const ok = await copyIconToClipboard(url, {
      size: settings.downloadSize,
      monochrome: settings.monochrome,
    });
    if (!ok) return;
    setCopiedName(name);
    window.setTimeout(() => {
      setCopiedName((c) => (c === name ? null : c));
    }, 1400);
  };

  useEffect(() => {
    if (!open) return;
    const compute = () => {
      const rect = getCartRect();
      if (rect) {
        const desiredRight = window.innerWidth - rect.right;
        const panelRight = Math.max(12, desiredRight);
        const panelRightX = window.innerWidth - panelRight;
        const cartCenterX = rect.left + rect.width / 2;
        const tailRight = Math.max(20, panelRightX - cartCenterX - 6);
        setAnchor({ top: rect.bottom + 14, right: panelRight, tailRight });
      } else {
        setAnchor({ top: 72, right: 24, tailRight: 28 });
      }
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
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
      const opts = {
        size: settings.downloadSize,
        monochrome: settings.monochrome,
      };
      if (items.length === 1) {
        await downloadPng(items[0].url, items[0].name.toLowerCase(), opts);
      } else {
        await downloadAsZip(items, `oddicons-${items.length}.zip`, opts);
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
            className="fixed inset-0 z-50 bg-background/60"
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
              transition: springs.moderate,
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: -6,
              transition: springs.fast,
            }}
          >
            <PopoverTail
              direction="up"
              style={{ top: -9, right: anchor.tailRight - 5 }}
            />
            <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45),_0_2px_6px_-2px_rgba(0,0,0,0.22)]">
              <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-4">
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
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setOpen(false)}
                  aria-label="close"
                >
                  <X />
                </Button>
              </div>

              <div
                className="scrollbar-custom max-h-[52vh] overflow-y-auto px-5 pb-4 pt-2"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)",
                  maskImage:
                    "linear-gradient(to bottom, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)",
                }}
              >
                {items.length === 0 ? (
                  <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 px-6 text-center">
                    <OddIcon name="cart" size={44} />
                    <p className="text-[14px] font-medium text-foreground">cart is empty</p>
                    <p className="text-[12px] text-muted-foreground">tap any icon to add it</p>
                  </div>
                ) : (
                  <>
                    <ul className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                      <AnimatePresence mode="popLayout">
                        {items.map((item, i) => {
                          const rot = rotations[item.name] ?? 0;
                          const copied = copiedName === item.name;
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
                              className="group relative"
                            >
                              <button
                                type="button"
                                onClick={() => handleCopy(item.name, item.url)}
                                aria-label={copied ? `copied ${item.name}` : `copy ${item.name}`}
                                className={cn(
                                  "relative block aspect-square w-full overflow-hidden rounded-xl border bg-sidebar p-2.5 transition-colors duration-[180ms] outline-none",
                                  "focus-visible:border-foreground/40 focus-visible:ring-1 focus-visible:ring-foreground/30",
                                  copied
                                    ? "border-foreground/50 bg-accent"
                                    : "border-border hover:border-foreground/30"
                                )}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={iconThumbUrl(item.file)}
                                  alt={item.name}
                                  width={96}
                                  height={96}
                                  loading="lazy"
                                  decoding="async"
                                  className={cn(
                                    "h-full w-full transition-all duration-200 group-hover:scale-105",
                                    copied && "opacity-20"
                                  )}
                                  style={{
                                    filter: settings.monochrome ? "grayscale(100%)" : undefined,
                                  }}
                                />
                                <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-sidebar via-sidebar/80 to-transparent px-2 pb-1 pt-4 text-center text-[10px] font-medium text-foreground opacity-0 transition-opacity duration-[180ms] group-hover:opacity-100">
                                  {item.name.toLowerCase()}
                                </span>
                                <span
                                  aria-hidden
                                  className={cn(
                                    "pointer-events-none absolute inset-0 grid place-items-center gap-1 text-foreground transition-opacity duration-[180ms]",
                                    copied ? "opacity-100" : "opacity-0"
                                  )}
                                >
                                  <Check size={22} strokeWidth={2} />
                                </span>
                                <span
                                  aria-hidden
                                  className={cn(
                                    "pointer-events-none absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-card/90 text-muted-foreground opacity-0 shadow transition-opacity duration-[180ms]",
                                    !copied && "group-hover:opacity-100"
                                  )}
                                >
                                  <Copy size={10} strokeWidth={2} />
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  remove(item.name);
                                }}
                                aria-label={`remove ${item.name}`}
                                className="absolute left-1 top-1 z-10 grid h-5 w-5 place-items-center rounded-full bg-card/90 text-muted-foreground opacity-0 shadow transition-all duration-[180ms] hover:bg-foreground hover:text-background group-hover:opacity-100"
                                style={{ pointerEvents: "auto" }}
                              >
                                <X size={11} strokeWidth={2} />
                              </button>
                            </motion.li>
                          );
                        })}
                      </AnimatePresence>
                    </ul>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2 bg-sidebar/40 px-5 py-3">
                <Button
                  variant="ghost"
                  size="lg"
                  leadingIcon={Trash2}
                  onClick={clear}
                  disabled={items.length === 0}
                  className="h-11 px-5 text-[14px]"
                >
                  clear
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  leadingIcon={Download}
                  loading={downloading}
                  disabled={items.length === 0}
                  onClick={handleDownloadAll}
                  className="ml-auto h-11 flex-1 px-5 text-[14px]"
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
