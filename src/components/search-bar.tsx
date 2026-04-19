"use client";

import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  total: number;
  visible: number;
}

export function SearchBar({ value, onChange, total, visible }: SearchBarProps) {
  return (
    <div className="pt-8 sm:pt-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-balance text-[30px] font-semibold leading-[1.05] tracking-tight text-foreground sm:text-[40px]">
            a weird little pack <br className="hidden sm:inline" />
            of AI icons.
          </h1>
          <p className="mt-3 max-w-lg text-[14px] leading-relaxed text-muted-foreground">
            free, monochrome, slightly odd. copy the SVG or add to cart and grab as PNGs.
          </p>
        </div>
        <div className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
          <span className="text-foreground">{visible}</span> / {total} icons
        </div>
      </div>

      <div
        className={cn(
          "mt-6 flex h-11 w-full items-center gap-2 rounded-lg bg-muted/60 px-3",
          "focus-within:bg-muted"
        )}
      >
        <Search size={16} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="search icons, categories, tags…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/70 outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
