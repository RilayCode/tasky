import type { Task } from '@/features/tasks/types';

let counter = 0;

export function makeTask(overrides: Partial<Task> = {}): Task {
  counter += 1;
  return {
    id: `task-${counter}`,
    title: `Tâche ${counter}`,
    description: null,
    priority: 'normal',
    dueDate: '2026-10-20',
    dueTime: null,
    completedAt: null,
    createdAt: `2026-10-01T08:00:${String(counter % 60).padStart(2, '0')}.000Z`,
    updatedAt: '2026-10-01T08:00:00.000Z',
    ...overrides,
  };
}
