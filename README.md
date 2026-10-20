# Tasky

Application mobile de gestion de tâches — « le journal de vos progrès ».
Expo SDK 58 · React Native 0.88 · TypeScript · stockage local, sans compte.

La documentation de référence (architecture, design system, décisions, plan) est dans [`CLAUDE.md`](./CLAUDE.md).

## Lancer l'app sur un téléphone Android

```bash
npm install
npx expo start          # scanner le QR code avec Expo Go (version compatible SDK 58)
```

## Vérifications

```bash
npm run typecheck       # TypeScript
npm run lint            # ESLint
npm test                # Jest : logique, persistance, composants, parcours complets
```

## Construire un APK installable

```bash
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview
```
