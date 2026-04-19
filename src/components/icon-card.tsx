"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Heart, ShoppingBag } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
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

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card transition-all",
        "hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.8)]"
      )}
    >
      <button
        type="button"
        onClick={() => onToggleFavorite(name)}
        aria-label={isFavorite ? "Unfavorite" : "Favorite"}
        aria-pressed={isFavorite}
        className={cn(
          "absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-md transition-all",
          "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground",
          isFavorite && "opacity-100 text-foreground"
        )}
      >
        <Heart
          size={14}
          strokeWidth={1.75}
          className={isFavorite ? "fill-foreground" : ""}
        />
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

      <div className="mt-auto grid grid-cols-2 gap-1 p-1.5">
        <Tooltip content={copied ? "Copied SVG" : "Copy SVG"}>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </Tooltip>
        <Tooltip content={inCart ? "In cart" : "Add to cart"}>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={inCart}
            className={cn(
              "inline-flex h-8 items-center justify-center gap-1.5 rounded-md text-[12px] transition-colors",
              inCart
                ? "bg-muted text-foreground cursor-default"
                : "text-muted-foreground hover:bg-foreground hover:text-background"
            )}
          >
            {inCart ? <Check size={13} strokeWidth={2} /> : <ShoppingBag size={13} strokeWidth={1.75} />}
            <span>{inCart ? "Added" : "Add"}</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
}
