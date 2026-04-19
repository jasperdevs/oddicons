"use client";

import { useEffect, useMemo, useRef } from "react";
import { animate } from "framer-motion";
import { useCart, type FlyEvent } from "@/lib/cart-context";

interface FlyProps {
  event: FlyEvent;
  onDone: (id: number) => void;
}

function Fly({ event, onDone }: FlyProps) {
  const { from, to, item, id, compact } = event;
  const ref = useRef<HTMLImageElement>(null);

  const geo = useMemo(() => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    const lift = Math.min(Math.max(dist * 0.22, 56), 160);
    const cx = from.x + dx * 0.5;
    const cy = Math.max(32, Math.min(from.y, to.y) - lift);
    return { cx, cy };
  }, [from.x, from.y, to.x, to.y]);

  const size = from.size;
  const duration = compact ? 0.5 : 0.9;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const controls = animate(0, 1, {
      duration,
      ease: [0.4, 0, 0.2, 1],
      onUpdate: (v) => {
        const u = 1 - v;
        const x = u * u * from.x + 2 * u * v * geo.cx + v * v * to.x;
        const y = u * u * from.y + 2 * u * v * geo.cy + v * v * to.y;
        const scale = compact
          ? Math.max(0.12, 1 - v * 0.88)
          : v < 0.9
            ? 1 - (v / 0.9) * 0.5
            : 0.5 * (1 - (v - 0.9) / 0.1);
        const fadeStart = compact ? 0.85 : 0.88;
        const opacity = v < fadeStart ? 1 : 1 - (v - fadeStart) / (1 - fadeStart);
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(${scale})`;
        el.style.opacity = String(opacity);
      },
      onComplete: () => onDone(id),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={item.url}
      alt=""
      width={size}
      height={size}
      loading="eager"
      decoding="async"
      draggable={false}
      className="absolute left-0 top-0 invert dark:invert-0"
      style={{
        width: size,
        height: size,
        willChange: "transform, opacity",
        transform: `translate3d(${from.x}px, ${from.y}px, 0) translate(-50%, -50%)`,
        transformOrigin: "center",
      }}
    />
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
