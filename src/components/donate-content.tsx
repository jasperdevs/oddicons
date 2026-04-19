"use client";

import { Coffee, ExternalLink, Heart, Sparkles } from "lucide-react";
import { KOFI_COLOR, KofiLogo } from "@/components/logos/kofi";
import { PAYPAL_COLOR, PaypalLogo } from "@/components/logos/paypal";

const OPTIONS = [
  {
    id: "kofi",
    label: "ko-fi",
    hint: "one-time tip, buy me a coffee",
    href: "https://ko-fi.com/jasperdevs",
    color: KOFI_COLOR,
    Logo: KofiLogo,
  },
  {
    id: "paypal",
    label: "paypal",
    hint: "any amount, sent directly",
    href: "https://www.paypal.com/paypalme/9KGFX",
    color: PAYPAL_COLOR,
    Logo: PaypalLogo,
  },
];

const FUNDS = [
  { icon: Sparkles, label: "more icons", hint: "new weekly drops" },
  { icon: Coffee, label: "more hours", hint: "actual espresso-powered" },
  { icon: Heart, label: "keeps it free", hint: "no paywall, ever" },
];

export function DonateContent() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 pb-10">
      <header className="flex flex-col items-center gap-4 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11.5px] font-medium text-muted-foreground">
          <Heart size={11} strokeWidth={2} className="fill-rose-500 text-rose-500" />
          optional, appreciated
        </span>
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[34px]">
          buy me a coffee
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
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-white shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35)]">
              <opt.Logo className="h-6 w-6" />
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

      <section className="relative overflow-hidden rounded-2xl border border-border bg-card p-6">
        <span
          aria-hidden
          className="pointer-events-none absolute -left-20 -top-20 h-48 w-48 rounded-full bg-rose-500/[0.06] blur-2xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-foreground/[0.05] blur-2xl"
        />
        <div className="relative flex flex-col gap-4">
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            where it goes
          </span>
          <div className="grid gap-3 sm:grid-cols-3">
            {FUNDS.map((f) => (
              <div
                key={f.label}
                className="flex items-start gap-3 rounded-xl border border-border bg-sidebar/40 p-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-foreground text-background">
                  <f.icon size={14} strokeWidth={1.75} />
                </span>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-semibold tracking-tight text-foreground">
                    {f.label}
                  </span>
                  <span className="text-[11.5px] leading-[1.4] text-muted-foreground">
                    {f.hint}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <p className="text-center text-[12.5px] text-muted-foreground">
        no pressure. sharing oddicons with a friend helps just as much.
      </p>
    </div>
  );
}
