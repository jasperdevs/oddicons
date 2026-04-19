"use client";

import { useCallback, useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "oddicons:theme";

function applyTheme(next: Theme) {
  document.documentElement.classList.toggle("dark", next === "dark");
}

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && window.localStorage.getItem(STORAGE_KEY)) as Theme | null;
    const initial: Theme = stored === "light" || stored === "dark" ? stored : "dark";
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = useCallback(
    (next: Theme, origin?: { x: number; y: number }) => {
      setThemeState(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // ignore
      }

      const doc = document as ViewTransitionDoc;
      if (origin) {
        document.documentElement.style.setProperty("--theme-x", `${origin.x}px`);
        document.documentElement.style.setProperty("--theme-y", `${origin.y}px`);
      }

      if (doc.startViewTransition) {
        doc.startViewTransition(() => applyTheme(next));
      } else {
        applyTheme(next);
      }
    },
    []
  );

  const toggle = useCallback(
    (origin?: { x: number; y: number }) => {
      setTheme(theme === "dark" ? "light" : "dark", origin);
    },
    [theme, setTheme]
  );

  return { theme, setTheme, toggle };
}
