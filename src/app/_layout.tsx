import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';

import { fontAssets } from '@/theme/fonts';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

// Garde l'écran de démarrage visible tant que les polices ne sont pas prêtes,
// pour éviter un « saut » de police au premier affichage.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontError) {
      // L'app reste utilisable avec les polices système : on signale sans bloquer.
      console.warn('Chargement des polices impossible :', fontError);
    }
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ThemeProvider>
      <AppShell />
    </ThemeProvider>
  );
}

function AppShell() {
  const { scheme, colors } = useTheme();

  useEffect(() => {
    // Fond de la fenêtre native : évite un flash de couleur pendant les transitions.
    SystemUI.setBackgroundColorAsync(colors.background);
  }, [colors.background]);

  const baseTheme = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.textPrimary,
      background: colors.background,
      card: colors.background,
      text: colors.textPrimary,
      border: colors.borderSubtle,
    },
  };

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </NavigationThemeProvider>
  );
}
