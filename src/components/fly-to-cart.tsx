"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";

const STEPS = 30;
const FINAL_SIZE = 16;

function buildPath(
  from: { x: number; y: number },
  to: { x: number; y: number }
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  // Control point: biased toward target, slight lift but viewport-safe.
  const lift = Math.min(Math.max(dist * 0.18, 40), 140);
  const cx = from.x + dx * 0.55 + (dx > 0 ? 20 : -20);
  const cy = Math.max(40, Math.min(from.y, to.y) - lift);

  const left: number[] = [];
  const top: number[] = [];
  const scale: number[] = [];
  const rotate: number[] = [];
  const opacity: number[] = [];
  const times: number[] = [];

  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const u = 1 - t;
    const x = u * u * from.x + 2 * u * t * cx + t * t * to.x;
    const y = u * u * from.y + 2 * u * t * cy + t * t * to.y;
    left.push(x);
    top.push(y);
    scale.push(1 - t * 0.7);
    rotate.push(t * 420);
    opacity.push(t < 0.9 ? 1 : 1 - (t - 0.9) / 0.1);
    times.push(t);
  }
  return { left, top, scale, rotate, opacity, times };
}

export function FlyToCart() {
  const { pendingFly, consumeFly, getCartPoint } = useCart();
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!pendingFly) {
      setTarget(null);
      return;
    }
    setTarget(getCartPoint());
  }, [pendingFly, getCartPoint]);

  const sparkles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 56,
        dy: (Math.random() - 0.5) * 56,
        delay: i * 0.025,
      })),
    [pendingFly?.id]
  );

  if (!pendingFly || !target) return null;

  const path = buildPath(pendingFly.from, target);

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      {/* Sparkle burst at the source */}
      <div
        className="absolute"
        style={{ left: pendingFly.from.x, top: pendingFly.from.y }}
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

      <AnimatePresence onExitComplete={consumeFly}>
        <motion.div
          key={pendingFly.id}
          className="absolute"
          style={{ width: pendingFly.from.size, height: pendingFly.from.size }}
          initial={{
            left: pendingFly.from.x - pendingFly.from.size / 2,
            top: pendingFly.from.y - pendingFly.from.size / 2,
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          animate={{
            left: path.left.map((x) => x - pendingFly.from.size / 2),
            top: path.top.map((y) => y - pendingFly.from.size / 2),
            scale: path.scale,
            rotate: path.rotate,
            opacity: path.opacity,
          }}
          transition={{
            duration: 0.75,
            times: path.times,
            ease: [0.4, 0, 0.2, 1],
          }}
          onAnimationComplete={consumeFly}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pendingFly.item.url}
            alt=""
            className="h-full w-full invert dark:invert-0"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
