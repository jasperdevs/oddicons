"use client";

import { Check, ScrollText, Sparkles } from "lucide-react";
import { RequestForm } from "@/components/request-form";

const LICENSE_POINTS = [
  "free for personal projects. portfolios, hobby apps, side hustles.",
  "free for commercial use. client work, products you sell, ads, anything.",
  "no attribution required. a shoutout is nice but never expected.",
  "do not resell the icons as their own pack. embed them in your work, don't repackage them.",
];

export function UsageContent() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 pb-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[34px]">
          license & requests
        </h1>
        <p className="max-w-xl text-[14px] leading-[1.65] text-muted-foreground">
          what you can do with oddicons, and how to ask for one that isn&apos;t in
          the pack yet.
        </p>
      </header>

      <section className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-foreground text-background">
            <ScrollText size={16} strokeWidth={1.75} />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              license
            </span>
            <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
              free to use. for anything.
            </h2>
            <p className="text-[13.5px] leading-[1.6] text-muted-foreground">
              oddicons are licensed for unrestricted personal and commercial use.
              no signup, no plan, no asterisk.
            </p>
          </div>
        </div>
        <ul className="flex flex-col gap-2.5 border-t border-border pt-5">
          {LICENSE_POINTS.map((point) => (
            <li
              key={point}
              className="flex gap-2.5 text-[13.5px] leading-[1.55] text-foreground"
            >
              <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-foreground text-background">
                <Check size={10} strokeWidth={3} />
              </span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-foreground text-background">
            <Sparkles size={16} strokeWidth={1.75} />
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              missing an icon?
            </span>
            <h2 className="text-[22px] font-semibold tracking-tight text-foreground">
              ask, and it usually gets made.
            </h2>
          </div>
        </div>
        <div className="border-t border-border pt-5">
          <RequestForm
            heading="request an icon"
            subheading="most requests turn into new icons within a week"
          />
        </div>
      </section>
    </div>
  );
}
