"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

/**
 * Wraps `next-themes`, which persists the user's dark/light preference in
 * localStorage and syncs the `class="dark"` attribute on <html> without a
 * flash of incorrect theme on load (via the injected blocking script).
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
