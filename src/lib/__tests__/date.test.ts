import {
  addDays,
  formatLongDate,
  formatRelativeDay,
  formatShortDate,
  isValidDateKey,
  isValidTime,
  toDateKey,
  toTimeString,
} from '../date';

describe('date', () => {
  it('convertit une date locale en clé YYYY-MM-DD et en heure HH:mm', () => {
    const date = new Date(2026, 0, 5, 9, 7);
    expect(toDateKey(date)).toBe('2026-01-05');
    expect(toTimeString(date)).toBe('09:07');
  });

  it('ajoute des jours en franchissant mois et années', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('rejette les dates et heures impossibles', () => {
    expect(isValidDateKey('2026-02-30')).toBe(false);
    expect(isValidDateKey('20-10-2026')).toBe(false);
    expect(isValidDateKey('2026-10-20')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
    expect(isValidTime('7:30')).toBe(false);
    expect(isValidTime('23:59')).toBe(true);
  });

  it('formate en français', () => {
    expect(formatLongDate('2026-10-19')).toBe('lundi 19 octobre 2026');
    expect(formatShortDate('2026-10-20')).toBe('mar. 20 oct.');
  });

  it('nomme les jours proches', () => {
    expect(formatRelativeDay('2026-10-20', '2026-10-20')).toBe('Aujourd’hui');
    expect(formatRelativeDay('2026-10-21', '2026-10-20')).toBe('Demain');
    expect(formatRelativeDay('2026-10-19', '2026-10-20')).toBe('Hier');
    expect(formatRelativeDay('2026-10-23', '2026-10-20')).toBe('Ven. 23 oct.');
  });
});
