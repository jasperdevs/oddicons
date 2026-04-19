"use client";

import { useEffect, useRef, type RefObject } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Contrast, Ruler } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DOWNLOAD_SIZE_STEPS,
  useSettings,
} from "@/lib/settings-context";

interface Props {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLButtonElement | null>;
}

export function SettingsPopover({ open, onClose, anchorRef }: Props) {
  const { settings, setMonochrome, setDownloadSize } = useSettings();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (panelRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open, onClose, anchorRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          role="dialog"
          aria-label="settings"
          initial={{ opacity: 0, y: -4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.97 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          style={{ transformOrigin: "top right" }}
          className="absolute right-0 top-full z-50 mt-2 w-[280px] rounded-xl border border-border bg-card p-3 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.6),_0_8px_16px_-6px_rgba(0,0,0,0.35)]"
        >
          <div className="flex flex-col gap-0.5 px-1 pb-3 pt-1">
            <h2 className="text-[13px] font-semibold tracking-tight text-foreground">
              settings
            </h2>
            <p className="text-[11.5px] text-muted-foreground">
              tweak icons and downloads
            </p>
          </div>

          <ToggleRow
            icon={<Contrast size={14} strokeWidth={1.75} />}
            label="monochrome icons"
            hint="render every icon in grayscale"
            checked={settings.monochrome}
            onChange={setMonochrome}
          />

          <SizeRow
            size={settings.downloadSize}
            onChange={setDownloadSize}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ToggleRow({
  icon,
  label,
  hint,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-sidebar text-foreground">
        {icon}
      </span>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[12.5px] font-medium text-foreground">{label}</span>
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full border transition-colors duration-[180ms] outline-none",
          "focus-visible:ring-1 focus-visible:ring-foreground/30",
          checked ? "border-foreground bg-foreground" : "border-border bg-sidebar"
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full transition-all duration-[180ms]",
            checked ? "left-[18px] bg-background" : "left-[3px] bg-muted-foreground"
          )}
        />
      </button>
    </div>
  );
}

function SizeRow({
  size,
  onChange,
}: {
  size: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg px-2 py-2.5">
      <div className="flex items-center gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-sidebar text-foreground">
          <Ruler size={14} strokeWidth={1.75} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[12.5px] font-medium text-foreground">
            download size
          </span>
          <span className="text-[11px] text-muted-foreground">
            resize down on export
          </span>
        </div>
        <span className="shrink-0 tabular-nums text-[12px] font-medium text-foreground">
          {size}px
        </span>
      </div>
      <div className="flex flex-wrap gap-1 pt-0.5">
        {DOWNLOAD_SIZE_STEPS.map((step) => {
          const active = size === step;
          return (
            <button
              key={step}
              type="button"
              onClick={() => onChange(step)}
              className={cn(
                "inline-flex h-7 min-w-11 items-center justify-center rounded-md border px-2 text-[11.5px] font-medium tabular-nums transition-colors duration-[180ms] outline-none",
                "focus-visible:ring-1 focus-visible:ring-foreground/30",
                active
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-sidebar text-muted-foreground hover:border-foreground/30 hover:text-foreground"
              )}
            >
              {step}
            </button>
          );
        })}
      </div>
    </div>
  );
}
