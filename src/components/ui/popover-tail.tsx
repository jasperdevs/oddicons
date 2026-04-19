"use client";

import { cn } from "@/lib/utils";

interface PopoverTailProps {
  direction: "up" | "down";
  className?: string;
  style?: React.CSSProperties;
}

const WIDTH = 22;
const HEIGHT = 10;

export function PopoverTail({ direction, className, style }: PopoverTailProps) {
  const d =
    direction === "up"
      ? `M 0.5 ${HEIGHT} L ${WIDTH / 2} 0.5 L ${WIDTH - 0.5} ${HEIGHT}`
      : `M 0.5 0 L ${WIDTH / 2} ${HEIGHT - 0.5} L ${WIDTH - 0.5} 0`;

  return (
    <svg
      aria-hidden
      width={WIDTH}
      height={HEIGHT}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      fill="none"
      className={cn("pointer-events-none absolute", className)}
      style={style}
    >
      <path
        d={d}
        fill="var(--card)"
        stroke="var(--border)"
        strokeWidth="1"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const POPOVER_TAIL_WIDTH = WIDTH;
export const POPOVER_TAIL_HEIGHT = HEIGHT;
