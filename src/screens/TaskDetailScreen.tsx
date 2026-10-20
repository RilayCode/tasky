import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/tasks/EmptyState';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ListDivider } from '@/components/ui/ListDivider';
import { Screen } from '@/components/ui/Screen';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useToast } from '@/components/ui/ToastProvider';
import { isCompleted, isOverdue } from '@/features/tasks/logic';
import { useTask, useTasks } from '@/features/tasks/TasksProvider';
import { PRIORITY_LABELS, type Priority } from '@/features/tasks/types';
import { useCompleteTask } from '@/hooks/useCompleteTask';
import { useToday } from '@/hooks/useToday';
import { capitalize, formatLongDate, formatRelativeDay, formatShortDate, toDateKey } from '@/lib/date';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

const PRIORITY_ICONS: Record<Priority, IconName> = {
  low: 'arrow-down',
  normal: 'minus',
  high: 'arrow-up',
};

function goBack() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function TaskDetailScreen({ id }: { id: string | undefined }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const task = useTask(id);
  const { removeTask, restoreTask, setCompleted } = useTasks();
  const toggle = useCompleteTask();
  const showToast = useToast();
  const today = useToday();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!task) {
    return (
      <Screen>
        <ScreenHeader icon="arrow-left" iconLabel="Retour" onIconPress={goBack} />
        <EmptyState title="Tâche introuvable." message="Elle a peut-être été supprimée.">
          <Button label="Retour" variant="secondary" onPress={goBack} />
        </EmptyState>
      </Screen>
    );
  }

  const done = isCompleted(task);
  const late = isOverdue(task, today);
  const dueText = task.dueDate
    ? `${capitalize(formatLongDate(task.dueDate))}${task.dueTime ? ` · ${task.dueTime}` : ''}`
    : 'Sans échéance';

  const deleteTask = () => {
    setConfirmDelete(false);
    const removed = removeTask(task.id);
    goBack();
    if (removed) {
      showToast({ message: 'Tâche supprimée', actionLabel: 'Annuler', onAction: () => restoreTask(removed) });
    }
  };

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <Screen scroll>
        <ScreenHeader icon="arrow-left" iconLabel="Retour" onIconPress={goBack} label="Détail de la tâche" />
        <AppText variant="eyebrow" tone={late ? 'danger' : 'secondary'}>
          {late ? `En retard · ${formatRelativeDay(task.dueDate ?? today, today)}` : dueText}
        </AppText>
        <AppText variant="display" accessibilityRole="header" style={styles.title}>
          {task.title}
        </AppText>

        <View
          style={[styles.status, { backgroundColor: done ? colors.accent : colors.surface }]}
          accessible
          accessibilityLabel={done ? 'Statut : terminée' : 'Statut : à faire'}>
          <Icon name={done ? 'check' : 'circle'} size={14} color={done ? 'onAccent' : 'textSecondary'} />
          <AppText variant="meta" tone={done ? 'onAccent' : 'primary'}>
            {done && task.completedAt
              ? `Terminée · ${formatShortDate(toDateKey(new Date(task.completedAt)))}`
              : 'À faire'}
          </AppText>
        </View>

        <View style={styles.block}>
          <AppText variant="eyebrow" tone="secondary">
            Les détails
          </AppText>
          <AppText variant="body" tone={task.description ? 'primary' : 'secondary'}>
            {task.description ?? 'Aucune description.'}
          </AppText>
        </View>

        <View style={styles.infos}>
          <ListDivider />
          <InfoRow label="Priorité">
            <View style={styles.inline}>
              <Icon name={PRIORITY_ICONS[task.priority]} size={16} />
              <AppText variant="bodyStrong">{PRIORITY_LABELS[task.priority]}</AppText>
            </View>
          </InfoRow>
          <ListDivider />
          <InfoRow label="Échéance">
            <AppText variant="bodyStrong" tone={late ? 'danger' : 'primary'}>
              {task.dueDate ? formatRelativeDay(task.dueDate, today) : 'Aucune'}
              {task.dueTime ? ` · ${task.dueTime}` : ''}
            </AppText>
          </InfoRow>
          <ListDivider />
          <InfoRow label="Créée">
            <AppText variant="bodyStrong">
              {capitalize(formatShortDate(toDateKey(new Date(task.createdAt))))}
            </AppText>
          </InfoRow>
          <ListDivider />
        </View>
      </Screen>

      <View style={[styles.actions, { paddingBottom: insets.bottom + spacing.lg }]}>
        {done ? (
          <Button label="Rouvrir la tâche" icon="rotate-ccw" variant="secondary" onPress={() => setCompleted(task.id, false)} />
        ) : (
          <Button label="Marquer comme terminée" icon="check" onPress={() => toggle(task, true)} />
        )}
        <Button
          label="Modifier la tâche"
          icon="edit-2"
          variant="secondary"
          onPress={() => router.push({ pathname: '/task/[id]/edit', params: { id: task.id } })}
        />
        <Button label="Supprimer la tâche" icon="trash-2" variant="dangerGhost" onPress={() => setConfirmDelete(true)} />
      </View>

      <ConfirmSheet
        visible={confirmDelete}
        icon="trash-2"
        title="Supprimer cette tâche ?"
        message={`« ${task.title} » sera supprimée. Vous pourrez annuler juste après.`}
        detail={dueText}
        confirmLabel="Supprimer"
        onConfirm={deleteTask}
        onCancel={() => setConfirmDelete(false)}
      />
    </View>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.infoRow}>
      <AppText variant="body" tone="secondary">
        {label}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  title: {
    marginTop: spacing.sm,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginTop: spacing.lg,
  },
  block: {
    gap: spacing.sm,
    marginTop: spacing.xxl,
  },
  infos: {
    marginTop: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 56,
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actions: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
});
