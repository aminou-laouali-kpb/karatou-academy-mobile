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

## Authentification (S2)

Même projet Supabase que le web : un compte créé sur l'un fonctionne sur l'autre.

- **Inscription** : `full_name`, `country` (code ISO, `XX` = autre), `gender` facultatif, dans les
  métadonnées. C'est le trigger `create_karatou_profile_for_new_user` qui crée le profil.
  La confirmation d'e-mail est active.
- **Liens de retour (PKCE)** : `karatou://auth/callback` (confirmation, OAuth) et
  `karatou://reset-password`. Ils doivent figurer dans les *Redirect URLs* de Supabase Auth
  (tâche B6 de la fiche).
- **Google / Apple** : les boutons n'apparaissent que si le fournisseur est activé dans
  Supabase (lu dans `/auth/v1/settings`). Apple demande aussi la capacité « Sign in with Apple »
  sur l'identifiant `academy.karatou.app` (compte Apple Developer).
- **Suppression de compte** : appelle l'Edge Function `delete-account` (tâche B5, repo web).
  Tant qu'elle n'est pas déployée, l'écran affiche « service pas encore disponible ».
- **Réponses de l'onboarding** : gardées sur le téléphone (MMKV) ; elles partiront vers
  `karatou_update_learning_prefs` quand cette RPC existera (tâche B2). La langue est déjà
  synchronisée dans `profiles.preferred_language`.
