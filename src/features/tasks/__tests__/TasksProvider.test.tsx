import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { makeTask } from '@/test/taskFactory';

import { loadTasks, TASKS_KEY } from '../repository';
import { TasksProvider, useTasks } from '../TasksProvider';

const renderTasks = () => renderHook(() => useTasks(), { wrapper: TasksProvider });

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('TasksProvider', () => {
  it('charge, modifie puis persiste les tâches', async () => {
    const { result } = await renderTasks();
    await waitFor(() => expect(result.current.status).toBe('ready'));

    await act(async () => {
      result.current.addTask({
        title: 'Lire',
        description: null,
        priority: 'normal',
        dueDate: null,
        dueTime: null,
      });
    });
    await waitFor(async () => {
      const stored = await loadTasks();
      expect(stored.ok && stored.tasks.map((task) => task.title)).toEqual(['Lire']);
    });
  });

  it('passe en erreur sans écraser des données illisibles', async () => {
    await AsyncStorage.setItem(TASKS_KEY, 'pas du json');
    const { result } = await renderTasks();
    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current.loadError).toBe('Vos tâches enregistrées sont illisibles.');
    expect(await AsyncStorage.getItem(TASKS_KEY)).toBe('pas du json');
  });

  it('restaure une tâche supprimée', async () => {
    const task = makeTask({ title: 'À garder' });
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify({ version: 1, tasks: [task] }));
    const { result } = await renderTasks();
    await waitFor(() => expect(result.current.tasks).toHaveLength(1));

    let removed: ReturnType<typeof result.current.removeTask>;
    await act(async () => {
      removed = result.current.removeTask(task.id);
    });
    expect(result.current.tasks).toHaveLength(0);
    await act(async () => {
      if (removed) result.current.restoreTask(removed);
    });
    expect(result.current.tasks).toEqual([task]);
  });
});
