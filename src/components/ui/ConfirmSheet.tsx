import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Icon, type IconName } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing } from '@/theme/tokens';

interface ConfirmSheetProps {
  visible: boolean;
  icon: IconName;
  title: string;
  message: string;
  detail?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Feuille de confirmation en bas d'écran pour les actions destructives.
// Le bouton « retour » d'Android et un appui sur le voile annulent.
export function ConfirmSheet({
  visible,
  icon,
  title,
  message,
  detail,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmSheetProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onCancel}>
      <View style={styles.root}>
        <Pressable
          accessible={false}
          importantForAccessibility="no"
          onPress={onCancel}
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.scrim }]}
        />
        <Animated.View
          entering={SlideInDown.springify().damping(20).stiffness(180)}
          accessibilityViewIsModal
          style={[
            styles.sheet,
            { backgroundColor: colors.background, paddingBottom: insets.bottom + spacing.xl },
          ]}>
          <View style={[styles.handle, { backgroundColor: colors.borderSubtle }]} />
          <View style={[styles.badge, { backgroundColor: colors.surface }]}>
            <Icon name={icon} size={22} color="danger" />
          </View>
          <AppText variant="title" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="body" tone="secondary">
            {message}
          </AppText>
          {detail && (
            <View style={[styles.detail, { backgroundColor: colors.surface }]}>
              <AppText variant="meta">{detail}</AppText>
            </View>
          )}
          <View style={styles.actions}>
            <Button label={confirmLabel} variant="danger" onPress={onConfirm} />
            <Button label="Annuler" variant="secondary" onPress={onCancel} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.lg + 8,
    borderTopRightRadius: radius.lg + 8,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detail: {
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
