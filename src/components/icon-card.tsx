"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { OddIcon } from "@/components/ui/odd-icon";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { getIconColors } from "@/lib/icon-colors";
import { iconThumbUrl } from "@/lib/icon-url";
import { useSettings } from "@/lib/settings-context";
import { springs } from "@/lib/springs";

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
  const thumbUrl = iconThumbUrl(file);
  const [favBurstId, setFavBurstId] = useState<number | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [colors, setColors] = useState<string[] | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { add, has, remove } = useCart();
  const { settings } = useSettings();
  const inCart = has(name);

  useEffect(() => {
    let alive = true;
    getIconColors(thumbUrl).then((c) => {
      if (alive && c.length > 0) setColors(c);
    });
    return () => {
      alive = false;
    };
  }, [thumbUrl]);

  const borderBackground = useMemo(() => {
    if (!colors || colors.length === 0) return null;
    const c1 = colors[0];
    const c2 = colors[1] ?? colors[0];
    const c3 = colors[2] ?? c2;
    return `conic-gradient(from 210deg, ${c1}, rgba(255,255,255,0.82) 15%, ${c2} 32%, ${c3} 52%, rgba(255,255,255,0.78) 72%, ${c2} 88%, ${c1})`;
  }, [colors]);

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
      { name, file, url, monochrome: settings.monochrome },
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, size: rect.width }
    );
  }, [add, remove, name, file, url, inCart, settings.monochrome]);

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
      transition={springs.moderate}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-left transition-[box-shadow,border-color,background-color] duration-[180ms] outline-none",
        borderBackground ? "border-transparent" : "border-border hover:border-foreground/30",
        "hover:shadow-[0_12px_24px_-12px_rgba(0,0,0,0.45),_0_4px_8px_-4px_rgba(0,0,0,0.25)]",
        "focus-visible:border-foreground/40 focus-visible:ring-1 focus-visible:ring-foreground/30",
        inCart && !borderBackground && "border-foreground/40"
      )}
    >
      {borderBackground && (
        <>
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-70 transition-opacity duration-[180ms] group-hover:opacity-95"
            style={{
              padding: 2.5,
              background: borderBackground,
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              filter: "blur(2.5px)",
            }}
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 rounded-2xl opacity-60 transition-opacity duration-[180ms] group-hover:opacity-80"
            style={{
              padding: 1,
              background: borderBackground,
              WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
            }}
          />
        </>
      )}
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
            transition={{ ...springs.slow, duration: 0.5 }}
          >
            <OddIcon
              name="heart"
              size={18}
              className={cn(
                "transition-[opacity,filter] duration-[180ms]",
                !isFavorite && "opacity-70 saturate-0"
              )}
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
          src={thumbUrl}
          alt={name}
          data-icon-card={name}
          draggable={false}
          width={192}
          height={192}
          className="h-full w-full object-contain will-change-transform"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(0.95)`,
            transition: "transform 120ms cubic-bezier(0.2, 0.8, 0.2, 1), filter 180ms cubic-bezier(0.4,0,0.2,1)",
            transformStyle: "preserve-3d",
            filter: settings.monochrome ? "grayscale(100%)" : undefined,
          }}
          loading="lazy"
          decoding="async"
        />
      </div>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24"
        style={{
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          maskImage:
            "linear-gradient(to top, black 0%, black 40%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, black 40%, transparent 100%)",
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20"
        style={{
          background:
            "linear-gradient(to top, var(--card) 0%, var(--card) 30%, transparent 100%)",
        }}
      />
      <div className="relative z-20 flex flex-col items-center gap-0.5 px-3 pb-3">
        <span className="max-w-full truncate text-[15px] font-semibold tracking-tight text-foreground">
          {name}
        </span>
        <span className="text-[13px] font-medium leading-[1.4] text-muted-foreground">
          {category}
        </span>
      </div>
    </motion.button>
  );
}
