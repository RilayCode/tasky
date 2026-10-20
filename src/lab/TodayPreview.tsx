import { Fragment, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { Checkbox } from '@/components/ui/Checkbox';
import { ListDivider } from '@/components/ui/ListDivider';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

// Données fictives du labo : le vrai modèle de tâche arrive en phase 3.
interface PreviewTask {
  id: string;
  title: string;
  time: string;
  highPriority: boolean;
  done: boolean;
}

const INITIAL_TASKS: PreviewTask[] = [
  { id: '1', title: 'Envoyer le devis à Léa', time: '11:00', highPriority: true, done: false },
  { id: '2', title: 'Réserver le train pour Lyon', time: '18:00', highPriority: false, done: false },
  { id: '3', title: 'Lire 20 minutes', time: '21:00', highPriority: false, done: false },
  { id: '4', title: 'Marcher 30 minutes', time: '08:00', highPriority: false, done: true },
];

function progressMessage(done: number, total: number): string {
  const remaining = total - done;
  if (done === 0) return 'Une chose à la fois.';
  if (remaining === 0) return 'Le reste attendra demain.';
  if (remaining === 1) return 'Plus qu’une. Tu y es presque.';
  return `Bel élan. Encore ${remaining}.`;
}

export function TodayPreview() {
  const { colors } = useTheme();
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const done = tasks.filter((task) => task.done).length;
  const total = tasks.length;
  const allDone = done === total;

  const toggle = (id: string, checked: boolean) =>
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, done: checked } : task)),
    );

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.numeralRow}>
          <Animated.View key={done} entering={FadeInDown.duration(280)}>
            <AppText variant="numeral">{done}</AppText>
          </Animated.View>
          <AppText variant="title" tone="secondary" style={styles.total}>
            /{total}
          </AppText>
        </View>
        <View style={styles.heroText}>
          {allDone ? (
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <AppText variant="eyebrow" tone="onAccent">
                Journée accomplie
              </AppText>
            </View>
          ) : (
            <AppText variant="eyebrow" tone="secondary">
              Terminées aujourd’hui
            </AppText>
          )}
          <AppText variant="body" tone="secondary">
            {progressMessage(done, total)}
          </AppText>
        </View>
      </View>

      <ProgressBar
        completed={done}
        total={total}
        accessibilityLabel={`${done} tâches terminées sur ${total}`}
      />

      <View style={styles.list}>
        {tasks.map((task, index) => (
          <Fragment key={task.id}>
            {index > 0 && <ListDivider />}
            <View style={styles.row}>
              <Checkbox
                checked={task.done}
                onChange={(checked) => toggle(task.id, checked)}
                accessibilityLabel={task.title}
              />
              <View style={styles.rowText}>
                <AppText
                  variant="body"
                  tone={task.done ? 'secondary' : 'primary'}
                  style={task.done && styles.doneTitle}>
                  {task.title}
                </AppText>
                <View style={styles.meta}>
                  <AppText variant="meta" tone="secondary">
                    {task.time}
                  </AppText>
                  {task.highPriority && !task.done && (
                    <AppText variant="meta">↑ Priorité haute</AppText>
                  )}
                </View>
              </View>
            </View>
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.lg,
  },
  numeralRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  total: {
    marginLeft: spacing.xs,
  },
  heroText: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  list: {
    marginTop: -spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    marginLeft: -spacing.md,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  meta: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  doneTitle: {
    textDecorationLine: 'line-through',
  },
});
