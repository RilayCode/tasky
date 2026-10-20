import type { Task, TaskDraft } from './types';

// Le reducer reste pur : identifiants et horodatages sont fournis par l'appelant.
export type TasksAction =
  | { type: 'hydrate'; tasks: Task[] }
  | { type: 'add'; task: Task }
  | { type: 'update'; id: string; draft: TaskDraft; now: string }
  | { type: 'setCompleted'; id: string; completed: boolean; now: string }
  | { type: 'remove'; id: string }
  | { type: 'restore'; task: Task }
  | { type: 'clear' };

export function tasksReducer(tasks: readonly Task[], action: TasksAction): readonly Task[] {
  switch (action.type) {
    case 'hydrate':
      return action.tasks;
    case 'add':
      return [...tasks, action.task];
    case 'update':
      return tasks.map((task) =>
        task.id === action.id ? { ...task, ...action.draft, updatedAt: action.now } : task,
      );
    case 'setCompleted':
      return tasks.map((task) =>
        task.id === action.id
          ? { ...task, completedAt: action.completed ? action.now : null, updatedAt: action.now }
          : task,
      );
    case 'remove':
      return tasks.filter((task) => task.id !== action.id);
    case 'restore':
      return tasks.some((task) => task.id === action.task.id) ? tasks : [...tasks, action.task];
    case 'clear':
      return [];
  }
}

export function createTask(draft: TaskDraft, id: string, now: string): Task {
  return { id, ...draft, completedAt: null, createdAt: now, updatedAt: now };
}
