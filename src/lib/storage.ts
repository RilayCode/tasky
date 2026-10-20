import AsyncStorage from '@react-native-async-storage/async-storage';

// Adaptateur minimal autour d'AsyncStorage (≈ localStorage asynchrone).
// Les erreurs d'entrée/sortie remontent à l'appelant : rien n'est avalé ici.

export type ReadResult =
  | { kind: 'missing' }
  | { kind: 'found'; value: unknown; raw: string }
  | { kind: 'unparsable'; raw: string };

export async function readJson(key: string): Promise<ReadResult> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return { kind: 'missing' };
  try {
    return { kind: 'found', value: JSON.parse(raw) as unknown, raw };
  } catch {
    return { kind: 'unparsable', raw };
  }
}

export async function readRaw(key: string): Promise<string | null> {
  return AsyncStorage.getItem(key);
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function writeRaw(key: string, raw: string): Promise<void> {
  await AsyncStorage.setItem(key, raw);
}
