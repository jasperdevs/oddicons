"use client";

import { type ReactNode } from "react";
import { ShapeProvider } from "@/lib/shape-context";
import { IconProvider } from "@/lib/icon-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <IconProvider defaultLibrary="lucide">
      <ShapeProvider defaultShape="rounded">{children}</ShapeProvider>
    </IconProvider>
  );
}
