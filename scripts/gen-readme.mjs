import { readFile, writeFile } from "node:fs/promises";

const README = "README.md";
const ICONS = "src/data/icons.json";
const START = "<!-- BEGIN ICON TABLE -->";
const END = "<!-- END ICON TABLE -->";

function thumbPath(file) {
  return `./public/icons/thumbs/${file.replace(/\.[^.]+$/, "")}.webp`;
}

function escapeCell(value) {
  return String(value).replace(/\|/g, "\\|");
}

const icons = JSON.parse(await readFile(ICONS, "utf8"));
const byCategory = new Map();

for (const icon of icons) {
  const list = byCategory.get(icon.category) ?? [];
  list.push(icon);
  byCategory.set(icon.category, list);
}

const sections = [];
sections.push(`_Generated from \`${ICONS}\`. Run \`npm run readme\` after adding icons._`);

for (const [category, items] of byCategory) {
  sections.push(`\n### ${category}\n`);
  sections.push("| Icon | Name |");
  sections.push("| --- | --- |");
  for (const icon of items) {
    sections.push(
      `| <img src="${thumbPath(icon.file)}" alt="${escapeCell(icon.name)}" width="44" /> | ${escapeCell(icon.name)} |`
    );
  }
}

const generated = `${START}\n${sections.join("\n")}\n${END}`;
const readme = await readFile(README, "utf8");

if (!readme.includes(START) || !readme.includes(END)) {
  throw new Error(`README.md must contain ${START} and ${END}`);
}

const next = readme.replace(new RegExp(`${START}[\\s\\S]*?${END}`), generated);
await writeFile(README, next);
console.log(`readme: wrote ${icons.length} icons`);
