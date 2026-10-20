import { fireEvent, screen } from '@testing-library/react-native';
import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import { renderWithTheme } from '@/test/renderWithTheme';

describe('Button', () => {
  it('expose un rôle bouton et déclenche onPress', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button label="Nouvelle tâche" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Nouvelle tâche' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('ne déclenche rien quand il est désactivé', async () => {
    const onPress = jest.fn();
    await renderWithTheme(<Button label="Créer" onPress={onPress} disabled />);
    await fireEvent.press(screen.getByRole('button', { name: 'Créer' }));
    expect(onPress).not.toHaveBeenCalled();
  });
});

describe('Checkbox', () => {
  function ControlledCheckbox() {
    const [checked, setChecked] = useState(false);
    return <Checkbox checked={checked} onChange={setChecked} accessibilityLabel="Lire 20 minutes" />;
  }

  it('bascule son état accessible à chaque appui', async () => {
    await renderWithTheme(<ControlledCheckbox />);
    const checkbox = screen.getByRole('checkbox', { name: 'Lire 20 minutes' });
    expect(checkbox).not.toBeChecked();
    await fireEvent.press(checkbox);
    expect(checkbox).toBeChecked();
    await fireEvent.press(checkbox);
    expect(checkbox).not.toBeChecked();
  });
});

describe('SegmentedControl', () => {
  it('signale l’option choisie et marque la sélection', async () => {
    const onChange = jest.fn();
    await renderWithTheme(
      <SegmentedControl
        options={[
          { value: 'all', label: 'Toutes' },
          { value: 'todo', label: 'À faire' },
        ]}
        value="all"
        onChange={onChange}
        accessibilityLabel="Filtre"
      />,
    );
    expect(screen.getByRole('radio', { name: 'Toutes' })).toBeChecked();
    await fireEvent.press(screen.getByRole('radio', { name: 'À faire' }));
    expect(onChange).toHaveBeenCalledWith('todo');
  });
});

describe('TextField', () => {
  it('affiche l’erreur à la place de l’aide', async () => {
    await renderWithTheme(
      <TextField label="Titre" hint="Aide" error="Le titre est requis." value="" />,
    );
    expect(screen.getByText('Le titre est requis.')).toBeOnTheScreen();
    expect(screen.queryByText('Aide')).toBeNull();
  });
});

describe('ProgressBar', () => {
  it('expose la progression aux lecteurs d’écran', async () => {
    await renderWithTheme(<ProgressBar completed={2} total={5} accessibilityLabel="Progression" />);
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ min: 0, max: 5, now: 2 });
  });

  it('borne la valeur au total', async () => {
    await renderWithTheme(<ProgressBar completed={9} total={3} accessibilityLabel="Progression" />);
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 3 });
  });
});
