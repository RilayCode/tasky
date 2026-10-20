import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/index';

describe('HomeScreen', () => {
  it('affiche le nom de l’application', async () => {
    await render(<HomeScreen />);
    expect(screen.getByText('Tasky')).toBeOnTheScreen();
  });
});
