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

const ALIASES: Record<string, string[]> = {
  money: ["dollar", "coin", "cash", "wallet", "money-bag", "card"],
  cash: ["dollar", "coin", "wallet", "money-bag"],
  coin: ["coin", "dollar", "cash"],
  pay: ["card", "coin", "dollar", "wallet"],
  payment: ["card", "wallet", "dollar"],
  buy: ["cart", "bag", "card", "shop"],
  shopping: ["cart", "bag", "shop"],
  store: ["shop", "bag"],
  clipboard: ["copy"],
  paste: ["copy"],
  duplicate: ["copy"],
  "copy and paste": ["copy"],
  delete: ["trash", "x", "close"],
  remove: ["trash", "minus", "x"],
  add: ["plus"],
  new: ["plus"],
  create: ["plus", "edit"],
  cancel: ["x", "close"],
  done: ["check"],
  yes: ["check"],
  ok: ["check"],
  tick: ["check"],
  cross: ["x"],
  close: ["close", "x"],
  home: ["house"],
  person: ["user"],
  profile: ["user"],
  account: ["user"],
  avatar: ["user"],
  people: ["users"],
  team: ["users"],
  chat: ["message"],
  talk: ["message"],
  speech: ["message"],
  comment: ["message"],
  email: ["mail", "at"],
  envelope: ["mail"],
  inbox: ["mail"],
  alert: ["bell", "exclamation"],
  warn: ["exclamation"],
  warning: ["exclamation"],
  danger: ["bomb", "skull", "exclamation"],
  error: ["exclamation", "x"],
  notification: ["bell"],
  ring: ["bell"],
  info: ["question"],
  help: ["question"],
  ask: ["question"],
  faq: ["question"],
  world: ["globe", "planet"],
  earth: ["globe", "planet"],
  international: ["globe"],
  space: ["planet", "star"],
  dark: ["moon"],
  night: ["moon"],
  light: ["sun", "bolt", "lightbulb"],
  day: ["sun"],
  weather: ["sun", "moon"],
  fav: ["heart", "star", "bookmark"],
  favorite: ["heart", "star", "bookmark"],
  love: ["heart"],
  like: ["heart", "star"],
  rating: ["star"],
  save: ["bookmark", "download"],
  time: ["clock", "calendar"],
  date: ["calendar"],
  schedule: ["calendar", "clock"],
  event: ["calendar"],
  gallery: ["image"],
  photo: ["image"],
  picture: ["image"],
  camera: ["image"],
  play: ["video"],
  movie: ["video"],
  film: ["video"],
  media: ["video", "music", "image"],
  sound: ["music"],
  audio: ["music"],
  song: ["music"],
  lightning: ["bolt"],
  thunder: ["bolt"],
  power: ["bolt"],
  energy: ["bolt"],
  fast: ["bolt"],
  idea: ["lightbulb", "sparkles"],
  magic: ["sparkles", "bolt"],
  magnify: ["search"],
  find: ["search"],
  look: ["search", "eye"],
  group: ["users"],
  party: ["users"],
  gift: ["gift", "package"],
  present: ["gift"],
  birthday: ["gift", "crown"],
  box: ["package"],
  shipping: ["truck", "package"],
  delivery: ["truck", "package"],
  ship: ["truck"],
  truck: ["truck"],
  price: ["tag", "dollar"],
  discount: ["percent", "tag"],
  sale: ["percent", "tag"],
  off: ["percent"],
  win: ["trophy", "crown", "star"],
  winner: ["trophy", "crown"],
  award: ["trophy", "crown", "star"],
  game: ["dice"],
  luck: ["dice"],
  random: ["dice"],
  roll: ["dice"],
  premium: ["crown", "diamond", "star"],
  vip: ["crown", "diamond"],
  king: ["crown"],
  queen: ["crown"],
  royalty: ["crown"],
  gem: ["diamond"],
  jewel: ["diamond"],
  death: ["skull"],
  pirate: ["skull"],
  explode: ["bomb"],
  explosion: ["bomb"],
  pet: ["cat"],
  animal: ["cat"],
  kitty: ["cat"],
  secure: ["lock", "shield"],
  security: ["lock", "shield"],
  private: ["lock"],
  protect: ["shield", "lock"],
  view: ["eye"],
  see: ["eye"],
  watch: ["eye"],
  preview: ["eye"],
  data: ["chart"],
  stats: ["chart"],
  statistics: ["chart"],
  analytics: ["chart"],
  graph: ["chart"],
  share: ["share", "link"],
  url: ["link"],
  hyperlink: ["link"],
  attach: ["link"],
  edit: ["edit"],
  pencil: ["edit"],
  pen: ["edit"],
  write: ["edit"],
  bookmark: ["bookmark", "pin"],
  marker: ["pin"],
  location: ["pin"],
  map: ["pin", "globe"],
  place: ["pin"],
  address: ["pin"],
  folder: ["folder", "file"],
  directory: ["folder"],
  archive: ["folder", "document"],
  arrow: ["arrow-up", "arrow-down", "arrow-left", "arrow-right"],
  direction: ["arrow-up", "arrow-down", "arrow-left", "arrow-right"],
  up: ["arrow-up"],
  down: ["arrow-down"],
  left: ["arrow-left"],
  right: ["arrow-right"],
  next: ["arrow-right"],
  back: ["arrow-left"],
  forward: ["arrow-right"],
  previous: ["arrow-left"],
  option: ["settings", "filter", "sort"],
  options: ["settings", "filter", "sort"],
  config: ["settings"],
  preferences: ["settings"],
  gear: ["settings"],
  cog: ["settings"],
  menu: ["menu"],
  hamburger: ["menu"],
  list: ["menu"],
  license: ["license", "document"],
  legal: ["license", "document"],
  terms: ["license", "document"],
  contract: ["license", "document"],
  doc: ["document"],
  docs: ["document", "file"],
  note: ["document", "file"],
  page: ["document", "file"],
  files: ["file", "folder"],
  paper: ["document", "file"],
  import: ["upload"],
  export: ["download"],
  trash: ["trash"],
  bin: ["trash"],
  garbage: ["trash"],
  clear: ["trash", "x"],
  phone: ["phone"],
  call: ["phone"],
  mobile: ["phone"],
  house: ["house"],
  building: ["house"],
  filter: ["filter"],
  sort: ["sort", "sort-az", "sort-az-ascending"],
  ascending: ["sort-az"],
  descending: ["sort-az-ascending"],
  alphabetical: ["sort-az", "sort-az-ascending"],
  order: ["sort", "sort-az"],
  sparkle: ["sparkles"],
  star: ["star", "sparkles"],
  twinkle: ["sparkles"],
  wallet: ["wallet", "card", "cash"],
  card: ["card", "wallet"],
  credit: ["card"],
  debit: ["card"],
  send: ["send", "arrow-right"],
  submit: ["send"],
  message: ["message", "mail"],
};

function score(icon: IconEntry, q: string): number {
  const needle = q.toLowerCase();
  const name = icon.name.toLowerCase();
  const cat = icon.category.toLowerCase();
  const slug = icon.file.replace(/\.[^.]+$/, "").toLowerCase();

  if (name === needle) return 1000;
  if (slug === needle) return 950;
  if (name.startsWith(needle)) return 900;
  if (slug.startsWith(needle)) return 860;
  if (name.split(" ").some((w) => w === needle)) return 820;
  if (slug.split("-").some((w) => w === needle)) return 800;
  if (name.includes(needle)) return 700;
  if (slug.includes(needle)) return 650;
  if (cat === needle) return 500;
  if (cat.startsWith(needle)) return 460;
  if (cat.includes(needle)) return 400;

  for (const [alias, targets] of Object.entries(ALIASES)) {
    const matches =
      alias === needle ||
      (needle.length >= 3 && alias.startsWith(needle)) ||
      (alias.length >= 3 && needle.startsWith(alias));
    if (!matches) continue;
    for (const t of targets) {
      if (slug === t) return 340;
      if (slug.includes(t)) return 300;
      if (name.includes(t)) return 280;
    }
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
