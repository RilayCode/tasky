import { fireEvent, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/index';
import { renderWithTheme } from '@/test/renderWithTheme';

describe('Labo de design (écran d’accueil provisoire)', () => {
  it('affiche le nom de l’application', async () => {
    await renderWithTheme(<HomeScreen />);
    expect(screen.getByText('Tasky')).toBeOnTheScreen();
  });

  it('fait avancer la progression quand on coche une tâche', async () => {
    await renderWithTheme(<HomeScreen />);
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 1, max: 4 });

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Lire 20 minutes' }));

    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 2, max: 4 });
    expect(screen.getByText('Bel élan. Encore 2.')).toBeOnTheScreen();
  });

  it('montre une erreur quand on valide un titre vide', async () => {
    await renderWithTheme(<HomeScreen />);
    await fireEvent.press(screen.getByRole('button', { name: 'Valider le titre' }));
    expect(screen.getByText('Le titre est requis pour créer une tâche.')).toBeOnTheScreen();
  });

  it('bascule le thème sur sombre', async () => {
    await renderWithTheme(<HomeScreen />);
    await fireEvent.press(screen.getByRole('radio', { name: 'Sombre' }));
    expect(screen.getByRole('radio', { name: 'Sombre' })).toBeChecked();
    expect(screen.getByText(/Rendu actuel : sombre/)).toBeOnTheScreen();
  });
});
