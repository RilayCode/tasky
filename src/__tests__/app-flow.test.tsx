import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

import { loadTasks } from '@/features/tasks/repository';

// Parcours complets dans la vraie navigation de l'app (Expo Router), stockage simulé.

beforeEach(async () => {
  await AsyncStorage.clear();
});

async function openApp() {
  await renderRouter('./src/app', { initialUrl: '/' });
  await screen.findByText('Votre page est encore blanche.');
}

async function createTask(title: string) {
  await fireEvent.changeText(screen.getByLabelText('Titre *'), title);
  await fireEvent.press(screen.getByRole('button', { name: 'Créer la tâche' }));
}

describe('Tasky — parcours utilisateur', () => {
  it('crée une tâche, la termine, annule, et la retrouve après redémarrage', async () => {
    await openApp();

    await fireEvent.press(screen.getByRole('button', { name: 'Créer ma première tâche' }));
    await createTask('Envoyer le devis à Léa');

    expect(await screen.findByText('Envoyer le devis à Léa')).toBeOnTheScreen();
    expect(screen.getByText('Tâche ajoutée')).toBeOnTheScreen();
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 0, max: 1 });

    await fireEvent.press(screen.getByRole('checkbox', { name: 'Envoyer le devis à Léa' }));
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 1, max: 1 });
    expect(screen.getByText('Journée accomplie')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Annuler' }));
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({ now: 0, max: 1 });

    await waitFor(async () => {
      const stored = await loadTasks();
      expect(stored.ok && stored.tasks.map((task) => [task.title, task.completedAt])).toEqual([
        ['Envoyer le devis à Léa', null],
      ]);
    });

    // « Redémarrage » : on remonte l'app, les données doivent être relues du stockage.
    screen.unmount();
    await renderRouter('./src/app', { initialUrl: '/' });
    expect(await screen.findByText('Envoyer le devis à Léa')).toBeOnTheScreen();
  });

  it('refuse un titre vide et explique pourquoi', async () => {
    await openApp();
    await fireEvent.press(screen.getByRole('button', { name: 'Créer ma première tâche' }));
    await createTask('   ');

    expect(screen.getByText('Le titre est requis pour créer une tâche.')).toBeOnTheScreen();
    expect(screen.getByText('Corrigez le champ signalé, puis réessayez.')).toBeOnTheScreen();

    await fireEvent.changeText(screen.getByLabelText('Titre *'), 'Lire 20 minutes');
    expect(screen.queryByText('Le titre est requis pour créer une tâche.')).toBeNull();
  });

  it('supprime après confirmation, puis restaure avec « Annuler »', async () => {
    await openApp();
    await fireEvent.press(screen.getByRole('button', { name: 'Créer ma première tâche' }));
    await createTask('Réserver le train');
    await screen.findByText('Réserver le train');

    await fireEvent.press(screen.getByRole('button', { name: /^Réserver le train, à faire/ }));
    expect(await screen.findByText('Détail de la tâche')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Supprimer la tâche' }));
    expect(screen.getByText('Supprimer cette tâche ?')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Supprimer' }));

    expect(await screen.findByText('Votre page est encore blanche.')).toBeOnTheScreen();
    expect(screen.getByText('Tâche supprimée')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Annuler' }));
    expect(await screen.findByText('Réserver le train')).toBeOnTheScreen();
  });

  it('filtre et recherche dans toutes les tâches', async () => {
    await openApp();
    await fireEvent.press(screen.getByRole('button', { name: 'Créer ma première tâche' }));
    await createTask('Appeler le dentiste');
    await screen.findByText('Appeler le dentiste');
    await fireEvent.press(screen.getByRole('button', { name: 'Nouvelle tâche' }));
    await createTask('Préparer le week-end');
    await screen.findByText('Préparer le week-end');
    await fireEvent.press(screen.getByRole('checkbox', { name: 'Appeler le dentiste' }));

    await fireEvent.press(screen.getByRole('tab', { name: 'Tâches' }));
    expect(await screen.findByText('Tout est là.')).toBeOnTheScreen();
    expect(screen.getByText('2 tâches · 1 à faire · 1 terminée')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('radio', { name: 'Terminées' }));
    expect(screen.getByText('Appeler le dentiste')).toBeOnTheScreen();
    expect(screen.queryByText('Préparer le week-end')).toBeNull();

    await fireEvent.press(screen.getByRole('radio', { name: 'Toutes' }));
    await fireEvent.changeText(screen.getByLabelText('Rechercher une tâche'), 'passeport');
    expect(screen.getByText('Rien pour « passeport ».')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Effacer la recherche' }));
    expect(screen.getByText('Préparer le week-end')).toBeOnTheScreen();
  });
});
