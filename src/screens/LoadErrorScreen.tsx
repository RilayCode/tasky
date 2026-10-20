import { useState } from 'react';

import { EmptyState } from '@/components/tasks/EmptyState';
import { Button } from '@/components/ui/Button';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { Screen } from '@/components/ui/Screen';
import { useTasks } from '@/features/tasks/TasksProvider';

// Affiché à la place de l'app si les tâches enregistrées n'ont pas pu être lues.
// Les données d'origine ont déjà été copiées sous une clé de secours.
export function LoadErrorScreen() {
  const { loadError, startFresh } = useTasks();
  const [confirm, setConfirm] = useState(false);

  return (
    <Screen>
      <EmptyState
        numeral="!"
        title={loadError ?? 'Vos tâches n’ont pas pu être chargées.'}
        message="Une copie de sécurité a été conservée sur l’appareil. Vous pouvez repartir d’une liste vide ; la copie ne sera pas effacée.">
        <Button label="Repartir d’une liste vide" variant="danger" onPress={() => setConfirm(true)} />
      </EmptyState>
      <ConfirmSheet
        visible={confirm}
        icon="alert-triangle"
        title="Repartir de zéro ?"
        message="Tasky démarrera avec une liste vide. La copie de sécurité reste sur l’appareil."
        confirmLabel="Repartir de zéro"
        onConfirm={() => {
          setConfirm(false);
          startFresh();
        }}
        onCancel={() => setConfirm(false)}
      />
    </Screen>
  );
}
