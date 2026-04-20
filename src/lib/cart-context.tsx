"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  name: string;
  file: string;
  url: string;
  monochrome: boolean;
}

export interface FlyEvent {
  id: number;
  item: CartItem;
  from: { x: number; y: number; size: number };
  to: { x: number; y: number };
  compact?: boolean;
}

interface CartContextValue {
  items: CartItem[];
  has: (name: string) => boolean;
  add: (
    item: CartItem,
    from: { x: number; y: number; size: number },
    opts?: { compact?: boolean; silent?: boolean }
  ) => void;
  remove: (name: string) => void;
  clear: () => void;
  setCartAnchor: (el: HTMLElement | null) => void;
  getCartPoint: () => { x: number; y: number } | null;
  getCartRect: () => DOMRect | null;
  flies: FlyEvent[];
  consumeFly: (id: number) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  bumpCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "oddicons:cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [flies, setFlies] = useState<FlyEvent[]>([]);
  const [open, setOpen] = useState(false);
  const [bumpCount, setBumpCount] = useState(0);
  const anchorRef = useRef<HTMLElement | null>(null);
  const idRef = useRef(0);
  const itemNames = useMemo(() => new Set(items.map((item) => item.name)), [items]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(
            parsed.map((i) => ({
              name: String(i.name ?? ""),
              file: String(i.file ?? ""),
              url: String(i.url ?? ""),
              monochrome: Boolean(i.monochrome),
            }))
          );
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);

  const has = useCallback((name: string) => itemNames.has(name), [itemNames]);

  const add = useCallback(
    (
      item: CartItem,
      from: { x: number; y: number; size: number },
      opts?: { compact?: boolean; silent?: boolean }
    ) => {
      setItems((prev) => (prev.some((i) => i.name === item.name) ? prev : [...prev, item]));
      if (opts?.silent) {
        return;
      }
      const el = anchorRef.current;
      const to = el
        ? (() => {
            const r = el.getBoundingClientRect();
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          })()
        : { x: window.innerWidth - 40, y: 40 };
      idRef.current += 1;
      const id = idRef.current;
      setFlies((prev) => [...prev, { id, item, from, to, compact: opts?.compact }]);
      if (opts?.compact) {
        setBumpCount((c) => c + 1);
      }
    },
    []
  );

  const remove = useCallback((name: string) => {
    setItems((prev) => prev.filter((i) => i.name !== name));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const setCartAnchor = useCallback((el: HTMLElement | null) => {
    anchorRef.current = el;
  }, []);

  const getCartPoint = useCallback(() => {
    const el = anchorRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, []);

  const getCartRect = useCallback(() => anchorRef.current?.getBoundingClientRect() ?? null, []);

  const consumeFly = useCallback((id: number) => {
    setFlies((prev) => prev.filter((f) => f.id !== id));
    setBumpCount((c) => c + 1);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      has,
      add,
      remove,
      clear,
      setCartAnchor,
      getCartPoint,
      getCartRect,
      flies,
      consumeFly,
      open,
      setOpen,
      bumpCount,
    }),
    [items, has, add, remove, clear, setCartAnchor, getCartPoint, getCartRect, flies, consumeFly, open, bumpCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
