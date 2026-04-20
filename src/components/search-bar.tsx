"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OddIcon } from "@/components/ui/odd-icon";
import { cn } from "@/lib/utils";

interface IconEntry {
  name: string;
  file: string;
  category: string;
}

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  total: number;
  items: IconEntry[];
}

// Only truly unrelated synonyms — words that share no letters with the icon name.
// Anything mechanically derivable (typos, prefixes, substrings) is handled by the fuzzy matcher.
const SEMANTIC_HINTS: Record<string, string[]> = {
  buy: ["cart", "bag", "shop", "card"],
  shopping: ["cart", "bag", "shop"],
  money: ["dollar", "coin", "cash", "wallet", "money-bag", "card"],
  pay: ["card", "dollar", "wallet", "paypal"],
  tip: ["kofi", "paypal", "dollar"],
  donate: ["kofi", "paypal", "heart"],
  coffee: ["kofi"],
  home: ["house"],
  person: ["user"],
  people: ["users"],
  team: ["users"],
  chat: ["message", "discord"],
  email: ["mail", "gmail", "at"],
  inbox: ["mail", "gmail"],
  envelope: ["mail"],
  alert: ["bell", "exclamation"],
  warning: ["exclamation", "bomb"],
  danger: ["bomb", "skull"],
  info: ["question"],
  help: ["question"],
  world: ["globe", "planet"],
  earth: ["globe", "planet"],
  dark: ["moon"],
  night: ["moon"],
  day: ["sun"],
  light: ["sun", "bolt"],
  fav: ["heart", "star"],
  love: ["heart"],
  like: ["heart", "star"],
  rating: ["star"],
  time: ["clock", "calendar"],
  date: ["calendar"],
  photo: ["image"],
  picture: ["image"],
  camera: ["image"],
  play: ["video"],
  movie: ["video"],
  sound: ["music", "spotify"],
  audio: ["music"],
  song: ["music", "spotify"],
  lightning: ["bolt"],
  thunder: ["bolt"],
  power: ["bolt"],
  energy: ["bolt"],
  fast: ["bolt"],
  magic: ["sparkles", "bolt"],
  idea: ["sparkles", "bolt"],
  box: ["package"],
  delivery: ["truck", "package"],
  price: ["tag", "dollar"],
  sale: ["percent", "tag"],
  discount: ["percent", "tag"],
  win: ["trophy", "crown"],
  award: ["trophy", "crown", "star"],
  game: ["dice"],
  luck: ["dice"],
  premium: ["crown", "diamond"],
  gem: ["diamond"],
  jewel: ["diamond"],
  pet: ["cat"],
  animal: ["cat"],
  view: ["eye"],
  see: ["eye"],
  watch: ["eye"],
  data: ["chart"],
  stats: ["chart"],
  graph: ["chart"],
  url: ["link"],
  pencil: ["edit"],
  pen: ["edit"],
  write: ["edit"],
  location: ["pin"],
  map: ["pin", "globe"],
  back: ["arrow-left"],
  previous: ["arrow-left"],
  next: ["arrow-right"],
  forward: ["arrow-right"],
  up: ["arrow-up"],
  down: ["arrow-down"],
  config: ["settings"],
  gear: ["settings"],
  cog: ["settings"],
  bin: ["trash"],
  garbage: ["trash"],
  call: ["phone"],
  mobile: ["phone"],
  building: ["house"],
  twitter: ["x-twitter"],
  tweet: ["x-twitter"],
  social: ["x-twitter", "instagram", "reddit", "tiktok", "youtube", "discord"],
  ai: ["chatgpt", "claude", "gemini", "sparkles"],
  llm: ["chatgpt", "claude", "gemini"],
  chatbot: ["chatgpt", "claude", "gemini"],
  openai: ["chatgpt"],
  anthropic: ["claude"],
  google: ["gemini", "gmail"],
  gpt: ["chatgpt"],
  brand: ["github", "discord", "x-twitter", "instagram", "reddit", "youtube", "tiktok", "spotify", "gmail", "chatgpt", "claude", "gemini", "paypal", "kofi"],
  logo: ["github", "discord", "x-twitter", "instagram", "reddit", "youtube", "tiktok", "spotify", "gmail", "chatgpt", "claude", "gemini", "paypal", "kofi"],
  stream: ["spotify", "youtube"],
  code: ["github"],
  git: ["github"],
};

function tokenize(s: string): string[] {
  return s.toLowerCase().split(/[\s\-_/]+/).filter(Boolean);
}

function bigrams(s: string): Set<string> {
  const padded = ` ${s} `;
  const out = new Set<string>();
  for (let i = 0; i < padded.length - 1; i++) out.add(padded.slice(i, i + 2));
  return out;
}

function dice(a: Set<string>, b: Set<string>): number {
  if (a.size + b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return (2 * inter) / (a.size + b.size);
}

function score(icon: IconEntry, q: string): number {
  const needle = q.toLowerCase().trim();
  if (!needle) return 0;
  const name = icon.name.toLowerCase();
  const slug = icon.file.replace(/\.[^.]+$/, "").toLowerCase();
  const cat = icon.category.toLowerCase();
  const words = [...tokenize(name), ...tokenize(slug)];

  if (name === needle || slug === needle) return 1000;
  if (words.includes(needle)) return 880;
  if (name.startsWith(needle) || slug.startsWith(needle)) return 820;
  if (words.some((w) => w.startsWith(needle))) return 740;
  if (needle.length >= 2 && (name.includes(needle) || slug.includes(needle))) return 600;

  if (cat === needle) return 480;
  if (cat.startsWith(needle)) return 420;
  if (cat.includes(needle)) return 360;

  const hinted = SEMANTIC_HINTS[needle];
  if (hinted) {
    for (const t of hinted) {
      if (slug === t) return 340;
      if (slug.includes(t) || name.includes(t)) return 300;
    }
  }

  if (needle.length >= 3) {
    const qb = bigrams(needle);
    let best = 0;
    for (const w of words) {
      if (w.length < 3) continue;
      const d = dice(qb, bigrams(w));
      if (d > best) best = d;
    }
    if (best >= 0.55) return Math.round(best * 280);
  }

  return 0;
}

function getSuggestions(items: IconEntry[], q: string, limit = 7): IconEntry[] {
  const trimmed = q.trim();
  if (!trimmed) return [];
  return items
    .map((icon) => ({ icon, s: score(icon, trimmed) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, limit)
    .map((x) => x.icon);
}

function isEditable(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable;
}

export function SearchBar({ value, onChange, total, items }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);
  const [activeState, setActiveState] = useState<{ value: string; index: number }>({
    value: "",
    index: 0,
  });

  const suggestions = useMemo(() => getSuggestions(items, value, 7), [items, value]);
  const activeIndex = activeState.value === value ? activeState.index : 0;
  const setActiveIndex = (updater: number | ((prev: number) => number)) => {
    setActiveState((prev) => {
      const base = prev.value === value ? prev.index : 0;
      const next = typeof updater === "function" ? updater(base) : updater;
      return { value, index: next };
    });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !isEditable(e.target)) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!focused) return;
    const onDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setFocused(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [focused]);

  const commitSuggestion = (icon: IconEntry) => {
    onChange(icon.name.toLowerCase());
    setFocused(false);
    inputRef.current?.blur();
  };

  const showDropdown = focused && value.trim().length > 0 && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-xl bg-muted pl-5 pr-5 transition-[background-color,border-radius] duration-[180ms]",
          "focus-within:ring-1 focus-within:ring-border"
        )}
      >
        <OddIcon name="search" size={20} />
        <input
          ref={inputRef}
          type="text"
          placeholder={`search ${total} icons`}
          value={value}
          onFocus={() => setFocused(true)}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              inputRef.current?.blur();
              setFocused(false);
              return;
            }
            if (!showDropdown) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => (i + 1) % suggestions.length);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
            } else if (e.key === "Enter") {
              e.preventDefault();
              const chosen = suggestions[activeIndex];
              if (chosen) commitSuggestion(chosen);
            }
          }}
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="search-suggestions"
          aria-autocomplete="list"
          className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground/70 outline-none"
        />
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            aria-label="clear search"
            className="grid h-6 w-6 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          >
            <OddIcon name="x" size={16} />
          </button>
        ) : (
          <span aria-hidden className="hidden shrink-0 text-[14px] text-muted-foreground sm:inline">
            /
          </span>
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            id="search-suggestions"
            role="listbox"
            initial={{ opacity: 0, y: -4, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.985 }}
            transition={{ duration: 0.14, ease: [0.2, 0.8, 0.2, 1] }}
            className="absolute inset-x-0 top-full z-50 mt-1.5 origin-top overflow-hidden rounded-xl border border-border bg-card p-1 shadow-[0_12px_24px_-12px_rgba(0,0,0,0.45),_0_4px_8px_-4px_rgba(0,0,0,0.25)]"
          >
            {suggestions.map((icon, i) => {
              const slug = icon.file.replace(/\.[^.]+$/, "");
              const active = i === activeIndex;
              return (
                <button
                  key={icon.name}
                  type="button"
                  role="option"
                  aria-selected={active}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    commitSuggestion(icon);
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left outline-none transition-colors duration-[140ms]",
                    active ? "bg-accent" : "bg-transparent"
                  )}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted">
                    <OddIcon name={slug} size={26} />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-foreground">
                    {icon.name.toLowerCase()}
                  </span>
                  <span className="shrink-0 text-[12px] text-muted-foreground">
                    {icon.category.toLowerCase()}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
