import { createTask, tasksReducer } from '../reducer';
import type { TaskInput } from '../types';
import { TITLE_MAX_LENGTH, validateTaskInput } from '../validation';
import { makeTask } from '@/test/taskFactory';

const baseInput: TaskInput = {
  title: 'Envoyer le devis',
  description: '',
  priority: 'normal',
  dueDate: '2026-10-20',
  dueTime: null,
};

describe('validateTaskInput', () => {
  it('nettoie le titre et transforme une description vide en null', () => {
    const result = validateTaskInput({ ...baseInput, title: '  Envoyer  ', description: '   ' });
    expect(result).toEqual({
      ok: true,
      value: {
        title: 'Envoyer',
        description: null,
        priority: 'normal',
        dueDate: '2026-10-20',
        dueTime: null,
      },
    });
  });

  it('refuse un titre vide ou fait d’espaces', () => {
    const result = validateTaskInput({ ...baseInput, title: '    ' });
    expect(result).toEqual({
      ok: false,
      errors: { title: 'Le titre est requis pour créer une tâche.' },
    });
  });

  it('refuse un titre trop long', () => {
    const result = validateTaskInput({ ...baseInput, title: 'a'.repeat(TITLE_MAX_LENGTH + 1) });
    expect(result.ok).toBe(false);
  });

  it('accepte une tâche sans échéance', () => {
    expect(validateTaskInput({ ...baseInput, dueDate: null }).ok).toBe(true);
  });

  it('refuse une heure sans date et une date impossible', () => {
    const noDate = validateTaskInput({ ...baseInput, dueDate: null, dueTime: '10:00' });
    expect(noDate).toEqual({ ok: false, errors: { dueTime: 'Choisissez d’abord une date.' } });
    expect(validateTaskInput({ ...baseInput, dueDate: '2026-02-31' }).ok).toBe(false);
  });
});

describe('tasksReducer', () => {
  const now = '2026-10-20T10:00:00.000Z';

  it('ajoute, modifie, termine, rouvre et supprime une tâche', () => {
    const task = createTask(
      { title: 'A', description: null, priority: 'low', dueDate: null, dueTime: null },
      'id-1',
      now,
    );
    let state = tasksReducer([], { type: 'add', task });
    expect(state).toHaveLength(1);

    state = tasksReducer(state, {
      type: 'update',
      id: 'id-1',
      draft: { title: 'B', description: 'd', priority: 'high', dueDate: '2026-10-21', dueTime: '09:00' },
      now: 'later',
    });
    expect(state[0]).toMatchObject({ title: 'B', priority: 'high', updatedAt: 'later', createdAt: now });

    state = tasksReducer(state, { type: 'setCompleted', id: 'id-1', completed: true, now: 'done-at' });
    expect(state[0].completedAt).toBe('done-at');

    state = tasksReducer(state, { type: 'setCompleted', id: 'id-1', completed: false, now: 'reopen' });
    expect(state[0].completedAt).toBeNull();

    state = tasksReducer(state, { type: 'remove', id: 'id-1' });
    expect(state).toEqual([]);
  });

  it('restaure une tâche supprimée sans la dupliquer', () => {
    const task = makeTask();
    const restored = tasksReducer([], { type: 'restore', task });
    expect(restored).toEqual([task]);
    expect(tasksReducer(restored, { type: 'restore', task })).toEqual([task]);
  });

  it('ne modifie pas l’état d’origine (immutabilité)', () => {
    const original = [makeTask()];
    const frozen = Object.freeze([...original]);
    tasksReducer(frozen, { type: 'setCompleted', id: original[0].id, completed: true, now });
    expect(frozen[0].completedAt).toBeNull();
  });
});
