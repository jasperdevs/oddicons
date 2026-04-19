"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Copy, Heart, ShoppingBag } from "lucide-react";
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
  const [favPulse, setFavPulse] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const { add, has } = useCart();
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
    if (inCart) return;
    const el = imgRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    add(
      { name, file, url },
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, size: rect.width }
    );
  }, [add, name, file, url, inCart]);

  const handleFavorite = useCallback(() => {
    onToggleFavorite(name);
    setFavPulse((v) => v + 1);
  }, [onToggleFavorite, name]);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card transition-all",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.9)]"
      )}
    >
      <button
        type="button"
        onClick={handleFavorite}
        aria-label={isFavorite ? "Unfavorite" : "Favorite"}
        aria-pressed={isFavorite}
        className={cn(
          "absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-md transition-all",
          "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground",
          isFavorite && "opacity-100 text-foreground"
        )}
      >
        <motion.span
          key={favPulse}
          initial={favPulse > 0 ? { scale: 0.6 } : false}
          animate={
            favPulse > 0
              ? { scale: [0.6, 1.45, 0.9, 1.1, 1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="relative inline-flex"
        >
          <Heart
            size={14}
            strokeWidth={1.75}
            className={cn(
              "transition-colors",
              isFavorite ? "fill-foreground text-foreground" : ""
            )}
          />
          <AnimatePresence>
            {favPulse > 0 && isFavorite && (
              <motion.span
                key={`ring-${favPulse}`}
                className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground"
                initial={{ scale: 0.4, opacity: 0.7 }}
                animate={{ scale: 2.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>
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

      <div className="mt-auto grid grid-cols-2">
        <button
          type="button"
          onClick={handleCopy}
          className="relative inline-flex h-10 items-center justify-center gap-1.5 border-t border-border/30 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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
          disabled={inCart}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-1.5 border-l border-t border-border/30 text-[12px] transition-colors",
            inCart
              ? "cursor-default bg-muted text-foreground"
              : "text-muted-foreground hover:bg-foreground hover:text-background"
          )}
        >
          {inCart ? (
            <>
              <Check size={13} strokeWidth={2} />
              <span>In cart</span>
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
