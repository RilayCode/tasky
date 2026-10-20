import Constants from 'expo-constants';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { useToast } from '@/components/ui/ToastProvider';
import { useTasks } from '@/features/tasks/TasksProvider';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';
import { colors as themeColors, radius, spacing, type ColorTokens } from '@/theme/tokens';

const THEME_OPTIONS: { value: ThemePreference; label: string; hint: string }[] = [
  { value: 'system', label: 'Auto', hint: 'Suit le téléphone' },
  { value: 'light', label: 'Clair', hint: 'Ivoire' },
  { value: 'dark', label: 'Sombre', hint: 'Charbon' },
];

export function SettingsScreen() {
  const { preference, setPreference } = useTheme();
  const { tasks, clearTasks, replaceTasks } = useTasks();
  const showToast = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const version = Constants.expoConfig?.version ?? '—';

  const reset = () => {
    setConfirmReset(false);
    const snapshot = [...tasks];
    clearTasks();
    showToast({
      message: 'Données réinitialisées',
      actionLabel: 'Annuler',
      onAction: () => replaceTasks(snapshot),
    });
  };

  return (
    <>
      <Screen scroll>
        <AppText variant="eyebrow" tone="secondary">
          Paramètres
        </AppText>
        <AppText variant="display" accessibilityRole="header">
          À votre façon.
        </AppText>

        <Section title="01 / Apparence">
          <View style={styles.themes} accessibilityRole="radiogroup" accessibilityLabel="Thème">
            {THEME_OPTIONS.map((option) => (
              <ThemeCard
                key={option.value}
                option={option}
                selected={preference === option.value}
                onPress={() => setPreference(option.value)}
              />
            ))}
          </View>
        </Section>

        <Section title="02 / Vos données">
          <AppText variant="body">
            {tasks.length === 0
              ? 'Aucune tâche enregistrée.'
              : `${tasks.length} tâche${tasks.length > 1 ? 's' : ''} enregistrée${tasks.length > 1 ? 's' : ''}.`}
          </AppText>
          <AppText variant="body" tone="secondary">
            Vos tâches restent sur cet appareil. Rien n’est envoyé en ligne.
          </AppText>
          <Button
            label="Réinitialiser les données"
            icon="rotate-ccw"
            variant="dangerGhost"
            disabled={tasks.length === 0}
            onPress={() => setConfirmReset(true)}
          />
        </Section>

        <Section title="03 / À propos">
          <View style={styles.about}>
            <AppText variant="headline">Tasky</AppText>
            <AppText variant="meta" tone="secondary">
              Version {version}
            </AppText>
          </View>
          <AppText variant="body" tone="secondary">
            Le journal de vos progrès.
          </AppText>
        </Section>
      </Screen>

      <ConfirmSheet
        visible={confirmReset}
        icon="rotate-ccw"
        title="Tout effacer ?"
        message="Toutes vos tâches seront supprimées de cet appareil. Vous pourrez annuler juste après."
        detail={`${tasks.length} tâche${tasks.length > 1 ? 's' : ''} concernée${tasks.length > 1 ? 's' : ''}`}
        confirmLabel="Réinitialiser"
        onConfirm={reset}
        onCancel={() => setConfirmReset(false)}
      />
    </>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="eyebrow" tone="secondary" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

interface ThemeCardProps {
  option: (typeof THEME_OPTIONS)[number];
  selected: boolean;
  onPress: () => void;
}

// Aperçu miniature du thème : fond, deux lignes de texte et le point chartreuse.
function ThemeCard({ option, selected, onPress }: ThemeCardProps) {
  const { colors } = useTheme();
  const previews: ColorTokens[] =
    option.value === 'system'
      ? [themeColors.light, themeColors.dark]
      : [themeColors[option.value]];

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={`${option.label}, ${option.hint}`}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[
        styles.card,
        { borderColor: selected ? colors.selected : colors.borderSubtle, borderWidth: selected ? 2 : 1 },
      ]}>
      <View style={styles.preview}>
        {previews.map((preview, index) => (
          <View key={index} style={[styles.previewHalf, { backgroundColor: preview.background }]}>
            <View style={[styles.line, { backgroundColor: preview.textPrimary, width: '70%' }]} />
            <View style={[styles.line, { backgroundColor: preview.textSecondary, width: '45%' }]} />
            <View style={[styles.previewDot, { backgroundColor: preview.accent }]} />
          </View>
        ))}
      </View>
      <View style={styles.cardLabel}>
        <AppText variant="bodyStrong">{option.label}</AppText>
        {selected && <Icon name="check" size={16} />}
      </View>
      <AppText variant="meta" tone="secondary">
        {option.hint}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    marginTop: spacing.xxl,
  },
  themes: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  preview: {
    flexDirection: 'row',
    height: 64,
    borderRadius: radius.sm,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  previewHalf: {
    flex: 1,
    padding: spacing.sm,
    gap: 5,
  },
  line: {
    height: 4,
    borderRadius: radius.pill,
  },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    marginTop: 'auto',
  },
  cardLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  about: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
});
