const cache = new Map<string, Promise<string[]>>();

const FALLBACK = ["rgb(160, 160, 160)", "rgb(96, 96, 96)"];

function extract(url: string): Promise<string[]> {
  if (typeof window === "undefined") return Promise.resolve(FALLBACK);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const size = 48;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return resolve(FALLBACK);
      ctx.drawImage(img, 0, 0, size, size);
      let data: Uint8ClampedArray;
      try {
        data = ctx.getImageData(0, 0, size, size).data;
      } catch {
        return resolve(FALLBACK);
      }

      const buckets = new Map<
        string,
        { count: number; r: number; g: number; b: number }
      >();
      for (let i = 0; i < data.length; i += 4) {
        const a = data[i + 3];
        if (a < 128) continue;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        if (max < 24 || min > 232) continue;
        const key = `${r >> 4}:${g >> 4}:${b >> 4}`;
        const entry = buckets.get(key);
        if (entry) {
          entry.count += 1;
          entry.r += r;
          entry.g += g;
          entry.b += b;
        } else {
          buckets.set(key, { count: 1, r, g, b });
        }
      }

      const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);
      const top = sorted.slice(0, 3).map(({ count, r, g, b }) => {
        return `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`;
      });

      if (top.length === 0) resolve(FALLBACK);
      else if (top.length === 1) resolve([top[0], top[0]]);
      else resolve(top);
    };
    img.onerror = () => resolve(FALLBACK);
    img.src = url;
  });
}

export function getIconColors(url: string): Promise<string[]> {
  const cached = cache.get(url);
  if (cached) return cached;
  const p = extract(url);
  cache.set(url, p);
  return p;
}
