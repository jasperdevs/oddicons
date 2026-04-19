import { readdir, mkdir, stat } from "node:fs/promises";
import { join, parse } from "node:path";
import sharp from "sharp";

const SRC_DIR = "public/icons";
const THUMB_DIR = "public/icons/thumbs";
const THUMB_SIZE = 192;
const QUALITY = 82;

async function main() {
  await mkdir(THUMB_DIR, { recursive: true });
  const entries = await readdir(SRC_DIR);
  const pngs = entries.filter((f) => f.toLowerCase().endsWith(".png"));

  let made = 0;
  let skipped = 0;
  for (const file of pngs) {
    const src = join(SRC_DIR, file);
    const out = join(THUMB_DIR, `${parse(file).name}.webp`);

    try {
      const [srcStat, outStat] = await Promise.all([
        stat(src),
        stat(out).catch(() => null),
      ]);
      if (outStat && outStat.mtimeMs >= srcStat.mtimeMs) {
        skipped++;
        continue;
      }
    } catch {}

    await sharp(src)
      .resize(THUMB_SIZE, THUMB_SIZE, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5 })
      .toFile(out);
    made++;
  }

  console.log(`thumbs: ${made} built, ${skipped} up-to-date, ${THUMB_SIZE}px @ q${QUALITY}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
