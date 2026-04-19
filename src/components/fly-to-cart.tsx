"use client";

import { useEffect, useState } from "react";
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
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (!pendingFly) {
      setTarget(null);
      setSparkles([]);
      return;
    }
    const pt = getCartPoint();
    setTarget(pt);
    setSparkles(
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 60,
        dy: (Math.random() - 0.5) * 60,
        delay: i * 0.04,
      }))
    );
  }, [pendingFly, getCartPoint]);

  if (!pendingFly || !target) return null;

  const { from } = pendingFly;
  const midX = (from.x + target.x) / 2;
  const arcY = Math.min(from.y, target.y) - 80;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70]">
      <AnimatePresence onExitComplete={consumeFly}>
        <motion.div
          key={pendingFly.id}
          className="absolute"
          initial={{
            left: from.x - from.size / 2,
            top: from.y - from.size / 2,
            width: from.size,
            height: from.size,
            opacity: 1,
            scale: 1,
            rotate: 0,
          }}
          animate={{
            left: [from.x - from.size / 2, midX - from.size / 2, target.x - 8],
            top: [from.y - from.size / 2, arcY - from.size / 2, target.y - 8],
            width: [from.size, from.size * 1.2, 16],
            height: [from.size, from.size * 1.2, 16],
            opacity: [1, 1, 0],
            scale: [1, 1.15, 0.4],
            rotate: [0, -20, 420],
          }}
          transition={{
            duration: 0.9,
            times: [0, 0.55, 1],
            ease: [0.22, 1, 0.36, 1],
          }}
          onAnimationComplete={() => consumeFly()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pendingFly.item.url}
            alt=""
            className="h-full w-full invert dark:invert-0"
            style={{ filter: "drop-shadow(0 0 12px rgba(255,255,255,0.35))" }}
          />
          {sparkles.map((s) => (
            <motion.span
              key={s.id}
              className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-foreground"
              initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
              animate={{
                x: s.dx,
                y: s.dy,
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{ duration: 0.7, delay: s.delay, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
