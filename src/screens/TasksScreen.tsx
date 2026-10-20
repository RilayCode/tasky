import { router } from 'expo-router';
import { useState } from 'react';
import { SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/tasks/EmptyState';
import { SectionHeader } from '@/components/tasks/SectionHeader';
import { TaskRow } from '@/components/tasks/TaskRow';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Fab } from '@/components/ui/Fab';
import { SearchField } from '@/components/ui/SearchField';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { filterByStatus, groupTasksByDay, isCompleted, searchTasks } from '@/features/tasks/logic';
import { useTasks } from '@/features/tasks/TasksProvider';
import type { TaskStatusFilter } from '@/features/tasks/types';
import { useCompleteTask } from '@/hooks/useCompleteTask';
import { usePressGuard } from '@/hooks/usePressGuard';
import { useToday } from '@/hooks/useToday';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing } from '@/theme/tokens';

const FILTER_OPTIONS: { value: TaskStatusFilter; label: string }[] = [
  { value: 'all', label: 'Toutes' },
  { value: 'todo', label: 'À faire' },
  { value: 'done', label: 'Terminées' },
];

function plural(count: number, word: string): string {
  return `${count} ${word}${count > 1 ? 's' : ''}`;
}

export function TasksScreen() {
  const { colors } = useTheme();
  const { tasks } = useTasks();
  const today = useToday();
  const toggle = useCompleteTask();
  const guard = usePressGuard();
  const [filter, setFilter] = useState<TaskStatusFilter>('all');
  const [query, setQuery] = useState('');

  const doneCount = tasks.filter(isCompleted).length;
  const visible = searchTasks(filterByStatus(tasks, filter), query);
  const sections = groupTasksByDay(visible, today);
  const summary = `${plural(tasks.length, 'tâche')} · ${tasks.length - doneCount} à faire · ${plural(doneCount, 'terminée')}`;

  const header = (
    <View style={styles.header}>
      <AppText variant="eyebrow" tone="secondary">
        Vos tâches
      </AppText>
      <AppText variant="display" accessibilityRole="header">
        Tout est là.
      </AppText>
      <AppText variant="meta" tone="secondary">
        {summary}
      </AppText>
      <View style={styles.controls}>
        <SearchField value={query} onChangeText={setQuery} placeholder="Rechercher une tâche" />
        <SegmentedControl
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
          accessibilityLabel="Filtrer par statut"
        />
      </View>
    </View>
  );

  const empty = (() => {
    if (tasks.length === 0) {
      return (
        <EmptyState title="Votre liste est vide." message="Ajoutez une première tâche : elle apparaîtra ici.">
          <Button label="Créer une tâche" icon="plus" onPress={guard(() => router.push('/task/new'))} />
        </EmptyState>
      );
    }
    if (query.trim()) {
      return (
        <EmptyState
          title={`Rien pour « ${query.trim()} ».`}
          message={`Essayez un autre mot ou effacez la recherche pour retrouver vos ${plural(tasks.length, 'tâche')}.`}>
          <Button label="Effacer la recherche" variant="secondary" onPress={() => setQuery('')} />
        </EmptyState>
      );
    }
    return filter === 'done' ? (
      <EmptyState title="Aucune tâche terminée." message="Cochez une tâche : elle viendra s’ajouter ici." />
    ) : (
      <EmptyState title="Tout est fait." message="Il ne reste rien à faire. Profitez-en." />
    );
  })();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={[styles.flex, { backgroundColor: colors.background }]}>
      <SectionList
        sections={sections}
        keyExtractor={(task) => task.id}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        renderSectionHeader={({ section }) => (
          <SectionHeader title={section.title} count={section.data.length} danger={section.key === 'overdue'} />
        )}
        renderItem={({ item }) => (
          <TaskRow
            task={item}
            today={today}
            showDay={false}
            onToggle={(completed) => toggle(item, completed)}
            onPress={guard(() => router.push({ pathname: '/task/[id]', params: { id: item.id } }))}
          />
        )}
        stickySectionHeadersEnabled={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
      {tasks.length > 0 && (
        <Fab icon="plus" accessibilityLabel="Nouvelle tâche" onPress={guard(() => router.push('/task/new'))} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: 120,
  },
  header: {
    gap: spacing.sm,
  },
  controls: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
