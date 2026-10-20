import { readJson, writeJson } from '@/lib/storage';
import type { ThemePreference } from '@/theme/ThemeProvider';

export const SETTINGS_KEY = 'tasky:settings';
const SETTINGS_SCHEMA_VERSION = 1;

const PREFERENCES: readonly ThemePreference[] = ['system', 'light', 'dark'];

// Les réglages ne sont pas critiques : en cas de problème on revient au thème
// automatique, en le signalant dans la console plutôt qu'en bloquant l'app.
export async function loadThemePreference(): Promise<ThemePreference> {
  try {
    const result = await readJson(SETTINGS_KEY);
    if (result.kind !== 'found') {
      if (result.kind === 'unparsable') console.warn('Réglages illisibles, thème automatique.');
      return 'system';
    }
    const theme = (result.value as { theme?: unknown } | null)?.theme;
    return PREFERENCES.includes(theme as ThemePreference) ? (theme as ThemePreference) : 'system';
  } catch (error) {
    console.warn('Lecture des réglages impossible :', error);
    return 'system';
  }
}

export async function saveThemePreference(theme: ThemePreference): Promise<void> {
  try {
    await writeJson(SETTINGS_KEY, { version: SETTINGS_SCHEMA_VERSION, theme });
  } catch (error) {
    console.warn('Enregistrement du thème impossible :', error);
  }
}
