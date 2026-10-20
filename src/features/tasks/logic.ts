import {
  addDays,
  compareDateKeys,
  formatRelativeDay,
  formatShortDate,
  toDateKey,
  type DateKey,
} from '@/lib/date';

import type { Priority, Task, TaskStatusFilter } from './types';

const PRIORITY_WEIGHT: Record<Priority, number> = { high: 0, normal: 1, low: 2 };

export function isCompleted(task: Task): boolean {
  return task.completedAt !== null;
}

export function isOverdue(task: Task, today: DateKey): boolean {
  return !isCompleted(task) && task.dueDate !== null && compareDateKeys(task.dueDate, today) < 0;
}

function completedOn(task: Task): DateKey | null {
  return task.completedAt ? toDateKey(new Date(task.completedAt)) : null;
}

// « Aujourd'hui » = échéance du jour + tâches en retard non terminées.
// Une tâche en retard terminée aujourd'hui reste visible : sinon la progression
// reculerait au moment même où on la coche.
export function selectTodayTasks(tasks: readonly Task[], today: DateKey): Task[] {
  return tasks.filter((task) => {
    if (task.dueDate === null) return false;
    if (task.dueDate === today) return true;
    if (compareDateKeys(task.dueDate, today) > 0) return false;
    return !isCompleted(task) || completedOn(task) === today;
  });
}

function compareNullableLast(a: string | null, b: string | null): number {
  if (a === b) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a < b ? -1 : 1;
}

// Ordre d'affichage : à faire avant terminées, en retard d'abord,
// puis date, heure, priorité et ancienneté.
export function compareTasks(a: Task, b: Task, today: DateKey): number {
  return (
    Number(isCompleted(a)) - Number(isCompleted(b)) ||
    Number(isOverdue(b, today)) - Number(isOverdue(a, today)) ||
    compareNullableLast(a.dueDate, b.dueDate) ||
    compareNullableLast(a.dueTime, b.dueTime) ||
    PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority] ||
    a.createdAt.localeCompare(b.createdAt)
  );
}

export function sortTasks(tasks: readonly Task[], today: DateKey): Task[] {
  return [...tasks].sort((a, b) => compareTasks(a, b, today));
}

export interface Progress {
  done: number;
  total: number;
}

export function computeProgress(tasks: readonly Task[]): Progress {
  return { done: tasks.filter(isCompleted).length, total: tasks.length };
}

export function progressMessage({ done, total }: Progress): string {
  const remaining = total - done;
  if (total === 0) return 'Rien de prévu pour l’instant.';
  if (done === 0) return 'Une chose à la fois.';
  if (remaining === 0) return 'Le reste peut attendre demain.';
  if (remaining === 1) return 'Plus qu’une. Vous y êtes presque.';
  return `Bel élan. Encore ${remaining}.`;
}

export function filterByStatus(tasks: readonly Task[], filter: TaskStatusFilter): readonly Task[] {
  if (filter === 'todo') return tasks.filter((task) => !isCompleted(task));
  if (filter === 'done') return tasks.filter(isCompleted);
  return tasks;
}

// Recherche insensible à la casse et aux accents : « reserver » trouve « Réserver ».
export function normalizeForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function searchTasks(tasks: readonly Task[], query: string): readonly Task[] {
  const needle = normalizeForSearch(query);
  if (!needle) return tasks;
  return tasks.filter((task) =>
    normalizeForSearch(`${task.title} ${task.description ?? ''}`).includes(needle),
  );
}

export type SectionKey = 'overdue' | 'none' | DateKey;

export interface TaskSection {
  key: SectionKey;
  title: string;
  data: Task[];
}

function sectionTitle(key: SectionKey, today: DateKey): string {
  if (key === 'overdue') return 'En retard';
  if (key === 'none') return 'Sans échéance';
  if (key === today || key === addDays(today, 1)) {
    return `${formatRelativeDay(key, today)} · ${formatShortDate(key)}`;
  }
  return formatRelativeDay(key, today);
}

function sectionRank(key: SectionKey): string {
  if (key === 'overdue') return '0';
  if (key === 'none') return '2';
  return `1${key}`;
}

export function groupTasksByDay(tasks: readonly Task[], today: DateKey): TaskSection[] {
  const groups = new Map<SectionKey, Task[]>();
  for (const task of sortTasks(tasks, today)) {
    const key: SectionKey = isOverdue(task, today) ? 'overdue' : (task.dueDate ?? 'none');
    groups.set(key, [...(groups.get(key) ?? []), task]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => sectionRank(a).localeCompare(sectionRank(b)))
    .map(([key, data]) => ({ key, title: sectionTitle(key, today), data }));
}

// Libellé court d'échéance pour une ligne de liste. showDay : afficher le jour
// (inutile quand la liste est déjà regroupée par jour).
export function dueLabel(task: Task, today: DateKey, showDay: boolean): string | null {
  if (task.dueDate === null) return null;
  const day = formatRelativeDay(task.dueDate, today);
  const parts = isOverdue(task, today) || showDay ? [day, task.dueTime] : [task.dueTime];
  const text = parts.filter(Boolean).join(' · ');
  if (isOverdue(task, today)) return `En retard · ${text}`;
  return text || null;
}
