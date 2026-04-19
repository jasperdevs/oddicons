import { IconGallery } from "@/components/icon-gallery";
import icons from "@/data/icons.json";
import { slugify } from "@/lib/slug";

export function generateStaticParams() {
  const cats = Array.from(new Set((icons as { category: string }[]).map((i) => i.category)));
  return cats.map((c) => ({ slug: slugify(c) }));
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <IconGallery view={{ type: "category", slug }} />;
}
