import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeOutDown, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { useTheme } from '@/theme/ThemeProvider';
import { radius, spacing, touchTarget } from '@/theme/tokens';

interface ToastOptions {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastState extends ToastOptions {
  id: number;
}

type ShowToast = (options: ToastOptions) => void;

const ToastContext = createContext<ShowToast | null>(null);

const DURATION_MS = 4500;
// Hauteur de la barre d'onglets : le toast s'affiche juste au-dessus.
export const TOAST_BOTTOM_OFFSET = 72;

export function ToastProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  const show: ShowToast = (options) => {
    nextId.current += 1;
    setToast({ ...options, id: nextId.current });
    AccessibilityInfo.announceForAccessibility(options.message);
  };

  return (
    <ToastContext value={show}>
      {children}
      {toast && (
        <View
          pointerEvents="box-none"
          style={[styles.overlay, { bottom: insets.bottom + TOAST_BOTTOM_OFFSET + spacing.md }]}>
          <Animated.View
            key={toast.id}
            entering={SlideInDown.springify().damping(18)}
            exiting={FadeOutDown.duration(180)}
            accessibilityLiveRegion="polite"
            style={[styles.toast, { backgroundColor: colors.inverseSurface }]}>
            <Icon name="check-circle" size={18} color="inverseAction" />
            <AppText variant="bodyStrong" style={[styles.message, { color: colors.onInverseSurface }]}>
              {toast.message}
            </AppText>
            {toast.actionLabel && toast.onAction && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={toast.actionLabel}
                onPress={() => {
                  toast.onAction?.();
                  setToast(null);
                }}
                hitSlop={8}
                style={styles.action}>
                <AppText variant="bodyStrong" style={{ color: colors.inverseAction }}>
                  {toast.actionLabel}
                </AppText>
              </Pressable>
            )}
          </Animated.View>
        </View>
      )}
    </ToastContext>
  );
}

export function useToast(): ShowToast {
  const context = use(ToastContext);
  if (!context) {
    throw new Error('useToast doit être utilisé à l’intérieur de <ToastProvider>.');
  }
  return context;
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: spacing.xl,
    right: spacing.xl,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    minHeight: touchTarget + 8,
  },
  message: {
    flex: 1,
  },
  action: {
    minHeight: touchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
});
