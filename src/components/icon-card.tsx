"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  const [favBurst, setFavBurst] = useState<{ id: number; on: boolean } | null>(null);
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
    setFavBurst({ id: Date.now(), on: willFav });
  }, [isFavorite, onToggleFavorite, name]);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card transition-all",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.9)]"
      )}
    >
      <AnimatePresence>
        {favBurst && favBurst.on && (
          <motion.div
            key={favBurst.id}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 grid place-items-center rounded-xl bg-foreground"
            initial={{ clipPath: "circle(0% at 50% 85%)" }}
            animate={{
              clipPath: [
                "circle(0% at 50% 85%)",
                "circle(120% at 50% 85%)",
                "circle(120% at 50% 85%)",
              ],
              opacity: [1, 1, 0],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, times: [0, 0.4, 1], ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => setFavBurst(null)}
          >
            <motion.div
              initial={{ scale: 0.2, rotate: -10 }}
              animate={{ scale: [0.2, 1.2, 1], rotate: [-10, 6, 0] }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Heart
                size={72}
                strokeWidth={0}
                className="fill-background"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={handleFavorite}
        aria-label={isFavorite ? "Unfavorite" : "Favorite"}
        aria-pressed={isFavorite}
        className={cn(
          "absolute right-2 top-2 z-30 grid h-8 w-8 place-items-center rounded-md transition-all",
          "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground",
          isFavorite && "opacity-100 text-foreground"
        )}
      >
        <motion.span
          key={favBurst?.id ?? "idle"}
          initial={favBurst ? { scale: 0.6 } : false}
          animate={favBurst ? { scale: [0.6, 1.5, 0.95, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <Heart
            size={15}
            strokeWidth={1.75}
            className={cn("transition-colors", isFavorite && "fill-foreground text-foreground")}
          />
        </motion.span>
      </button>

      <div className="flex aspect-[5/4] items-center justify-center px-6 py-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={url}
          alt={name}
          width={64}
          height={64}
          className="h-14 w-14 invert transition-transform duration-200 group-hover:scale-[1.06] dark:invert-0"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col items-center gap-0.5 pb-3">
        <span className="text-[13px] font-medium leading-none text-foreground">{name}</span>
        <span className="text-[11px] leading-none text-muted-foreground">{category}</span>
      </div>

      <div className="mt-auto grid grid-cols-2 border-t border-border/40">
        <button
          type="button"
          onClick={handleCopy}
          className="relative inline-flex h-10 items-center justify-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.span
                key="copied"
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                <Check size={13} strokeWidth={2} />
                <span>Copied</span>
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                className="flex items-center gap-1.5"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
              >
                <Copy size={13} strokeWidth={1.75} />
                <span>Copy</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
        <button
          type="button"
          onClick={handleAddToCart}
          className={cn(
            "group/cart inline-flex h-10 items-center justify-center gap-1.5 border-l border-border/40 text-[12px] transition-colors",
            inCart
              ? "bg-muted text-foreground hover:bg-destructive/10"
              : "text-muted-foreground hover:bg-foreground hover:text-background"
          )}
        >
          {inCart ? (
            <>
              <span className="flex items-center gap-1.5 group-hover/cart:hidden">
                <Check size={13} strokeWidth={2} />
                <span>Added</span>
              </span>
              <span className="hidden items-center gap-1.5 group-hover/cart:flex">
                <X size={13} strokeWidth={2} />
                <span>Remove</span>
              </span>
            </>
          ) : (
            <>
              <ShoppingBag size={13} strokeWidth={1.75} />
              <span>Add</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
