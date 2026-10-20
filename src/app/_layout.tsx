import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from 'react';

import { ToastProvider } from '@/components/ui/ToastProvider';
import { loadThemePreference, saveThemePreference } from '@/features/settings/repository';
import { TasksProvider, useTasks } from '@/features/tasks/TasksProvider';
import { LoadErrorScreen } from '@/screens/LoadErrorScreen';
import { fontAssets } from '@/theme/fonts';
import { ThemeProvider, useTheme, type ThemePreference } from '@/theme/ThemeProvider';

// Garde l'écran de démarrage tant que polices, thème et tâches ne sont pas prêts :
// pas de « saut » de police ni de flash de thème au lancement.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ ...fontAssets, ...Feather.font });
  const [themePreference, setThemePreference] = useState<ThemePreference | null>(null);

  useEffect(() => {
    loadThemePreference().then(setThemePreference);
  }, []);

  useEffect(() => {
    if (fontError) {
      // L'app reste utilisable avec les polices système : on signale sans bloquer.
      console.warn('Chargement des polices impossible :', fontError);
    }
  }, [fontError]);

  if ((!fontsLoaded && !fontError) || themePreference === null) {
    return null;
  }

  return (
    <ThemeProvider initialPreference={themePreference} onPreferenceChange={saveThemePreference}>
      <TasksProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </TasksProvider>
    </ThemeProvider>
  );
}

function AppShell() {
  const { scheme, colors } = useTheme();
  const { status } = useTasks();

  useEffect(() => {
    if (status !== 'loading') SplashScreen.hideAsync();
  }, [status]);

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
      {status === 'error' ? (
        <LoadErrorScreen />
      ) : (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="task/new"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="task/[id]/index" />
          <Stack.Screen name="task/[id]/edit" options={{ animation: 'slide_from_bottom' }} />
        </Stack>
      )}
    </NavigationThemeProvider>
  );
}
