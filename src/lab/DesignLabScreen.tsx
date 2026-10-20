import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import { TodayPreview } from '@/lab/TodayPreview';
import { contrastRatio } from '@/theme/contrast';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';
import { displayFonts, radius, spacing, type ColorTokens, type DisplayFontKey } from '@/theme/tokens';

// Écran temporaire de la phase 2 : vitrine interactive du design system.
// Il sera supprimé quand les vrais écrans existeront.

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Auto' },
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
];

const FONT_OPTIONS = (Object.keys(displayFonts) as DisplayFontKey[]).map((key) => ({
  value: key,
  label: displayFonts[key].label,
}));

const SWATCHES: { token: keyof ColorTokens; label: string }[] = [
  { token: 'textPrimary', label: 'Encre · texte' },
  { token: 'textSecondary', label: 'Texte secondaire' },
  { token: 'accent', label: 'Chartreuse · action' },
  { token: 'progressFill', label: 'Progrès' },
  { token: 'selected', label: 'Sélection' },
  { token: 'danger', label: 'Danger' },
  { token: 'borderStrong', label: 'Bordure de champ' },
];

export function DesignLabScreen() {
  const { colors, scheme, preference, setPreference, displayFont, setDisplayFont } = useTheme();
  const reducedMotion = useReducedMotion();
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState<string | undefined>();
  const [lastAction, setLastAction] = useState('aucune');

  const validateTitle = () => {
    setTitleError(title.trim() ? undefined : 'Le titre est requis pour créer une tâche.');
  };

  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.wordmark}>
          <AppText variant="display" accessibilityRole="header">
            Tasky
          </AppText>
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        </View>
        <AppText variant="eyebrow" tone="secondary">
          Labo · phase 2
        </AppText>
      </View>

      <Section index="01" title="Thème">
        <SegmentedControl
          options={THEME_OPTIONS}
          value={preference}
          onChange={setPreference}
          accessibilityLabel="Thème de l’application"
        />
        <AppText variant="meta" tone="secondary">
          Rendu actuel : {scheme === 'dark' ? 'sombre' : 'clair'}
          {preference === 'system' ? ' (suit le réglage du téléphone)' : ''}
        </AppText>
      </Section>

      <Section index="02" title="Police d’affichage">
        <SegmentedControl
          options={FONT_OPTIONS}
          value={displayFont}
          onChange={setDisplayFont}
          accessibilityLabel="Police d’affichage"
        />
        <AppText variant="display">Faire moins.{'\n'}Avancer mieux.</AppText>
        <AppText variant="body" tone="secondary">
          L’interface reste en Inter. Seuls les titres et les chiffres changent de voix.
        </AppText>
      </Section>

      <Section index="03" title="Aujourd’hui · aperçu">
        <TodayPreview />
      </Section>

      <Section index="04" title="Champs">
        <TextField
          label="Titre"
          placeholder="Que souhaitez-vous faire ?"
          value={title}
          onChangeText={(text) => {
            setTitle(text);
            if (titleError && text.trim()) setTitleError(undefined);
          }}
          error={titleError}
          hint="Valide avec le champ vide pour voir l’erreur."
          maxLength={120}
        />
        <TextField
          label="Description · facultative"
          placeholder="Un détail pour vous aider…"
          multiline
        />
        <Button label="Valider le titre" variant="secondary" onPress={validateTitle} />
      </Section>

      <Section index="05" title="Boutons">
        <Button label="Nouvelle tâche" onPress={() => setLastAction('Nouvelle tâche')} />
        <Button
          label="Modifier la tâche"
          variant="secondary"
          onPress={() => setLastAction('Modifier')}
        />
        <Button label="Plus tard" variant="ghost" onPress={() => setLastAction('Plus tard')} />
        <Button
          label="Supprimer la tâche"
          variant="danger"
          onPress={() => setLastAction('Supprimer')}
        />
        <AppText variant="meta" tone="secondary">
          Dernière action : {lastAction}
        </AppText>
      </Section>

      <Section index="06" title="Couleurs · contraste sur le fond">
        <View style={styles.swatches}>
          {SWATCHES.map(({ token, label }) => (
            <View key={token} style={styles.swatchRow}>
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: colors[token], borderColor: colors.borderSubtle },
                ]}
              />
              <View style={styles.swatchText}>
                <AppText variant="bodyStrong">{label}</AppText>
                <AppText variant="meta" tone="secondary">
                  {colors[token]}
                </AppText>
              </View>
              <AppText variant="meta">
                {contrastRatio(colors[token], colors.background).toFixed(2)}:1
              </AppText>
            </View>
          ))}
        </View>
      </Section>

      <AppText variant="meta" tone="secondary" style={styles.footer}>
        Animations réduites (réglage du téléphone) : {reducedMotion ? 'oui' : 'non'}
      </AppText>
    </Screen>
  );
}

interface SectionProps {
  index: string;
  title: string;
  children: ReactNode;
}

function Section({ index, title, children }: SectionProps) {
  return (
    <View style={styles.section}>
      <AppText variant="eyebrow" tone="secondary" accessibilityRole="header">
        {index} / {title}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  wordmark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  section: {
    gap: spacing.lg,
    marginTop: spacing.xxl,
  },
  swatches: {
    gap: spacing.md,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  swatch: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  swatchText: {
    flex: 1,
  },
  footer: {
    marginTop: spacing.xxl,
  },
});
