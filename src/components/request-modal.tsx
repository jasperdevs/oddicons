"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RequestForm } from "@/components/request-form";
import { springs } from "@/lib/springs";

interface RequestModalProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLButtonElement | null>;
}

const PANEL_MAX_WIDTH = 440;
const GAP = 14;

export function RequestModal({ open, onClose, anchorRef }: RequestModalProps) {
  const [pos, setPos] = useState<{
    left: number;
    bottom: number;
    tailX: number;
    width: number;
  } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const compute = () => {
      const width = Math.min(PANEL_MAX_WIDTH, window.innerWidth - 24);
      const el = anchorRef.current;
      if (!el) {
        setPos({
          left: (window.innerWidth - width) / 2,
          bottom: 80,
          tailX: width / 2,
          width,
        });
        return;
      }
      const r = el.getBoundingClientRect();
      const centerX = r.left + r.width / 2;
      let left = centerX - width / 2;
      const minLeft = 12;
      const maxLeft = window.innerWidth - width - 12;
      left = Math.max(minLeft, Math.min(left, maxLeft));
      const bottom = window.innerHeight - r.top + GAP;
      const tailX = centerX - left;
      setPos({ left, bottom, tailX, width });
    };
    compute();
    window.addEventListener("resize", compute);
    window.addEventListener("scroll", compute, true);
    return () => {
      window.removeEventListener("resize", compute);
      window.removeEventListener("scroll", compute, true);
    };
  }, [open, anchorRef]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose, anchorRef]);

  return (
    <AnimatePresence>
      {open && pos && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-[60] bg-background/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
        <motion.div
          key="panel"
          ref={panelRef}
          role="dialog"
          aria-label="request an icon"
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.96 }}
          transition={springs.moderate}
          style={{
            left: pos.left,
            bottom: pos.bottom,
            width: pos.width,
            transformOrigin: `${pos.tailX}px calc(100% + ${GAP}px)`,
          }}
          className="fixed z-[61]"
        >
          <div className="relative rounded-2xl border border-border bg-card p-5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7),_0_12px_24px_-8px_rgba(0,0,0,0.4)]">
              <div
                aria-hidden
                className="absolute h-3 w-3 rotate-45 border-b border-r border-border bg-card"
                style={{
                  left: pos.tailX - 6,
                  bottom: -6,
                }}
              />
              <RequestForm />
          </div>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
