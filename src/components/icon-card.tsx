"use client";

import { useState } from "react";
import { Copy, Download, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { Icon } from "@/lib/icons";
import { assetPath } from "@/lib/icons";

export function IconCard({ icon }: { icon: Icon }) {
  const [copied, setCopied] = useState(false);

  async function copySvg() {
    try {
      const res = await fetch(assetPath(icon.file));
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      // swallow
    }
  }

  function download() {
    const a = document.createElement("a");
    a.href = assetPath(icon.file);
    a.download = icon.file;
    a.click();
  }

  return (
    <div className="group flex flex-col rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20">
      <div className="flex items-center justify-center h-24">
        <img
          src={assetPath(icon.file)}
          alt={icon.name}
          className="h-14 w-14"
          loading="lazy"
        />
      </div>

      <div className="mt-3 flex flex-col items-center gap-2">
        <span className="text-[13px] font-medium">{icon.name}</span>
        <Badge variant="dot" size="sm" color="gray">
          {icon.category}
        </Badge>
      </div>

      <div className="mt-4 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip content={copied ? "Copied!" : "Copy SVG"}>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={copySvg}
            aria-label="Copy SVG"
          >
            {copied ? <Check /> : <Copy />}
          </Button>
        </Tooltip>
        <Tooltip content="Download">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={download}
            aria-label="Download"
          >
            <Download />
          </Button>
        </Tooltip>
        <Tooltip content="Source">
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
            aria-label="Source link"
          >
            <a href={icon.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
            </a>
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}
