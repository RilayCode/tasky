import { contrastRatio } from '../contrast';
import { colors, type ColorScheme, type ColorTokens } from '../tokens';

type Pair = [foreground: keyof ColorTokens, background: keyof ColorTokens, minimum: number];

// Texte : 4,5:1 (WCAG AA). Éléments graphiques porteurs de sens : 3:1.
const requiredPairs: Pair[] = [
  ['textPrimary', 'background', 4.5],
  ['textPrimary', 'surface', 4.5],
  ['textSecondary', 'background', 4.5],
  ['textSecondary', 'surface', 4.5],
  ['onAccent', 'accent', 4.5],
  ['onSelected', 'selected', 4.5],
  ['onDanger', 'danger', 4.5],
  ['danger', 'background', 4.5],
  ['borderStrong', 'background', 3],
  ['selected', 'background', 3],
  ['progressFill', 'background', 3],
  ['checkFill', 'background', 3],
  ['checkMark', 'checkFill', 3],
  ['onInverseSurface', 'inverseSurface', 4.5],
  ['inverseAction', 'inverseSurface', 4.5],
];

describe('contrastRatio', () => {
  it('renvoie 21 pour noir sur blanc et 1 pour une couleur sur elle-même', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrastRatio('#C7F36B', '#C7F36B')).toBe(1);
  });
});

describe.each<ColorScheme>(['light', 'dark'])('tokens de couleur (%s)', (scheme) => {
  it.each(requiredPairs)('%s sur %s respecte %d:1', (foreground, background, minimum) => {
    const tokens = colors[scheme];
    expect(contrastRatio(tokens[foreground], tokens[background])).toBeGreaterThanOrEqual(minimum);
  });
});
