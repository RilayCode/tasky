import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

interface EmptyStateProps {
  title: string;
  message: string;
  numeral?: string;
  children?: ReactNode;
}

// État vide « éditorial » : un grand chiffre ponctué du point chartreuse de Tasky.
export function EmptyState({ title, message, numeral = '0', children }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeIn.duration(250)} style={styles.container}>
      <View style={styles.numeralRow} importantForAccessibility="no-hide-descendants">
        <AppText variant="numeral" tone="secondary">
          {numeral}
        </AppText>
        <View style={[styles.dot, { backgroundColor: colors.accent }]} />
      </View>
      <View style={[styles.rule, { backgroundColor: colors.borderSubtle }]} />
      <AppText variant="headline" accessibilityRole="header">
        {title}
      </AppText>
      <AppText variant="body" tone="secondary">
        {message}
      </AppText>
      {children && <View style={styles.actions}>{children}</View>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  numeralRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: radius.pill,
    marginBottom: spacing.lg,
  },
  rule: {
    height: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
