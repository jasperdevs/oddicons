"use client";

import { Check, Download, MousePointerClick, Search, ShoppingBag, Sparkles } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "browse or search",
    body: "filter by category in the sidebar, or type a keyword in the search bar. tags like 'robot' or 'brain' work too.",
  },
  {
    icon: MousePointerClick,
    title: "tap to add to cart",
    body: "click any icon card to drop it in your cart. tap again to remove. or use 'add all' in the bottom bar to grab every icon on screen at once.",
  },
  {
    icon: ShoppingBag,
    title: "open your cart",
    body: "the shopping bag in the top right opens the cart. tap any icon there to copy it straight to your clipboard.",
  },
  {
    icon: Download,
    title: "download",
    body: "one icon downloads as a png. multiple downloads ship as a zip with every icon named properly. you pick the size in settings.",
  },
];

const LICENSE_POINTS = [
  "free for personal projects — portfolios, hobby apps, side hustles.",
  "free for commercial use — client work, products you sell, ads, anything.",
  "no attribution required. a shoutout is nice but never expected.",
  "do not resell the icons as their own pack. embed them in your work, don't repackage them.",
];

export function UsageContent() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 pb-10">
      <header className="flex flex-col gap-3">
        <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          <Sparkles size={12} strokeWidth={1.75} />
          getting started
        </span>
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground sm:text-[34px]">
          how to use oddicons
        </h1>
        <p className="max-w-xl text-[14px] leading-[1.65] text-muted-foreground">
          a pack of odd, hand-made icons built for apps, sites, decks, and whatever
          else needs a little personality. here&apos;s the short version.
        </p>
      </header>

      <ol className="flex flex-col gap-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-2xl border border-border bg-card p-5 transition-colors duration-[180ms] hover:border-foreground/30"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-foreground">
              <step.icon size={18} strokeWidth={1.75} />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <span className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-[15px] font-semibold tracking-tight text-foreground">
                  {step.title}
                </h2>
              </span>
              <p className="text-[13.5px] leading-[1.6] text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <section className="flex flex-col gap-4 rounded-2xl border border-foreground/30 bg-foreground/[0.03] p-6">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
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
