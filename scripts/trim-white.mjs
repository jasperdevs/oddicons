import { readdir } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ICON_DIR = "public/icons";
const NEAR_WHITE = 210;
const MAX_SAT = 30;
const MIN_ALPHA = 10;
const MAX_COMPONENT = 400;

const apply = process.argv.includes("--apply");

function isNearWhiteOpaque(data, i, channels) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = channels === 4 ? data[i + 3] : 255;
  if (a < MIN_ALPHA) return false;
  const mn = Math.min(r, g, b);
  const mx = Math.max(r, g, b);
  return mn >= NEAR_WHITE && mx - mn <= MAX_SAT;
}

async function processIcon(path) {
  const image = sharp(path).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const total = width * height;
  const buf = Buffer.from(data);

  const label = new Int32Array(total);
  const MARK_PENDING = -1;
  const seed = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (label[idx] !== 0) return;
    const bi = idx * channels;
    if (!isNearWhiteOpaque(buf, bi, channels)) return;
    label[idx] = MARK_PENDING;
  };

  for (let x = 0; x < width; x++) {
    seed(x, 0);
    seed(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    seed(0, y);
    seed(width - 1, y);
  }

  const components = [];
  const stack = [];
  for (let start = 0; start < total; start++) {
    if (label[start] !== MARK_PENDING) continue;
    const id = components.length + 1;
    let size = 0;
    stack.push(start);
    label[start] = id;
    while (stack.length) {
      const idx = stack.pop();
      size++;
      const x = idx % width;
      const y = (idx / width) | 0;
      const neighbours = [idx - 1, idx + 1, idx - width, idx + width];
      const valid = [
        x > 0,
        x < width - 1,
        y > 0,
        y < height - 1,
      ];
      for (let k = 0; k < 4; k++) {
        if (!valid[k]) continue;
        const ni = neighbours[k];
        if (label[ni] !== 0) continue;
        const bi = ni * channels;
        if (!isNearWhiteOpaque(buf, bi, channels)) continue;
        label[ni] = id;
        stack.push(ni);
      }
    }
    components.push(size);
  }

  let cleared = 0;
  const bigComponents = [];
  for (let i = 0; i < total; i++) {
    const id = label[i];
    if (id <= 0) continue;
    if (components[id - 1] > MAX_COMPONENT) {
      if (!bigComponents.includes(id)) bigComponents.push(id);
      continue;
    }
    buf[i * channels + 3] = 0;
    cleared++;
  }

  if (cleared > 0 && apply) {
    await sharp(buf, { raw: { width, height, channels } }).png().toFile(path);
  }
  return { cleared, skipped: bigComponents.map((id) => components[id - 1]) };
}

const entries = await readdir(ICON_DIR);
const pngs = entries.filter((f) => f.toLowerCase().endsWith(".png"));

const results = [];
let cleanedFiles = 0;
for (const f of pngs) {
  const r = await processIcon(join(ICON_DIR, f));
  if (r.cleared > 0 || r.skipped.length > 0) {
    const parts = [];
    if (r.cleared > 0) parts.push(`cleared ${r.cleared}`);
    if (r.skipped.length > 0) parts.push(`skipped large blob(s) ${r.skipped.join(",")}`);
    results.push(`${f}: ${parts.join("; ")}`);
    if (r.cleared > 0) cleanedFiles++;
  }
}

if (results.length === 0) {
  console.log("trim-white: nothing to clean");
} else {
  console.log(results.join("\n"));
  console.log(`\ntrim-white: ${cleanedFiles} file(s) had stray white${apply ? " — cleaned in place" : " — run with --apply to fix"}`);
}
