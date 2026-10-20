import { useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius, spacing, touchTarget } from '@/theme/tokens';

interface TextFieldProps
  extends Pick<
    TextInputProps,
    'value' | 'onChangeText' | 'placeholder' | 'multiline' | 'maxLength' | 'autoFocus' | 'returnKeyType'
  > {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
}

export function TextField({ label, required = false, error, hint, multiline, ...inputProps }: TextFieldProps) {
  const { colors, typography } = useTheme();
  const [focused, setFocused] = useState(false);
  const focus = useSharedValue(0);

  useEffect(() => {
    focus.set(withTiming(focused ? 1 : 0, { duration: motion.fast }));
  }, [focused, focus]);

  const restingBorder = error ? colors.danger : colors.borderStrong;
  const activeBorder = error ? colors.danger : colors.textPrimary;
  const frameStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focus.value, [0, 1], [restingBorder, activeBorder]),
    borderWidth: 1 + focus.value * 0.5,
  }));

  return (
    <View style={styles.container}>
      <AppText variant="bodyStrong" importantForAccessibility="no">
        {required ? `${label} *` : label}
      </AppText>
      <Animated.View style={[styles.frame, { backgroundColor: colors.surface }, frameStyle]}>
        <TextInput
          accessibilityLabel={required ? `${label}, obligatoire` : label}
          accessibilityHint={error ?? hint}
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.textPrimary}
          cursorColor={colors.textPrimary}
          multiline={multiline}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[
            typography.body,
            styles.input,
            multiline && styles.multiline,
            { color: colors.textPrimary },
          ]}
          {...inputProps}
        />
      </Animated.View>
      {error ? (
        <AppText variant="meta" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="meta" tone="secondary">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  frame: {
    borderRadius: radius.md,
  },
  input: {
    minHeight: touchTarget + 4,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  multiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
