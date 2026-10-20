import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { Checkbox } from '@/components/ui/Checkbox';
import { Icon } from '@/components/ui/Icon';
import { dueLabel, isCompleted, isOverdue } from '@/features/tasks/logic';
import type { Task } from '@/features/tasks/types';
import type { DateKey } from '@/lib/date';
import { useTheme } from '@/theme/ThemeProvider';
import { spacing, touchTarget } from '@/theme/tokens';

interface TaskRowProps {
  task: Task;
  today: DateKey;
  showDay?: boolean;
  // Animations de mise en page : réservées aux listes courtes (écran Aujourd'hui).
  animated?: boolean;
  onToggle: (completed: boolean) => void;
  onPress: () => void;
}

export function TaskRow({ task, today, showDay = false, animated = false, onToggle, onPress }: TaskRowProps) {
  const { colors } = useTheme();
  const done = isCompleted(task);
  const late = isOverdue(task, today);
  const due = dueLabel(task, today, showDay);
  const showPriority = task.priority === 'high' && !done;

  const accessibilitySummary = [
    task.title,
    done ? 'terminée' : 'à faire',
    due,
    showPriority ? 'priorité haute' : null,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Animated.View
      layout={animated ? LinearTransition.springify().damping(20) : undefined}
      entering={animated ? FadeIn.duration(200) : undefined}
      exiting={animated ? FadeOut.duration(150) : undefined}
      style={[styles.row, { borderBottomColor: colors.borderSubtle }]}>
      <Checkbox checked={done} onChange={onToggle} accessibilityLabel={task.title} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilitySummary}
        accessibilityHint="Ouvre le détail de la tâche"
        onPress={onPress}
        android_ripple={{ color: colors.ripple }}
        style={styles.content}>
        <View style={styles.text}>
          <AppText
            variant="body"
            tone={done ? 'secondary' : 'primary'}
            numberOfLines={2}
            style={done && styles.doneTitle}>
            {task.title}
          </AppText>
          {(due || showPriority) && (
            <View style={styles.meta}>
              {due && (
                <AppText variant="meta" tone={late ? 'danger' : 'secondary'}>
                  {due}
                </AppText>
              )}
              {showPriority && (
                <View style={styles.priority}>
                  <Icon name="arrow-up" size={13} />
                  <AppText variant="meta">Priorité haute</AppText>
                </View>
              )}
            </View>
          )}
        </View>
        <Icon name="chevron-right" size={18} color="textSecondary" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginLeft: -spacing.md,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: touchTarget + 20,
    paddingVertical: spacing.md,
    paddingRight: spacing.xs,
  },
  text: {
    flex: 1,
    gap: 3,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: spacing.md,
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  doneTitle: {
    textDecorationLine: 'line-through',
  },
});
