import { StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

export function ListDivider() {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
  },
});
