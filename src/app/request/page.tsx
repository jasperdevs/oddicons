"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Copy, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const EMAIL = "jasper.mceligott@gmail.com";

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.19 0 0 1-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.89.12 3.19.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5" />
    </svg>
  );
}

function DiscordIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19.27 5.33A19 19 0 0 0 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09a.1.1 0 0 0-.07-.03c-1.5.26-2.93.71-4.27 1.33a.06.06 0 0 0-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95 0 .02.01.04.03.05a19.3 19.3 0 0 0 5.24 2.65c.03.01.06 0 .07-.02.4-.55.76-1.13 1.07-1.74a.07.07 0 0 0-.04-.09c-.57-.22-1.11-.48-1.64-.78a.07.07 0 0 1-.01-.11q.165-.12.33-.25a.07.07 0 0 1 .07-.01c3.44 1.57 7.15 1.57 10.55 0a.07.07 0 0 1 .07.01q.165.135.33.26a.07.07 0 0 1-.01.11c-.52.31-1.07.56-1.64.78a.07.07 0 0 0-.04.09c.32.61.68 1.19 1.07 1.74.03.01.06.02.09.01a19.2 19.2 0 0 0 5.25-2.65.07.07 0 0 0 .03-.05c.44-4.53-.73-8.46-3.1-11.95a.05.05 0 0 0-.04-.02M8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12m6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12" />
    </svg>
  );
}

interface ContactRow {
  id: string;
  label: string;
  handle: string;
  icon: React.ReactNode;
  href?: string;
  copyValue?: string;
}

const CONTACTS: ContactRow[] = [
  {
    id: "x",
    label: "x",
    handle: "@jasperdevs",
    icon: <XIcon />,
    href: "https://x.com/jasperdevs",
  },
  {
    id: "github",
    label: "github",
    handle: "jasperdevs",
    icon: <GithubIcon />,
    href: "https://github.com/jasperdevs",
  },
  {
    id: "discord",
    label: "discord",
    handle: "jasperdevs",
    icon: <DiscordIcon />,
    copyValue: "jasperdevs",
  },
  {
    id: "email",
    label: "email",
    handle: EMAIL,
    icon: <Mail size={16} strokeWidth={1.75} />,
    copyValue: EMAIL,
  },
];

export default function RequestPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const canSubmit = message.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    const lines: string[] = [];
    if (name.trim()) lines.push(`From: ${name.trim()}`, "");
    lines.push(message.trim());
    const body = lines.join("\n");
    const subj = subject.trim() || "icon request";
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(body)}`;
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
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col rounded-2xl bg-sidebar px-6 py-6 sm:px-10 sm:py-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="md"
            leadingIcon={ArrowLeft}
            onClick={() => router.push("/")}
            className="h-11 px-4 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            back to icons
          </Button>
          <Link
            href="/"
            className="flex items-center gap-3 text-foreground"
            aria-label="oddicons home"
          >
            <span
              aria-hidden
              className="relative grid h-8 w-8 place-items-center rounded-xl bg-foreground text-background"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-background" />
              <span className="absolute right-1 top-1 h-1 w-1 rounded-full bg-background/70" />
            </span>
            <span className="font-display text-[20px] leading-none">oddicons</span>
          </Link>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <h1 className="text-[30px] font-semibold tracking-tight text-foreground">
            request an icon
          </h1>
          <p className="max-w-xl text-[14px] leading-[1.6] text-muted-foreground">
            missing something? send a note and i&apos;ll add it to the next drop.
            or just say hi — all links below work.
          </p>
        </div>

        <section className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CONTACTS.map((c) => {
            const copied = copiedId === c.id;
            const content = (
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
                  {c.icon}
                </span>
                <div className="flex min-w-0 flex-col">
                  <span className="text-[12px] font-medium tracking-[0.02em] text-muted-foreground">
                    {c.label}
                  </span>
                  <span className="truncate text-[14px] font-medium text-foreground">
                    {c.handle}
                  </span>
                </div>
              </div>
            );

            if (c.href) {
              return (
                <a
                  key={c.id}
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors duration-[180ms] hover:border-foreground/30"
                >
                  {content}
                  <span className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors duration-[180ms] group-hover:bg-accent group-hover:text-foreground">
                    <ArrowLeft size={14} strokeWidth={1.75} className="-rotate-[135deg]" />
                  </span>
                </a>
              );
            }

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => c.copyValue && handleCopy(c.id, c.copyValue)}
                className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-left transition-colors duration-[180ms] hover:border-foreground/30"
              >
                {content}
                <span
                  className={cn(
                    "ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-[180ms]",
                    copied
                      ? "bg-accent text-foreground"
                      : "text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
                  )}
                  aria-label={copied ? "copied" : "copy"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={copied ? "check" : "copy"}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.14, ease: [0.4, 0, 0.2, 1] }}
                      className="inline-flex"
                    >
                      {copied ? (
                        <Check size={14} strokeWidth={2} />
                      ) : (
                        <Copy size={14} strokeWidth={1.75} />
                      )}
                    </motion.span>
                  </AnimatePresence>
                </span>
              </button>
            );
          })}
        </section>

        <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
              send a message
            </h2>
            <p className="text-[13px] text-muted-foreground">
              this opens your mail app with the draft ready to send.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="your name (optional)">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="jane"
                className="h-11 w-full rounded-xl border border-border bg-card px-4 text-[14px] text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors duration-[180ms] focus:border-foreground/30"
              />
            </Field>
            <Field label="subject (optional)">
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="icon request"
                className="h-11 w-full rounded-xl border border-border bg-card px-4 text-[14px] text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors duration-[180ms] focus:border-foreground/30"
              />
            </Field>
          </div>

          <Field label="message">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              placeholder="what are you looking for?"
              required
              className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-[14px] leading-[1.6] text-foreground placeholder:text-muted-foreground/70 outline-none transition-colors duration-[180ms] focus:border-foreground/30"
            />
          </Field>

          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              leadingIcon={Send}
              disabled={!canSubmit}
              className="h-11 px-5"
            >
              submit
            </Button>
          </div>
        </form>

        <div className="mt-auto pt-12 text-center text-[12px] text-muted-foreground">
          oddicons · a weird little pack of AI icons
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium tracking-[0.02em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}
