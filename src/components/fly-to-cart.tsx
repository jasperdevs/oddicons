"use client";

import { useEffect, useMemo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useCart, type FlyEvent } from "@/lib/cart-context";

interface FlyProps {
  event: FlyEvent;
  onDone: (id: number) => void;
}

function Fly({ event, onDone }: FlyProps) {
  const { from, to, item, id } = event;

  const geo = useMemo(() => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy);
    const lift = Math.min(Math.max(dist * 0.22, 60), 160);
    // Two control points — a smooth cubic bezier arc that settles into the target.
    const c1x = from.x + dx * 0.3;
    const c1y = Math.max(32, Math.min(from.y, to.y) - lift);
    const c2x = to.x + (dx >= 0 ? 24 : -24);
    const c2y = to.y - lift * 0.35;
    return { c1x, c1y, c2x, c2y };
  }, [from.x, from.y, to.x, to.y]);

  const t = useMotionValue(0);

  const x = useTransform(t, (v) => {
    const u = 1 - v;
    return (
      u * u * u * from.x +
      3 * u * u * v * geo.c1x +
      3 * u * v * v * geo.c2x +
      v * v * v * to.x
    );
  });

  const y = useTransform(t, (v) => {
    const u = 1 - v;
    return (
      u * u * u * from.y +
      3 * u * u * v * geo.c1y +
      3 * u * v * v * geo.c2y +
      v * v * v * to.y
    );
  });

  const scale = useTransform(t, [0, 0.85, 1], [1, 0.45, 0]);
  const rotate = useTransform(t, [0, 1], [0, 32]);
  const opacity = useTransform(t, [0, 0.88, 1], [1, 1, 0]);

  useEffect(() => {
    const controls = animate(t, 1, {
      duration: 1,
      ease: [0.4, 0, 0.2, 1],
      onComplete: () => onDone(id),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 48,
        dy: (Math.random() - 0.5) * 48,
        delay: i * 0.025,
      })),
    []
  );

  return (
    <>
      <div
        className="pointer-events-none absolute"
        style={{ left: from.x, top: from.y }}
      >
        {sparkles.map((s) => (
          <motion.span
            key={s.id}
            className="absolute h-1 w-1 rounded-full bg-foreground"
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: s.dx,
              y: s.dy,
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{ duration: 0.5, delay: s.delay, ease: "easeOut" }}
          />
        ))}
      </div>

      <motion.div
        className="absolute left-0 top-0"
        style={{ x, y, scale, rotate, opacity }}
      >
        <div
          style={{
            width: from.size,
            height: from.size,
            transform: "translate(-50%, -50%)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.url}
            alt=""
            className="h-full w-full invert dark:invert-0"
          />
        </div>
      </motion.div>
    </>
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
