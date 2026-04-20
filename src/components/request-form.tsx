"use client";

import { OddIcon } from "@/components/ui/odd-icon";

const ISSUES_URL = "https://github.com/jasperdevs/oddicons/issues/new";

interface RequestFormProps {
  heading?: string;
  subheading?: string;
  hideHeader?: boolean;
}

export function RequestForm({
  heading = "send an issue",
  subheading = "tell us what icon you want on GitHub",
  hideHeader = false,
}: RequestFormProps) {
  return (
    <div className="flex flex-col gap-4">
      {!hideHeader && (
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="text-[12px] text-muted-foreground">
            {subheading}
          </p>
        </div>
      )}

      <div className="flex items-start gap-3 rounded-xl border border-border bg-sidebar p-3.5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-card">
          <OddIcon name="github" size={28} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-[13.5px] font-medium leading-[1.45] text-foreground">
            Send an issue with the icon you want.
          </p>
          <p className="text-[12px] leading-[1.55] text-muted-foreground">
            Requests are tracked in GitHub issues so they do not get lost.
          </p>
        </div>
      </div>

      <a
        href={ISSUES_URL}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-foreground px-5 text-[14px] font-medium text-background outline-none transition-all duration-80 hover:bg-foreground/90 focus-visible:ring-1 focus-visible:ring-[#6B97FF] active:bg-foreground/80"
      >
        <OddIcon name="github" size={20} />
        send GitHub issue
      </a>
    </div>
  );
}
