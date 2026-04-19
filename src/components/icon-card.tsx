"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, Download, Heart } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface IconCardProps {
  name: string;
  file: string;
  category: string;
  basePath: string;
  isFavorite: boolean;
  onToggleFavorite: (name: string) => void;
}

async function fetchSvg(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

export function IconCard({
  name,
  file,
  category,
  basePath,
  isFavorite,
  onToggleFavorite,
}: IconCardProps) {
  const url = `${basePath}/icons/${file}`;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const handleCopy = useCallback(async () => {
    const svg = await fetchSvg(url);
    if (!svg) return;
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
    } catch {
      // ignore
    }
  }, [url]);

  const handleDownload = useCallback(async () => {
    const svg = await fetchSvg(url);
    if (!svg) return;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = file;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(href);
  }, [url, file]);

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl bg-card transition-colors",
        "ring-1 ring-border/50 hover:ring-foreground/20"
      )}
    >
      <button
        type="button"
        onClick={() => onToggleFavorite(name)}
        aria-label={isFavorite ? "Unfavorite" : "Favorite"}
        aria-pressed={isFavorite}
        className={cn(
          "absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-md transition-all",
          "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-muted hover:text-foreground",
          isFavorite && "opacity-100 text-foreground"
        )}
      >
        <Heart
          size={14}
          strokeWidth={1.75}
          className={isFavorite ? "fill-foreground" : ""}
        />
      </button>

      <div className="flex aspect-[5/4] items-center justify-center px-6 py-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          width={64}
          height={64}
          className="h-14 w-14 transition-transform duration-200 group-hover:scale-[1.04]"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col items-center gap-0.5 pb-3">
        <span className="text-[13px] font-medium leading-none text-foreground">{name}</span>
        <span className="text-[11px] leading-none text-muted-foreground">{category}</span>
      </div>

      <div className="mt-auto grid grid-cols-2 border-t border-border/60">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-9 items-center justify-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {copied ? <Check size={13} strokeWidth={2} /> : <Copy size={13} strokeWidth={1.75} />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex h-9 items-center justify-center gap-1.5 border-l border-border/60 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Download size={13} strokeWidth={1.75} />
          <span>SVG</span>
        </button>
      </div>
    </div>
  );
}
