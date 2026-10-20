# CLAUDE.md — Tasky

> Document de référence du projet. À lire en entier avant toute session de développement.
> Dernière mise à jour : 2026-10-20 (phase 1 — initialisation, en attente de validation sur appareil).

---

## 0. État actuel du projet (à mettre à jour à chaque fin de phase)

| Élément | État |
|---|---|
| Phase en cours | **Phase 1 — Initialisation** : terminée côté code, **test sur téléphone non effectué** |
| Code applicatif | Projet Expo SDK 58 nettoyé ; un seul écran provisoire « Tasky » (`src/app/index.tsx`) |
| Dépôt git | GitHub `RilayCode/tasky`, branche `main` |
| Design | Direction révisée (§D) **adoptée** ; elle sera finalisée directement en code (pas de nouvelle maquette Figma) |
| Décisions ouvertes | Voir §I |

Objectif exprimé par le porteur du projet : une app **fluide**, qui sert aussi de terrain d'apprentissage pour expérimenter les techniques du développement mobile (animations, gestes, persistance, thèmes, build).

Règle : une phase ne commence que lorsque la précédente est validée explicitement par le porteur du projet.

---

## A. Présentation du projet

### Objectif
Tasky est une application mobile **personnelle** de gestion de tâches, locale et sans compte. Elle doit offrir une expérience moderne, soignée et identifiable — pas une énième todo-list générique. Positionnement repris de la maquette : « le journal de vos progrès » — clarté, maîtrise, satisfaction.

### Public cible
- Particuliers qui gèrent leurs tâches du quotidien (perso, petites tâches pro).
- Usage court et fréquent (quelques secondes, plusieurs fois par jour), à une main.
- Interface **en français** uniquement pour le moment.

### Porteur du projet
Développeur web (JavaScript, frontend, notions backend) qui **découvre le mobile**. Les concepts mobiles doivent être expliqués (voir §H).

### Fonctionnalités du périmètre initial
1. Écran « Aujourd'hui » : tâches du jour + synthèse de progression.
2. Liste de toutes les tâches, filtrable par statut (toutes / à faire / terminées).
3. Création d'une tâche : titre (obligatoire), description (facultative), priorité, échéance.
4. Détail d'une tâche.
5. Modifier, terminer (et dé-terminer), supprimer une tâche.
6. Persistance locale des données après fermeture de l'application.
7. Paramètres : choix du thème clair / sombre.
8. États vides, erreurs de formulaire, confirmation des actions destructives.

Ajouts issus de la maquette, **inclus** : recherche de tâches, toast « Annuler » après une action, réinitialisation des données (avec confirmation), thème « Automatique ».
Éléments de la maquette **exclus** : rappels d'échéance, retour haptique, option « garder les tâches terminées visibles », salutation personnalisée (« Bonjour Camille »).

### Hors périmètre (explicitement exclu)
- Backend, synchronisation, comptes, authentification.
- Notifications push (et, sauf décision contraire, notifications locales).
- Publication sur les stores (Play Store / App Store).
- Catégories, étiquettes, sous-tâches, tâches récurrentes, partage, pièces jointes.
- Internationalisation (autre que le français).
- Widgets, montre, tablette optimisée.

---

## B. Stack technique

### Technologies retenues

| Outil | Version cible | Rôle | Pourquoi |
|---|---|---|---|
| **Expo SDK** | 58 (`expo ~58.0.16`) | Socle de l'app | Évite de configurer Android Studio/Xcode au départ, outils intégrés (build, polices, mise à jour des versions). Standard recommandé par React Native. |
| **React Native** | 0.88.0 | Framework mobile | Imposé par le SDK 58. |
| **React** | 19.3.0 | UI | Imposé par le SDK 58. |
| **TypeScript** | ~6.0.3 | Typage | Version épinglée par le template Expo SDK 58. **Ne pas monter en TS 7** tant qu'Expo ne l'a pas adopté. |
| **Expo Router** | ~58.0.24 | Navigation | Routage par fichiers (proche de Next.js, familier pour un dev web), inclus dans le template. Basé sur React Navigation. |
| **Stockage local** | voir ci-dessous | Persistance | — |
| **Jest + jest-expo + React Native Testing Library** | à installer via `npx expo install` | Tests | Préréglage officiel Expo. |

Versions **vérifiées le 2026-10-20** via `npm view` (registre npm) et le template `expo-template-default@sdk-58`. Elles n'ont pas encore été installées ni testées ensemble sur un appareil.

**Règle d'installation :** toute dépendance native ou liée à Expo s'installe avec `npx expo install <paquet>` (et non `npm install`), pour que l'outil choisisse la version compatible avec le SDK. Vérifier ensuite avec `npx expo-doctor`.

**Point à vérifier en phase 1 :** que l'application Expo Go disponible sur le téléphone Android supporte le SDK 58. Sinon, utiliser un *development build* (voir §F).

### Constats de la phase 1 (installation réelle)
- **Dépendances conservées du template** : expo, expo-constants, expo-font, expo-linking, expo-router, expo-splash-screen, expo-status-bar, expo-system-ui, react, react-native, react-native-gesture-handler, react-native-reanimated, react-native-worklets, react-native-safe-area-context, react-native-screens. Reanimated et Gesture Handler servent à la fluidité visée (animations, gestes).
- **`react-dom` et `react-native-web` doivent rester** (19.3.0 / ~0.21.4) même sans cible web : Expo Router les attend comme dépendances « pair ». Les retirer fait résoudre `react-dom@19.3.1` et casse l'installation (conflit avec React 19.3.0).
- **Retirées du template** (inutilisées) : @expo/ui, expo-device, expo-glass-effect, expo-image, expo-symbols, expo-web-browser. La configuration `web` d'`app.json` a aussi été supprimée.
- **Outils de dev** : jest 30, jest-expo ~58.0.11, @types/jest 30, @testing-library/react-native 14 + test-renderer 1, eslint 9 + eslint-config-expo ~58.0.4.
- **TypeScript 6** ne charge plus automatiquement les types globaux : `"types": ["jest"]` est déclaré dans `tsconfig.json`. Tout nouveau type global devra y être ajouté.
- **React Native Testing Library 14** : `render` est **asynchrone** (`await render(...)`), requêtes via `screen`.
- **AsyncStorage** : la version compatible SDK 58 est **2.2.0** (`bundledNativeModules.json`), pas la 3.x « latest » de npm → toujours passer par `npx expo install`.
- `app.json` active `experiments.typedRoutes` (routes typées) et `experiments.reactCompiler` (mémoïsation automatique, rend `useMemo`/`useCallback` rarement nécessaires) — réglages par défaut du template, conservés.
- `AGENTS.md` (fourni par Expo) : consignes officielles Expo pour agents, à respecter aussi. `.claude/settings.json` active le plugin Expo pour Claude Code.

### Environnement cloud de Claude Code (limites connues)
- Le proxy bloque `api.expo.dev` / `exp.host` / React Native Directory. Lancer les commandes Expo avec **`EXPO_OFFLINE=1`** (ex. `EXPO_OFFLINE=1 npx expo install <pkg>`) : les versions sont alors lues dans `node_modules/expo/bundledNativeModules.json`.
- `npx expo-doctor` : 2 vérifications sur 20 échouent **uniquement faute de réseau** (schéma `app.json`, React Native Directory). À relancer sur une machine connectée.
- `npm audit` signale des vulnérabilités dans des dépendances **transitives des outils** (CLI Expo, Jest : braces, node-forge, uuid…), pas dans le code embarqué. **Ne pas lancer `npm audit fix --force`** : il casserait l'alignement des versions du SDK. Se réévalue à chaque montée de SDK.
- Impossible de lancer l'app sur un téléphone depuis le conteneur : le code est poussé sur `RilayCode/tasky`, puis lancé depuis la machine du porteur du projet (`git pull`, `npm install`, `npx expo start`).

### Stratégie de navigation
- Expo Router, dossier `src/app/`.
- Une **barre d'onglets** (3 onglets) : Aujourd'hui · Tâches · Paramètres.
- Une **pile** (stack) au-dessus des onglets pour : création (`task/new`, présentée en modale), détail (`task/[id]`), modification (`task/[id]/edit`).
- Confirmation de suppression / réinitialisation : **feuille modale en bas d'écran** (bottom sheet) — implémentation à choisir en phase 9, sans bibliothèque si `Modal` natif suffit.
- Android : le bouton/geste « retour » système doit toujours fonctionner de façon prévisible (ferme la modale, revient à l'écran précédent).

### Stratégie de stockage local
- **Choix recommandé (à valider) :** `@react-native-async-storage/async-storage` (clé → texte), installé via `npx expo install`.
  - + Très simple, API proche de `localStorage`, largement documenté.
  - − Pas de requêtes ; tout est relu/écrit en bloc. Acceptable : on vise quelques centaines de tâches au plus.
- Alternative écartée pour l'instant : `expo-sqlite` (vraie base SQL). Plus puissant, mais schéma, migrations SQL et requêtes ajoutent de la complexité inutile pour un premier projet. Reconsidérer si le volume ou les besoins de tri/recherche explosent.
- Format : une clé par domaine, contenu JSON **versionné** :
  - `tasky:tasks` → `{ "version": 1, "tasks": Task[] }`
  - `tasky:settings` → `{ "version": 1, "theme": "system" | "light" | "dark" }`
- Tout accès au stockage passe par un **repository** (`src/features/*/repository.ts`). Aucun écran n'appelle AsyncStorage directement. Changer de technologie = réécrire uniquement le repository.
- Données illisibles / corrompues : **ne jamais écraser silencieusement**. Conserver la donnée brute sous une clé de sauvegarde, afficher une erreur, repartir d'un état vide.

### Gestion d'état
- **React Context + `useReducer`** pour les tâches et les paramètres. Pas de Zustand/Redux : inutile à cette échelle, et cela garde les concepts React standards.
- Le reducer et les fonctions métier sont **purs** (testables sans React Native).
- Persistance : après chaque action modifiant l'état, écriture via le repository.

### Outils de test et de débogage
- `npx tsc --noEmit` — vérification des types.
- `npx expo lint` — ESLint (configuration Expo).
- `npx jest` (preset `jest-expo`) — tests unitaires et de composants.
- `npx expo-doctor` — cohérence des versions.
- Débogage : React Native DevTools (touche `j` dans le terminal `npx expo start`), menu développeur sur l'appareil (secouer le téléphone).
- Appareil réel Android via Expo Go ou development build (voir §F).

---

## C. Architecture

### Arborescence cible (à créer progressivement, pas d'un coup)

```
/                         racine du projet (ce dossier)
├── CLAUDE.md
├── app.json              configuration Expo (nom, icônes, thème système…)
├── package.json
├── tsconfig.json         "strict": true, alias "@/*" → "src/*"
├── assets/               polices, icône, splash
└── src/
    ├── app/              ROUTES uniquement (Expo Router). Fichiers fins : assemblent des composants.
    │   ├── _layout.tsx           providers (thème, tâches), stack racine
    │   ├── (tabs)/_layout.tsx    barre d'onglets
    │   ├── (tabs)/index.tsx      Aujourd'hui
    │   ├── (tabs)/tasks.tsx      Toutes les tâches
    │   ├── (tabs)/settings.tsx   Paramètres
    │   └── task/
    │       ├── new.tsx           Création (modale)
    │       ├── [id].tsx          Détail
    │       └── [id]/edit.tsx     Modification
    ├── components/
    │   ├── ui/           primitives génériques sans logique métier :
    │   │                 AppText, Button, TextField, SegmentedControl, Checkbox,
    │   │                 ProgressBar, ListDivider, BottomSheet, Toast, Screen
    │   └── tasks/        composants métier : TaskRow, TaskList, TaskForm, EmptyState
    ├── features/
    │   ├── tasks/
    │   │   ├── types.ts        Task, Priority, TaskStatus, TaskInput
    │   │   ├── logic.ts        fonctions pures : filtres, tri, regroupement par jour, stats
    │   │   ├── validation.ts   validation du formulaire (pure)
    │   │   ├── reducer.ts      actions et reducer (pur)
    │   │   ├── repository.ts   lecture/écriture stockage + migrations
    │   │   ├── TasksProvider.tsx  contexte + hooks (useTasks, useTask(id))
    │   │   └── __tests__/
    │   └── settings/           même découpage, plus léger
    ├── __tests__/        tests des écrans (jamais dans src/app : chaque fichier y devient une route)
    ├── theme/
    │   ├── tokens.ts      couleurs, typo, espacements, rayons (source unique)
    │   ├── ThemeProvider.tsx / useTheme.ts
    └── lib/
        ├── storage.ts     petit adaptateur autour d'AsyncStorage (JSON + erreurs)
        └── date.ts        formatage FR, « aujourd'hui », comparaisons de jours
```

### Séparation des responsabilités
1. **Interface** (`src/app`, `src/components`) : affiche, capte les interactions. Aucun calcul métier, aucun accès au stockage.
2. **Logique métier** (`src/features/*/logic.ts`, `validation.ts`, `reducer.ts`) : fonctions pures TypeScript, sans import React Native. C'est là que vivent les règles (qu'est-ce qu'une tâche « du jour », comment on trie, etc.).
3. **Accès aux données** (`repository.ts`, `lib/storage.ts`) : sérialisation, version du schéma, migrations, gestion d'erreurs de lecture/écriture.

Flux : Écran → hook (`useTasks`) → dispatch d'une action → reducer pur → nouvel état → repository écrit sur le disque.

### Modèle de données (proposition, à valider en phase 3)
```ts
type Priority = 'low' | 'normal' | 'high';

interface Task {
  id: string;              // généré localement
  title: string;           // 1 à 120 caractères après trim
  description: string | null;
  priority: Priority;      // 'normal' par défaut
  dueAt: string | null;    // ISO 8601 ; obligatoire ou non → décision ouverte (§I)
  completedAt: string | null; // null = à faire
  createdAt: string;
  updatedAt: string;
}
```
Le statut se **dérive** de `completedAt` (pas de champ `status` dupliqué).

### Conventions composants et types
- Composants fonctionnels uniquement, un composant exporté par fichier, nom de fichier = nom du composant (`TaskRow.tsx`).
- Props typées par une `interface NomProps` déclarée au-dessus du composant.
- Pas de `any`. `unknown` + garde de type pour les données lues du stockage.
- Types métier dans `features/*/types.ts`, jamais redéfinis dans les composants.
- Styles via `StyleSheet.create` et **uniquement des tokens du thème** (pas de couleurs/tailles en dur).
- Alias d'import `@/` pour `src/`.

### Réutilisation
- Un élément visuel utilisé 2 fois → candidat composant ; 3 fois → composant obligatoire.
- Les primitives `ui/` ne connaissent pas les tâches. Les composants `tasks/` composent des primitives.
- Pas d'abstraction « au cas où » : on factorise un besoin réel, pas hypothétique.

---

## D. Design system

### Source
- Fichier Figma : https://www.figma.com/design/qmbPFprU23YcPrQSIRGLI7/tasky?node-id=3-11317
- Page `01 — Direction artistique` (nœud `3:7977`) : planche d'identité (logo, palette, typo, grille).
- Page `03 — Mobile screens` (nœud `3:11317`) : 16 écrans 390×844 (iOS), dont clair/sombre, états vides, erreurs, confirmations, clavier.
- Accès via l'intégration Figma MCP (`get_metadata`, `get_screenshot`, `get_variable_defs`). Le téléchargement direct des images depuis figma.com est bloqué par le proxy de l'environnement cloud : utiliser `get_screenshot` avec `enableBase64Response: true`.

### Statut
**La maquette est une v1, PAS une référence définitive.** La direction révisée ci-dessous est adoptée et sera **finalisée directement en code** (phase 2, écran de démonstration). Les valeurs Figma servent de point de départ ; les valeurs définitives seront celles de `src/theme/tokens.ts` une fois validées sur appareil.

### Valeurs relevées dans Figma (variables existantes, non validées)

| Token Figma | Clair | Sombre |
|---|---|---|
| `background/primary` | `#F7F6F2` (ivoire) | `#191B18` (charbon) |
| `text/primary` | `#171717` (encre) | `#F3F3EA` |
| `text/secondary` | `#706F68` (gris chaud) | `#ABAEA2` |
| `border/subtle` | `#DCDCD3` | `#3A3D35` |
| `action/accent` | `#C7F36B` (chartreuse) | `#C7F36B` |

- Danger (suppression) : rouge brique visible sur les écrans, **pas défini en variable**.
- Espacements : variables 4, 8, 12, 16, 24 (la planche mentionne aussi 32 et 48). Base 4 px, marges latérales 24 px.
- Rayons : variables 8 et 16 ; la planche annonce 12 pour les champs (absent des variables).
- Typo : Inter uniquement. Display 38/40 semi-bold, texte 15–17, légendes 11–14. Styles nommés `Taskly/…` avec doublons (ex. deux styles « 15 Medium » identiques) → à nettoyer.
- Cibles tactiles ≥ 44×44 annoncées et respectées dans les lignes de tâche.

Contrastes calculés (WCAG) :
- Texte secondaire `#706F68` sur ivoire : **4,67:1** (AA texte normal, juste).
- Encre sur chartreuse (boutons) : 14,05:1 ✅
- **Chartreuse sur ivoire : 1,18:1** ❌ — jauge de progression et case cochée quasi invisibles par leur forme seule en mode clair (minimum 3:1 pour un élément graphique).
- Bordure `#DCDCD3` sur ivoire : 1,28:1 — acceptable pour un filet décoratif, insuffisant pour délimiter un champ ou une piste de jauge.

### Diagnostic de la v1 (synthèse)
**À conserver**
- Ton éditorial : grands titres, numérotation (« 01 / 04 », « 00. »), listes à filets plutôt que cartes, pas d'ombres.
- Palette restreinte ivoire / encre / chartreuse / charbon, et la règle « le chartreuse signale l'action ou le progrès, jamais le décor ».
- Jauge segmentée, case à cocher dans une zone de 44 px, chevron vers le détail.
- États bien pensés : vide, recherche sans résultat, journée terminée, erreur de champ, confirmation en feuille basse, toast avec « Annuler ».
- Rédaction française chaleureuse et sobre.

**À faire évoluer**
1. **Nom incohérent** : la maquette affiche « taskly » partout ; le projet s'appelle « Tasky ».
2. **Identité générique** : Inter seule + accent citron vert = esthétique SaaS très répandue. Le logo est un simple mot en Inter. Rien n'est propre à Tasky hormis le point de progrès.
3. **Hiérarchie de l'écran Aujourd'hui** : un slogan fixe (« Chaque chose, à son rythme. ») occupe ~20 % de l'écran à chaque ouverture ; l'information utile (progression) est reléguée en petit. Même problème sur Nouvelle tâche (slogan au-dessus du formulaire, critique quand le clavier est ouvert).
4. **Règle chartreuse violée** : le point de priorité haute est chartreuse (ce n'est ni une action ni un progrès). Et la priorité n'est signalée que par un point de 6 px (couleur seule → non accessible).
5. **Bruit dans les lignes** : « Priorité normale / basse » répété sur chaque ligne alors que seule la priorité haute mérite un signal.
6. **États sélectionnés incohérents** : filtre actif noir en clair mais chartreuse en sombre ; onglet actif = pastille chartreuse ; priorité sélectionnée = noir. Trois langages pour « sélectionné ».
7. **Deux styles de champs** : champs texte remplis sans bordure vs champs date/heure bordés.
8. **Incohérences de rédaction / structure** : « Réglages » (onglet) vs « Paramètres » (titre) ; surtitre présent sur certains écrans (« VOS TÂCHES » sur 08) et absent sur l'écran équivalent (02) ; espacement serré entre filtres et premier en-tête de section.
9. **Statut « À faire » du détail** ressemble à un bouton radio (affordance trompeuse). Le compteur « 01 / 04 » suggère un balayage entre tâches non spécifié.
10. **Jauge segmentée** non définie au-delà de quelques tâches (12 segments ? 30 ?).
11. **Maquettes 100 % iOS** (Dynamic Island, clavier iOS, indicateur d'accueil) alors que la cible de test et de build est **Android** : retour système, sélecteur de date natif Android, retour tactile (ripple) non pensés.
12. **Paramètres hors périmètre** : rappels, haptique, visibilité des terminées. Pas d'option « Automatique (système) » pour le thème.
13. **« Bonjour Camille »** suppose un prénom qu'aucun écran ne permet de saisir.

### Direction artistique révisée — **adoptée** (détails à finaliser en code)
Garder « l'éditorial du quotidien », le rendre plus personnel et plus fonctionnel :
- **La progression devient le héros** de l'écran Aujourd'hui : grand chiffre tabulaire (ex. « 1/4 ») + jauge ; la phrase d'accroche devient une ligne secondaire contextuelle (matin / soir / journée terminée), plus petite.
- **Typographie à deux voix** : Inter (ou police système) pour l'interface ; une police d'affichage plus caractérielle pour les titres et chiffres, chargée via `expo-font` (inclus dans Expo). Candidats à comparer avant choix — aucun n'est retenu.
- **Couleur strictement sémantique** :
  - chartreuse = action principale, progrès, accomplissement ;
  - encre (clair) / ivoire (sombre) = sélection (filtres, priorité, onglet actif) ;
  - priorité haute = icône + libellé en encre (jamais couleur seule), basse/normale non affichées dans la liste ;
  - danger = rouge brique, ajouté en token.
- **Contraste en mode clair** : piste de jauge plus foncée et/ou remplissage avec contour ; case cochée lisible par sa forme (fond encre + coche chartreuse en clair, inverse en sombre) — à tester visuellement.
- **Un seul style de champ** (fond + bordure 1 px, bordure encre au focus, rouge en erreur).
- **Signature de mouvement** discrète : animation de la coche et du remplissage de la jauge à la complétion ; respecter « réduire les animations » du système.
- **Adaptation Android** : retour système, sélecteurs natifs, ripple, barre d'état/navigation.
- **Thème** : Automatique (par défaut) / Clair / Sombre.

### Principes de cohérence visuelle (s'appliqueront après validation)
- Toutes les valeurs proviennent de `src/theme/tokens.ts`. Aucune couleur, taille ou espacement en dur dans les composants.
- Tokens **sémantiques** (`text.primary`, `surface.field`, `action.primary`, `feedback.danger`…) mappés sur une palette brute ; les composants n'utilisent que les sémantiques.
- Chaque token a une valeur clair **et** une valeur sombre ; le thème sombre n'est pas une inversion automatique.
- Échelle d'espacement fermée (4, 8, 12, 16, 24, 32, 48) ; échelle typographique fermée (≤ 7 styles).
- Toute nouvelle variante de composant est d'abord justifiée, puis ajoutée au design system.

---

## E. Règles de développement

### Nommage
- Composants et fichiers de composants : `PascalCase` (`TaskRow.tsx`).
- Hooks : `useCamelCase` ; fonctions et variables : `camelCase` ; constantes globales : `UPPER_SNAKE_CASE`.
- Types/interfaces : `PascalCase`, sans préfixe `I`.
- Routes Expo Router : fichiers en minuscules, segments dynamiques entre crochets.
- Code et identifiants en **anglais** ; textes affichés en **français** ; commentaires en français acceptés, seulement quand ils expliquent un « pourquoi ».

### Gestion des erreurs
- Les erreurs de stockage sont attrapées dans le repository, journalisées (`console.warn` en dev) et remontées sous forme d'état d'erreur affichable — jamais avalées.
- Aucun `try/catch` vide. Aucun contournement silencieux d'un problème : la cause est identifiée et expliquée.
- Un écran dont l'ID de tâche n'existe plus affiche un état « Tâche introuvable » avec retour.

### Validation des formulaires
- Fonction pure `validateTaskInput(input) → { ok: true, value } | { ok: false, errors }` dans `validation.ts`, testée unitairement.
- Titre : obligatoire après `trim`, 120 caractères max (proposition). Description : 1000 max (proposition).
- Erreurs affichées sous le champ concerné, au plus tard à la soumission ; l'erreur disparaît quand le champ devient valide.
- Le bouton de soumission ne se désactive pas silencieusement : l'utilisateur doit comprendre pourquoi rien ne se passe.

### Accessibilité et ergonomie mobile
- Cibles tactiles ≥ 44×44 pt (Android : 48 dp recommandé).
- `accessibilityRole`, `accessibilityLabel` et `accessibilityState` (ex. `checked`) sur tous les éléments interactifs ; tester avec TalkBack.
- Contraste texte ≥ 4,5:1, éléments graphiques porteurs de sens ≥ 3:1.
- Aucune information portée par la couleur seule.
- Respect de la taille de police système (pas de `allowFontScaling={false}` sauf justification).
- Zones sûres (`react-native-safe-area-context`), clavier qui ne masque jamais le champ actif ni le bouton principal.
- Actions destructives : confirmation explicite ; action réversible courante (terminer) : toast avec « Annuler » si validé.

### Dépendances
- Toute nouvelle dépendance doit être **justifiée** (besoin, alternative sans dépendance, poids, maintenance) et validée avant installation.
- Installation via `npx expo install`, puis `npx expo-doctor`.
- Pas de bibliothèque UI complète (pas de NativeBase, Paper, Tamagui…) : le design system est maison.

### Sécurité des données
- Données uniquement sur l'appareil ; aucune collecte, aucun envoi réseau.
- Aucun secret, jeton ou clé dans le dépôt. Fichiers `.env*` ignorés par git.
- AsyncStorage n'est pas chiffré : n'y stocker rien de sensible (adapté à des tâches personnelles ; à reconsidérer si le périmètre change).
- Les identifiants de compte Expo/EAS restent en local, jamais commités.

### Qualité et maintenabilité
- TypeScript `strict`. Zéro erreur `tsc`, zéro erreur lint avant de clore une étape.
- Fonctions courtes, logique métier hors des composants.
- Pas de code mort ni de code commenté laissé « pour plus tard ».
- Commits petits, message clair en français décrivant le *pourquoi*.

---

## F. Stratégie de test

### Vérifications automatiques (à chaque étape)
```bash
npx tsc --noEmit
npx expo lint
npx jest
npx expo-doctor
```

### Tests des fonctionnalités essentielles (Jest)
- **Logique pure** (priorité absolue, rapide à tester) : sélection des tâches du jour, filtres par statut, tri, regroupement par jour, calcul de progression, validation du formulaire, reducer (création, modification, complétion, suppression).
- **Composants clés** (React Native Testing Library) : `TaskForm` (erreur affichée si titre vide), `TaskRow` (cocher appelle l'action), écran vide.

### Tests de persistance
- Repository testé avec le mock officiel d'AsyncStorage : écriture puis relecture identique, état vide au premier lancement, donnée corrompue → erreur + sauvegarde de la donnée brute, migration de version.
- Test manuel sur appareil : créer des tâches → fermer complètement l'app (pas seulement la mettre en arrière-plan) → rouvrir → données présentes.

### Vérifications sur appareil réel (Android)
- Lancement via `npx expo start` + Expo Go **si compatible SDK 58**, sinon *development build* (`npx expo run:android` avec Android SDK, ou EAS Build).
- Checklist par écran : rendu clair/sombre, texte agrandi (taille de police système maximale), TalkBack, bouton retour Android, clavier ouvert, rotation désactivée ou gérée.

### Procédure de validation avant chaque étape importante
1. Vérifications automatiques ci-dessus — **résultats réels copiés dans le compte rendu**.
2. Test manuel sur téléphone des critères d'acceptation de la phase.
3. Compte rendu : ce qui a été fait, ce qui a été testé (et comment), ce qui n'a pas pu l'être, décisions prises.
4. Validation explicite du porteur du projet avant la phase suivante.

Un test non exécuté est déclaré « non exécuté », jamais « réussi ».

---

## G. Plan de développement

Chaque phase est courte, livrable et testable. Ne pas anticiper la phase suivante.

### Phase 0 — Cadrage et direction artistique *(terminée)*
- **Objectif** : comprendre le design, définir le cadre, valider la direction visuelle.
- **Livrables** : ce `CLAUDE.md` ; décisions de §I tranchées ; direction artistique révisée validée (éventuellement mise à jour dans Figma).
- **Critères d'acceptation** : décisions ouvertes résolues ou explicitement reportées ; palette, typo et composants clés validés.
- **Tests** : aucun (pas de code).
- **Prérequis** : accès Figma (OK).

### Phase 1 — Initialisation du projet *(code fait ; validation sur appareil en attente)*
- **Objectif** : une app Expo vide qui démarre sur le téléphone.
- **Livrables** : projet Expo SDK 58 TypeScript (template par défaut, nettoyé des exemples), `tsconfig` strict + alias `@/`, ESLint, Jest configuré avec un test trivial, `git init` + `.gitignore`, `app.json` (nom « Tasky », identifiant Android).
- **Critères** : l'app affiche un écran « Tasky » sur un Android réel ; les 4 commandes de vérification passent.
- **Tests** : vérifications automatiques ; lancement sur appareil.
- **Prérequis** : téléphone Android ; Expo Go installé ou plan B dev build ; décision sur l'identifiant de package Android (ex. `com.<vous>.tasky`). Note : `create-expo-app` dans un dossier non vide peut refuser de s'exécuter → générer dans un sous-dossier temporaire puis déplacer, en conservant `CLAUDE.md`.

### Phase 2 — Thème et primitives UI
- **Objectif** : le design system validé existe en code.
- **Livrables** : `theme/tokens.ts` (clair + sombre), `ThemeProvider` (automatique / clair / sombre, non persisté pour l'instant), polices chargées, primitives `AppText`, `Button`, `Screen`, `TextField`, `SegmentedControl`, `Checkbox`, `ProgressBar`. Un écran de démonstration temporaire.
- **Critères** : bascule clair/sombre fonctionnelle ; aucune valeur en dur ; contrastes conformes à §E.
- **Tests** : tests de rendu des primitives (états), vérification visuelle sur appareil dans les deux thèmes.
- **Prérequis** : phase 0 validée (palette, polices).

### Phase 3 — Domaine « tâches » (sans UI)
- **Objectif** : toute la logique métier, pure et testée.
- **Livrables** : `types.ts`, `logic.ts`, `validation.ts`, `reducer.ts` + tests.
- **Critères** : couverture des cas limites (titre vide/espaces, tâche sans échéance, changement de jour, fuseau horaire local).
- **Tests** : Jest uniquement.
- **Prérequis** : décisions sur l'échéance obligatoire/heure facultative.

### Phase 4 — Persistance locale
- **Objectif** : les données survivent au redémarrage.
- **Livrables** : `lib/storage.ts`, `repository.ts` (versionné, gestion de corruption), `TasksProvider` + hooks, `SettingsProvider` (thème persisté).
- **Critères** : relecture fidèle ; premier lancement propre ; erreur de lecture visible et non destructrice.
- **Tests** : tests de persistance (mock) + test manuel fermeture/réouverture.
- **Prérequis** : phase 3.

### Phase 5 — Navigation et squelette des écrans
- **Objectif** : naviguer entre tous les écrans (contenu provisoire).
- **Livrables** : onglets, pile, modale de création, routes détail/édition, écran « introuvable ».
- **Critères** : tous les parcours accessibles ; retour Android cohérent partout.
- **Tests** : parcours manuel complet sur appareil.

### Phase 6 — Écran Aujourd'hui
- **Livrables** : synthèse de progression, liste du jour, cocher/décocher, états « vide » et « journée terminée ».
- **Critères** : progression juste et mise à jour immédiatement ; cohérent clair/sombre ; accessible TalkBack.
- **Tests** : tests composant `TaskRow` ; test manuel avec 0, 1, n tâches et toutes terminées.

### Phase 7 — Toutes les tâches
- **Livrables** : liste regroupée par jour, filtres par statut, recherche (si validée), état « aucun résultat ».
- **Critères** : filtres corrects, liste fluide avec ~200 tâches (utiliser `FlatList`/`SectionList`).
- **Tests** : tests de la logique de filtre ; test manuel de performance avec données générées.

### Phase 8 — Création et modification
- **Livrables** : `TaskForm` partagé création/édition, sélecteur de priorité, sélecteurs date/heure natifs, gestion du clavier, erreurs de validation.
- **Critères** : impossible de créer une tâche invalide ; erreurs claires ; clavier ne masque rien ; édition pré-remplie.
- **Tests** : tests `TaskForm` ; test manuel complet sur Android.
- **Prérequis** : dépendance sélecteur de date à valider (probablement `@react-native-community/datetimepicker`).

### Phase 9 — Détail, complétion, suppression
- **Livrables** : écran détail, actions terminer / modifier / supprimer, feuille de confirmation, toast « Annuler » (si validé).
- **Critères** : suppression uniquement après confirmation ; retour correct après suppression.
- **Tests** : tests du reducer (suppression, annulation) ; test manuel.

### Phase 10 — Paramètres
- **Livrables** : choix du thème (automatique / clair / sombre) persisté, informations de version, réinitialisation des données avec confirmation (si validée).
- **Critères** : thème appliqué immédiatement et conservé au redémarrage.
- **Tests** : persistance des paramètres ; test manuel.

### Phase 11 — Finitions et qualité
- **Livrables** : animations validées, revue accessibilité (TalkBack, grande police), icône et splash, nettoyage du code.
- **Critères** : checklist §F complète sur appareil ; aucune alerte lint/type.
- **Tests** : passe complète de tests manuels + automatiques.

### Phase 12 — Build Android installable
- **Objectif** : un fichier APK installable sur le téléphone sans environnement de développement.
- **Livrables** : `eas.json` avec un profil `preview` produisant un APK (EAS Build, nécessite un compte Expo gratuit) **ou** build local via `npx expo prebuild` + Gradle (nécessite Android SDK/JDK). Choix à faire à ce moment-là.
- **Critères** : APK installé sur un téléphone réel, données persistées entre redémarrages, fonctionnement hors ligne.
- **Tests** : parcours complet sur l'APK installé.
- **Prérequis** : compte Expo (si EAS), aucune clé de signature commitée.

---

## H. Règles de collaboration

- **Expliquer** chaque décision importante en mots simples, avec avantages et inconvénients. Faire le lien avec les équivalents web quand c'est utile (ex. Expo Router ≈ Next.js, AsyncStorage ≈ localStorage, `View` ≈ `div`).
- **Ne pas demander de choisir une technologie sans comparer** les options.
- **Rester dans la phase en cours** : pas de modification hors du périmètre de l'étape, pas de génération massive de code.
- **Aucune dépendance** ajoutée sans justification et validation.
- **Honnêteté sur les tests** : rapporter les sorties réelles ; « non exécuté » quand c'est le cas ; ne jamais masquer une erreur.
- **Marquer clairement** ce qui est décidé, proposé, ou en attente de validation (voir §I).
- **Poser une question précise** plutôt qu'inventer une exigence.
- **Aucune information sensible** (identifiants, clés, jetons, données personnelles) dans le dépôt ni dans ce fichier.
- **Mettre à jour ce fichier** (§0 et §I) à la fin de chaque phase.
- Fin de chaque étape : compte rendu, puis **attendre la validation** avant de continuer.

---

## I. Décisions en attente

Légende : ✅ validé explicitement · ☑️ proposition adoptée par défaut (le porteur a lancé le code sans objection ; à rouvrir si besoin) · ⏳ ouvert.

| # | Sujet | Décision / proposition | Statut |
|---|---|---|---|
| 1 | Nom affiché | **Tasky** (la maquette « taskly » est obsolète sur ce point) | ✅ |
| 2 | Direction artistique révisée (§D) | Adoptée ; **finalisée directement en code**, sans nouvelle maquette Figma | ✅ |
| 3 | Police d'affichage | Choisie en code en phase 2 (comparer 2–3 candidats sur un écran de démonstration) | ⏳ phase 2 |
| 4 | Échéance obligatoire ? Heure obligatoire ? | **Ni la date ni l'heure ne sont obligatoires** ; sans date = « Sans échéance » | ✅ |
| 5 | Définition de « tâches du jour » | Échéance aujourd'hui + tâches en retard non terminées (affichées en tête) | ☑️ |
| 6 | Recherche | **Gardée** (filtre texte local) | ✅ |
| 7 | Toast « Annuler » | **Gardé** (au minimum pour la complétion) | ✅ |
| 8 | Rappels, haptique, visibilité des terminées | **Retirés** du périmètre initial | ✅ |
| 9 | Réinitialisation des données | Gardée, avec confirmation | ☑️ |
| 10 | Salutation « Bonjour <prénom> » | **Retirée** | ✅ |
| 11 | Thème « Automatique (système) » | Ajouté, valeur par défaut | ☑️ |
| 12 | Stockage | AsyncStorage (2.2.0 via `npx expo install`) derrière un repository | ☑️ |
| 13 | Mode de test sur téléphone | Expo Go si compatible SDK 58, sinon development build | ⏳ à vérifier par le porteur |
| 14 | Identifiant du package Android | `com.<nom>.tasky` — non renseigné dans `app.json` (inutile pour Expo Go, requis au premier build natif) | ⏳ |
| 15 | Hébergement du code | Dépôt GitHub `RilayCode/tasky` | ✅ |
