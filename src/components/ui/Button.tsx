import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AppText, type TextTone } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius, spacing, touchTarget } from '@/theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  accessibilityHint?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const appearances: Record<
    ButtonVariant,
    { backgroundColor: string; borderColor: string; tone: TextTone }
  > = {
    primary: { backgroundColor: colors.accent, borderColor: colors.accent, tone: 'onAccent' },
    secondary: { backgroundColor: 'transparent', borderColor: colors.borderStrong, tone: 'primary' },
    ghost: { backgroundColor: 'transparent', borderColor: 'transparent', tone: 'primary' },
    danger: { backgroundColor: colors.danger, borderColor: colors.danger, tone: 'onDanger' },
  };
  const appearance = appearances[variant];

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: appearance.backgroundColor, borderColor: appearance.borderColor },
        disabled && styles.disabled,
        animatedStyle,
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          scale.set(withSpring(0.97, motion.spring));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, motion.spring));
        }}
        android_ripple={{ color: colors.ripple }}
        style={styles.pressable}>
        <AppText variant="bodyStrong" tone={appearance.tone}>
          {label}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressable: {
    minHeight: touchTarget + 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.4,
  },
});
