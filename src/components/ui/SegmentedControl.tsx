import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { motion, radius, spacing, touchTarget } from '@/theme/tokens';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}

const PADDING = spacing.xs;

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  );
  const segmentWidth = width > 0 ? (width - PADDING * 2) / options.length : 0;
  const translateX = useSharedValue(0);

  useEffect(() => {
    translateX.set(withSpring(selectedIndex * segmentWidth, motion.spring));
  }, [selectedIndex, segmentWidth, translateX]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
      style={[styles.container, { backgroundColor: colors.surface }]}>
      {segmentWidth > 0 && (
        <Animated.View
          style={[
            styles.indicator,
            { width: segmentWidth, backgroundColor: colors.selected },
            indicatorStyle,
          ]}
        />
      )}
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ checked: selected }}
            onPress={() => onChange(option.value)}
            style={styles.option}>
            <AppText variant="bodyStrong" tone={selected ? 'onSelected' : 'secondary'}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: PADDING,
  },
  indicator: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
    borderRadius: radius.sm,
  },
  option: {
    flex: 1,
    minHeight: touchTarget - PADDING * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
