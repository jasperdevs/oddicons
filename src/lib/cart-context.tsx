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
}

interface FlyEvent {
  id: number;
  item: CartItem;
  from: { x: number; y: number; size: number };
}

interface CartContextValue {
  items: CartItem[];
  has: (name: string) => boolean;
  add: (item: CartItem, from: { x: number; y: number; size: number }) => void;
  remove: (name: string) => void;
  clear: () => void;
  setCartAnchor: (el: HTMLElement | null) => void;
  getCartPoint: () => { x: number; y: number } | null;
  pendingFly: FlyEvent | null;
  consumeFly: () => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  bumpCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "oddicons:cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [pendingFly, setPendingFly] = useState<FlyEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [bumpCount, setBumpCount] = useState(0);
  const anchorRef = useRef<HTMLElement | null>(null);
  const idRef = useRef(0);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
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

  const has = useCallback((name: string) => items.some((i) => i.name === name), [items]);

  const add = useCallback(
    (item: CartItem, from: { x: number; y: number; size: number }) => {
      setItems((prev) => (prev.some((i) => i.name === item.name) ? prev : [...prev, item]));
      idRef.current += 1;
      setPendingFly({ id: idRef.current, item, from });
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

  const consumeFly = useCallback(() => {
    setPendingFly(null);
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
      pendingFly,
      consumeFly,
      open,
      setOpen,
      bumpCount,
    }),
    [items, has, add, remove, clear, setCartAnchor, getCartPoint, pendingFly, consumeFly, open, bumpCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
