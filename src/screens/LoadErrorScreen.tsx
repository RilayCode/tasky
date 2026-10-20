import { useState } from 'react';

import { EmptyState } from '@/components/tasks/EmptyState';
import { Button } from '@/components/ui/Button';
import { ConfirmSheet } from '@/components/ui/ConfirmSheet';
import { Screen } from '@/components/ui/Screen';
import { useTasks } from '@/features/tasks/TasksProvider';

// Affiché à la place de l'app si les tâches enregistrées n'ont pas pu être lues.
export function LoadErrorScreen() {
  const { loadError, loadErrorKind, startFresh, retryLoad } = useTasks();
  const [confirm, setConfirm] = useState(false);

  // Lecture impossible (erreur du stockage) : les données sont peut-être intactes
  // et aucune copie n'existe. On ne propose QUE de réessayer.
  if (loadErrorKind === 'io') {
    return (
      <Screen>
        <EmptyState
          numeral="!"
          title={loadError ?? 'Vos tâches n’ont pas pu être chargées.'}
          message="Vos données n’ont pas été modifiées. Réessayez ; si le problème persiste, redémarrez l’application.">
          <Button label="Réessayer" icon="refresh-cw" onPress={retryLoad} />
        </EmptyState>
      </Screen>
    );
  }

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
