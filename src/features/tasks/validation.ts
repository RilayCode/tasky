import { isValidDateKey, isValidTime } from '@/lib/date';

import type { TaskDraft, TaskInput } from './types';

export const TITLE_MAX_LENGTH = 120;
export const DESCRIPTION_MAX_LENGTH = 1000;

export type TaskInputErrors = Partial<Record<keyof TaskInput, string>>;

export type ValidationResult =
  | { ok: true; value: TaskDraft }
  | { ok: false; errors: TaskInputErrors };

export function validateTaskInput(input: TaskInput): ValidationResult {
  const errors: TaskInputErrors = {};
  const title = input.title.trim();
  const description = input.description.trim();

  if (!title) {
    errors.title = 'Le titre est requis pour créer une tâche.';
  } else if (title.length > TITLE_MAX_LENGTH) {
    errors.title = `Le titre ne doit pas dépasser ${TITLE_MAX_LENGTH} caractères.`;
  }

  if (description.length > DESCRIPTION_MAX_LENGTH) {
    errors.description = `La description ne doit pas dépasser ${DESCRIPTION_MAX_LENGTH} caractères.`;
  }

  if (input.dueDate !== null && !isValidDateKey(input.dueDate)) {
    errors.dueDate = 'Cette date n’est pas valide.';
  }

  if (input.dueTime !== null) {
    if (input.dueDate === null) {
      errors.dueTime = 'Choisissez d’abord une date.';
    } else if (!isValidTime(input.dueTime)) {
      errors.dueTime = 'Cette heure n’est pas valide.';
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      title,
      description: description || null,
      priority: input.priority,
      dueDate: input.dueDate,
      dueTime: input.dueTime,
    },
  };
}
