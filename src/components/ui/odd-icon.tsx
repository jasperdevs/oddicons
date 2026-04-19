"use client";

import { iconThumbUrl } from "@/lib/icon-url";
import { cn } from "@/lib/utils";

interface OddIconProps {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
}

export function OddIcon({ name, size = 20, className, alt = "" }: OddIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconThumbUrl(`${name}.png`)}
      alt={alt}
      aria-hidden={alt === ""}
      draggable={false}
      width={size}
      height={size}
      className={cn("shrink-0 select-none", className)}
      style={{ width: size, height: size }}
    />
  );
}
