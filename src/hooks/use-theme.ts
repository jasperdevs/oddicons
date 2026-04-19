"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "oddicons:theme";

function applyTheme(next: Theme) {
  document.documentElement.classList.toggle("dark", next === "dark");
}

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void | Promise<void>) => {
    finished: Promise<void>;
    skipTransition?: () => void;
  };
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");
  const transitioningRef = useRef(false);

  useEffect(() => {
    const stored = (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY)) as Theme | null;
    const initial: Theme = stored === "light" || stored === "dark" ? stored : "dark";
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = useCallback((next: Theme, origin?: { x: number; y: number }) => {
    if (transitioningRef.current) return;

    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }

    const doc = document as ViewTransitionDoc;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (origin) {
      document.documentElement.style.setProperty("--theme-x", `${origin.x}px`);
      document.documentElement.style.setProperty("--theme-y", `${origin.y}px`);
    } else {
      document.documentElement.style.setProperty("--theme-x", `${window.innerWidth - 40}px`);
      document.documentElement.style.setProperty("--theme-y", `40px`);
    }

    if (!doc.startViewTransition || reduced) {
      applyTheme(next);
      return;
    }

    transitioningRef.current = true;
    const transition = doc.startViewTransition(() => applyTheme(next));
    transition.finished.finally(() => {
      transitioningRef.current = false;
    });
  }, []);

  const toggle = useCallback(
    (origin?: { x: number; y: number }) => {
      setTheme(theme === "dark" ? "light" : "dark", origin);
    },
    [theme, setTheme]
  );

  return { theme, setTheme, toggle, locked: () => transitioningRef.current };
}
