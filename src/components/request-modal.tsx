"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RequestForm } from "@/components/request-form";
import { PopoverTail } from "@/components/ui/popover-tail";

interface RequestModalProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
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
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
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
    <AnimatePresence initial={false}>
      {open && pos && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-[60] bg-background/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
          />
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-label="request an icon"
            initial={{ opacity: 0, y: 10, scale: 0.92, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 5, scale: 0.96, filter: "blur(3px)" }}
            transition={{ type: "spring", duration: 0.18, bounce: 0 }}
            style={{
              left: pos.left,
              bottom: pos.bottom,
              width: pos.width,
              transformOrigin: `${pos.tailX}px calc(100% + ${GAP}px)`,
            }}
            className="fixed z-[61]"
          >
            <div className="relative rounded-2xl border border-border bg-card p-5 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45),_0_2px_6px_-2px_rgba(0,0,0,0.22)]">
              <PopoverTail
                direction="down"
                style={{
                  left: pos.tailX - 11,
                  bottom: -9,
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
