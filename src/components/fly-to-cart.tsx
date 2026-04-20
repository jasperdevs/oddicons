"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate } from "framer-motion";
import { useCart, type FlyEvent } from "@/lib/cart-context";
import { iconMiniUrl } from "@/lib/icon-url";

const TRAIL_COUNT = 3;
const SPARK_COUNT = 4;

interface FlyProps {
  event: FlyEvent;
  onDone: (id: number) => void;
}

function easeInCubic(t: number) {
  return t * t * t;
}

function Fly({ event, onDone }: FlyProps) {
  const { from, to, item, id, compact } = event;
  const rootRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  const geo = useMemo(() => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    const lift = Math.min(Math.max(dist * 0.32, 72), compact ? 140 : 220);
    const side = dx >= 0 ? 1 : -1;
    const sweep = Math.min(Math.max(dist * 0.08, 18), 58) * side;
    const cx = from.x + dx * 0.5;
    const cy = Math.max(28, Math.min(from.y, to.y) - lift);
    const seed = (id * 9301 + item.name.length * 49297) % 233280;
    const spin = ((seed / 233280) > 0.5 ? 1 : -1) * (compact ? 120 : 180);
    return { cx, cy, sweep, spin };
  }, [compact, from.x, from.y, id, item.name.length, to.x, to.y]);

  const size = Math.min(from.size, compact ? 48 : 112);
  const duration = compact ? 0.95 : 0.86;
  const trailSize = Math.max(8, size * 0.2);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      onDone(id);
    };
    const controls = animate(0, 1, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        const u = 1 - v;
        const x = u * u * from.x + 2 * u * v * geo.cx + v * v * to.x;
        const y = u * u * from.y + 2 * u * v * geo.cy + v * v * to.y;
        const swirl = Math.sin(v * Math.PI * 1.8) * geo.sweep * (1 - v) * 0.28;
        const px = x + swirl;
        const collapse = v > 0.72 ? (v - 0.72) / 0.28 : 0;
        const scale = compact
          ? Math.max(0.08, 1 + Math.sin(v * Math.PI) * 0.18 - easeInCubic(v) * 0.92)
          : v < 0.9
            ? 1 + Math.sin(v * Math.PI) * 0.2 - v * 0.42
            : 0.58 * (1 - (v - 0.9) / 0.1);
        const fadeStart = compact ? 0.9 : 0.86;
        const opacity = v < fadeStart ? 1 : 1 - (v - fadeStart) / (1 - fadeStart);
        const rotate = geo.spin * v + Math.sin(v * Math.PI * (compact ? 5 : 3)) * (compact ? 22 : 10) + collapse * 160;
        el.style.transform = `translate3d(${px}px, ${y}px, 0) translate(-50%, -50%) rotate(${rotate}deg) scale(${scale})`;
        el.style.opacity = String(opacity);
        el.style.setProperty("--fly-v", String(v));
        el.style.setProperty("--fly-glow", String(Math.sin(v * Math.PI)));
        el.style.filter = compact
          ? `blur(${Math.sin(v * Math.PI) * 0.9 + collapse * 1.6}px) saturate(${1 + Math.sin(v * Math.PI) * 0.25})`
          : "none";
      },
      onComplete: finish,
    });
    return () => {
      controls.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={rootRef}
      className="absolute left-0 top-0"
      style={{
        width: size,
        height: size,
        willChange: "transform, opacity",
        transform: `translate3d(${from.x}px, ${from.y}px, 0) translate(-50%, -50%)`,
        transformOrigin: "center",
      }}
    >
      {!compact && Array.from({ length: TRAIL_COUNT }, (_, i) => {
        const lag = i + 1;
        return (
          <span
            key={`trail-${i}`}
            aria-hidden
            className="absolute left-1/2 top-1/2 rounded-full bg-foreground/70 blur-[1px]"
            style={{
              width: trailSize * (1 - i * 0.11),
              height: trailSize * (1 - i * 0.11),
              opacity: 0.22 - i * 0.03,
              transform: `translate(${-50 - lag * 16}%, ${-50 + Math.sin(i) * 18}%) scale(${1 - i * 0.1})`,
            }}
          />
        );
      })}
      {!compact && (
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 rounded-full bg-foreground/20 blur-xl"
          style={{
            width: size * 0.9,
            height: size * 0.9,
            opacity: "calc(var(--fly-glow, 0) * 0.55)",
            transform: "translate(-50%, -50%)",
          }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={iconMiniUrl(item.file)}
        alt=""
        width={size}
        height={size}
        loading="eager"
        decoding="sync"
        draggable={false}
        className={compact ? "absolute inset-0 h-full w-full object-contain drop-shadow-[0_6px_14px_rgba(0,0,0,0.42)]" : "absolute inset-0 h-full w-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.35)]"}
        style={{
          filter: item.monochrome ? "grayscale(100%)" : undefined,
        }}
      />
      {!compact &&
        Array.from({ length: SPARK_COUNT }, (_, i) => {
          const angle = (i / SPARK_COUNT) * Math.PI * 2;
          const distance = 24 + i * 2.5;
          return (
            <span
              key={`spark-${i}`}
              aria-hidden
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-foreground"
              style={{
                opacity: 0.6,
                transform: `translate(calc(-50% + ${Math.cos(angle) * distance}px), calc(-50% + ${Math.sin(angle) * distance}px)) scale(0.85)`,
              }}
            />
          );
        })}
    </div>
  );
}

export function FlyToCart() {
  const { flies, consumeFly } = useCart();

  if (flies.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[70]"
      style={{ contain: "layout paint" }}
    >
      {flies.map((f) => (
        <Fly key={f.id} event={f} onDone={consumeFly} />
      ))}
    </div>
  );
}
