import {
  computeProgress,
  filterByStatus,
  groupTasksByDay,
  isOverdue,
  progressMessage,
  searchTasks,
  selectTodayTasks,
  sortTasks,
} from '../logic';
import { makeTask } from '@/test/taskFactory';

const TODAY = '2026-10-20';
// Midi local : reste le 20 octobre quel que soit le fuseau de la machine de test.
const COMPLETED_TODAY = new Date(2026, 9, 20, 12).toISOString();
const COMPLETED_EARLIER = new Date(2026, 9, 17, 12).toISOString();

describe('selectTodayTasks', () => {
  it('garde le jour même et les retards non terminés, ignore le futur et les tâches sans date', () => {
    const today = makeTask({ dueDate: TODAY });
    const lateTodo = makeTask({ dueDate: '2026-10-18' });
    const tomorrow = makeTask({ dueDate: '2026-10-21' });
    const undated = makeTask({ dueDate: null });
    expect(selectTodayTasks([today, lateTodo, tomorrow, undated], TODAY)).toEqual([today, lateTodo]);
  });

  it('garde un retard terminé aujourd’hui mais pas un retard terminé avant', () => {
    const doneToday = makeTask({ dueDate: '2026-10-18', completedAt: COMPLETED_TODAY });
    const doneBefore = makeTask({ dueDate: '2026-10-16', completedAt: COMPLETED_EARLIER });
    expect(selectTodayTasks([doneToday, doneBefore], TODAY)).toEqual([doneToday]);
  });
});

describe('sortTasks', () => {
  it('place retards puis heures croissantes, terminées en dernier, sans heure après les heures', () => {
    const done = makeTask({ title: 'done', dueTime: '07:00', completedAt: COMPLETED_TODAY });
    const evening = makeTask({ title: 'evening', dueTime: '21:00' });
    const morning = makeTask({ title: 'morning', dueTime: '08:00' });
    const noTime = makeTask({ title: 'noTime' });
    const late = makeTask({ title: 'late', dueDate: '2026-10-19', dueTime: '23:00' });
    const titles = sortTasks([done, evening, noTime, morning, late], TODAY).map((t) => t.title);
    expect(titles).toEqual(['late', 'morning', 'evening', 'noTime', 'done']);
  });

  it('départage par priorité à horaire égal', () => {
    const low = makeTask({ title: 'low', priority: 'low' });
    const high = makeTask({ title: 'high', priority: 'high' });
    expect(sortTasks([low, high], TODAY).map((t) => t.title)).toEqual(['high', 'low']);
  });
});

describe('isOverdue', () => {
  it('ne considère jamais une tâche terminée ou sans date comme en retard', () => {
    expect(isOverdue(makeTask({ dueDate: '2026-10-01' }), TODAY)).toBe(true);
    expect(isOverdue(makeTask({ dueDate: '2026-10-01', completedAt: COMPLETED_TODAY }), TODAY)).toBe(false);
    expect(isOverdue(makeTask({ dueDate: null }), TODAY)).toBe(false);
    expect(isOverdue(makeTask({ dueDate: TODAY }), TODAY)).toBe(false);
  });
});

describe('progression', () => {
  it('compte les terminées et choisit un message adapté', () => {
    const tasks = [makeTask({ completedAt: COMPLETED_TODAY }), makeTask(), makeTask()];
    const progress = computeProgress(tasks);
    expect(progress).toEqual({ done: 1, total: 3 });
    expect(progressMessage(progress)).toBe('Bel élan. Encore 2.');
    expect(progressMessage({ done: 0, total: 0 })).toBe('Rien de prévu pour l’instant.');
    expect(progressMessage({ done: 0, total: 2 })).toBe('Une chose à la fois.');
    expect(progressMessage({ done: 1, total: 2 })).toBe('Plus qu’une. Vous y êtes presque.');
    expect(progressMessage({ done: 2, total: 2 })).toBe('Le reste peut attendre demain.');
  });
});

describe('filterByStatus et searchTasks', () => {
  const todo = makeTask({ title: 'Réserver le train pour Lyon' });
  const done = makeTask({ title: 'Lire', description: 'Chapitre ÉTÉ', completedAt: COMPLETED_TODAY });

  it('filtre par statut', () => {
    expect(filterByStatus([todo, done], 'all')).toHaveLength(2);
    expect(filterByStatus([todo, done], 'todo')).toEqual([todo]);
    expect(filterByStatus([todo, done], 'done')).toEqual([done]);
  });

  it('cherche sans tenir compte des accents ni de la casse, y compris dans la description', () => {
    expect(searchTasks([todo, done], 'reserver')).toEqual([todo]);
    expect(searchTasks([todo, done], 'ete')).toEqual([done]);
    expect(searchTasks([todo, done], '   ')).toHaveLength(2);
    expect(searchTasks([todo, done], 'passeport')).toEqual([]);
  });
});

describe('groupTasksByDay', () => {
  it('ordonne retard, jours croissants puis sans échéance, avec des titres lisibles', () => {
    const sections = groupTasksByDay(
      [
        makeTask({ dueDate: null }),
        makeTask({ dueDate: '2026-10-23' }),
        makeTask({ dueDate: '2026-10-21' }),
        makeTask({ dueDate: TODAY }),
        makeTask({ dueDate: '2026-10-10' }),
      ],
      TODAY,
    );
    expect(sections.map((section) => section.title)).toEqual([
      'En retard',
      'Aujourd’hui · mar. 20 oct.',
      'Demain · mer. 21 oct.',
      'Ven. 23 oct.',
      'Sans échéance',
    ]);
  });

  it('range une tâche passée terminée sous sa date, pas dans les retards', () => {
    const sections = groupTasksByDay(
      [makeTask({ dueDate: '2026-10-17', completedAt: COMPLETED_EARLIER })],
      TODAY,
    );
    expect(sections.map((section) => section.key)).toEqual(['2026-10-17']);
  });
});
