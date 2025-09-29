## Installation (FR)

Suivez ces étapes pour installer et lancer ce projet Expo + React Native avec Gluestack UI.

### Prérequis

- Node.js 18+ et npm (ou pnpm/yarn)
- Expo CLI (facultatif, `npx expo` suffit)
- Android Studio (pour Android) / Xcode (pour iOS, macOS requis)

Vérifiez votre version de Node:

```bash
node -v
```

### 1) Installer les dépendances

Depuis la racine du projet:

```bash
npm install
```

### 2) Démarrer l’application

```bash
npm run start
```

Dans le terminal Expo, choisissez une cible:

- Android: appuyez sur « a » (émulateur requis) ou scannez le QR code avec un appareil réel.
- iOS: appuyez sur « i » (macOS + Xcode requis).
- Web: appuyez sur « w ».

### 3) Structure et thème

- Le routeur se trouve dans `app/` (Expo Router).
- Le thème Gluestack est fourni par `GluestackUIProvider` dans `app/_layout.tsx`.
- Tailwind/Nativwind est configuré via `global.css` et `tailwind.config.js`.

### 4) Commandes utiles

```bash
# Lancer en mode web directement
npm run web

# Lancer et ouvrir Android
npm run android

# Lancer et ouvrir iOS (macOS)
npm run ios

# Lint
npm run lint

# Réinitialiser le squelette (déplace l’exemple vers app-example/)
npm run reset-project
```

### 5) Dépannage rapide

- Si Metro ne détecte pas des changements, arrêtez puis relancez `npm run start`.
- Pour des problèmes Android, ouvrez l’émulateur dans Android Studio avant d’appuyer sur « a ».
- Si vous voyez une erreur de compatibilité Node, mettez à jour Node vers 18+.
