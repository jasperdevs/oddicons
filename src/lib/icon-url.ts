const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function iconFullUrl(file: string): string {
  return `${BASE}/icons/${file}`;
}

export function iconThumbUrl(file: string): string {
  const name = file.replace(/\.[^.]+$/, "");
  return `${BASE}/icons/thumbs/${name}.webp`;
}

export function iconMiniUrl(file: string): string {
  const name = file.replace(/\.[^.]+$/, "");
  return `${BASE}/icons/mini/${name}.webp`;
}
