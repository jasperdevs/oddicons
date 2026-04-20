"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { OddIcon, oddIconComponent } from "@/components/ui/odd-icon";
import { cn } from "@/lib/utils";

const GmailIcon = oddIconComponent("gmail");

const EMAIL = "jasper.mceligott@gmail.com";

const EMAIL_TEMPLATE = `hi jasper,

i'd love to see an icon for:
[describe what you want]

thanks!`;

function CopyBadgeIcon({ size = 12 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="8" y="8" width="13" height="13" rx="2.5" />
      <path d="M5 15H4.5A2.5 2.5 0 0 1 2 12.5v-8A2.5 2.5 0 0 1 4.5 2h8A2.5 2.5 0 0 1 15 4.5V5" />
    </svg>
  );
}

interface ContactRow {
  id: string;
  label: string;
  iconName: string;
  href?: string;
  copyValue?: string;
}

const CONTACTS: ContactRow[] = [
  { id: "x", label: "@jasperdevs", iconName: "x-twitter", href: "https://x.com/jasperdevs" },
  { id: "github", label: "jasperdevs", iconName: "github", href: "https://github.com/jasperdevs" },
  { id: "discord", label: "jasperdevs", iconName: "discord", copyValue: "jasperdevs" },
];

interface RequestFormProps {
  heading?: string;
  subheading?: string;
  hideHeader?: boolean;
}

export function RequestForm({
  heading = "send an email",
  subheading = "request an icon or just say hi",
  hideHeader = false,
}: RequestFormProps) {
  const [subject, setSubject] = useState("icon request");
  const [message, setMessage] = useState(EMAIL_TEMPLATE);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canSubmit = message.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const subj = subject.trim() || "icon request";
    const href = `mailto:${EMAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(message.trim())}`;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const handleCopy = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1600);
    } catch {
      // ignore
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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

        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="subject (optional)"
          className="h-11 w-full rounded-lg border border-border bg-sidebar px-3 text-[13px] text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors duration-[180ms] focus:border-foreground/30"
        />

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={6}
          required
          className="scrollbar-custom w-full resize-none rounded-lg border border-border bg-sidebar px-3 py-2.5 text-[13px] leading-[1.55] text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors duration-[180ms] focus:border-foreground/30"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          leadingIcon={GmailIcon}
          disabled={!canSubmit}
          className="h-11 w-full px-5 text-[14px]"
        >
          send an email
        </Button>
      </form>

      <div className="mt-4 grid grid-cols-3 gap-1.5 border-t border-border pt-4">
        {CONTACTS.map((c) => {
          const copied = copiedId === c.id;
          const cls = cn(
            "group/chip relative flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-sidebar text-[12px] font-medium text-muted-foreground transition-all duration-[180ms]",
            "hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-accent hover:text-foreground"
          );
          const content = (
            <>
              <span className="inline-flex shrink-0">
                {copied ? <OddIcon name="check" size={18} /> : <OddIcon name={c.iconName} size={20} />}
              </span>
              <span className="truncate">
                {copied ? "copied" : c.label}
              </span>
            </>
          );
          if (c.href) {
            return (
              <a
                key={c.id}
                href={c.href}
                target="_blank"
                rel="noreferrer"
                className={cls}
                title={c.id}
              >
                {content}
              </a>
            );
          }
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => c.copyValue && handleCopy(c.id, c.copyValue)}
              className={cls}
              title={c.copyValue}
            >
              {content}
              {!copied && (
                <span className="absolute right-1.5 top-1.5 opacity-40 transition-opacity group-hover/chip:opacity-70">
                  <CopyBadgeIcon size={12} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
