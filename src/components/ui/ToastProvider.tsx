import { createContext, use, useEffect, useRef, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeOutUp, SlideInUp } from 'react-native-reanimated';
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
// Avec un lecteur d'écran, il faut le temps d'atteindre le bouton « Annuler ».
const SCREEN_READER_DURATION_MS = 12000;

// Durée d'affichage : réglage Android « Temps pour agir » et lecteur d'écran pris en compte.
async function toastDuration(): Promise<number> {
  try {
    const [recommended, screenReader] = await Promise.all([
      AccessibilityInfo.getRecommendedTimeoutMillis(DURATION_MS),
      AccessibilityInfo.isScreenReaderEnabled(),
    ]);
    return Math.max(recommended, screenReader ? SCREEN_READER_DURATION_MS : 0);
  } catch {
    // API d'accessibilité indisponible (ex. tests) : durée par défaut.
    return DURATION_MS;
  }
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const nextId = useRef(0);

  useEffect(() => {
    if (!toast) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    toastDuration().then((duration) => {
      if (!cancelled) timer = setTimeout(() => setToast(null), duration);
    });
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [toast]);

  const show: ShowToast = (options) => {
    nextId.current += 1;
    setToast({ ...options, id: nextId.current });
    AccessibilityInfo.announceForAccessibility(options.message);
  };

  return (
    <ToastContext value={show}>
      {children}
      {/* En haut d'écran : ne recouvre jamais le bouton flottant, la barre d'onglets
          ni les boutons d'action en bas des écrans de détail et de formulaire. */}
      {toast && (
        <View
          pointerEvents="box-none"
          style={[styles.overlay, { top: insets.top + spacing.sm }]}>
          <Animated.View
            key={toast.id}
            entering={SlideInUp.springify().damping(18)}
            exiting={FadeOutUp.duration(180)}
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
