"use client";

interface ProgressiveBlurProps {
  direction: "top" | "bottom";
}

const LAYERS = [
  { blur: 0.5, stop: 100 },
  { blur: 1.5, stop: 80 },
  { blur: 4, stop: 55 },
  { blur: 10, stop: 30 },
];

export function ProgressiveBlur({ direction }: ProgressiveBlurProps) {
  const anchor = direction === "top" ? "top" : "bottom";
  const gradDir = direction === "top" ? "bottom" : "top";

  return (
    <>
      {LAYERS.map((layer, i) => {
        const mid = Math.max(0, layer.stop - 20);
        const mask = `linear-gradient(to ${gradDir}, black 0%, black ${mid}%, transparent ${layer.stop}%)`;
        return (
          <div
            key={i}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 -z-10"
            style={{
              [anchor]: 0,
              height: "calc(100% + 2rem)",
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
