"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "oddicons:favorites";

export function useFavorites() {
  const [favorites, setFavoritesState] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setFavoritesState(parsed.filter((v) => typeof v === "string"));
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: string[]) => {
    setFavoritesState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }, []);

  const toggle = useCallback(
    (name: string) => {
      setFavoritesState((prev) => {
        const next = prev.includes(name) ? prev.filter((v) => v !== name) : [...prev, name];
        try {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const isFavorite = useCallback((name: string) => favorites.includes(name), [favorites]);

  return { favorites, isFavorite, toggle, setFavorites: persist, hydrated };
}
