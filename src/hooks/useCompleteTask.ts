import { useToast } from '@/components/ui/ToastProvider';
import { useTasks } from '@/features/tasks/TasksProvider';
import type { Task } from '@/features/tasks/types';

// Cocher / décocher une tâche, avec un toast « Annuler » quand on la termine.
export function useCompleteTask() {
  const { setCompleted } = useTasks();
  const showToast = useToast();

  return (task: Task, completed: boolean) => {
    setCompleted(task.id, completed);
    if (completed) {
      showToast({
        message: 'Tâche terminée',
        actionLabel: 'Annuler',
        onAction: () => setCompleted(task.id, false),
      });
    }
  };
}
