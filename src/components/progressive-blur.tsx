"use client";

interface ProgressiveBlurProps {
  direction: "top" | "bottom";
}

const LAYERS = [
  { blur: 1, start: 0, end: 100 },
  { blur: 2, start: 0, end: 75 },
  { blur: 4, start: 0, end: 50 },
  { blur: 8, start: 0, end: 25 },
];

export function ProgressiveBlur({ direction }: ProgressiveBlurProps) {
  const anchor = direction === "top" ? "top" : "bottom";
  const gradDir = direction === "top" ? "bottom" : "top";

  return (
    <>
      {LAYERS.map((layer, i) => {
        const mask = `linear-gradient(to ${gradDir}, black ${layer.start}%, transparent ${layer.end}%)`;
        return (
          <div
            key={i}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -z-10"
            style={{
              [anchor]: 0,
              height: "calc(100% + 1.5rem)",
              backdropFilter: `blur(${layer.blur}px)`,
              WebkitBackdropFilter: `blur(${layer.blur}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
    </>
  );
}
