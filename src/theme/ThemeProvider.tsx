import { createContext, use, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import {
  buildTypography,
  colors,
  displayFonts,
  type ColorScheme,
  type ColorTokens,
  type DisplayFontKey,
  type TextVariant,
} from './tokens';
import type { TextStyle } from 'react-native';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  scheme: ColorScheme;
  colors: ColorTokens;
  typography: Record<TextVariant, TextStyle>;
  // Temporaire (phase 2) : sert à comparer les polices d'affichage dans le labo.
  displayFont: DisplayFontKey;
  setDisplayFont: (font: DisplayFontKey) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  initialPreference?: ThemePreference;
}

export function ThemeProvider({ children, initialPreference = 'system' }: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>(initialPreference);
  const [displayFont, setDisplayFont] = useState<DisplayFontKey>('instrument');

  const scheme: ColorScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value: ThemeContextValue = {
    preference,
    setPreference,
    scheme,
    colors: colors[scheme],
    typography: buildTypography(displayFonts[displayFont]),
    displayFont,
    setDisplayFont,
  };

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const context = use(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l’intérieur de <ThemeProvider>.');
  }
  return context;
}
