import { useEffect } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius, touchTarget } from '@/theme/tokens';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  accessibilityLabel: string;
}

export function Checkbox({ checked, onChange, accessibilityLabel }: CheckboxProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.set(withSpring(checked ? 1 : 0, motion.spring));
  }, [checked, progress]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [colors.background, colors.checkFill]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.borderStrong, colors.checkFill]),
    transform: [{ scale: 1 - Math.sin(progress.value * Math.PI) * 0.12 }],
  }));

  const markStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ rotate: '45deg' }, { scale: 0.4 + progress.value * 0.6 }],
  }));

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      hitSlop={4}
      style={styles.target}>
      <Animated.View style={[styles.box, boxStyle]}>
        <Animated.View style={[styles.mark, { borderColor: colors.checkMark }, markStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: {
    width: touchTarget,
    height: touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Coche dessinée avec deux bordures d'un rectangle pivoté : pas besoin d'icône ni de SVG.
  mark: {
    width: 7,
    height: 13,
    marginTop: -3,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
  },
});
