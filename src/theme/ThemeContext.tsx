import React, { createContext, useContext, useMemo } from 'react';

import type { Theme } from '@/types/schema';

/**
 * OTA theming. The active `Theme` (baseline payload theme, or the active
 * campaign's theme) is injected once at the root via a Context Provider. Every
 * skinnable child (buttons, borders, headers, tags) samples it through
 * `useTheme()` so a single server-pushed palette repaints the whole tree.
 *
 * The context value is memoized on the theme object identity, so swapping
 * campaigns triggers exactly one re-render pass keyed on the new palette — not a
 * cascade per render.
 */

const ThemeContext = createContext<Theme | null>(null);

interface ThemeProviderProps {
  theme: Theme;
  children: React.ReactNode;
}

export function ThemeProvider({
  theme,
  children,
}: ThemeProviderProps): React.ReactElement {
  // Stabilize identity across renders that don't actually change the palette.
  const value = useMemo<Theme>(
    () => theme,
    [
      theme.primary,
      theme.background,
      theme.accent,
      theme.surface,
      theme.text,
      theme.textMuted,
      theme.onPrimary,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a <ThemeProvider>.');
  }
  return theme;
}
