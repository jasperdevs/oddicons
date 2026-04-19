"use client";

import { useEffect, useMemo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useCart, type FlyEvent } from "@/lib/cart-context";

interface FlyProps {
  event: FlyEvent;
  onDone: (id: number) => void;
}

function Fly({ event, onDone }: FlyProps) {
  const { from, to, item, id, compact } = event;

  const geo = useMemo(() => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    const lift = Math.min(Math.max(dist * 0.22, 56), 160);
    const cx = from.x + dx * 0.5;
    const cy = Math.max(32, Math.min(from.y, to.y) - lift);
    return { cx, cy };
  }, [from.x, from.y, to.x, to.y]);

  const t = useMotionValue(0);

  const x = useTransform(t, (v) => {
    const u = 1 - v;
    return u * u * from.x + 2 * u * v * geo.cx + v * v * to.x;
  });

  const y = useTransform(t, (v) => {
    const u = 1 - v;
    return u * u * from.y + 2 * u * v * geo.cy + v * v * to.y;
  });

  const scale = useTransform(t, [0, 0.9, 1], [1, 0.5, 0]);
  const opacity = useTransform(t, [0, 0.88, 1], [1, 1, 0]);

  useEffect(() => {
    const controls = animate(t, 1, {
      duration: compact ? 0.7 : 0.9,
      ease: [0.4, 0, 0.2, 1],
      onComplete: () => onDone(id),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const size = compact ? 20 : Math.min(from.size, 44);

  return (
    <motion.div
      className="absolute left-0 top-0"
      style={{ x, y, scale, opacity }}
    >
      <div
        style={{
          width: size,
          height: size,
          transform: "translate(-50%, -50%)",
        }}
      >
        {compact ? (
          <div className="h-full w-full rounded-full bg-foreground" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.url}
            alt=""
            className="h-full w-full invert dark:invert-0"
          />
        )}
      </div>
    </motion.div>
  );
}

export function FlyToCart() {
  const { flies, consumeFly } = useCart();

  if (flies.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {flies.map((f) => (
        <Fly key={f.id} event={f} onDone={consumeFly} />
      ))}
    </div>
  );
}
