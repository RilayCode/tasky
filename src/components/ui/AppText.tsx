import { Text, type TextProps } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import type { TextVariant } from '@/theme/tokens';

export type TextTone = 'primary' | 'secondary' | 'danger' | 'onAccent' | 'onSelected' | 'onDanger';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  tone?: TextTone;
}

export function AppText({ variant = 'body', tone = 'primary', style, ...rest }: AppTextProps) {
  const { colors, typography } = useTheme();
  const toneColor = {
    primary: colors.textPrimary,
    secondary: colors.textSecondary,
    danger: colors.danger,
    onAccent: colors.onAccent,
    onSelected: colors.onSelected,
    onDanger: colors.onDanger,
  }[tone];

  return <Text style={[typography[variant], { color: toneColor }, style]} {...rest} />;
}
