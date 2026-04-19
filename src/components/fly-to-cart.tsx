"use client";

import { useEffect, useMemo } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useCart, type FlyEvent } from "@/lib/cart-context";

const APPROACH = 0.68;
const SPIRAL_TURNS = 1.8;

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
    const lift = Math.min(Math.max(dist * 0.22, 60), 180);
    const cx = from.x + dx * 0.55 + (dx >= 0 ? 40 : -40);
    const cy = Math.max(40, Math.min(from.y, to.y) - lift);
    // Point on bezier at t=APPROACH — the spiral's starting anchor.
    const u = 1 - APPROACH;
    const nearX = u * u * from.x + 2 * u * APPROACH * cx + APPROACH * APPROACH * to.x;
    const nearY = u * u * from.y + 2 * u * APPROACH * cy + APPROACH * APPROACH * to.y;
    const startRadius = Math.max(36, Math.hypot(nearX - to.x, nearY - to.y));
    const startAngle = Math.atan2(nearY - to.y, nearX - to.x);
    return { cx, cy, startRadius, startAngle };
  }, [from.x, from.y, to.x, to.y]);

  const t = useMotionValue(0);

  const x = useTransform(t, (v) => {
    if (v <= APPROACH) {
      const p = v / APPROACH;
      const u = 1 - p;
      return u * u * from.x + 2 * u * p * geo.cx + p * p * to.x;
    }
    const p = (v - APPROACH) / (1 - APPROACH);
    const eased = p * p;
    const radius = geo.startRadius * (1 - eased);
    const angle = geo.startAngle + p * Math.PI * 2 * SPIRAL_TURNS;
    return to.x + Math.cos(angle) * radius;
  });

  const y = useTransform(t, (v) => {
    if (v <= APPROACH) {
      const p = v / APPROACH;
      const u = 1 - p;
      return u * u * from.y + 2 * u * p * geo.cy + p * p * to.y;
    }
    const p = (v - APPROACH) / (1 - APPROACH);
    const eased = p * p;
    const radius = geo.startRadius * (1 - eased);
    const angle = geo.startAngle + p * Math.PI * 2 * SPIRAL_TURNS;
    return to.y + Math.sin(angle) * radius;
  });

  const scale = useTransform(t, [0, APPROACH, 1], [1, 0.55, 0]);
  const rotate = useTransform(t, [0, APPROACH, 1], [0, 160, 900]);
  const opacity = useTransform(t, [0, 0.85, 1], [1, 1, 0]);

  useEffect(() => {
    const controls = animate(t, 1, {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
      onComplete: () => onDone(id),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 56,
        dy: (Math.random() - 0.5) * 56,
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
              opacity: [0, 0.9, 0],
              scale: [0, 1, 0],
            }}
            transition={{ duration: 0.55, delay: s.delay, ease: "easeOut" }}
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
