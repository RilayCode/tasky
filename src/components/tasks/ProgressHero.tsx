import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { progressMessage, type Progress } from '@/features/tasks/logic';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

interface ProgressHeroProps {
  progress: Progress;
}

// La progression est le « héros » de l'écran Aujourd'hui : un grand chiffre,
// une phrase contextuelle et la jauge.
export function ProgressHero({ progress }: ProgressHeroProps) {
  const { colors } = useTheme();
  const { done, total } = progress;
  const accomplished = total > 0 && done === total;

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <View
          style={styles.numeral}
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants">
          <Animated.View key={done} entering={FadeInDown.duration(280)}>
            <AppText variant="numeral">{done}</AppText>
          </Animated.View>
          <AppText variant="title" tone="secondary" style={styles.total}>
            /{total}
          </AppText>
        </View>
        <View style={styles.text}>
          {accomplished ? (
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <AppText variant="eyebrow" tone="onAccent">
                Journée accomplie
              </AppText>
            </View>
          ) : (
            <AppText variant="eyebrow" tone="secondary">
              Terminées aujourd’hui
            </AppText>
          )}
          <AppText variant="body" tone="secondary">
            {progressMessage(progress)}
          </AppText>
        </View>
      </View>
      <ProgressBar
        completed={done}
        total={total}
        accessibilityLabel={`Progression du jour : ${done} ${done > 1 ? 'terminées' : 'terminée'} sur ${total}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xl,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.lg,
  },
  numeral: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  total: {
    marginLeft: spacing.xs,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
