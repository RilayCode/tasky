import { createContext, use, useEffect, useReducer, useRef, useState, type ReactNode } from 'react';

import { generateId } from '@/lib/id';

import { createTask, tasksReducer } from './reducer';
import { loadTasks, saveTasks } from './repository';
import type { Task, TaskDraft } from './types';

export type TasksStatus = 'loading' | 'ready' | 'error';

interface TasksContextValue {
  status: TasksStatus;
  loadError: string | null;
  saveError: string | null;
  tasks: readonly Task[];
  addTask: (draft: TaskDraft) => Task;
  updateTask: (id: string, draft: TaskDraft) => void;
  setCompleted: (id: string, completed: boolean) => void;
  removeTask: (id: string) => Task | undefined;
  restoreTask: (task: Task) => void;
  clearTasks: () => void;
  replaceTasks: (tasks: readonly Task[]) => void;
  startFresh: () => void;
}

const TasksContext = createContext<TasksContextValue | null>(null);

const LOAD_ERROR_MESSAGES = {
  corrupted: 'Vos tâches enregistrées sont illisibles.',
  'unsupported-version': 'Vos tâches ont été enregistrées par une version plus récente de Tasky.',
  io: 'Impossible de lire le stockage de l’appareil.',
} as const;

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, dispatch] = useReducer(tasksReducer, []);
  const [status, setStatus] = useState<TasksStatus>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Écritures en file : chaque sauvegarde attend la précédente (ordre garanti).
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const skipNextSave = useRef(true);

  useEffect(() => {
    let cancelled = false;
    loadTasks()
      .then((result) => {
        if (cancelled) return;
        if (result.ok) {
          dispatch({ type: 'hydrate', tasks: result.tasks });
          setStatus('ready');
        } else {
          console.warn(`Tâches non chargées (${result.reason}), copie de secours : ${result.backupKey}`);
          setLoadError(LOAD_ERROR_MESSAGES[result.reason]);
          setStatus('error');
        }
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.warn('Lecture des tâches impossible :', error);
        setLoadError(LOAD_ERROR_MESSAGES.io);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Rien n'est écrit tant que le chargement n'a pas réussi : on n'écrase jamais
    // des données qu'on n'a pas pu lire.
    if (status !== 'ready') return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    saveQueue.current = saveQueue.current
      .then(() => saveTasks(tasks))
      .then(() => setSaveError(null))
      .catch((error: unknown) => {
        console.warn('Enregistrement des tâches impossible :', error);
        setSaveError('Vos dernières modifications n’ont pas pu être enregistrées.');
      });
  }, [tasks, status]);

  const now = () => new Date().toISOString();

  const value: TasksContextValue = {
    status,
    loadError,
    saveError,
    tasks,
    addTask: (draft) => {
      const task = createTask(draft, generateId(), now());
      dispatch({ type: 'add', task });
      return task;
    },
    updateTask: (id, draft) => dispatch({ type: 'update', id, draft, now: now() }),
    setCompleted: (id, completed) => dispatch({ type: 'setCompleted', id, completed, now: now() }),
    removeTask: (id) => {
      const task = tasks.find((candidate) => candidate.id === id);
      dispatch({ type: 'remove', id });
      return task;
    },
    restoreTask: (task) => dispatch({ type: 'restore', task }),
    clearTasks: () => dispatch({ type: 'clear' }),
    replaceTasks: (next) => dispatch({ type: 'hydrate', tasks: [...next] }),
    // Après une erreur de lecture (données déjà mises de côté) : repartir d'une liste vide.
    startFresh: () => {
      dispatch({ type: 'hydrate', tasks: [] });
      skipNextSave.current = false;
      setLoadError(null);
      setStatus('ready');
    },
  };

  return <TasksContext value={value}>{children}</TasksContext>;
}

export function useTasks(): TasksContextValue {
  const context = use(TasksContext);
  if (!context) {
    throw new Error('useTasks doit être utilisé à l’intérieur de <TasksProvider>.');
  }
  return context;
}

export function useTask(id: string | undefined): Task | undefined {
  const { tasks } = useTasks();
  return tasks.find((task) => task.id === id);
}
