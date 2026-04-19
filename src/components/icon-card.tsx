"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Heart, ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

interface IconCardProps {
  name: string;
  file: string;
  category: string;
  basePath: string;
  isFavorite: boolean;
  onToggleFavorite: (name: string) => void;
}

async function fetchSvg(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export function IconCard({
  name,
  file,
  category,
  basePath,
  isFavorite,
  onToggleFavorite,
}: IconCardProps) {
  const url = `${basePath}/icons/${file}`;
  const [copied, setCopied] = useState(false);
  const [favBurstId, setFavBurstId] = useState<number | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { add, has, remove } = useCart();
  const inCart = has(name);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    const svg = await fetchSvg(url);
    if (!svg) return;
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
    } catch {
      // ignore
    }
  }, [url]);

  const handleAddToCart = useCallback(() => {
    if (inCart) {
      remove(name);
      return;
    }
    const el = imgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    add(
      { name, file, url },
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, size: rect.width }
    );
  }, [add, remove, name, file, url, inCart]);

  const handleFavorite = useCallback(() => {
    const willFav = !isFavorite;
    onToggleFavorite(name);
    if (willFav) setFavBurstId(Date.now());
  }, [isFavorite, onToggleFavorite, name]);

  const sparks = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        angle: (i / 6) * Math.PI * 2 + Math.PI / 6,
      })),
    []
  );

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-colors duration-[180ms] hover:border-foreground/30"
    >
      <button
        type="button"
        onClick={handleFavorite}
        aria-label={isFavorite ? "unfavorite" : "favorite"}
        aria-pressed={isFavorite}
        className={cn(
          "absolute right-3 top-3 z-30 grid h-8 w-8 place-items-center rounded-full transition-all",
          "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground",
          isFavorite && "opacity-100 text-foreground"
        )}
      >
        <div className="relative grid place-items-center">
          <AnimatePresence>
            {favBurstId !== null && (
              <motion.span
                key={favBurstId}
                aria-hidden
                className="pointer-events-none absolute inset-0"
                onAnimationComplete={() => setFavBurstId(null)}
              >
                {sparks.map((s) => (
                  <motion.span
                    key={s.id}
                    className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0.6 }}
                    animate={{
                      x: Math.cos(s.angle) * 16,
                      y: Math.sin(s.angle) * 16,
                      opacity: [0, 1, 0],
                      scale: [0.6, 1, 0.4],
                    }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                ))}
              </motion.span>
            )}
          </AnimatePresence>
          <motion.span
            key={favBurstId ?? "idle"}
            initial={favBurstId !== null ? { scale: 0.6 } : false}
            animate={
              favBurstId !== null
                ? { scale: [0.6, 1.45, 0.92, 1.08, 1], rotate: [0, -8, 6, -2, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          >
            <Heart
              size={16}
              strokeWidth={1.75}
              className={cn("transition-colors", isFavorite && "fill-foreground text-foreground")}
            />
          </motion.span>
        </div>
      </button>

      <div className="grid aspect-square place-items-center p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={url}
          alt={name}
          width={112}
          height={112}
          className="h-28 w-28 invert transition-transform duration-[180ms] ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.06] dark:invert-0"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col items-center justify-center gap-1 px-4 py-5">
        <span className="text-[14px] font-semibold tracking-tight text-foreground">
          {name}
        </span>
        <span className="text-[12px] font-medium leading-[1.4] text-muted-foreground">
          {category}
        </span>
      </div>

      <div className="grid grid-cols-2 border-t border-border">
        <button
          type="button"
          onClick={handleCopy}
          className="relative inline-flex h-10 items-center justify-center gap-2 text-[14px] font-medium text-muted-foreground transition-colors duration-[180ms] hover:bg-accent hover:text-foreground"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              >
                <Check size={14} strokeWidth={2} />
                <span>copied</span>
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                className="flex items-center gap-2"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              >
                <Copy size={14} strokeWidth={1.75} />
                <span>copy</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          className={cn(
            "group/cart relative inline-flex h-10 items-center justify-center gap-2 border-l border-border text-[14px] font-medium transition-colors duration-[180ms]",
            inCart
              ? "bg-foreground text-background hover:bg-foreground/90"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {inCart ? (
              <motion.span
                key="added"
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              >
                <span className="flex items-center gap-2 group-hover/cart:hidden">
                  <Check size={14} strokeWidth={2} />
                  <span>added</span>
                </span>
                <span className="hidden items-center gap-2 group-hover/cart:flex">
                  <X size={14} strokeWidth={2} />
                  <span>remove</span>
                </span>
              </motion.span>
            ) : (
              <motion.span
                key="add"
                className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              >
                <ShoppingBag size={14} strokeWidth={1.75} />
                <span>add</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}
