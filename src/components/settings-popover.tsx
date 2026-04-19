"use client";

import { Popover, Select, Switch } from "@base-ui/react";
import { motion } from "framer-motion";
import { Check, ChevronDown, Settings } from "lucide-react";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  DOWNLOAD_SIZE_STEPS,
  useSettings,
} from "@/lib/settings-context";

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
                transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
                className="inline-flex"
              >
                <Settings size={16} strokeWidth={1.75} />
              </motion.span>
            </button>
          )}
        />
      </Tooltip>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={8}>
          <Popover.Popup
            className={cn(
              "z-50 w-[288px] rounded-xl border border-border bg-card p-2 text-foreground",
              "shadow-[0_24px_48px_-16px_rgba(0,0,0,0.6),_0_8px_16px_-6px_rgba(0,0,0,0.35)]",
              "origin-[var(--transform-origin)] outline-none",
              "transition-all duration-[180ms] ease-out",
              "data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.97] data-[starting-style]:-translate-y-1",
              "data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.97] data-[ending-style]:-translate-y-1"
            )}
          >
            <Popover.Title className="px-2 pb-1.5 pt-1 text-[13px] font-semibold tracking-tight">
              settings
            </Popover.Title>

            <SwitchRow
              label="monochrome icons"
              hint="render every icon in grayscale"
              checked={settings.monochrome}
              onChange={setMonochrome}
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

function SwitchRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent/60">
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-[12.5px] font-medium text-foreground">{label}</span>
        <span className="text-[11px] text-muted-foreground">{hint}</span>
      </div>
      <Switch.Root
        checked={checked}
        onCheckedChange={onChange}
        className={cn(
          "relative inline-flex h-[22px] w-[38px] shrink-0 items-center rounded-full border outline-none transition-colors duration-[180ms]",
          "focus-visible:ring-2 focus-visible:ring-foreground/20",
          "data-[checked]:border-foreground data-[checked]:bg-foreground",
          "data-[unchecked]:border-border data-[unchecked]:bg-sidebar"
        )}
      >
        <Switch.Thumb
          className={cn(
            "block h-[14px] w-[14px] rounded-full shadow-sm transition-all duration-[180ms]",
            "data-[checked]:translate-x-[19px] data-[checked]:bg-background",
            "data-[unchecked]:translate-x-[3px] data-[unchecked]:bg-muted-foreground"
          )}
        />
      </Switch.Root>
    </label>
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
        <span className="text-[12.5px] font-medium text-foreground">
          download size
        </span>
        <span className="text-[11px] text-muted-foreground">
          resize on export
        </span>
      </div>
      <Select.Root value={size} onValueChange={(v) => onChange(v as number)}>
        <Select.Trigger
          className={cn(
            "inline-flex h-8 min-w-[88px] items-center justify-between gap-1.5 rounded-md border border-border bg-sidebar px-2.5 text-[12px] font-medium tabular-nums text-foreground transition-colors outline-none",
            "hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-foreground/20",
            "data-[popup-open]:border-foreground/40"
          )}
        >
          <Select.Value>{(val) => `${val}px`}</Select.Value>
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
                <Select.Item
                  key={step}
                  value={step}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-[12.5px] tabular-nums text-muted-foreground outline-none",
                    "data-[highlighted]:bg-accent data-[highlighted]:text-foreground",
                    "data-[selected]:text-foreground"
                  )}
                >
                  <Select.ItemIndicator className="absolute left-2 inline-flex">
                    <Check size={13} strokeWidth={2} />
                  </Select.ItemIndicator>
                  <Select.ItemText>{step}px</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
