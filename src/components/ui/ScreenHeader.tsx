import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { IconButton } from '@/components/ui/IconButton';
import type { IconName } from '@/components/ui/Icon';
import { spacing } from '@/theme/tokens';

interface ScreenHeaderProps {
  icon: IconName;
  iconLabel: string;
  onIconPress: () => void;
  label?: string;
  trailing?: ReactNode;
}

// En-tête des écrans empilés (détail, formulaire) : retour/fermeture + contexte.
export function ScreenHeader({ icon, iconLabel, onIconPress, label, trailing }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <IconButton icon={icon} accessibilityLabel={iconLabel} onPress={onIconPress} />
      {label ? (
        <AppText variant="meta" tone="secondary" style={styles.label}>
          {label}
        </AppText>
      ) : (
        <View style={styles.label} />
      )}
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    flex: 1,
  },
});
