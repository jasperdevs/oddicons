"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";

const MAX_TILT = 16;

interface IconCardProps {
  name: string;
  file: string;
  category: string;
  basePath: string;
  isFavorite: boolean;
  onToggleFavorite: (name: string) => void;
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
  const [favBurstId, setFavBurstId] = useState<number | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);
  const { add, has, remove } = useCart();
  const inCart = has(name);

  const handleIconMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x: -ny * MAX_TILT, y: nx * MAX_TILT });
  }, []);

  const handleIconLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  const handleToggleCart = useCallback(() => {
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

  const handleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const willFav = !isFavorite;
      onToggleFavorite(name);
      if (willFav) setFavBurstId(Date.now());
    },
    [isFavorite, onToggleFavorite, name]
  );

  const sparks = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        angle: (i / 6) * Math.PI * 2 + Math.PI / 6,
      })),
    []
  );

  return (
    <motion.button
      type="button"
      onClick={handleToggleCart}
      aria-label={inCart ? `remove ${name} from cart` : `add ${name} to cart`}
      aria-pressed={inCart}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-left transition-[box-shadow,border-color,background-color] duration-[180ms] outline-none",
        "hover:border-foreground/30 hover:shadow-[0_12px_24px_-12px_rgba(0,0,0,0.45),_0_4px_8px_-4px_rgba(0,0,0,0.25)]",
        "focus-visible:border-foreground/40 focus-visible:ring-1 focus-visible:ring-foreground/30",
        inCart ? "border-foreground/40" : "border-border"
      )}
    >
      <span
        onClick={handleFavorite}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleFavorite(e as unknown as React.MouseEvent);
          }
        }}
        aria-label={isFavorite ? "unfavorite" : "favorite"}
        aria-pressed={isFavorite}
        className={cn(
          "card-fav absolute right-3 top-3 z-30 grid h-8 w-8 place-items-center rounded-full transition-all",
          "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground",
          isFavorite && "opacity-100 text-foreground"
        )}
      >
        <span className="relative grid place-items-center">
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
        </span>
      </span>

      {inCart && (
        <span
          aria-hidden
          className="absolute left-3 top-3 z-30 grid h-5 w-5 place-items-center rounded-full bg-foreground text-background"
        >
          <Check size={11} strokeWidth={2.5} />
        </span>
      )}

      <div
        onMouseMove={handleIconMove}
        onMouseLeave={handleIconLeave}
        className="grid aspect-square place-items-center p-3"
        style={{ perspective: "600px" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={url}
          alt={name}
          data-icon-card={name}
          draggable={false}
          className="h-full w-full object-contain will-change-transform"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: "transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1)",
            transformStyle: "preserve-3d",
          }}
          loading="lazy"
        />
      </div>

      <div className="flex flex-col items-center gap-0.5 px-3 pb-3">
        <span className="max-w-full truncate text-[13px] font-semibold tracking-tight text-foreground">
          {name}
        </span>
        <span className="text-[11px] font-medium leading-[1.4] text-muted-foreground">
          {category}
        </span>
      </div>
    </motion.button>
  );
}
