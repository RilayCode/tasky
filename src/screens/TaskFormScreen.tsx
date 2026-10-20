import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/tasks/EmptyState';
import { TaskForm } from '@/components/tasks/TaskForm';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useToast } from '@/components/ui/ToastProvider';
import { useTask, useTasks } from '@/features/tasks/TasksProvider';
import type { TaskInput } from '@/features/tasks/types';
import { useToday } from '@/hooks/useToday';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

function close() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

// Un seul écran pour créer (taskId absent) ou modifier une tâche.
export function TaskFormScreen({ taskId }: { taskId?: string }) {
  const { colors } = useTheme();
  const { addTask, updateTask } = useTasks();
  const existing = useTask(taskId);
  const showToast = useToast();
  const today = useToday();
  const editing = taskId !== undefined;

  if (editing && !existing) {
    return (
      <SafeAreaView style={[styles.flex, styles.padded, { backgroundColor: colors.background }]}>
        <ScreenHeader icon="x" iconLabel="Fermer" onIconPress={close} />
        <EmptyState title="Tâche introuvable." message="Elle a peut-être été supprimée.">
          <Button label="Fermer" variant="secondary" onPress={close} />
        </EmptyState>
      </SafeAreaView>
    );
  }

  const initial: TaskInput = existing
    ? {
        title: existing.title,
        description: existing.description ?? '',
        priority: existing.priority,
        dueDate: existing.dueDate,
        dueTime: existing.dueTime,
      }
    : { title: '', description: '', priority: 'normal', dueDate: today, dueTime: null };

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.flex, { backgroundColor: colors.background }]}>
      <TaskForm
        initial={initial}
        today={today}
        submitLabel={editing ? 'Enregistrer les modifications' : 'Créer la tâche'}
        header={
          <View>
            <ScreenHeader
              icon="x"
              iconLabel={editing ? 'Annuler la modification' : 'Fermer sans créer'}
              onIconPress={close}
            />
            <AppText variant="title" accessibilityRole="header">
              {editing ? 'Modifier la tâche' : 'Nouvelle tâche'}
            </AppText>
          </View>
        }
        onSubmit={(draft) => {
          if (existing) {
            updateTask(existing.id, draft);
            showToast({ message: 'Modifications enregistrées' });
          } else {
            addTask(draft);
            showToast({ message: 'Tâche ajoutée' });
          }
          close();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.xl,
  },
});
