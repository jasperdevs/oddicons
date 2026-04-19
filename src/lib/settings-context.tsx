"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface Settings {
  monochrome: boolean;
  downloadSize: number;
}

const STORAGE_KEY = "oddicons:settings";

export const DOWNLOAD_SIZE_MAX = 1024;
export const DOWNLOAD_SIZE_MIN = 32;
export const DOWNLOAD_SIZE_STEPS = [32, 64, 128, 256, 512, 1024];

const DEFAULTS: Settings = { monochrome: false, downloadSize: DOWNLOAD_SIZE_MAX };

interface Ctx {
  settings: Settings;
  setMonochrome: (v: boolean) => void;
  setDownloadSize: (v: number) => void;
}

const SettingsContext = createContext<Ctx | null>(null);

function clampSize(v: number): number {
  if (!Number.isFinite(v)) return DEFAULTS.downloadSize;
  return Math.max(DOWNLOAD_SIZE_MIN, Math.min(DOWNLOAD_SIZE_MAX, Math.round(v)));
}

function persist(next: Settings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setSettings({
          monochrome: Boolean(parsed.monochrome),
          downloadSize:
            typeof parsed.downloadSize === "number"
              ? clampSize(parsed.downloadSize)
              : DEFAULTS.downloadSize,
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const setMonochrome = useCallback((v: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, monochrome: v };
      persist(next);
      return next;
    });
  }, []);

  const setDownloadSize = useCallback((v: number) => {
    setSettings((prev) => {
      const next = { ...prev, downloadSize: clampSize(v) };
      persist(next);
      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, setMonochrome, setDownloadSize }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
