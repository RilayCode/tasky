import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Icon, type IconName } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius, spacing } from '@/theme/tokens';

interface FabProps {
  icon: IconName;
  accessibilityLabel: string;
  onPress: () => void;
}

const SIZE = 60;

// Bouton d'action flottant, en bas à droite : à portée de pouce.
export function Fab({ icon, accessibilityLabel, onPress }: FabProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      entering={FadeIn.delay(150)}
      style={[styles.container, { backgroundColor: colors.accent }, animatedStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        onPressIn={() => scale.set(withSpring(0.92, motion.spring))}
        onPressOut={() => scale.set(withSpring(1, motion.spring))}
        android_ripple={{ color: colors.ripple }}
        style={styles.pressable}>
        <Icon name={icon} size={26} color="onAccent" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: SIZE,
    height: SIZE,
    borderRadius: radius.lg + 4,
    overflow: 'hidden',
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
