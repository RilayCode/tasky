import { StyleSheet, Text, View } from 'react-native';

// Écran provisoire de la phase 1 : sert uniquement à vérifier que l'app démarre sur l'appareil.
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tasky</Text>
      <Text style={styles.subtitle}>Phase 1 — le projet démarre.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F6F2',
  },
  title: {
    fontSize: 38,
    fontWeight: '600',
    color: '#171717',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#706F68',
  },
});
