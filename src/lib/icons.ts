import iconsData from "@/data/icons.json";

export type Icon = {
  name: string;
  file: string;
  category: string;
  tags: string[];
  url: string;
};

export const icons: Icon[] = iconsData as Icon[];

export const categories = Array.from(
  new Set(icons.map((i) => i.category))
).sort();

export function countByCategory(category: string) {
  return icons.filter((i) => i.category === category).length;
}

export function assetPath(file: string) {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  return `${base}/icons/${file}`;
}
