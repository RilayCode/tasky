import { createContext, use, useState, type ReactNode } from 'react';
import { useColorScheme, type TextStyle } from 'react-native';

import { colors, typography, type ColorScheme, type ColorTokens, type TextVariant } from './tokens';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  scheme: ColorScheme;
  colors: ColorTokens;
  typography: Record<TextVariant, TextStyle>;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

interface ThemeProviderProps {
  children: ReactNode;
  initialPreference?: ThemePreference;
  // Appelé à chaque changement, pour enregistrer le choix (voir features/settings).
  onPreferenceChange?: (preference: ThemePreference) => void;
}

export function ThemeProvider({
  children,
  initialPreference = 'system',
  onPreferenceChange,
}: ThemeProviderProps) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(initialPreference);

  const scheme: ColorScheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const value: ThemeContextValue = {
    preference,
    setPreference: (next) => {
      setPreferenceState(next);
      onPreferenceChange?.(next);
    },
    scheme,
    colors: colors[scheme],
    typography,
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
