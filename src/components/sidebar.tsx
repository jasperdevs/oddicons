"use client";

import { Home, Heart, Code2, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { categories, countByCategory, icons } from "@/lib/icons";

type SidebarProps = {
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
};

const primaryNav = [
  { key: "home", label: "Home", icon: Home },
  { key: "favorites", label: "Favorites", icon: Heart },
  { key: "api", label: "API", icon: Code2 },
  { key: "pack", label: "Pack", icon: Package },
];

export function Sidebar({ activeCategory, onCategoryChange }: SidebarProps) {
  return (
    <aside className="hidden md:flex w-[240px] shrink-0 flex-col border-r border-border bg-sidebar px-3 py-4 gap-1">
      <div className="flex items-center gap-2 px-2 pb-4">
        <Logo className="h-7 w-7 text-foreground" />
        <span className="text-[15px] font-medium tracking-tight">oddicons</span>
      </div>

      <div className="flex flex-col gap-0.5">
        {primaryNav.map(({ key, label, icon: Icon }) => {
          const isActive = key === "home" && activeCategory === null;
          return (
            <button
              key={key}
              onClick={() => key === "home" && onCategoryChange(null)}
              className={cn(
                "flex items-center gap-2 h-8 px-2 rounded-lg text-[13px] text-left transition-colors",
                "hover:bg-accent hover:text-foreground",
                isActive ? "bg-accent text-foreground" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <div className="h-px bg-border my-3 mx-2" />

      <div className="flex flex-col gap-0.5 overflow-y-auto">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(isActive ? null : cat)}
              className={cn(
                "flex items-center justify-between h-8 px-2 rounded-lg text-[13px] transition-colors",
                "hover:bg-accent hover:text-foreground",
                isActive ? "bg-accent text-foreground" : "text-muted-foreground"
              )}
            >
              <span>{cat}</span>
              <span className="text-[11px] text-muted-foreground tabular-nums">
                {countByCategory(cat)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto px-2 pt-4 text-[11px] text-muted-foreground">
        {icons.length} icons · free forever
      </div>
    </aside>
  );
}
