"use client";

import { TabsSubtle, TabsSubtleItem } from "@/components/ui/tabs-subtle";

interface CategoryTabsProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
  counts: Record<string, number>;
}

export function CategoryTabs({ categories, selected, onSelect, counts }: CategoryTabsProps) {
  const selectedIndex = Math.max(0, categories.indexOf(selected));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6">
      <TabsSubtle
        selectedIndex={selectedIndex}
        onSelect={(i) => onSelect(categories[i])}
        idPrefix="oddicons-categories"
      >
        {categories.map((cat, i) => (
          <TabsSubtleItem
            key={cat}
            index={i}
            label={`${cat} · ${counts[cat] ?? 0}`}
          />
        ))}
      </TabsSubtle>
    </div>
  );
}
