import JSZip from "jszip";

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

export async function downloadPng(url: string, nameNoExt: string) {
  const blob = await fetchIconBlob(url);
  const name = filenameFromUrl(url, `${nameNoExt}.png`);
  downloadBlob(blob, name);
}

export async function downloadAsZip(
  items: { url: string; name: string }[],
  zipName = "oddicons.zip",
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
      const blob = await fetchIconBlob(item.url);
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
