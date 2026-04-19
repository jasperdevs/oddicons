"use client";

import { Switch as BaseSwitch } from "@base-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/springs";
import { fontWeights } from "@/lib/font-weight";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  label?: string;
  hint?: string;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  hint,
  className,
}: SwitchProps) {
  const reduce = useReducedMotion();
  const transition = reduce ? { duration: 0 } : springs.moderate;

  return (
    <label
      className={cn(
        "group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2.5 transition-colors duration-[180ms] hover:bg-accent/60",
        className
      )}
    >
      {(label || hint) && (
        <div className="flex min-w-0 flex-1 flex-col">
          {label && (
            <span
              className="text-[12.5px] text-foreground transition-[font-variation-settings] duration-150"
              style={{
                fontVariationSettings: checked
                  ? fontWeights.semibold
                  : fontWeights.medium,
              }}
            >
              {label}
            </span>
          )}
          {hint && (
            <span className="text-[11px] text-muted-foreground">{hint}</span>
          )}
        </div>
      )}
      <BaseSwitch.Root
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={cn(
          "relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full border outline-none",
          "transition-colors duration-[180ms]",
          "focus-visible:ring-2 focus-visible:ring-foreground/20",
          "data-[checked]:border-foreground data-[checked]:bg-foreground",
          "data-[unchecked]:border-border data-[unchecked]:bg-sidebar"
        )}
      >
        <motion.span
          aria-hidden
          initial={false}
          animate={{
            x: checked ? 19 : 3,
            scale: 1,
            backgroundColor: checked
              ? "var(--background)"
              : "var(--muted-foreground)",
          }}
          whileTap={{ scale: 0.88 }}
          transition={transition}
          className="block h-[14px] w-[14px] rounded-full shadow-sm"
        />
      </BaseSwitch.Root>
    </label>
  );
}
