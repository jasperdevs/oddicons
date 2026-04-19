"use client";

import { useState } from "react";
import { Check, Copy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMAIL = "jasper.mceligott@gmail.com";

const EMAIL_TEMPLATE = `hi jasper,

i'd love to see an icon for:
[describe what you want]

thanks!`;

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.19 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.89.12 3.19.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5" />
    </svg>
  );
}

function DiscordIcon({ size = 14 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.27 5.33A19 19 0 0 0 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09a.1.1 0 0 0-.07-.03c-1.5.26-2.93.71-4.27 1.33a.06.06 0 0 0-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05a19.3 19.3 0 0 0 5.24 2.65c.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74a.07.07 0 0 0-.04-.09c-.57-.22-1.11-.48-1.64-.78a.07.07 0 0 1-.01-.11q.165-.12.33-.25a.07.07 0 0 1 .07-.01c3.44 1.57 7.15 1.57 10.55 0a.07.07 0 0 1 .07.01q.165.135.33.26a.07.07 0 0 1-.01.11c-.52.31-1.07.56-1.64.78a.07.07 0 0 0-.04.09c.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01a19.2 19.2 0 0 0 5.25-2.65.07.07 0 0 0 .03-.05c.44-4.53-.73-8.46-3.1-11.95a.05.05 0 0 0-.04-.02M8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12m6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12" />
    </svg>
  );
}

interface ContactRow {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  copyValue?: string;
}

const CONTACTS: ContactRow[] = [
  { id: "x", label: "@jasperdevs", icon: <XIcon />, href: "https://x.com/jasperdevs" },
  { id: "github", label: "jasperdevs", icon: <GithubIcon />, href: "https://github.com/jasperdevs" },
  { id: "discord", label: "jasperdevs", icon: <DiscordIcon />, copyValue: "jasperdevs" },
];

interface RequestFormProps {
  heading?: string;
  subheading?: string;
}

export function RequestForm({
  heading = "send an email",
  subheading = "request an icon or just say hi",
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
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="text-[12px] text-muted-foreground">
            {subheading}
          </p>
        </div>

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
          leadingIcon={Send}
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
                {copied ? <Check size={13} strokeWidth={2} /> : c.icon}
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
                <Copy
                  size={10}
                  strokeWidth={2}
                  className="absolute right-1.5 top-1.5 opacity-40 transition-opacity group-hover/chip:opacity-70"
                />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}
