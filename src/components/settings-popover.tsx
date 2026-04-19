"use client";

import { Popover, Select } from "@base-ui/react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Settings } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { fontWeights } from "@/lib/font-weight";
import { springs } from "@/lib/springs";
import {
  DOWNLOAD_SIZE_ORIGINAL,
  DOWNLOAD_SIZE_STEPS,
  useSettings,
} from "@/lib/settings-context";

function formatSize(n: number): string {
  return n === DOWNLOAD_SIZE_ORIGINAL ? "max" : `${n}px`;
}

export function SettingsPopover() {
  const { settings, setMonochrome, setDownloadSize } = useSettings();

  return (
    <Popover.Root>
      <Tooltip content="settings">
        <Popover.Trigger
          render={(props, state) => (
            <button
              {...props}
              aria-label="open settings"
              className={cn(
                "grid h-11 w-11 place-items-center text-foreground transition-colors duration-[180ms] hover:bg-foreground/5 outline-none",
                state.open && "bg-foreground/5"
              )}
            >
              <motion.span
                animate={{ rotate: state.open ? 60 : 0 }}
                transition={springs.moderate}
                className="inline-flex"
              >
                <Settings size={16} strokeWidth={1.75} />
              </motion.span>
            </button>
          )}
        />
      </Tooltip>
      <Popover.Portal>
        <Popover.Backdrop
          className={cn(
            "fixed inset-0 z-40 bg-background/60",
            "transition-opacity duration-[220ms] ease-out",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
          )}
        />
        <Popover.Positioner side="bottom" align="end" sideOffset={12} className="z-50">
          <Popover.Popup
            className={cn(
              "relative w-[288px] rounded-2xl border border-border bg-card p-2 text-foreground",
              "shadow-[0_32px_64px_-16px_rgba(0,0,0,0.7),_0_12px_24px_-8px_rgba(0,0,0,0.4)]",
              "origin-[var(--transform-origin)] outline-none",
              "transition-all duration-[180ms] ease-out",
              "data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:-translate-y-1",
              "data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.97] data-[ending-style]:-translate-y-1"
            )}
          >
            <div
              aria-hidden
              className="absolute h-3 w-3 rotate-45 border-l border-t border-border bg-card"
              style={{ top: -6, right: 16 }}
            />
            <Popover.Title className="px-2 pb-1.5 pt-1 text-[13px] font-semibold tracking-tight">
              settings
            </Popover.Title>

            <Switch
              label="monochrome icons"
              checked={settings.monochrome}
              onToggle={() => setMonochrome(!settings.monochrome)}
            />

            <SizeRow
              size={settings.downloadSize}
              onChange={setDownloadSize}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
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
    <div className="flex items-center gap-3 rounded-lg px-2 py-2.5">
      <div className="flex min-w-0 flex-1 flex-col">
        <span
          className="text-[12.5px] text-foreground"
          style={{ fontVariationSettings: fontWeights.medium }}
        >
          download size
        </span>
        <span className="text-[11px] text-muted-foreground">
          resize on export
        </span>
      </div>
      <Select.Root value={size} onValueChange={(v) => onChange(v as number)}>
        <Select.Trigger
          className={cn(
            "inline-flex h-8 min-w-[88px] items-center justify-between gap-1.5 rounded-md border border-border bg-sidebar px-2.5 text-[12px] tabular-nums text-foreground transition-colors outline-none",
            "hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-foreground/20",
            "data-[popup-open]:border-foreground/40"
          )}
          style={{ fontVariationSettings: fontWeights.medium }}
        >
          <Select.Value>{(val) => formatSize(val as number)}</Select.Value>
          <Select.Icon>
            <ChevronDown size={13} strokeWidth={1.75} className="text-muted-foreground" />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner sideOffset={6} align="end" className="z-[60]">
            <Select.Popup
              className={cn(
                "max-h-[240px] min-w-[var(--anchor-width)] overflow-y-auto rounded-lg border border-border bg-card p-1 text-foreground",
                "shadow-[0_24px_48px_-16px_rgba(0,0,0,0.6),_0_8px_16px_-6px_rgba(0,0,0,0.35)]",
                "origin-[var(--transform-origin)] outline-none",
                "transition-all duration-[150ms] ease-out",
                "data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.97]",
                "data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.97]"
              )}
            >
              {DOWNLOAD_SIZE_STEPS.map((step) => (
                <FluidSelectItem key={step} value={step} label={formatSize(step)} />
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

function FluidSelectItem({ value, label }: { value: number; label: string }) {
  return (
    <Select.Item
      value={value}
      render={(props, state) => (
        <div
          {...props}
          className={cn(
            "relative flex cursor-pointer select-none items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-[12.5px] tabular-nums outline-none transition-[color,background-color,font-variation-settings] duration-[140ms]",
            state.highlighted
              ? "bg-accent text-foreground"
              : state.selected
                ? "text-foreground"
                : "text-muted-foreground"
          )}
          style={{
            fontVariationSettings: state.selected
              ? fontWeights.semibold
              : state.highlighted
                ? fontWeights.medium
                : fontWeights.normal,
          }}
        >
          <Select.ItemIndicator className="absolute left-2 inline-flex">
            <Check size={13} strokeWidth={2} />
          </Select.ItemIndicator>
          <Select.ItemText>{label}</Select.ItemText>
        </div>
      )}
    />
  );
}
