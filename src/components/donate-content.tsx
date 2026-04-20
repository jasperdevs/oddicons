"use client";

import { ExternalLink } from "lucide-react";
import { OddIcon } from "@/components/ui/odd-icon";
import { KOFI_COLOR } from "@/components/logos/kofi";
import { PAYPAL_COLOR } from "@/components/logos/paypal";

const OPTIONS = [
  {
    id: "kofi",
    label: "ko-fi",
    hint: "one-time tip, buy me a coffee",
    href: "https://ko-fi.com/jasperdevs",
    color: KOFI_COLOR,
    iconName: "kofi",
  },
  {
    id: "paypal",
    label: "paypal",
    hint: "any amount, sent directly",
    href: "https://www.paypal.com/paypalme/9KGFX",
    color: PAYPAL_COLOR,
    iconName: "paypal",
  },
];

const FUNDS = [
  { icon: "sparkles", label: "more icons", hint: "new weekly drops" },
  { icon: "bolt", label: "more hours", hint: "actual espresso-powered" },
  { icon: "heart", label: "keeps it free", hint: "no paywall, ever" },
];

export function DonateContent() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 pb-10">
      <header className="relative flex flex-col gap-3 overflow-hidden rounded-3xl border border-border bg-card px-7 py-10">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-[0.14] blur-2xl"
          style={{ background: KOFI_COLOR }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full opacity-[0.12] blur-2xl"
          style={{ background: PAYPAL_COLOR }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            background:
              "radial-gradient(circle at 1px 1px, var(--foreground) 1px, transparent 0)",
            backgroundSize: "18px 18px",
          }}
        />
        <div className="relative flex flex-col gap-3">
          <h1 className="text-[32px] font-semibold tracking-tight text-foreground sm:text-[40px]">
            donate
          </h1>
          <p className="max-w-xl text-[14px] leading-[1.65] text-muted-foreground">
            oddicons will always be free. if you&apos;d like to chip in, it keeps the
            pack growing with more icons and more categories.
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <a
            key={opt.id}
            href={opt.href}
            target="_blank"
            rel="noreferrer"
            className="group relative flex flex-col gap-5 overflow-hidden rounded-2xl border border-border bg-card p-6 transition-all duration-[220ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.5)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full opacity-[0.10] blur-2xl transition-all duration-[300ms] group-hover:-right-6 group-hover:-top-10 group-hover:opacity-[0.22]"
              style={{ background: opt.color }}
            />
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-60"
              style={{
                background: `linear-gradient(to right, transparent, ${opt.color}66, transparent)`,
              }}
            />
            <span
              className="relative grid h-14 w-14 place-items-center rounded-2xl border border-border bg-sidebar transition-transform duration-[240ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:-rotate-6 group-hover:scale-[1.06]"
            >
              <OddIcon name={opt.iconName} size={38} />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[17px] font-semibold tracking-tight text-foreground">
                {opt.label}
              </span>
              <span className="text-[12.5px] leading-[1.5] text-muted-foreground">
                {opt.hint}
              </span>
            </div>
            <span className="relative mt-auto inline-flex items-center gap-1.5 text-[12.5px] font-medium text-foreground">
              open link
              <ExternalLink
                size={12}
                strokeWidth={2}
                className="transition-transform duration-[220ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:translate-x-1 group-hover:-translate-y-1"
              />
            </span>
          </a>
        ))}
      </div>

      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-7">
        <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          where it goes
        </span>
        <ul className="grid gap-2.5 sm:grid-cols-3">
          {FUNDS.map((f) => (
            <li
              key={f.label}
              className="group flex items-start gap-3 rounded-xl border border-border bg-sidebar/40 p-3.5 transition-all duration-[180ms] hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-sidebar"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sidebar transition-transform duration-[220ms] group-hover:scale-[1.08] group-hover:-rotate-3">
                <OddIcon name={f.icon} size={24} />
              </span>
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="text-[13px] font-semibold tracking-tight text-foreground">
                  {f.label}
                </span>
                <span className="text-[11.5px] leading-[1.4] text-muted-foreground">
                  {f.hint}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
