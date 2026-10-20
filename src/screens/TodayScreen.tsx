import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/tasks/EmptyState';
import { ProgressHero } from '@/components/tasks/ProgressHero';
import { SectionHeader } from '@/components/tasks/SectionHeader';
import { TaskRow } from '@/components/tasks/TaskRow';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Fab } from '@/components/ui/Fab';
import { Screen } from '@/components/ui/Screen';
import { computeProgress, selectTodayTasks, sortTasks } from '@/features/tasks/logic';
import { useTasks } from '@/features/tasks/TasksProvider';
import { useCompleteTask } from '@/hooks/useCompleteTask';
import { useToday } from '@/hooks/useToday';
import { capitalize, formatLongDate } from '@/lib/date';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

export function TodayScreen() {
  const { colors } = useTheme();
  const { tasks, saveError } = useTasks();
  const today = useToday();
  const toggle = useCompleteTask();
  const todayTasks = sortTasks(selectTodayTasks(tasks, today), today);
  const progress = computeProgress(todayTasks);
  const dateLabel = capitalize(formatLongDate(today).replace(/ \d{4}$/, ''));

  return (
    <View style={styles.flex}>
      <Screen scroll>
        <View style={styles.header}>
          <View style={styles.wordmark} accessible accessibilityRole="header" accessibilityLabel="Tasky">
            <AppText variant="title">Tasky</AppText>
            <View style={[styles.dot, { backgroundColor: colors.accent }]} />
          </View>
          <AppText variant="eyebrow" tone="secondary">
            {dateLabel}
          </AppText>
        </View>

        {saveError && (
          <View style={[styles.banner, { borderColor: colors.danger }]}>
            <AppText variant="meta" tone="danger">
              {saveError}
            </AppText>
          </View>
        )}

        {todayTasks.length === 0 ? (
          <EmptyState
            title={tasks.length === 0 ? 'Votre page est encore blanche.' : 'Rien de prévu aujourd’hui.'}
            message={
              tasks.length === 0
                ? 'Une idée, une envie, un petit pas. Ajoutez votre première tâche.'
                : 'Profitez-en, ou avancez sur la suite de votre liste.'
            }>
            {tasks.length === 0 ? (
              <Button label="Créer ma première tâche" icon="plus" onPress={() => router.push('/task/new')} />
            ) : (
              <Button
                label="Voir toutes les tâches"
                variant="secondary"
                onPress={() => router.navigate('/tasks')}
              />
            )}
          </EmptyState>
        ) : (
          <>
            <ProgressHero progress={progress} />
            <SectionHeader
              title={progress.done === progress.total ? 'Votre journée, accomplie' : 'Le programme du jour'}
              count={todayTasks.length}
            />
            <View>
              {todayTasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  today={today}
                  animated
                  onToggle={(completed) => toggle(task, completed)}
                  onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })}
                />
              ))}
            </View>
            {progress.done === progress.total && (
              <AppText variant="body" tone="secondary" style={styles.closing}>
                Vous avez tenu vos engagements.{'\n'}Le reste peut attendre demain.
              </AppText>
            )}
          </>
        )}
        <View style={styles.fabSpacer} />
      </Screen>
      {todayTasks.length > 0 && (
        <Fab icon="plus" accessibilityLabel="Nouvelle tâche" onPress={() => router.push('/task/new')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    marginBottom: 7,
  },
  banner: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  closing: {
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  fabSpacer: {
    height: 80,
  },
});
