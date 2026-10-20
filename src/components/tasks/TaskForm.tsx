import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DueDateField } from '@/components/tasks/DueDateField';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import type { Priority, TaskDraft, TaskInput } from '@/features/tasks/types';
import {
  DESCRIPTION_MAX_LENGTH,
  TITLE_MAX_LENGTH,
  validateTaskInput,
  type TaskInputErrors,
} from '@/features/tasks/validation';
import type { DateKey } from '@/lib/date';
import { spacing } from '@/theme/tokens';

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'low', label: '↓ Basse' },
  { value: 'normal', label: '– Normale' },
  { value: 'high', label: '↑ Haute' },
];

interface TaskFormProps {
  initial: TaskInput;
  today: DateKey;
  submitLabel: string;
  header: ReactNode;
  onSubmit: (draft: TaskDraft) => void;
}

export function TaskForm({ initial, today, submitLabel, header, onSubmit }: TaskFormProps) {
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState<TaskInput>(initial);
  const [errors, setErrors] = useState<TaskInputErrors>({});
  const [submitted, setSubmitted] = useState(false);

  // Après une première tentative, on revalide à chaque saisie : l'erreur
  // disparaît dès que le champ devient valide.
  const update = (changes: Partial<TaskInput>) => {
    const next = { ...input, ...changes };
    setInput(next);
    if (submitted) {
      const result = validateTaskInput(next);
      setErrors(result.ok ? {} : result.errors);
    }
  };

  const submit = () => {
    setSubmitted(true);
    const result = validateTaskInput(input);
    if (result.ok) {
      onSubmit(result.value);
    } else {
      setErrors(result.errors);
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {header}
        <TextField
          label="Titre *"
          placeholder="Que souhaitez-vous faire ?"
          value={input.title}
          onChangeText={(title) => update({ title })}
          error={errors.title}
          maxLength={TITLE_MAX_LENGTH}
          autoFocus={!initial.title}
          returnKeyType="next"
        />
        <TextField
          label="Description · facultative"
          placeholder="Un détail pour vous aider…"
          value={input.description}
          onChangeText={(description) => update({ description })}
          error={errors.description}
          maxLength={DESCRIPTION_MAX_LENGTH}
          multiline
        />
        <View style={styles.group}>
          <AppText variant="bodyStrong">Priorité</AppText>
          <SegmentedControl
            options={PRIORITY_OPTIONS}
            value={input.priority}
            onChange={(priority) => update({ priority })}
            accessibilityLabel="Priorité"
          />
        </View>
        <DueDateField
          date={input.dueDate}
          time={input.dueTime}
          today={today}
          onChange={(dueDate, dueTime) => update({ dueDate, dueTime })}
          error={errors.dueTime ?? errors.dueDate}
        />
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        <AppText variant="meta" tone={hasErrors ? 'danger' : 'secondary'}>
          {hasErrors ? 'Corrigez le champ signalé, puis réessayez.' : '* Champ obligatoire · tout reste modifiable.'}
        </AppText>
        <Button label={submitLabel} onPress={submit} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.xl,
  },
  group: {
    gap: spacing.sm,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
});
