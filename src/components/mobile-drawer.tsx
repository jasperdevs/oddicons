"use client";

import { Drawer } from "@base-ui/react";
import { SidebarBody } from "@/components/sidebar";
import { cn } from "@/lib/utils";

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
  counts: Record<string, number>;
  favoriteCount: number;
  onlyFavorites: boolean;
  onToggleFavorites: () => void;
  totalCount: number;
}

export function MobileDrawer({
  open,
  onOpenChange,
  onSelect,
  onToggleFavorites,
  ...rest
}: MobileDrawerProps) {
  const close = () => onOpenChange(false);

  const wrappedSelect = (cat: string) => {
    onSelect(cat);
    close();
  };

  const wrappedToggleFavorites = () => {
    onToggleFavorites();
    close();
  };

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange} swipeDirection="left">
      <Drawer.Portal>
        <Drawer.Backdrop
          className={cn(
            "fixed inset-0 z-50 bg-background/60 backdrop-blur-[2px]",
            "transition-opacity duration-[220ms] ease-out",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0"
          )}
        />
        <Drawer.Popup
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[min(17rem,calc(100vw-3rem))] flex-col overflow-hidden bg-sidebar shadow-[0_24px_64px_-8px_rgba(0,0,0,0.6)] outline-none",
            "transition-transform duration-[240ms] ease-out",
            "data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full"
          )}
        >
          <Drawer.Title className="sr-only">menu</Drawer.Title>
          <SidebarBody
            {...rest}
            onSelect={wrappedSelect}
            onToggleFavorites={wrappedToggleFavorites}
          />
        </Drawer.Popup>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
