"use client";

import { Check } from "lucide-react";

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
          how to use oddicons
        </h1>
      </header>

      <section className="flex flex-col gap-4 rounded-2xl border border-foreground/30 bg-foreground/[0.03] p-6">
        <div className="flex flex-col gap-1">
          <span className="text-[12px] font-semibold tracking-tight text-muted-foreground">
            license
          </span>
          <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
            free to use. for anything.
          </h2>
          <p className="text-[13.5px] leading-[1.6] text-muted-foreground">
            oddicons are licensed for unrestricted personal and commercial use. no
            signup, no plan, no asterisk.
          </p>
        </div>
        <ul className="flex flex-col gap-2">
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

      <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
          missing an icon?
        </h2>
        <p className="text-[13.5px] leading-[1.6] text-muted-foreground">
          hit the <span className="font-medium text-foreground">request</span>{" "}
          button in the bottom bar and send a quick email. most requests turn into
          new icons within a week.
        </p>
      </section>
    </div>
  );
}
