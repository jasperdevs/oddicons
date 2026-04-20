"use client";

import { OddIcon } from "@/components/ui/odd-icon";
import { RequestForm } from "@/components/request-form";

const LICENSE_POINTS = [
  "free for personal projects. portfolios, hobby apps, side hustles.",
  "free for commercial use. client work, products you sell, ads, anything.",
  "no attribution required. a shoutout is nice but never expected.",
  "do not resell the icons as their own pack. embed them in your work, don't repackage them.",
];

export function UsageContent() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-12 pb-10">
      <header className="flex flex-col gap-3 rounded-3xl border border-border bg-card px-7 py-10">
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground sm:text-[40px]">
          license & requests
        </h1>
        <p className="max-w-xl text-[14px] leading-[1.65] text-muted-foreground">
          what you can do with oddicons, and how to ask for one that isn&apos;t in
          the pack yet.
        </p>
      </header>

      <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-7">
        <div className="flex items-start gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-border bg-sidebar">
            <OddIcon name="license" size={40} />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-semibold tracking-tight text-muted-foreground">
              license
            </span>
            <h2 className="text-[22px] font-semibold tracking-tight text-foreground sm:text-[24px]">
              free to use. for anything.
            </h2>
            <p className="text-[13.5px] leading-[1.6] text-muted-foreground">
              oddicons are licensed for unrestricted personal and commercial use.
              no signup, no plan, no asterisk.
            </p>
          </div>
        </div>
        <ul className="flex flex-col gap-2 border-t border-border pt-5">
          {LICENSE_POINTS.map((point) => (
            <li
              key={point}
              className="group flex items-start gap-3 rounded-xl px-2 py-2 text-[13.5px] leading-[1.55] text-foreground transition-colors duration-[160ms] hover:bg-sidebar/60"
            >
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sidebar transition-transform duration-[200ms] group-hover:scale-[1.1]">
                <OddIcon name="check" size={16} />
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-7">
        <div className="flex items-start gap-4">
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-border bg-sidebar">
            <OddIcon name="sparkles" size={40} />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[12px] font-semibold tracking-tight text-muted-foreground">
              missing an icon?
            </span>
            <h2 className="text-[22px] font-semibold tracking-tight text-foreground sm:text-[24px]">
              ask, and it usually gets made.
            </h2>
            <p className="text-[13.5px] leading-[1.6] text-muted-foreground">
              most requests turn into new icons within a week.
            </p>
          </div>
        </div>
        <div className="border-t border-border pt-6">
          <RequestForm hideHeader />
        </div>
      </section>
    </div>
  );
}
