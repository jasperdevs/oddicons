export async function svgToPngBlob(url: string, size = 512): Promise<Blob> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  const svgText = await res.text();
  const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
  const objUrl = URL.createObjectURL(blob);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = objUrl;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas 2d unavailable");
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(img, 0, 0, size, size);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png")
    );
  } finally {
    URL.revokeObjectURL(objUrl);
  }
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

export async function downloadPng(url: string, nameNoExt: string, size = 512) {
  const blob = await svgToPngBlob(url, size);
  downloadBlob(blob, `${nameNoExt}.png`);
}
