import type { TextStyle } from 'react-native';

// Palette brute : les composants ne l'utilisent jamais directement,
// ils passent par les couleurs sémantiques ci-dessous.
const palette = {
  ivory: '#F7F6F2',
  ivoryDim: '#EEEDE6',
  ink: '#171717',
  warmGrey: '#66655E',
  stone: '#DCDCD3',
  stoneStrong: '#84837B',
  chartreuse: '#C7F36B',
  brick: '#A63A2E',
  white: '#FFFFFF',
  charcoal: '#191B18',
  charcoalRaised: '#242621',
  paper: '#F3F3EA',
  sage: '#ABAEA2',
  moss: '#3A3D35',
  mossStrong: '#74786C',
  coral: '#EE8A7A',
} as const;

export interface ColorTokens {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  borderSubtle: string;
  borderStrong: string;
  accent: string;
  onAccent: string;
  selected: string;
  onSelected: string;
  progressFill: string;
  progressTrack: string;
  checkFill: string;
  checkMark: string;
  danger: string;
  onDanger: string;
  ripple: string;
}

export type ColorScheme = 'light' | 'dark';

// Règle : le chartreuse signale l'action principale et le progrès.
// En clair, il est trop pâle sur ivoire (1,18:1) pour porter seul une forme :
// la jauge et la case cochée passent alors en encre, le chartreuse devient la coche.
export const colors: Record<ColorScheme, ColorTokens> = {
  light: {
    background: palette.ivory,
    surface: palette.ivoryDim,
    textPrimary: palette.ink,
    textSecondary: palette.warmGrey,
    borderSubtle: palette.stone,
    borderStrong: palette.stoneStrong,
    accent: palette.chartreuse,
    onAccent: palette.ink,
    selected: palette.ink,
    onSelected: palette.ivory,
    progressFill: palette.ink,
    progressTrack: palette.stone,
    checkFill: palette.ink,
    checkMark: palette.chartreuse,
    danger: palette.brick,
    onDanger: palette.white,
    ripple: 'rgba(23, 23, 23, 0.08)',
  },
  dark: {
    background: palette.charcoal,
    surface: palette.charcoalRaised,
    textPrimary: palette.paper,
    textSecondary: palette.sage,
    borderSubtle: palette.moss,
    borderStrong: palette.mossStrong,
    accent: palette.chartreuse,
    onAccent: palette.ink,
    selected: palette.paper,
    onSelected: palette.charcoal,
    progressFill: palette.chartreuse,
    progressTrack: palette.moss,
    checkFill: palette.chartreuse,
    checkMark: palette.ink,
    danger: palette.coral,
    onDanger: palette.charcoal,
    ripple: 'rgba(243, 243, 234, 0.12)',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

// Cibles tactiles : 48 dp (recommandation Android, couvre aussi les 44 pt iOS).
export const touchTarget = 48;

export const motion = {
  fast: 150,
  base: 250,
  slow: 400,
  spring: { damping: 18, stiffness: 220, mass: 1 },
} as const;

export const uiFonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
} as const;

export interface DisplayFont {
  family: string;
  label: string;
  // Chaque police a sa propre « chasse » : on compense pour garder un rendu équilibré.
  letterSpacing: number;
  sizeScale: number;
}

export type DisplayFontKey = 'instrument' | 'bricolage' | 'space';

export const displayFonts: Record<DisplayFontKey, DisplayFont> = {
  instrument: {
    family: 'InstrumentSerif_400Regular',
    label: 'Instrument',
    letterSpacing: -0.4,
    sizeScale: 1.14,
  },
  bricolage: {
    family: 'BricolageGrotesque_600SemiBold',
    label: 'Bricolage',
    letterSpacing: -1,
    sizeScale: 1,
  },
  space: {
    family: 'SpaceGrotesk_600SemiBold',
    label: 'Space',
    letterSpacing: -1.2,
    sizeScale: 0.98,
  },
};

export type TextVariant =
  | 'numeral'
  | 'display'
  | 'title'
  | 'headline'
  | 'body'
  | 'bodyStrong'
  | 'meta'
  | 'eyebrow';

// Échelle typographique fermée : toute nouvelle taille passe par ici.
export function buildTypography(display: DisplayFont): Record<TextVariant, TextStyle> {
  const displayStyle = (size: number, lineHeight: number): TextStyle => ({
    fontFamily: display.family,
    fontSize: Math.round(size * display.sizeScale),
    lineHeight: Math.round(lineHeight * display.sizeScale),
    letterSpacing: display.letterSpacing,
  });

  return {
    numeral: { ...displayStyle(80, 84), fontVariant: ['tabular-nums'] },
    display: displayStyle(40, 44),
    title: displayStyle(28, 32),
    headline: { fontFamily: uiFonts.semiBold, fontSize: 17, lineHeight: 22 },
    body: { fontFamily: uiFonts.regular, fontSize: 15, lineHeight: 21 },
    bodyStrong: { fontFamily: uiFonts.semiBold, fontSize: 15, lineHeight: 21 },
    meta: {
      fontFamily: uiFonts.medium,
      fontSize: 13,
      lineHeight: 18,
      fontVariant: ['tabular-nums'],
    },
    eyebrow: {
      fontFamily: uiFonts.semiBold,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
  };
}
