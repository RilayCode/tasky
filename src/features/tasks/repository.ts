import { isValidDateKey, isValidTime } from '@/lib/date';
import { readJson, readRaw, writeJson, writeRaw } from '@/lib/storage';

import type { Priority, Task } from './types';

export const TASKS_KEY = 'tasky:tasks';
export const TASKS_SCHEMA_VERSION = 1;

interface StoredTasks {
  version: number;
  tasks: Task[];
}

export type LoadTasksResult =
  | { ok: true; tasks: Task[] }
  | { ok: false; reason: 'corrupted' | 'unsupported-version'; backupKey: string };

const PRIORITIES: readonly Priority[] = ['low', 'normal', 'high'];

const isNullableString = (value: unknown): value is string | null =>
  value === null || typeof value === 'string';

export function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const task = value as Record<string, unknown>;
  return (
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    task.title.trim().length > 0 &&
    isNullableString(task.description) &&
    PRIORITIES.includes(task.priority as Priority) &&
    (task.dueDate === null || (typeof task.dueDate === 'string' && isValidDateKey(task.dueDate))) &&
    (task.dueTime === null || (typeof task.dueTime === 'string' && isValidTime(task.dueTime))) &&
    isNullableString(task.completedAt) &&
    typeof task.createdAt === 'string' &&
    typeof task.updatedAt === 'string'
  );
}

export const BACKUP_KEY = `${TASKS_KEY}:backup`;

// Donnée illisible : on la met de côté au lieu de l'écraser. Une même donnée n'est
// copiée qu'une fois (sinon chaque relance ajouterait une copie et remplirait le stockage) ;
// une donnée différente ne remplace jamais une copie existante.
async function backup(raw: string): Promise<string> {
  const existing = await readRaw(BACKUP_KEY);
  if (existing === null || existing === raw) {
    if (existing === null) await writeRaw(BACKUP_KEY, raw);
    return BACKUP_KEY;
  }
  const datedKey = `${BACKUP_KEY}:${Date.now()}`;
  await writeRaw(datedKey, raw);
  return datedKey;
}

export async function loadTasks(): Promise<LoadTasksResult> {
  const result = await readJson(TASKS_KEY);
  if (result.kind === 'missing') return { ok: true, tasks: [] };
  if (result.kind === 'unparsable') {
    return { ok: false, reason: 'corrupted', backupKey: await backup(result.raw) };
  }

  const stored = result.value as Partial<StoredTasks> | null;
  if (typeof stored?.version === 'number' && stored.version > TASKS_SCHEMA_VERSION) {
    // Données écrites par une version plus récente de l'app : ne jamais les réécrire.
    return { ok: false, reason: 'unsupported-version', backupKey: await backup(result.raw) };
  }
  if (stored?.version !== TASKS_SCHEMA_VERSION || !Array.isArray(stored.tasks)) {
    return { ok: false, reason: 'corrupted', backupKey: await backup(result.raw) };
  }
  if (!stored.tasks.every(isTask)) {
    return { ok: false, reason: 'corrupted', backupKey: await backup(result.raw) };
  }
  return { ok: true, tasks: stored.tasks };
}

export async function saveTasks(tasks: readonly Task[]): Promise<void> {
  const payload: StoredTasks = { version: TASKS_SCHEMA_VERSION, tasks: [...tasks] };
  await writeJson(TASKS_KEY, payload);
}
