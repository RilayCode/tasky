import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius, spacing } from '@/theme/tokens';

// Au-delà, des segments deviendraient illisibles : on passe à une barre continue.
const MAX_SEGMENTS = 7;

interface ProgressBarProps {
  completed: number;
  total: number;
  accessibilityLabel: string;
}

export function ProgressBar({ completed, total, accessibilityLabel }: ProgressBarProps) {
  const safeTotal = Math.max(total, 0);
  const segmented = safeTotal > 0 && safeTotal <= MAX_SEGMENTS;
  const fills = segmented
    ? Array.from({ length: safeTotal }, (_, index) => (index < completed ? 1 : 0))
    : [safeTotal === 0 ? 0 : Math.min(completed / safeTotal, 1)];

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: safeTotal, now: Math.min(completed, safeTotal) }}
      style={styles.row}>
      {fills.map((fill, index) => (
        <Segment key={index} fill={fill} delay={index * 40} />
      ))}
    </View>
  );
}

interface SegmentProps {
  fill: number;
  delay: number;
}

function Segment({ fill, delay }: SegmentProps) {
  const { colors } = useTheme();
  const progress = useSharedValue(fill);

  useEffect(() => {
    progress.set(withDelay(delay, withTiming(fill, { duration: motion.slow })));
  }, [fill, delay, progress]);

  // scaleX + transformOrigin gauche : animation sur le thread natif, sans recalcul de mise en page.
  const fillStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: progress.value }] }));

  return (
    <View style={[styles.segment, { backgroundColor: colors.progressTrack }]}>
      <Animated.View
        style={[styles.fill, { backgroundColor: colors.progressFill }, fillStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    ...StyleSheet.absoluteFill,
    transformOrigin: 'left',
  },
});
