"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { OddIcon } from "@/components/ui/odd-icon";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  total: number;
}

function isEditable(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function SearchBar({ value, onChange, total }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div
      className={cn(
        "flex h-11 w-full items-center gap-3 rounded-xl bg-muted pl-5 pr-5 transition-colors duration-[180ms]",
        "focus-within:ring-1 focus-within:ring-border"
      )}
    >
      <OddIcon name="search" size={20} />
      <input
        ref={inputRef}
        type="text"
        placeholder={`search ${total} icons`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
  );
}
