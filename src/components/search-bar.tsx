"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  total: number;
}

export function SearchBar({ value, onChange, total }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || navigator.platform || "";
    setIsMac(/Mac|iPhone|iPod|iPad/i.test(ua));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMac]);

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
        placeholder={`search ${total} icons…`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/70 outline-none"
      />
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
        <div
          aria-hidden
          className="hidden shrink-0 items-center gap-1 sm:flex"
        >
          <kbd className="grid h-6 min-w-6 place-items-center rounded-md border border-border/70 bg-background/60 px-1.5 font-mono text-[11px] font-medium text-muted-foreground">
            {isMac ? "⌘" : "Ctrl"}
          </kbd>
          <kbd className="grid h-6 min-w-6 place-items-center rounded-md border border-border/70 bg-background/60 px-1.5 font-mono text-[11px] font-medium text-muted-foreground">
            K
          </kbd>
        </div>
      )}
    </div>
  );
}
