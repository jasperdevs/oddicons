"use client";

import { OddIcon } from "@/components/ui/odd-icon";

const OPTIONS = [
  {
    id: "kofi",
    label: "ko-fi",
    hint: "one-time tip, buy me a coffee",
    href: "https://ko-fi.com/jasperdevs",
    iconName: "kofi",
  },
  {
    id: "paypal",
    label: "paypal",
    hint: "any amount, sent directly",
    href: "https://www.paypal.com/paypalme/9KGFX",
    iconName: "paypal",
  },
];

const FUNDS = [
  { icon: "sparkles", label: "more icons", hint: "new weekly drops" },
  { icon: "bolt", label: "more hours", hint: "time spent on the pack" },
  { icon: "heart", label: "keeps it free", hint: "no paywall, ever" },
];

export function DonateContent() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 pb-10 sm:gap-12">
      <header className="flex flex-col gap-3 rounded-3xl border border-border bg-card px-5 py-8 sm:px-7 sm:py-10">
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground sm:text-[40px]">
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
            className="group relative flex min-h-[210px] flex-col gap-5 rounded-2xl border border-border bg-card p-5 transition-all duration-[220ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.5)] sm:min-h-[240px] sm:p-6"
          >
            <div className="grid place-items-center pt-1">
              <span className="inline-flex transition-transform duration-[320ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:-translate-y-1 group-hover:-rotate-[6deg] group-hover:scale-[1.08]">
                <OddIcon name={opt.iconName} size={96} />
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-[18px] font-semibold tracking-tight text-foreground">
                {opt.label}
              </span>
              <span className="text-[12.5px] leading-[1.5] text-muted-foreground">
                {opt.hint}
              </span>
            </div>
            <span className="mt-auto inline-flex items-center justify-center gap-1.5 text-[12.5px] font-medium text-foreground">
              open link
              <span className="inline-flex transition-transform duration-[220ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:translate-x-1 group-hover:-translate-y-1">
                <OddIcon name="link" size={14} />
              </span>
            </span>
          </a>
        ))}
      </div>

      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 sm:p-7">
        <span className="text-[12px] font-semibold tracking-tight text-muted-foreground">
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
