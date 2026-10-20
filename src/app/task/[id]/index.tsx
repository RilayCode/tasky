import { useLocalSearchParams } from 'expo-router';

import { TaskDetailScreen } from '@/screens/TaskDetailScreen';

export default function TaskDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <TaskDetailScreen id={id} />;
}
