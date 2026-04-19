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
    <div
      className={cn(
        "flex h-11 w-full items-center gap-2 rounded-lg bg-muted/60 px-3 transition-colors",
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
      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
        <span className="text-foreground">{visible}</span> / {total}
      </span>
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
  );
}
