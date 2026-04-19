"use client";

import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  total: number;
  visible: number;
}

export function SearchBar({ value, onChange, total, visible }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const tag = (e.target as HTMLElement | null)?.tagName;
        const editable = (e.target as HTMLElement | null)?.isContentEditable;
        if (tag === "INPUT" || tag === "TEXTAREA" || editable) return;
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div
      className={cn(
        "flex h-11 w-full items-center gap-2 rounded-lg bg-muted/60 px-3 transition-colors",
        "focus-within:bg-muted"
      )}
    >
      <Search size={16} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        placeholder="search icons, categories, tags…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/70 outline-none"
      />
      <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
        <span className="text-foreground">{visible}</span> / {total}
      </span>
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="grid h-6 w-6 place-items-center rounded text-muted-foreground hover:bg-background hover:text-foreground"
        >
          <X size={14} />
        </button>
      ) : (
        <kbd
          aria-hidden
          className="hidden h-6 items-center rounded border border-border/70 px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex"
        >
          /
        </kbd>
      )}
    </div>
  );
}
