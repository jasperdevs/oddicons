"use client";

import { useState } from "react";
import { OddIcon } from "@/components/ui/odd-icon";

const ISSUES_URL = "https://github.com/jasperdevs/oddicons/issues/new";
type Social =
  | { id: string; label: string; icon: string; href: string; copy?: never }
  | { id: string; label: string; icon: string; copy: string; href?: never };

const SOCIALS: Social[] = [
  { id: "x", label: "x", icon: "x-twitter", href: "https://x.com/jasperdevs" },
  { id: "discord", label: "discord", icon: "discord", copy: "jasperdevs" },
  { id: "gmail", label: "gmail", icon: "gmail", href: "mailto:jasper.mceligott@gmail.com" },
];

interface RequestFormProps {
  heading?: string;
  subheading?: string;
  hideHeader?: boolean;
}

export function RequestForm({
  heading = "request an icon",
  subheading = "tell us what icon you want on GitHub",
  hideHeader = false,
}: RequestFormProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copySocial = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      window.setTimeout(() => setCopied((current) => (current === id ? null : current)), 1400);
    } catch {
      // ignore
    }
  };

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
            GitHub is the best place to request new icons.
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

      <div className="grid grid-cols-3 gap-1.5 border-t border-border pt-4">
        {SOCIALS.map((social) => {
          const content = (
            <>
              <OddIcon name={copied === social.id ? "check" : social.icon} size={20} />
              <span className="truncate">{copied === social.id ? "copied" : social.label}</span>
            </>
          );
          const className = "group/chip flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-sidebar text-[12px] font-medium text-muted-foreground transition-[color,background-color,border-color,transform] duration-[180ms] hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-accent hover:text-foreground";

          if (social.copy !== undefined) {
            return (
              <button
                key={social.id}
                type="button"
                onClick={() => copySocial(social.id, social.copy)}
                className={className}
              >
                {content}
              </button>
            );
          }

          return (
            <a
              key={social.id}
              href={social.href}
              target={social.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={social.href.startsWith("mailto:") ? undefined : "noreferrer"}
              className={className}
            >
              {content}
            </a>
          );
        })}
      </div>
    </div>
  );
}
