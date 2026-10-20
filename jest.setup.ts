// Active les utilitaires de test de Reanimated (horloge d'animation simulée, matchers).
import { setUpTests } from 'react-native-reanimated';

setUpTests();

// Stockage simulé en mémoire (mock officiel d'AsyncStorage).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Les fichiers de police n'existent pas dans Jest : on simule un chargement réussi.
jest.mock('expo-font', () => ({
  ...jest.requireActual('expo-font'),
  useFonts: () => [true, null],
  isLoaded: () => true,
  loadAsync: jest.fn(() => Promise.resolve()),
}));
