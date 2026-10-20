import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/theme/tokens';

interface SectionHeaderProps {
  title: string;
  count?: number;
  danger?: boolean;
}

export function SectionHeader({ title, count, danger = false }: SectionHeaderProps) {
  return (
    <View style={styles.row} accessibilityRole="header" accessible>
      <AppText variant="eyebrow" tone={danger ? 'danger' : 'secondary'}>
        {title}
      </AppText>
      {count !== undefined && (
        <AppText variant="eyebrow" tone="secondary" accessibilityLabel={`${count} tâche${count > 1 ? 's' : ''}`}>
          {String(count).padStart(2, '0')}
        </AppText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
});
