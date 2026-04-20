"use client";

import { useEffect, useState } from "react";
import { Tooltip } from "@/components/ui/tooltip";
import { OddIcon } from "@/components/ui/odd-icon";
import { cn } from "@/lib/utils";

const REPO_URL = "https://github.com/jasperdevs/oddicons";
const API_URL = "https://api.github.com/repos/jasperdevs/oddicons";
const STORAGE_KEY = "oddicons:github-stars";
const REFRESH_MS = 5 * 60 * 1000;

function formatStars(count: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count).toLowerCase();
}

function readCachedStars(): number | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function GitHubStars() {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    setStars(readCachedStars());

    const load = async (signal?: AbortSignal) => {
      try {
        const res = await fetch(API_URL, {
          signal,
          headers: { Accept: "application/vnd.github+json" },
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        const next = Number(data.stargazers_count);
        if (!Number.isFinite(next)) return;
        setStars(next);
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Keep the cached value if GitHub is unavailable or rate limited.
      }
    };

    const controller = new AbortController();
    load(controller.signal);
    const interval = window.setInterval(() => load(), REFRESH_MS);
    return () => {
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  return (
    <Tooltip content="open GitHub repo">
      <a
        href={REPO_URL}
        target="_blank"
        rel="noreferrer"
        aria-label={stars === null ? "open GitHub repo" : `open GitHub repo, ${stars} stars`}
        className={cn(
          "flex h-11 items-center gap-1.5 px-1.5 text-[14px] font-medium text-foreground min-[420px]:px-2",
          "transition-colors duration-[180ms] hover:bg-foreground/5"
        )}
      >
        <OddIcon name="github" size={20} />
        <span className="hidden text-left tabular-nums min-[420px]:inline">
          {stars === null ? "..." : formatStars(stars)}
        </span>
      </a>
    </Tooltip>
  );
}
