import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AppText, type TextTone } from '@/components/ui/AppText';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius, spacing, touchTarget, type ColorTokens } from '@/theme/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dangerGhost';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  accessibilityHint?: string;
}

interface Appearance {
  backgroundColor: string;
  borderColor: string;
  tone: TextTone;
  iconColor: keyof ColorTokens;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  accessibilityHint,
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const appearances: Record<ButtonVariant, Appearance> = {
    primary: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
      tone: 'onAccent',
      iconColor: 'onAccent',
    },
    secondary: {
      backgroundColor: 'transparent',
      borderColor: colors.borderStrong,
      tone: 'primary',
      iconColor: 'textPrimary',
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      tone: 'primary',
      iconColor: 'textPrimary',
    },
    danger: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
      tone: 'onDanger',
      iconColor: 'onDanger',
    },
    dangerGhost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      tone: 'danger',
      iconColor: 'danger',
    },
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
        {icon && <Icon name={icon} size={18} color={appearance.iconColor} />}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.4,
  },
});
