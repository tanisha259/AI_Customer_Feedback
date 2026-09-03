"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";

/**
 * @file components/theme-provider.tsx
 * Thin wrapper around next-themes to keep provider boilerplate out of layout.tsx.
 */

/**
 * Wraps the application in next-themes provider to enable client-side
 * dark mode and light mode switching without hydration mismatch errors.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
