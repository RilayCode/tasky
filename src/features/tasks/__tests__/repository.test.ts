import AsyncStorage from '@react-native-async-storage/async-storage';

import { makeTask } from '@/test/taskFactory';

import { BACKUP_KEY, loadTasks, saveTasks, TASKS_KEY } from '../repository';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('repository des tâches', () => {
  it('renvoie une liste vide au premier lancement', async () => {
    expect(await loadTasks()).toEqual({ ok: true, tasks: [] });
  });

  it('relit exactement ce qui a été écrit', async () => {
    const tasks = [makeTask({ title: 'Envoyer le devis', dueTime: '11:00', priority: 'high' })];
    await saveTasks(tasks);
    expect(await loadTasks()).toEqual({ ok: true, tasks });
  });

  it('met de côté un JSON illisible sans l’écraser', async () => {
    await AsyncStorage.setItem(TASKS_KEY, '{oups');
    const result = await loadTasks();
    expect(result).toMatchObject({ ok: false, reason: 'corrupted' });
    if (result.ok) throw new Error('chargement inattendu');
    expect(await AsyncStorage.getItem(result.backupKey)).toBe('{oups');
    expect(await AsyncStorage.getItem(TASKS_KEY)).toBe('{oups');
  });

  it('ne recopie pas la même donnée illisible à chaque relance', async () => {
    await AsyncStorage.setItem(TASKS_KEY, '{oups');
    await loadTasks();
    await loadTasks();
    await loadTasks();
    const keys = (await AsyncStorage.getAllKeys()).filter((key) => key.includes(':backup'));
    expect(keys).toEqual([BACKUP_KEY]);
  });

  it('refuse une tâche au format invalide', async () => {
    await AsyncStorage.setItem(
      TASKS_KEY,
      JSON.stringify({ version: 1, tasks: [{ ...makeTask(), dueDate: '2026-13-45' }] }),
    );
    expect(await loadTasks()).toMatchObject({ ok: false, reason: 'corrupted' });
  });

  it('ne touche pas aux données d’une version plus récente', async () => {
    const future = JSON.stringify({ version: 99, tasks: [] });
    await AsyncStorage.setItem(TASKS_KEY, future);
    expect(await loadTasks()).toMatchObject({ ok: false, reason: 'unsupported-version' });
    expect(await AsyncStorage.getItem(TASKS_KEY)).toBe(future);
  });
});
