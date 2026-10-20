import type { DateKey, TimeString } from '@/lib/date';

export type Priority = 'low' | 'normal' | 'high';

export type TaskStatusFilter = 'all' | 'todo' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: Priority;
  // Échéance facultative : date seule, date + heure, ou rien. Jamais d'heure sans date.
  dueDate: DateKey | null;
  dueTime: TimeString | null;
  // Le statut se déduit de completedAt : null = à faire.
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Données saisies dans le formulaire, avant validation.
export interface TaskInput {
  title: string;
  description: string;
  priority: Priority;
  dueDate: DateKey | null;
  dueTime: TimeString | null;
}

// Données validées et normalisées (titre nettoyé, description vide → null).
export type TaskDraft = Pick<Task, 'title' | 'description' | 'priority' | 'dueDate' | 'dueTime'>;

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Basse',
  normal: 'Normale',
  high: 'Haute',
};
