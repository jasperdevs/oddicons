import { readdir, mkdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const SRC_DIR = "public/icons";
const THUMB_DIR = "public/icons/thumbs";
const MINI_DIR = "public/icons/mini";
const THUMB_SIZE = 192;
const MINI_SIZE = 64;
const QUALITY = 82;
const MINI_QUALITY = 70;

async function buildVariant(file, outDir, size, quality) {
  const src = join(SRC_DIR, file);
  const out = join(outDir, `${parse(file).name}.webp`);
  try {
    const [srcStat, outStat] = await Promise.all([
      stat(src),
      stat(out).catch(() => null),
    ]);
    if (outStat && outStat.mtimeMs >= srcStat.mtimeMs) return "skipped";
  } catch {}
  await sharp(src)
    .resize(size, size, { fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 5 })
    .toFile(out);
  return "made";
}

async function main() {
  await mkdir(THUMB_DIR, { recursive: true });
  await mkdir(MINI_DIR, { recursive: true });
  const entries = await readdir(SRC_DIR);
  const pngs = entries.filter((f) => f.toLowerCase().endsWith(".png"));

  let thumbMade = 0, thumbSkipped = 0, miniMade = 0, miniSkipped = 0;
  for (const file of pngs) {
    const t = await buildVariant(file, THUMB_DIR, THUMB_SIZE, QUALITY);
    if (t === "made") thumbMade++; else thumbSkipped++;
    const m = await buildVariant(file, MINI_DIR, MINI_SIZE, MINI_QUALITY);
    if (m === "made") miniMade++; else miniSkipped++;
  }

  console.log(`thumbs: ${thumbMade} built, ${thumbSkipped} up-to-date, ${THUMB_SIZE}px @ q${QUALITY}`);
  console.log(`mini:   ${miniMade} built, ${miniSkipped} up-to-date, ${MINI_SIZE}px @ q${MINI_QUALITY}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
