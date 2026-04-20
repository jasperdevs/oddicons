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
    <div className="mx-auto flex max-w-3xl flex-col gap-10 pb-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[34px]">
          donate
        </h1>
        <p className="max-w-xl text-[14px] leading-[1.65] text-muted-foreground">
          oddicons will always be free. if you&apos;d like to chip in, it keeps the
          pack growing with more icons and more categories.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <a
            key={opt.id}
            href={opt.href}
            target="_blank"
            rel="noreferrer"
            className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-[200ms] hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[0_16px_32px_-12px_rgba(0,0,0,0.45)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full opacity-[0.08] transition-all duration-[240ms] group-hover:-right-4 group-hover:-top-6 group-hover:opacity-[0.14]"
              style={{ background: opt.color }}
            />
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-sidebar">
              <OddIcon name={opt.iconName} size={32} />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[16px] font-semibold tracking-tight text-foreground">
                {opt.label}
              </span>
              <span className="text-[12.5px] text-muted-foreground">
                {opt.hint}
              </span>
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 text-[12.5px] font-medium text-foreground">
              open link
              <ExternalLink
                size={12}
                strokeWidth={2}
                className="transition-transform duration-[180ms] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </span>
          </a>
        ))}
      </div>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <span className="text-[11.5px] font-semibold tracking-tight text-muted-foreground">
          where it goes
        </span>
        <ul className="grid gap-2.5 sm:grid-cols-3">
          {FUNDS.map((f) => (
            <li
              key={f.label}
              className="flex items-start gap-3 rounded-xl border border-border bg-sidebar/40 p-3"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-sidebar">
                <OddIcon name={f.icon} size={22} />
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
