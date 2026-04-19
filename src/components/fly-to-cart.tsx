"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/lib/cart-context";

interface Sparkle {
  id: number;
  dx: number;
  dy: number;
  delay: number;
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

  const sparkles: Sparkle[] = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 48,
        dy: (Math.random() - 0.5) * 48,
        delay: i * 0.03,
      })),
    [pendingFly?.id]
  );

  if (!pendingFly || !target) return null;

  const { from } = pendingFly;
  const dx = target.x - from.x;
  const dy = target.y - from.y;
  // Subtle horizontal curve — pulls slightly inward, never above viewport.
  const curveX = dx * 0.7;
  const curveY = dy * 0.25;
  const finalSize = 18;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <AnimatePresence onExitComplete={consumeFly}>
        <motion.div
          key={pendingFly.id}
          className="absolute"
          style={{ left: from.x, top: from.y }}
          initial={{ x: -from.size / 2, y: -from.size / 2, opacity: 1 }}
          animate={{
            x: [
              -from.size / 2,
              curveX - finalSize / 2,
              dx - finalSize / 2,
            ],
            y: [
              -from.size / 2,
              curveY - finalSize / 2,
              dy - finalSize / 2,
            ],
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 0.72,
            times: [0, 0.6, 1],
            ease: [0.34, 1.2, 0.64, 1],
          }}
          onAnimationComplete={consumeFly}
        >
          <motion.div
            initial={{ width: from.size, height: from.size, rotate: 0, scale: 1 }}
            animate={{
              width: [from.size, from.size * 0.6, finalSize],
              height: [from.size, from.size * 0.6, finalSize],
              rotate: [0, 180, 360],
              scale: [1, 0.9, 0.4],
            }}
            transition={{
              duration: 0.72,
              times: [0, 0.6, 1],
              ease: [0.34, 1.2, 0.64, 1],
            }}
            className="relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingFly.item.url}
              alt=""
              className="h-full w-full invert dark:invert-0"
            />
            {sparkles.map((s) => (
              <motion.span
                key={s.id}
                className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-foreground"
                initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                animate={{
                  x: s.dx,
                  y: s.dy,
                  opacity: [0, 0.9, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 0.55,
                  delay: s.delay,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
