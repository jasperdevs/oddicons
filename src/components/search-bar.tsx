"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hash, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  total: number;
  suggestions: string[];
}

function isEditable(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

const MAX_SUGGESTIONS = 8;

export function SearchBar({ value, onChange, total, suggestions }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !isEditable(e.target)) {
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
  }, []);

  useEffect(() => {
    if (!focused) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      setFocused(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [focused]);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions.slice(0, MAX_SUGGESTIONS);
    return suggestions
      .filter((t) => t.toLowerCase().includes(q) && t.toLowerCase() !== q)
      .slice(0, MAX_SUGGESTIONS);
  }, [value, suggestions]);

  const showSuggestions = focused && filtered.length > 0;

  return (
    <div ref={wrapRef} className="relative">
      <div
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-xl bg-muted pl-5 pr-5 transition-colors duration-[180ms]",
          "focus-within:ring-1 focus-within:ring-border"
        )}
      >
        <Search size={16} strokeWidth={1.75} className="shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder={`search ${total} icons`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/70 outline-none"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="clear search"
            className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
          >
            <X size={14} />
          </button>
        ) : (
          <span
            aria-hidden
            className="hidden shrink-0 text-[14px] text-muted-foreground sm:inline"
          >
            /
          </span>
        )}
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: "top center" }}
            className="absolute left-0 right-0 top-full z-40 mt-2 rounded-xl border border-border bg-card p-2 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.6),_0_8px_16px_-6px_rgba(0,0,0,0.35)]"
          >
            <div className="mb-1 flex items-center gap-1.5 px-2 pt-1 text-[11px] uppercase tracking-[0.08em] text-muted-foreground/70">
              <Hash size={10} strokeWidth={2} />
              <span>tags</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {filtered.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onChange(tag);
                    inputRef.current?.focus();
                  }}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-sidebar px-2 py-1 text-[12px] font-medium text-muted-foreground transition-colors duration-[140ms] hover:border-foreground/30 hover:bg-accent hover:text-foreground"
                >
                  <Hash size={10} strokeWidth={2} className="opacity-50" />
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
