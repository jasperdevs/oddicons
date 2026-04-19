import JSZip from "jszip";

export interface ProcessOpts {
  size: number;
  monochrome: boolean;
}

export async function fetchIconBlob(url: string): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return await res.blob();
}

export function downloadBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

function filenameFromUrl(url: string, fallback: string): string {
  const last = url.split("/").pop() ?? "";
  return last.includes(".") ? last : fallback;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`failed to load ${src}`));
    img.src = src;
  });
}

export async function fetchProcessedIconBlob(url: string, opts?: ProcessOpts): Promise<Blob> {
  const source = await fetchIconBlob(url);
  return processBlob(source, opts);
}

async function processBlob(sourceBlob: Blob, opts?: ProcessOpts): Promise<Blob> {
  if (!opts) return sourceBlob;
  const objectUrl = URL.createObjectURL(sourceBlob);
  try {
    const img = await loadImage(objectUrl);
    const originalMax = Math.max(img.naturalWidth, img.naturalHeight);
    if (originalMax === 0) return sourceBlob;
    const targetMax = Math.min(opts.size, originalMax);
    if (targetMax === originalMax && !opts.monochrome) return sourceBlob;
    const scale = targetMax / originalMax;
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return sourceBlob;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    if (opts.monochrome) ctx.filter = "grayscale(100%)";
    ctx.drawImage(img, 0, 0, w, h);
    const out = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/png")
    );
    return out ?? sourceBlob;
  } catch {
    return sourceBlob;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function downloadPng(url: string, nameNoExt: string, opts?: ProcessOpts) {
  const source = await fetchIconBlob(url);
  const blob = await processBlob(source, opts);
  const name = filenameFromUrl(url, `${nameNoExt}.png`);
  downloadBlob(blob, name);
}

export async function downloadAsZip(
  items: { url: string; name: string; monochrome?: boolean }[],
  zipName = "oddicons.zip",
  opts?: { size: number },
  onProgress?: (done: number, total: number) => void
) {
  const zip = new JSZip();
  let done = 0;
  const CONCURRENCY = 6;
  let idx = 0;
  async function worker() {
    while (idx < items.length) {
      const i = idx++;
      const item = items[i];
      const source = await fetchIconBlob(item.url);
      const perItemOpts: ProcessOpts | undefined = opts
        ? { size: opts.size, monochrome: Boolean(item.monochrome) }
        : undefined;
      const blob = await processBlob(source, perItemOpts);
      const name = filenameFromUrl(item.url, `${item.name.toLowerCase()}.png`);
      zip.file(name, blob);
      done += 1;
      onProgress?.(done, items.length);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker)
  );
  const out = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  downloadBlob(out, zipName);
}
