import { Pressable, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

// Raccourci compact (ex. « Aujourd'hui », « Demain ») : même langage de sélection
// que le SegmentedControl (encre en clair, ivoire en sombre).
export function Chip({ label, selected, onPress }: ChipProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={6}
      style={[
        styles.chip,
        selected
          ? { backgroundColor: colors.selected, borderColor: colors.selected }
          : { borderColor: colors.borderStrong },
      ]}>
      <AppText variant="meta" tone={selected ? 'onSelected' : 'primary'}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
});
