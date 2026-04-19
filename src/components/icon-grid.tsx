"use client";

import { useMemo, useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { IconCard } from "./icon-card";
import { icons } from "@/lib/icons";

export function IconGrid() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return icons.filter((i) => {
      if (category && i.category !== category) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [query, category]);

  return (
    <div className="flex min-h-screen">
      <Sidebar activeCategory={category} onCategoryChange={setCategory} />
      <main className="flex-1 flex flex-col min-w-0">
        <Topbar query={query} onQueryChange={setQuery} />

        <div className="flex-1 px-4 md:px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] text-muted-foreground">
              <span className="tabular-nums text-foreground font-medium">
                {filtered.length}
              </span>{" "}
              {filtered.length === 1 ? "icon" : "icons"}
              {category && (
                <>
                  {" "}
                  · <span>{category}</span>
                </>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-24 text-center text-muted-foreground text-[13px]">
              No icons match your search.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((icon) => (
                <IconCard key={icon.name} icon={icon} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
