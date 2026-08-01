"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>  {/* attribute="class" means it toggles dark mode by adding/removing a dark class on the page */}
      {children}
    </NextThemesProvider>
  );
}