import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, touchTarget } from '@/theme/tokens';

interface SearchFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}

export function SearchField({ value, onChangeText, placeholder }: SearchFieldProps) {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Icon name="search" size={18} color="textSecondary" />
      <TextInput
        accessibilityLabel={placeholder}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        cursorColor={colors.textPrimary}
        selectionColor={colors.textPrimary}
        returnKeyType="search"
        style={[typography.body, styles.input, { color: colors.textPrimary }]}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vider le champ"
          onPress={() => onChangeText('')}
          hitSlop={12}>
          <Icon name="x" size={18} color="textSecondary" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    minHeight: touchTarget,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
});
