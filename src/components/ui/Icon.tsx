import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { useTheme } from '@/theme/ThemeProvider';
import type { ColorTokens } from '@/theme/tokens';

export type IconName = ComponentProps<typeof Feather>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color?: keyof ColorTokens;
}

// Icônes Feather (trait fin, cohérent avec la maquette). Décoratives par défaut :
// le libellé accessible est porté par le bouton ou le texte voisin.
export function Icon({ name, size = 20, color = 'textPrimary' }: IconProps) {
  const { colors } = useTheme();
  return (
    <Feather
      name={name}
      size={size}
      color={colors[color]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    />
  );
}
