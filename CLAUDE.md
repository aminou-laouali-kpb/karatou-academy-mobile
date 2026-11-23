# CLAUDE.md — Karatou Academy Mobile

> À copier à la racine du nouveau repo `karatou-academy-mobile`.
> La spec complète est dans `docs/FICHE-LANCEMENT.md` (copie de
> `karatou-academy-app/docs/app-mobile/fiche-lancement-app-mobile.md`).

## Le projet

App iOS/Android de Karatou Academy : vidéos courtes (style DataCamp) + leçons
interactives pas à pas (style Brilliant) + gamification (XP, séries, ligues, badges).
Apprenants d'Afrique de l'Ouest, trilingue **FR / EN / HA**, Android d'entrée de gamme,
data mobile chère, connexion intermittente.

**Même backend que la web app** : projet Supabase « Karatou Academy ». Mêmes comptes,
même catalogue, même progression, mêmes certificats. Une leçon finie sur le web est
finie sur mobile, et inversement.

## Règles non négociables

1. **Le schéma Supabase n'est jamais modifié depuis ce repo.** Les migrations vivent
   dans `karatou-academy-app/supabase/migrations`. Ici on consomme les types générés
   (`src/lib/database.types.ts`, via `npm run db:types`). Besoin d'une table ou d'une
   RPC ? On écrit la migration dans le repo web, on la pousse, puis on régénère les types.
2. **Jamais de clé `service_role` dans l'app.** Seulement `EXPO_PUBLIC_SUPABASE_URL` et
   `EXPO_PUBLIC_SUPABASE_ANON_KEY`. Toute logique sensible (XP, séries, certificats)
   passe par des RPC `SECURITY DEFINER` côté base.
3. **L'XP n'est jamais calculé côté client** de façon autoritaire. Le client affiche une
   valeur optimiste ; la base fait foi (RPC `karatou_record_lesson_attempt`).
4. **Chaque texte d'interface existe en FR, EN et HA** (`src/i18n/locales/{fr,en,ha}.json`).
   Pas de chaîne en dur dans les composants. Un test vérifie la parité des clés.
5. **Offline d'abord** : toute écriture de progression passe par la file
   `src/lib/offlineQueue.ts` (clé d'idempotence par tentative). L'app doit rester
   utilisable en mode avion pour les leçons téléchargées.
6. **Économie de data** : pas d'autoplay vidéo, images en WebP dimensionnées, pas de
   préchargement réseau non demandé.
7. **Accessibilité** : cibles tactiles ≥ 44 pt, `accessibilityLabel` sur toute icône
   interactive, contraste AA, tailles de police dynamiques respectées.

## Stack

Expo (SDK stable le plus récent) · Expo Router · TypeScript strict · NativeWind ·
Reanimated + Gesture Handler · @gorhom/bottom-sheet · lottie-react-native ·
expo-haptics · TanStack Query (+ persistance MMKV) · Zustand · supabase-js ·
i18next · react-native-youtube-iframe · expo-notifications · Sentry ·
Jest + Testing Library · Maestro (E2E) · EAS Build / Submit / Update.

## Arborescence

```
app/                    # routes Expo Router
  (onboarding)/         # bienvenue, langue, objectif, niveau, rappel
  (auth)/               # connexion, inscription, mot de passe oublié
  (tabs)/               # index (Accueil), learn, league, profile
  module/[slug].tsx     # parcours d'un module
  lesson/[moduleSlug]/[courseId].tsx   # lecteur immersif (modal plein écran)
  lesson-complete.tsx
  streak.tsx  certificates/  settings/  review.tsx  downloads.tsx
src/
  components/ui/        # Button, Card, ProgressBar, Sheet, Chip, Avatar…
  components/lesson/    # StepRenderer + un composant par type d'étape
  components/gamification/  # XpBadge, StreakFlame, DailyGoalRing, LeagueRow…
  features/<domaine>/   # hooks + services par domaine (catalog, lesson, gamification, auth)
  lib/                  # supabase, queryClient, offlineQueue, analytics, sentry
  lesson-engine/        # lessonToSteps(), scoring, types des étapes (pur TS, testé)
  i18n/  theme/
```

## Commandes

```bash
npm run start        # Expo dev server
npm run lint && npm run typecheck && npm test
npm run db:types     # supabase gen types typescript --project-id $SUPABASE_PROJECT_REF
npm run e2e          # maestro test .maestro/
```

## Façon de travailler

- Un sprint = une branche + une PR, avec la Definition of Done de la fiche (§11).
- `src/lesson-engine/` est du TypeScript pur, sans React : couverture de tests ≥ 90 %.
- Toute nouvelle étape interactive : type dans `lesson-engine/types.ts`, rendu dans
  `components/lesson/`, test unitaire, histoire dans l'écran de démo `app/dev/steps.tsx`.
- Avant de coder un écran, relire sa référence Mobbin dans la fiche (§3 et §5).
