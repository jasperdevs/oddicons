"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OddIcon } from "@/components/ui/odd-icon";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart-context";
import { getIconColors } from "@/lib/icon-colors";
import { iconThumbUrl } from "@/lib/icon-url";
import { useSettings } from "@/lib/settings-context";
import { springs } from "@/lib/springs";

const MAX_TILT = 16;
const RIM_RADIUS = 260;

const rimSubscribers = new Set<HTMLButtonElement>();
let rimPointerX = 0;
let rimPointerY = 0;
let rimRaf = 0;
let rimListening = false;

function updateCardRim(node: HTMLButtonElement, clientX: number, clientY: number) {
  const rect = node.getBoundingClientRect();
  const localX = clientX - rect.left;
  const localY = clientY - rect.top;
  node.style.setProperty("--mx", `${localX}px`);
  node.style.setProperty("--my", `${localY}px`);
  const cx = rect.width / 2;
  const cy = rect.width / 2 + 12;
  const relX = localX - cx;
  const relY = localY - cy;
  const dist = Math.hypot(relX, relY);
  const intensity = Math.max(0, 1 - dist / RIM_RADIUS);
  const angle = (Math.atan2(relX, -relY) * 180) / Math.PI;
  node.style.setProperty("--rim-a", `${intensity * 0.75}`);
  node.style.setProperty("--rim-angle", `${angle}deg`);
}

function resetCardRim(node: HTMLButtonElement) {
  node.style.setProperty("--mx", "-800px");
  node.style.setProperty("--my", "-800px");
  node.style.setProperty("--rim-a", "0");
}

function flushCardRims() {
  rimRaf = 0;
  rimSubscribers.forEach((node) => updateCardRim(node, rimPointerX, rimPointerY));
}

function onWindowPointerMove(e: PointerEvent) {
  rimPointerX = e.clientX;
  rimPointerY = e.clientY;
  if (rimRaf) return;
  rimRaf = window.requestAnimationFrame(flushCardRims);
}

function onWindowPointerLeave() {
  rimSubscribers.forEach(resetCardRim);
}

function subscribeCardRim(node: HTMLButtonElement) {
  rimSubscribers.add(node);
  if (!rimListening) {
    window.addEventListener("pointermove", onWindowPointerMove);
    window.addEventListener("pointerleave", onWindowPointerLeave);
    rimListening = true;
  }
  return () => {
    rimSubscribers.delete(node);
    resetCardRim(node);
    if (rimSubscribers.size === 0 && rimListening) {
      window.removeEventListener("pointermove", onWindowPointerMove);
      window.removeEventListener("pointerleave", onWindowPointerLeave);
      rimListening = false;
      if (rimRaf) {
        window.cancelAnimationFrame(rimRaf);
        rimRaf = 0;
      }
    }
  };
}

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
  const [clickBurstId, setClickBurstId] = useState<number | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [colors, setColors] = useState<string[] | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLButtonElement>(null);
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
    if (file === "check.png") return null;
    if (!colors || colors.length === 0) return null;
    const c1 = colors[0];
    const c2 = colors[1] ?? colors[0];
    const c3 = colors[2] ?? c2;
    return `radial-gradient(circle 360px at var(--mx, -800px) var(--my, -800px), rgba(255,255,255,0.95) 0%, ${c1} 22%, rgba(255,255,255,0.7) 44%, ${c2} 66%, ${c3} 82%, transparent 100%)`;
  }, [colors, file]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    return subscribeCardRim(el);
  }, []);

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
    setClickBurstId(Date.now());
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

  const clickSparks = useMemo(() => {
    if (clickBurstId === null) return [];
    const n = 10;
    return Array.from({ length: n }, (_, i) => {
      const base = (i / n) * Math.PI * 2;
      return {
        id: i,
        angle: base + (Math.random() - 0.5) * 0.45,
        distance: 44 + Math.random() * 30,
        delay: Math.random() * 0.05,
      };
    });
  }, [clickBurstId]);

  return (
    <motion.button
      ref={cardRef}
      type="button"
      onClick={handleToggleCart}
      aria-label={inCart ? `remove ${name} from cart` : `add ${name} to cart`}
      aria-pressed={inCart}
      whileHover={{ y: -2 }}
      transition={springs.moderate}
      className={cn(
        "group relative isolate flex flex-col overflow-hidden rounded-2xl border bg-card text-left transition-[box-shadow,border-color,background-color] duration-[180ms] outline-none",
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
            className="pointer-events-none absolute inset-0 z-[1] rounded-2xl opacity-70"
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
            className="pointer-events-none absolute inset-0 z-[1] rounded-2xl opacity-60"
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
          "card-fav absolute right-3 top-3 z-[1] grid h-8 w-8 place-items-center rounded-full transition-all",
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
          className="absolute left-2.5 top-2.5 z-[1] grid h-7 w-7 place-items-center text-foreground"
        >
          <OddIcon name="check" size={26} />
        </span>
      )}

      <div
        onMouseMove={handleIconMove}
        onMouseLeave={handleIconLeave}
        className="relative grid aspect-square place-items-center p-3"
        style={{ perspective: "600px" }}
      >
        <AnimatePresence onExitComplete={() => setClickBurstId(null)}>
          {clickBurstId !== null && (
            <motion.span
              key={clickBurstId}
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[1]"
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {[0, 1, 2].map((idx) => (
                <motion.span
                  key={`ring-${idx}`}
                  className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/45"
                  initial={{ scale: 0.5, opacity: 0.9 - idx * 0.2 }}
                  animate={{ scale: 1.9 + idx * 0.55, opacity: 0 }}
                  transition={{
                    duration: 0.7 + idx * 0.1,
                    delay: idx * 0.08,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                />
              ))}
              {clickSparks.map((s) => (
                <motion.span
                  key={`spark-${s.id}`}
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground"
                  initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
                  animate={{
                    x: Math.cos(s.angle) * s.distance,
                    y: Math.sin(s.angle) * s.distance,
                    opacity: [0, 1, 1, 0],
                    scale: [0.4, 1, 0.85, 0.2],
                  }}
                  transition={{
                    duration: 0.58,
                    delay: s.delay,
                    times: [0, 0.18, 0.6, 1],
                    ease: [0.33, 0.98, 0.43, 1],
                  }}
                />
              ))}
            </motion.span>
          )}
        </AnimatePresence>
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          aria-hidden
          src={thumbUrl}
          alt=""
          draggable={false}
          width={192}
          height={192}
          className="pointer-events-none absolute inset-3 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)] object-contain"
          style={{
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(0.95)`,
            transformStyle: "preserve-3d",
            filter: "brightness(0) invert(1) blur(0.6px)",
            mixBlendMode: "screen",
            opacity: "var(--rim-a, 0)",
            WebkitMaskImage:
              "linear-gradient(var(--rim-angle, 90deg), transparent 68%, black 100%)",
            maskImage:
              "linear-gradient(var(--rim-angle, 90deg), transparent 68%, black 100%)",
            transition: "opacity 120ms linear",
          }}
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="relative z-[1] flex flex-col items-center gap-0.5 px-3 pb-3">
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
