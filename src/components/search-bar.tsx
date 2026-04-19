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
    <div className="mx-auto w-full max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-balance text-[28px] font-semibold leading-tight tracking-tight text-foreground sm:text-[34px]">
            a weird little pack of AI icons.
          </h1>
          <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-muted-foreground">
            Free, monochrome, slightly odd. Copy, download, remix.
          </p>
        </div>
        <div className="shrink-0 text-[12px] tabular-nums text-muted-foreground">
          <span className="text-foreground">{visible}</span> / {total} icons
        </div>
      </div>

      <div
        className={cn(
          "mt-6 flex h-11 w-full items-center gap-2 rounded-lg border border-border bg-card/60 px-3",
          "focus-within:border-foreground/30"
        )}
      >
        <Search size={16} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search icons, categories, tags…"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/70 outline-none"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
