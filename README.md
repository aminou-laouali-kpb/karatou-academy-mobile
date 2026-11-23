# Karatou Academy Mobile

App iOS/Android de Karatou Academy (Expo + React Native). Même backend Supabase que la web app.

- Règles du projet : [CLAUDE.md](CLAUDE.md)
- Spécification complète : [docs/FICHE-LANCEMENT.md](docs/FICHE-LANCEMENT.md)

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis renseigner la clé anon Supabase
npx expo run:ios             # ou run:android (build de dev, nécessaire pour MMKV et Sentry)
```

## Commandes

```bash
npm run start        # serveur Expo (client de dev déjà installé)
npm run lint && npm run typecheck && npm test
npm run db:types     # régénère src/lib/database.types.ts depuis Supabase
```

En mode dev, l'écran d'accueil propose un lien vers la galerie du kit UI (`/dev/ui`).
