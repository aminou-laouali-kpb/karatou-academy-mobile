# Karatou Academy Mobile — Fiche de lancement v1

> **Usage** : copier ce fichier dans le nouveau repo `karatou-academy-mobile` sous
> `docs/FICHE-LANCEMENT.md`, et `CLAUDE.md` (même dossier) à sa racine.
> Rédigée le 22/11/2026 à partir du code de `karatou-academy-app` (branche `main`)
> et d'une recherche Mobbin.

---

## 0. En bref

| | |
|---|---|
| **Produit** | App iOS + Android de Karatou Academy. Mêmes comptes, catalogue, progression et certificats que la web app. |
| **Expérience** | Vidéo courte (ADN **DataCamp**) → leçon interactive pas à pas où l'on apprend en manipulant (ADN **Brilliant**) → XP, série, objectif quotidien, ligues, badges (ADN **Duolingo / Mimo**). |
| **Public** | Jeunes et professionnels d'Afrique de l'Ouest. **FR / EN / HA**. Android d'entrée de gamme majoritaire, data chère, réseau intermittent. |
| **Stack** | Expo (React Native) + TypeScript + Expo Router + NativeWind + TanStack Query + Supabase (projet existant). |
| **Données** | Aucune duplication. Le schéma reste versionné dans le repo web (`supabase/migrations`). Toute la logique de gamification vit **en base** (RPC + triggers), donc le web en profite aussi. |
| **Plan** | Phase 0 UX (Mobbin → maquettes) puis 9 sprints mobiles, avec une piste backend menée en parallèle dans le repo web. |
| **Prérequis bloquant** | Basculer le corps des 52 leçons dans `karatou_courses.lesson_content` (aujourd'hui 51 n'existent que dans le bundle JS du web). Voir §8.5, tâche B1. |

---

## 1. Vision et principes

**Promesse** : « 10 minutes par jour pour maîtriser l'IA et le numérique, dans ta langue, même hors connexion. »

1. **Une leçon tient dans un trajet** : 5 à 10 min, découpée en étapes de 20 à 60 s.
2. **Apprendre en faisant** : chaque notion est suivie d'une interaction en moins d'une minute (Brilliant).
3. **Feedback immédiat et bienveillant** : explication à chaque erreur, une seconde chance, question reposée en fin de leçon. **Pas de vies/cœurs qui bloquent** l'apprentissage.
4. **Sobre en data** : vidéo jamais en lecture auto, textes et exercices en cache, modules téléchargeables.
5. **Une seule progression** : ce qui est fait sur le web compte sur mobile, et inversement.
6. **Trilingue partout**, Hausa compris, y compris dans la gamification (noms de badges, ligues, notifications).
7. **La base fait foi** : XP, séries et certificats sont calculés côté serveur. Le client est optimiste mais jamais autoritaire.

---

## 2. Périmètre v1

### Dans la v1

| Domaine | Fonctionnalités |
|---|---|
| Accueil | Onboarding (langue, objectif, niveau, objectif quotidien, rappel), inscription/connexion e-mail, Google, Apple, mot de passe oublié, suppression de compte |
| Catalogue | Rubriques → modules → leçons, vidéo d'intro de module, parcours visuel du module |
| Lecteur | Leçon par étapes : vidéo, explication, exemple « devine puis révèle », mise en pratique, QCM, vrai/faux, texte à trous, remise en ordre, association, réflexion, récap |
| Gamification | XP, niveaux, objectif quotidien, série + gel de série, 3 quêtes du jour, badges, ligue hebdomadaire, classement de mon organisation |
| Révision | Session de révision (glossaire + questions ratées) en répétition espacée (Leitner) |
| Certificats | Émission auto à la fin d'un module, liste, PDF, partage WhatsApp/LinkedIn, lien de vérification public |
| Bourses | Saisie d'un code de bourse (RPC existante), deep link `karatou://redeem/CODE` |
| Hors ligne | Téléchargement d'un module (textes + exercices + images), file de synchronisation |
| Notifications | Locales : rappel quotidien, « ta série est en danger » à 20 h |
| Transverse | FR/EN/HA, analytics produit, Sentry, accessibilité AA |

### Hors v1 (v1.1 et après)

- Espaces entreprise et admin, studio de leçons : restent sur le web (l'app affiche un lien).
- Tuteur IA conversationnel (« Comment puis-je t'aider ? » de Brilliant/Mimo) : v1.1, via une Edge Function.
- Amis, séries entre amis, quêtes d'amis.
- Notifications push serveur (résultat de ligue) : v1.1.
- Monnaie virtuelle et boutique.
- Vidéos téléchargeables : impossible avec YouTube (CGU) ; v2 avec hébergement vidéo propre.
- Mode sombre : tokens prêts dès la v1, activation en v1.1.
- Synchronisation des notes de pratique/réflexion (aujourd'hui en localStorage sur le web).

---

## 3. Benchmark UX (Mobbin)

> **DataCamp n'est pas référencé sur Mobbin** (vérifié, recherches écrans et flows vides).
> Ses patterns sont couverts par **Mimo** (même modèle : parcours + XP + exercices à
> trous) et par Udemy/Skillshare pour la page de cours vidéo.

### 3.1 ADN à reprendre de chaque app

| App | Ce qu'on reprend | Ce qu'on ne reprend pas |
|---|---|---|
| **DataCamp** (connu, hors Mobbin) | Vidéo courte puis exercices immédiats ; XP par exercice ; objectif XP quotidien ; « Continuer » en une touche ; mode révision | Exercices de code au clavier |
| **Brilliant** | Leçon plein écran, barre de progression segmentée ; une idée par écran ; manipuler avant d'expliquer ; bouton « Vérifier » puis feuille de feedback ; parcours vertical en niveaux ; écran de fin avec XP + score ; confirmation avant de quitter | Système d'énergie qui limite les leçons |
| **Mimo** | En-tête XP + série toujours visible ; parcours en nœuds (fait / en cours / verrouillé) ; feedback « C'est juste ! » avec mascotte ; onglet Pratique | 5 onglets (on en garde 4) |
| **Duolingo** | Série avec calendrier et gel ; célébration de série ; quêtes du jour ; ligues hebdomadaires avec zones de promotion/relégation ; leaderboard débloqué après N leçons | Vies/cœurs, pression agressive |
| **Udemy / Skillshare / LinkedIn Learning** | Page module : vidéo en tête, liste des leçons avec durée, état et téléchargement | Pages longues et denses |

### 3.2 Références par écran

| Écran Karatou | Références Mobbin |
|---|---|
| Bienvenue | [Brilliant – welcome](https://mobbin.com/screens/ed95bf0e-e7b0-46f5-af57-79e2e952c3aa) |
| Onboarding complet | [Brilliant – flow onboarding (15 écrans)](https://mobbin.com/flows/7ffbd4f0-78d1-49be-bf0d-9c90cac00e8c) |
| Niveau de départ | [Brilliant – quel est ton niveau](https://mobbin.com/screens/d03ae3af-6556-4411-b757-2207370eb9e3) |
| Moment de la journée | [Brilliant – grille](https://mobbin.com/screens/d9bf8e15-eb11-4908-b6fe-ac2cd7bce10e) |
| Objectif quotidien | [Ahead – minutes par jour](https://mobbin.com/screens/e4361a8e-e1b9-436f-b250-df7ecf4032cf) · [Insight Timer – jours consécutifs](https://mobbin.com/screens/580ddba5-e7ec-4532-8c2e-fa6077a2f2a5) |
| Plan d'apprentissage | [Brilliant – your learning plan](https://mobbin.com/screens/db53ade2-7e69-4ef1-959f-a04a3e17dfd6) |
| Accueil | [Brilliant – recommandé + Start](https://mobbin.com/screens/b47cf8dc-96b5-4abd-b18e-47620d761e52) · [Mimo – en-tête XP/série + parcours](https://mobbin.com/screens/f83964b8-5a63-4abf-bc32-726991f82a82) |
| Parcours du module | [Brilliant – niveau + Start](https://mobbin.com/screens/ab126790-340c-40d6-a92c-bbeaeb272bea) · [Brilliant – révision de niveau](https://mobbin.com/screens/fd4efbd9-32d7-4abb-b129-dd5d335245ad) · [Mimo – progression 58 %](https://mobbin.com/screens/e466340b-80ce-4a91-b557-14d55afcf4c9) · [Mimo – projet dans le parcours](https://mobbin.com/screens/f12436aa-f7a8-42b2-89e4-c88a361ed7ed) |
| Page module (vidéo + leçons) | [Udemy – leçons + téléchargement + quiz](https://mobbin.com/screens/49a75f85-dc70-43e0-b66e-09f1f6c7c69b) · [Skillshare](https://mobbin.com/screens/15e380f4-c72f-4706-b9d0-240ed6ba5ded) · [Acorns – leçons + « teste tes connaissances »](https://mobbin.com/screens/823d2426-7995-4546-8dda-ebe3414345ba) · [Tiimo – états « terminé »](https://mobbin.com/screens/4a3fa710-da4c-4017-8994-b269c1c65c61) |
| Étape « explication » | [Brilliant – graphique + Continuer](https://mobbin.com/screens/b1be59dc-63c9-47c2-a3fc-dbbbfddd4ecc) · [Mimo – intro](https://mobbin.com/screens/ff8a200a-125e-4eb2-b0f3-310463b5d2da) |
| Exercice manipulable | [Brilliant – blocs à taper + Vérifier](https://mobbin.com/screens/f332bf9f-b059-4b2d-89aa-c9226ace3557) |
| Texte à trous | [Ahead – fill in the blank](https://mobbin.com/screens/5967dc8e-fc20-4b10-910f-df0f675c804d) · [Vocabulary – fill the gap](https://mobbin.com/screens/a3538d35-c422-40ed-b571-121b4b16a4fb) |
| Feedback juste | [Brilliant – réussite + explication](https://mobbin.com/screens/e022666a-34f8-4241-8d48-9613e578b033) · [Mimo – « That's right »](https://mobbin.com/screens/f3bc2435-6420-49f2-af17-ba65409f4b76) |
| Feedback faux | [Brainly – « Ooops » + pourquoi](https://mobbin.com/screens/c06406ea-5d58-452e-8aa0-859d93219090) · [Speak – bonne réponse affichée](https://mobbin.com/screens/20e92afb-d1b9-47ed-8ef8-d2431ba3d88b) · [Alan](https://mobbin.com/screens/49f3790f-ac4e-4436-be11-6c9097aa08ec) |
| Quitter la leçon | [Brilliant – « Tu es sûr·e ? »](https://mobbin.com/screens/d7d7f00a-f59b-4bf2-acfb-8cb35b147154) |
| Fin de leçon | [Brilliant – XP + score](https://mobbin.com/screens/f5881118-ee68-4f94-b0fa-c56e9bffb6f0) |
| Célébration de série | [Duolingo – 6 jours](https://mobbin.com/screens/f6675d16-c6b5-4847-aa9f-fb66a2d61e88) |
| Écran série | [Duolingo – calendrier + objectif de série](https://mobbin.com/screens/fbef2d10-7767-41e4-8a9f-825e022ead13) |
| Quêtes du jour | [Duolingo – quêtes](https://mobbin.com/screens/f35dbc35-4569-483e-9d66-cc3a7832b8f2) · [Duolingo – toutes terminées](https://mobbin.com/screens/d530dada-6595-4901-8541-1895451c7863) |
| Ligue | [Duolingo – ligue](https://mobbin.com/screens/aea875c3-ba2c-4a72-928c-1cef67817142) · [Duolingo – résultat de la semaine](https://mobbin.com/screens/99e7f2d1-6876-4848-b5cf-dbd596d2e0ce) · [Duolingo – ligue verrouillée](https://mobbin.com/screens/baeadfed-3790-43a8-b6f7-0afd4e4368a1) · [Sweatcoin – podium + filtres](https://mobbin.com/screens/fb5005f6-a445-4483-a1ec-8ddd13eeddfc) |
| Profil, badges | [Cal AI – série + badges](https://mobbin.com/screens/40849b04-f210-49aa-8144-e830e38a2710) · [Brainly – rang suivant](https://mobbin.com/screens/958f4b13-5969-4a5d-84a3-3cc75c0628ee) · [Citi Bike – succès à vie](https://mobbin.com/screens/e6736ec2-07d7-4e10-9e0b-66aa8b8f56e7) |
| Pratique / révision | [Mimo – onglet Practice](https://mobbin.com/screens/e57a9a4c-95b8-479c-9bef-b86f67c757e0) |
| Téléchargement hors ligne | [Insight Timer – feuille « hors ligne »](https://mobbin.com/screens/d12b2f50-d9b9-4410-9140-7bb4c84bc05b) · [Brink – écran Téléchargements](https://mobbin.com/screens/e8ebf722-ccbd-4321-beba-55d4780bb98e) |
| Tuteur IA (v1.1) | [Brilliant – explication du tuteur](https://mobbin.com/screens/fa56eca9-cb28-4ed8-bc7b-115d4531df04) · [Mimo – indice IA](https://mobbin.com/screens/eb925543-60b5-4dbd-8c6a-954146f8a1a4) |

---

## 4. Architecture de l'information

**4 onglets** : Accueil · Apprendre · Ligue · Profil. Le lecteur de leçon est une modale plein écran, sans barre d'onglets.

```
(onboarding)  bienvenue → langue → objectif → niveau → moment → objectif quotidien → rappel → plan → inscription
(auth)        connexion · inscription · mot de passe oublié · nouveau mot de passe (deep link)
(tabs)
 ├─ Accueil    en-tête (série, XP du jour, niveau) · Continuer · objectif du jour · quêtes · Réviser · recommandations
 ├─ Apprendre  rubriques (chips) → modules → Module (parcours) → feuille leçon → Lecteur
 ├─ Ligue      ligue de la semaine · onglet « Mon organisation » (si membre)
 └─ Profil     stats · badges · certificats · série · paramètres · code de bourse · téléchargements
Modales       Lecteur · Fin de leçon · Série · Badge débloqué · Résultat de ligue · Certificat obtenu
```

Deep links (schéma `karatou://` + liens universels sur `course.karatou.academy`) :
`/learn/:moduleSlug`, `/learn/:moduleSlug/:courseId`, `/certificates`, `/redeem/:code`, `/auth/callback`, `/reset-password`.

---

## 5. Écrans v1

Tous les écrans gèrent 4 états : chargement (squelette), vide, hors ligne, erreur (avec « Réessayer »).

| # | Écran | Contenu clé | Notes |
|---|---|---|---|
| E01 | Bienvenue | Logo, promesse, « Commencer », « J'ai déjà un compte » | Choix de langue visible dès cet écran (FR/EN/HA) |
| E02 | Onboarding | 6 questions, 1 par écran, barre de progression, illustration | Réponses stockées localement puis envoyées après inscription (`karatou_update_learning_prefs`) |
| E03 | Inscription / connexion | E-mail + mot de passe, Google, Apple ; nom complet, pays (16 pays d'Afrique de l'Ouest + « Autre »), genre facultatif | Mêmes métadonnées que le web (`full_name`, `country`, `gender`) pour que le trigger crée le profil. Confirmation e-mail via deep link |
| E04 | Accueil | Série 🔥, XP du jour / objectif (anneau), niveau ; carte « Continuer » ; 3 quêtes ; carte « Réviser (n cartes) » ; modules recommandés | Une seule action principale : Continuer |
| E05 | Apprendre | Chips de rubriques, cartes de modules (emoji, dégradé, durée, nb leçons, % progression, badge « certifiant ») | |
| E06 | Module (parcours) | En-tête (titre, progression, vidéo d'intro), parcours vertical de nœuds, nœud final « Certificat » | Nœud = fait (or ✓), en cours (bleu, halo animé), à venir (gris). Déverrouillé si fait OU précédent fait |
| E07 | Feuille leçon | Titre, durée, XP à gagner, langue de la vidéo, « Commencer », « Télécharger » | Bottom sheet |
| E08 | Lecteur | ✕, barre segmentée, étape, CTA « Vérifier » puis « Continuer », feuille de feedback | Voir §6. Quitter → confirmation (progression de la leçon perdue, pas l'XP déjà acquis) |
| E09 | Fin de leçon | XP gagné (détail), précision, durée, série +1 animée, quêtes avancées, badge éventuel | Lottie + haptique |
| E10 | Série | Calendrier du mois, record, gels disponibles, règle expliquée | |
| E11 | Ligue | Tier + compte à rebours, liste classée (zones promotion/relégation colorées), ma ligne épinglée ; onglet Organisation | Verrouillée tant que < 3 leçons terminées |
| E12 | Profil | Avatar, nom, pays, niveau + barre vers le suivant, stats (XP total, série record, leçons, certificats), badges (grille), raccourcis | |
| E13 | Badge | Illustration, nom, critère, date d'obtention ou progression | |
| E14 | Certificats | Liste (actif/expiré), détail : PDF, partager, copier le lien de vérification | Émission auto quand un module est fini |
| E15 | Paramètres | Langue, objectif quotidien, heure du rappel, notifications, visibilité dans les classements, vidéos en Wi-Fi uniquement, téléchargements, compte, mot de passe, **supprimer mon compte**, CGU, confidentialité | Suppression obligatoire pour l'App Store |
| E16 | Révision | Session de 10 cartes (glossaire + questions ratées), mêmes composants que le lecteur | |
| E17 | Téléchargements | Modules téléchargés, taille, supprimer | |
| E18 | Code de bourse | Saisie du code, résultat (`redeemed`, `invalid`, `expired`…) | RPC existante `karatou_redeem_scholarship` |

---

## 6. Moteur de leçon interactive (cœur Brilliant)

### 6.1 Principe

Une leçon = une suite d'**étapes** (`Step[]`). Deux sources, par ordre de priorité :

1. **Étapes rédigées** : nouvelle colonne `karatou_courses.interactive_steps` (`{fr, en, ha}: Step[]`). Exercices pensés pour mobile (texte à trous, remise en ordre…).
2. **Étapes dérivées automatiquement** du `LessonContent` existant par l'adaptateur `lessonToSteps()`. Toutes les leçons sont donc jouables dès le jour 1, sans réécriture.

On ajoute une colonne séparée plutôt qu'un champ dans `lesson_content` : le studio web réécrit `lesson_content` en entier à chaque sauvegarde et effacerait des champs qu'il ne connaît pas.

### 6.2 Types d'étapes

```ts
type Lang = 'fr' | 'en' | 'ha';
type Option = { key: string; text: string };

type Step =
  | { type: 'intro';          id: string; title: string; objective: string; estMinutes: number }
  | { type: 'video';          id: string; youtubeId: string; videoLang: Lang }
  | { type: 'explain';        id: string; title?: string; body: string; imageUrl?: string }
  | { type: 'predict_reveal'; id: string; challenge: string; solution: string; impact: string }
  | { type: 'checklist';      id: string; title: string; items: string[]; observation: string }
  | { type: 'mcq';            id: string; prompt: string; options: Option[]; answer: string; explanation: string }
  | { type: 'multi';          id: string; prompt: string; options: Option[]; answers: string[]; explanation: string }
  | { type: 'true_false';     id: string; statement: string; answer: boolean; explanation: string }
  | { type: 'fill_blank';     id: string; template: string /* "Un {{0}} suit des {{1}}" */; bank: string[]; answer: string[]; explanation: string }
  | { type: 'order';          id: string; prompt: string; itemsInOrder: string[]; explanation: string }
  | { type: 'match';          id: string; prompt: string; pairs: { left: string; right: string }[] }
  | { type: 'reflection';     id: string; prompt: string }
  | { type: 'recap';          id: string; points: string[] };

const GRADED = ['mcq', 'multi', 'true_false', 'fill_blank', 'order', 'match'] as const;
```

### 6.3 Dérivation automatique depuis `LessonContent`

| Champ existant | Étape(s) générée(s) |
|---|---|
| `title`, `objective` | `intro` (durée = `karatou_courses.duration`) |
| `video[lang]` (repli `fr`) | `video`, avec la pastille « Vidéo en français » si repli. Sautée si vide ou hors ligne |
| `content[]` | Une `explain` par paragraphe (`body` découpé sur `\n\n`, ~60 mots max par carte). **Après chaque section, une question du quiz est insérée** (questions réparties dans l'ordre) |
| `example` | `predict_reveal` : on lit le défi, on réfléchit, puis on touche « Révéler » |
| `practice` | `checklist` (cases à cocher + observation) |
| `quiz[]` restantes | `mcq` (clés `A`–`D` ou `a`–`d`, comparaison exacte comme sur le web) |
| `glossary[]` | `match` (jusqu'à 4 paires terme ↔ définition) + ajout au paquet de révision |
| `reflection` | `reflection` (texte libre, non noté, stocké localement en v1) |
| titres des sections | `recap` |

### 6.4 Boucle d'une étape notée

1. L'apprenant répond, puis touche **Vérifier**.
2. **Juste** : feuille verte, haptique « success », micro-animation « +2 XP », bouton **Continuer**.
3. **Faux** : feuille rouge, haptique « error », explication, bouton **Réessayer** (une fois). Au second échec : la bonne réponse s'affiche et la question est **reposée en fin de leçon** (boucle de maîtrise).
4. Résultat de l'étape enregistré dans `stepResults` : `firstTry | afterRetry | failed`.

La leçon est **terminée** quand toutes les étapes sont passées ; une question ratée qui a été reposée compte comme passée.

### 6.5 Architecture du code

- `src/lesson-engine/` : TypeScript pur (types, `lessonToSteps`, notation, machine d'état de session). Couverture ≥ 90 %.
- `components/lesson/StepRenderer.tsx` : un composant par type d'étape.
- Session en cours dans Zustand, persistée (reprise après un appel entrant ou un kill de l'app).
- `app/dev/steps.tsx` : galerie de toutes les étapes avec des données factices (QA visuelle).

### 6.6 Production du contenu interactif (piste contenu)

- Étendre le skill `karatou-course-creator` et l'Edge Function `admin-generate-lesson` (nouvelle action `steps`) pour produire `interactive_steps` à partir d'une leçon existante.
- Pilote : 1 leçon par module (8 leçons) en S5, puis génération des 52 leçons × 3 langues.
- Relecture humaine du FR ; validation du Hausa par un locuteur natif (déjà signalé « à valider » sur le web).

---

## 7. Gamification

### 7.1 XP

| Événement | XP | Source |
|---|---|---|
| Leçon terminée (1ʳᵉ fois) | 20 | Trigger sur `karatou_learner_progress` : **compte aussi sur le web** |
| Étape notée juste du premier coup | 2 | Mobile (tentative) |
| Étape notée juste après une seconde chance | 1 | Mobile |
| Leçon parfaite (tout du premier coup) | +10 | Mobile |
| Vidéo regardée à ≥ 80 % | 5 | Mobile |
| Leçon rejouée | 25 % du bonus, pas les 20 XP | Mobile |
| Session de révision (10 cartes) | 10 | Mobile |
| Quête du jour | 10 chacune, +20 si les 3 sont faites | Serveur |
| Certificat obtenu | 100 | Trigger sur `karatou_certificates` |

Une leçon rapporte environ 45 XP.

### 7.2 Niveaux

Le niveau *n* demande `25 × n × (n − 1)` XP cumulés : N2 = 50, N3 = 150, N5 = 500, N10 = 2 250. Le catalogue actuel (52 leçons) mène vers le niveau 9 ou 10.

### 7.3 Objectif quotidien et série

- **Objectifs** : Léger 30 XP (~1 leçon), Régulier 60 XP, Intense 100 XP.
- **Jour actif** = au moins 1 leçon terminée OU 1 session de révision, compté dans le **fuseau de l'apprenant** (`timezone`, par défaut `Africa/Niamey`).
- **Série** : +1 par jour actif consécutif. Calcul paresseux, sans tâche planifiée : à chaque événement, on compare `last_active_date` avec la date du jour.
- **Gel de série** : 1 gel gagné tous les 7 jours de série, 2 en stock au maximum, consommé automatiquement pour couvrir un jour manqué.
- **Hors ligne** : la date de l'activité est celle du client si elle date de moins de 72 h et n'est pas dans le futur ; sinon, celle du serveur.

### 7.4 Quêtes du jour

Chaque jour, 3 quêtes sont tirées de façon déterministe (hash utilisateur + date) dans ce pool :

- gagner 30 / 50 XP
- terminer 1 / 2 leçons
- 5 bonnes réponses du premier coup
- regarder une vidéo en entier
- faire une session de révision
- atteindre l'objectif quotidien

### 7.5 Badges v1 (17)

Les noms et descriptions sont stockés en FR/EN/HA dans `karatou_badges`.

| Catégorie | Badges |
|---|---|
| Démarrage | Premier pas (1ʳᵉ leçon) |
| Régularité | Série de 3, 7, 30, 100 jours |
| Qualité | Sans faute (5 leçons parfaites) |
| Volume | 10 leçons, 50 leçons, Marathon (5 leçons dans la journée) |
| Accomplissement | Module bouclé, Certifié·e (1ᵉʳ certificat) |
| Exploration | Explorateur·rice (1 leçon dans chaque rubrique publiée), Polyglotte (leçons dans 2 langues) |
| Habitudes | Lève-tôt (leçon avant 7 h), Oiseau de nuit (après 22 h) |
| Ligue | Podium (top 3), Promu·e |

### 7.6 Ligues hebdomadaires

- **Semaine** : du lundi 00:00 au dimanche 23:59 UTC. Groupes de 20 apprenants du même tier, formés à la 1ʳᵉ XP de la semaine.
- **Tiers** : Bronze → Argent → Or → Saphir → Diamant (noms à thématiser, voir §13).
- **Clôture** (pg_cron, lundi 00:05 UTC) : top 5 promus, 3 derniers relégués si le groupe compte au moins 10 membres.
- **Faible population** : moins de 5 actifs dans un tier → fusion avec le tier voisin ; moins de 10 actifs au total → simple « classement de la semaine », sans promotion.
- **Déverrouillage** après 3 leçons terminées.
- **Onglet « Mon organisation »** : classement hebdomadaire des membres de la même organisation (`karatou_org_memberships`). Utile pour le PNUD et les cohortes de boursiers.
- **Vie privée** : affichage « Prénom N. » + avatar + drapeau du pays ; option « Masquer mon profil des classements ».

### 7.7 Décisions assumées

- **Pas de vies ni d'énergie** : on ne bloque pas un apprenant qui paie sa data pour apprendre.
- **Pas de monnaie virtuelle** en v1 : les récompenses sont de l'XP et des badges.
- **Anti-triche** : le serveur plafonne les compteurs (bonnes réponses ≤ étapes notées ≤ 30) ; chaque tentative est idempotente (UUID client) ; l'XP de complétion n'est accordé qu'une fois par leçon.

---

## 8. Données partagées et backend

### 8.1 Principes

1. **Un seul projet Supabase** (« Karatou Academy »), donc les mêmes `auth.users`.
2. **Migrations uniquement dans le repo web.** Le repo mobile génère ses types (`supabase gen types typescript`).
3. **Le mobile n'utilise que** les tables `karatou_*`, `profiles` et `newsletter_subscribers`. Les tables héritées (`modules`, `courses`, `certificates`, `user_progress`…) sont ignorées.
4. **Logique métier en base** : la gamification est déclenchée par des triggers sur les tables que le web écrit déjà. Le web gagne de l'XP et des séries sans modification lourde.

### 8.2 Existant réutilisé tel quel

| Objet | Usage mobile |
|---|---|
| `karatou_rubriques`, `karatou_modules`, `karatou_courses` | Lecture du catalogue publié (RLS déjà publique). `lesson_content->{lang}` lu leçon par leçon |
| `karatou_learner_progress` | Lecture de sa progression. Écriture via la nouvelle RPC (qui fait l'upsert) |
| `karatou_certificates` | Lecture de ses certificats |
| RPC `karatou_issue_certificate(input_module_slug)` | Émission à la fin d'un module (idempotente) |
| RPC `karatou_verify_certificate(input_uid)` | Lien public `https://verify.karatou.academy/verify/<UID>` |
| RPC `karatou_redeem_scholarship(input_code)` | Écran code de bourse |
| `profiles` | Colonnes modifiables : `full_name, country, city, region, gender, phone, age_range, avatar_url, preferred_language` (`role` ne l'est pas) |
| Trigger `create_karatou_profile_for_new_user` | Crée le profil depuis les métadonnées d'inscription |
| Rôles (`app_metadata.role`) | L'app mobile est réservée aux apprenants. Un compte admin voit l'expérience apprenant et un lien « Ouvrir l'espace admin sur le web » |

### 8.3 Nouveaux objets (migrations dans le repo web)

| Table | Colonnes principales | RLS |
|---|---|---|
| `karatou_learner_stats` | `user_id` PK, `total_xp`, `level`, `current_streak`, `longest_streak`, `last_active_date date`, `streak_freezes smallint`, `daily_goal_xp` (30/60/100), `timezone text default 'Africa/Niamey'`, `league_tier smallint`, `show_in_leaderboards bool`, `onboarding jsonb` (objectif, niveau, moment), `updated_at` | SELECT soi-même ; écriture via RPC uniquement |
| `karatou_xp_events` | `id bigserial`, `user_id`, `amount`, `reason` (enum texte), `ref text`, `local_date date`, `occurred_at`, **unique `(user_id, reason, ref)`** | SELECT soi-même ; aucune écriture client |
| `karatou_lesson_attempts` | `id uuid` PK (fourni par le client = idempotence), `user_id`, `module_slug`, `course_id`, `language`, `platform` (ios/android/web), `started_at`, `finished_at`, `graded_steps`, `correct_first_try`, `correct_after_retry`, `video_watched bool`, `duration_seconds`, `step_results jsonb` | SELECT soi-même + admin d'organisation (comme la progression) |
| `karatou_daily_quests` | `user_id`, `quest_date`, `quest_key`, `target`, `progress`, `completed_at`, PK `(user_id, quest_date, quest_key)` | SELECT soi-même |
| `karatou_badges` | `key` PK, `name jsonb {fr,en,ha}`, `description jsonb`, `icon`, `category`, `criteria jsonb`, `display_order` | Lecture publique |
| `karatou_user_badges` | `user_id`, `badge_key`, `earned_at`, PK `(user_id, badge_key)` | SELECT soi-même |
| `karatou_league_groups` | `id`, `week_start date`, `tier`, `created_at` | Via RPC |
| `karatou_league_members` | `group_id`, `user_id`, `week_start`, `weekly_xp`, `final_rank`, `outcome` (promoted/stayed/demoted), unique `(user_id, week_start)` | Via RPC |
| `karatou_review_items` | `user_id`, `item_key` (`gloss:c1:<terme>` / `q:c1:3`), `module_slug`, `course_id`, `kind`, `box smallint` (Leitner 1–5), `due_date`, `last_result`, PK `(user_id, item_key)` | SELECT soi-même ; écriture via RPC |

Colonne ajoutée : `karatou_courses.interactive_steps jsonb null` (`{fr,en,ha}: Step[]`), avec un contrôle de taille (≤ 400 ko, comme `lesson_content`).

### 8.4 Fonctions et triggers

| Objet | Type | Rôle |
|---|---|---|
| `app_private.karatou_apply_xp(user, amount, reason, ref, at)` | Interne | Insère l'événement (`ON CONFLICT DO NOTHING`), met à jour les stats (total, niveau, série, gel), l'XP de ligue de la semaine, les quêtes et les badges. **Point d'entrée unique** de toute la gamification |
| Trigger `AFTER INSERT` sur `karatou_learner_progress` | Trigger | +20 XP « lesson_completed » (ref = `course_id`). Se déclenche pour le web comme pour le mobile ; un upsert qui tombe en conflit ne refait pas l'insertion |
| Trigger `AFTER INSERT` sur `karatou_certificates` | Trigger | +100 XP, badge « Certifié·e » |
| `karatou_record_lesson_attempt(payload jsonb)` | RPC, security definer | Valide le cours (publié, module publié), enregistre la tentative (idempotente), fait l'upsert de la progression (→ trigger), ajoute les bonus plafonnés. Renvoie `{xp_breakdown, total_xp, level, level_up, streak, streak_extended, daily_goal, quests, new_badges, module_completed}` |
| `karatou_get_learner_home()` | RPC | Stats, état de la série (`active`, `at_risk`, `broken` ; calcul paresseux), quêtes du jour (créées à la volée), aperçu de ligue, nombre de cartes à réviser |
| `karatou_get_streak_calendar(month date)` | RPC | Jours actifs du mois (depuis `karatou_xp_events.local_date`) |
| `karatou_get_league()` | RPC | Classement de mon groupe : nom affiché, avatar, pays, XP de la semaine, zones |
| `karatou_get_org_leaderboard(org_id)` | RPC | Réservé aux membres de l'organisation, champs limités |
| `karatou_update_learning_prefs(jsonb)` | RPC | Objectif quotidien, fuseau, visibilité, réponses d'onboarding |
| `karatou_record_review(results jsonb)` | RPC | Met à jour les boîtes Leitner et accorde l'XP de révision |
| `karatou_close_league_week()` | pg_cron | Clôture la semaine (non exécutable par les clients) |
| Edge Function `delete-account` | Service role | Supprime l'utilisateur Auth (cascade) — exigence Apple et Google |

Tests SQL dans le style de `scripts/verify-cross-org-rls.sql` : idempotence de l'XP, série sur changement de fuseau, gel, plafonds anti-triche, isolation RLS.

### 8.5 Tâches côté repo web (piste B)

| # | Tâche | Priorité |
|---|---|---|
| **B1** | **Backfill** de `karatou_courses.lesson_content` pour les 52 leçons depuis le registre TS (`scripts/backfill-lesson-content.mjs`, avec `--dry-run`), et des `translations` EN/HA des modules 5–8 | Bloquant avant S3 |
| B2 | Migrations et RPC de la gamification (§8.3, §8.4) + tests SQL | Avant S6 |
| B3 | Correctif : `karatou_issue_certificate` compte aussi les cours en brouillon, ce qui bloquerait la certification → filtrer sur `status = 'published'` | Avant S7 |
| B4 | Confidentialité : `karatou_verify_certificate` renvoie `user_id` aux anonymes → retirer la colonne | Avant S7 |
| B5 | Edge Function `delete-account` | Avant S2 |
| B6 | Opérateur : ajouter `karatou://auth/callback` et `karatou://reset-password` aux Redirect URLs Supabase Auth ; activer les fournisseurs Google et Apple | Avant S2 |
| B7 | Web : remplacer la série codée en dur (`Dashboard.tsx`, valeur `5`) par `karatou_get_learner_home()` et afficher XP/niveau | Après B2 |
| B8 | Studio de leçons : lire et éditer `interactive_steps` | v1.1 |

### 8.6 Accès aux données depuis le mobile

```ts
// Catalogue (léger, mis en cache 24 h)
supabase.from('karatou_modules')
  .select('id,slug,title,subtitle,description,emoji,color,duration,level,is_free,display_order,translations,intro_video,rubrique_id,' +
          'karatou_courses(id,title,duration,description,display_order,translations,status)')
  .eq('status', 'published').order('display_order');

// Corps d'une leçon (à la demande ou au téléchargement du module)
supabase.from('karatou_courses')
  .select(`id, body:lesson_content->${lang}, steps:interactive_steps->${lang}`)
  .eq('id', courseId).single();

// Fin de leçon (via la file hors ligne, idempotente)
supabase.rpc('karatou_record_lesson_attempt', { payload: attempt });

// Fin de module
supabase.rpc('karatou_issue_certificate', { input_module_slug: slug });
```

**Hors ligne** :
- Cache TanStack Query persisté dans MMKV.
- Téléchargement d'un module = corps et étapes de toutes ses leçons dans les 3 langues (pour changer de langue hors ligne) + images.
- File d'envoi `offlineQueue` vidée à la reconnexion. L'XP s'affiche « en attente de synchronisation » tant que le serveur n'a pas répondu.

---

## 9. Stack technique mobile

| Domaine | Choix | Pourquoi |
|---|---|---|
| Framework | **Expo** (SDK stable le plus récent), React Native, Hermes | Un seul code iOS/Android, mises à jour OTA (EAS Update) précieuses quand les stores sont lents |
| Navigation | **Expo Router** (routes typées) | Deep links natifs |
| Langage | TypeScript strict | Mêmes types que le web |
| UI | **NativeWind** + composants maison | Reprend les tokens Tailwind du web |
| Animations | Reanimated, Gesture Handler, **lottie-react-native**, expo-haptics | Glisser-déposer (ordre, association), célébrations |
| Feuilles | @gorhom/bottom-sheet | Feedback, feuille leçon |
| Listes | FlashList | Performance sur Android d'entrée de gamme |
| Données serveur | **@supabase/supabase-js** + TanStack Query (persisté dans react-native-mmkv) | Cache hors ligne |
| État local | Zustand (session de leçon) | Simple, persistable |
| Session Auth | supabase-js + AsyncStorage (ou le modèle « LargeSecureStore » si on veut chiffrer) | Méthode recommandée par Supabase pour Expo |
| Connexion sociale | `signInWithIdToken` (Google natif, `expo-apple-authentication`) | |
| Vidéo | **react-native-youtube-iframe** (toutes les vidéos actuelles sont des liens YouTube embed) ; expo-video plus tard pour des vidéos hébergées | Suivi du % regardé pour l'XP |
| i18n | i18next + react-i18next + expo-localization | Reprise des ~500 clés de `src/data/translations.ts` |
| Formulaires | react-hook-form + zod | |
| PDF certificat | expo-print (gabarit HTML + QR) + expo-sharing | Plus simple que pdf-lib en React Native |
| Notifications | expo-notifications (locales en v1) | Pas de backend nécessaire |
| Analytics | **PostHog** (posthog-react-native, cloud UE) | Umami, utilisé par le web, n'a pas de SDK natif |
| Erreurs | @sentry/react-native | Aligné sur le web (`sendDefaultPii: false`) |
| Tests | Jest + Testing Library ; **Maestro** pour l'E2E | |
| CI/CD | GitHub Actions (lint, typecheck, tests) ; EAS Build, Submit et Update | |

Variables d'environnement : `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_VERIFY_BASE_URL` (`https://verify.karatou.academy`). Jamais de `service_role`.

### Événements analytics v1

`onboarding_step_completed {step}` · `signup_completed {method}` · `lesson_started {module, course, lang, source}` · `step_answered {type, result}` · `lesson_completed {module, course, accuracy, duration_s, xp}` · `lesson_abandoned {step_index}` · `streak_extended {length}` · `streak_broken {length}` · `daily_goal_reached` · `quest_completed {key}` · `badge_earned {key}` · `league_viewed` · `certificate_issued {module}` · `certificate_shared {channel}` · `module_downloaded {module, size_kb}` · `review_session_completed {cards}` · `scholarship_redeemed {result}`.

---

## 10. Design system

Base : les tokens de la web app (`tailwind.config.js`), adaptés au mobile. **Une seule source** : le favicon et le manifest PWA du web (`#0b1c4b`, `#1E3A8A`, `#F4B400`) divergent des tokens et seront réalignés.

### 10.1 Couleurs

| Rôle | Token | Hex |
|---|---|---|
| Primaire (actions, en cours) | blue-500 | `#1A73E8` |
| Primaire pressé / bord 3D | blue-700 | `#1035A0` |
| Fond sombre, en-têtes immersifs | blue-900 | `#0A1628` |
| Fond clair | blue-50 / gray-50 | `#F0F7FF` / `#F9FAFB` |
| Récompense, XP, nœud terminé | gold-400 | `#F5A623` |
| Série 🔥 | orange-500 | `#F97316` |
| Juste | emerald-500 / fond emerald-50 | `#10B981` / `#ECFDF5` |
| Faux | red-500 / fond red-50 | `#EF4444` / `#FEF2F2` |
| Gel de série | cyan-500 | `#06B6D4` |
| Texte | gray-900 / gray-500 | `#111827` / `#6B7280` |

Dégradés repris : bleu `#1A73E8 → #1A52CC`, or `#F5A623 → #E8960C`, sombre `#0A1628 → #0D2245`.
Les couleurs de modules et de rubriques sont stockées comme classes Tailwind (`from-blue-800 to-blue-600`) : une table de correspondance `theme/moduleGradients.ts` les traduit pour `expo-linear-gradient`.

### 10.2 Typographie

Titres en **Literata**, texte en **Inter**, codes et UID de certificat en **DM Mono** (toutes sur Google Fonts, via `@expo-google-fonts`).

| Token | Taille / interligne | Graisse |
|---|---|---|
| display | 32 / 38 | 700 Literata |
| h1 | 26 / 32 | 700 Literata |
| h2 | 22 / 28 | 700 Literata |
| h3 | 18 / 24 | 600 Inter |
| body-lg (lecteur) | 17 / 28 | 400 Inter |
| body | 15 / 24 | 400 Inter |
| label | 13 | 500 Inter |
| meta | 12 | 400 Inter |
| eyebrow | 11, majuscules, espacement 0.08em | 600 Inter |

Les tailles respectent le réglage de police du système (Dynamic Type), avec un plafond ×1,3 dans le lecteur.

### 10.3 Composants clés

- **Bouton principal « 3D »** (Brilliant/Duolingo) : hauteur 52, rayon 16, bordure basse de 4 px plus foncée, s'enfonce à l'appui.
- **Nœud de parcours** 64 px : terminé (or ✓), en cours (bleu + halo pulsé + bulle « Commencer »), à venir (gris), évaluation finale (trophée), certificat (médaille).
- **Barre de progression segmentée** (lecteur), **anneau d'objectif quotidien**, **pastille XP**, **flamme de série** (grise si inactive aujourd'hui).
- **Feuille de feedback** (verte ou rouge), **carte module** (dégradé + emoji), **ligne de classement** (rang, avatar, nom, drapeau, XP, zone).
- **Mascotte** : à décider (§13). Par défaut, la tuile « K » or sur fond bleu du logo, animée.

### 10.4 Mouvement et accessibilité

- Célébrations Lottie (fin de leçon, série, badge, promotion de ligue), haptique à chaque Vérifier.
- Le réglage « Réduire les animations » est respecté.
- Contraste AA, cibles ≥ 44 pt, libellés d'accessibilité, ordre de lecture logique dans les exercices.

---

## 11. Plan de réalisation jusqu'à la v1 complète

Durées indicatives : 1 à 2 semaines par sprint avec Claude Code. Chaque sprint = une branche + une PR.

**Definition of Done commune** :
- lint, typecheck et tests au vert ;
- textes FR/EN/HA ;
- testé sur un Android d'entrée de gamme (2 Go de RAM) et un iPhone ;
- états chargement / vide / hors ligne / erreur présents ;
- captures d'écran dans la PR ;
- aucun nouveau crash dans Sentry.

### Phase 0 — UX/UI à partir de Mobbin (1 à 2 semaines)

| # | Livrable |
|---|---|
| 0.1 | Collection Mobbin « Karatou Mobile v1 » : 3 à 5 références par écran du §5 (point de départ : §3.2) |
| 0.2 | 4 parcours utilisateur annotés : 1ʳᵉ ouverture → 1ʳᵉ leçon ; retour quotidien ; leçon ratée puis réussie ; module fini → certificat partagé |
| 0.3 | Wireframes basse fidélité des 18 écrans (Figma ou Magic Patterns) |
| 0.4 | Tokens + 6 écrans haute fidélité : Accueil, Parcours, Étape explication, Étape exercice + feedback, Fin de leçon, Ligue |
| 0.5 | Test du prototype cliquable avec 5 apprenants (dont 2 hausaphones) ; ajustements |
| 0.6 | Décisions du §13 tranchées |

### Piste B — Backend (repo web, en parallèle de S1 à S5)

Tâches B1 à B7 du §8.5. **B1 bloque S3**, B5 et B6 bloquent S2, B2 bloque S6.

### Sprints mobiles

| Sprint | Objectif | Livrables | Critères d'acceptation |
|---|---|---|---|
| **S1 Fondations** | Socle technique | Repo, Expo + Router, EAS (dev/preview/prod), CI, NativeWind + tokens + polices, i18n FR/EN/HA (test de parité des clés), client Supabase, Sentry, PostHog, kit UI (Button, Card, Chip, ProgressBar, Sheet, Avatar), écran `dev/` | Build Android et iOS installable ; changement de langue à chaud |
| **S2 Onboarding + Auth** | Entrer dans l'app | E01–E03, deep links de confirmation et de réinitialisation, Google + Apple, profil, suppression de compte, gestion des rôles | Un compte créé sur mobile se connecte sur le web, et inversement ; profil créé par le trigger |
| **S3 Catalogue + Parcours** | Trouver sa leçon | E04 (v0 : carte Continuer), E05, E06, E07, vidéo d'intro de module, cache persisté | Progression faite sur le web visible sur mobile ; catalogue consultable en mode avion après une 1ʳᵉ ouverture |
| **S4 Lecteur, partie 1** | Jouer une leçon existante | `lesson-engine` (types, `lessonToSteps`, notation, machine d'état), lecteur E08, étapes intro, video, explain, predict_reveal, checklist, mcq, reflection, recap ; E09 local ; enregistrement de la progression | Les 52 leçons sont jouables en 3 langues ; leçon finie sur mobile = cochée sur le web |
| **S5 Lecteur, partie 2 (Brilliant)** | Apprendre en manipulant | Étapes match, fill_blank, order, true_false, multi ; seconde chance + question reposée ; haptique, animations ; galerie dev ; `interactive_steps` pilotes (1 leçon par module) | Pilote : 8 leçons avec au moins 4 types d'exercices ; test utilisateur ≥ 4/5 en « clair » |
| **S6 Gamification** | Revenir chaque jour | Branchement de `karatou_record_lesson_attempt`, XP, niveaux, objectif quotidien, série + gel + E10, quêtes, célébrations, badges (E13), Profil (E12) | XP identique entre affichage optimiste et serveur ; aucun XP en double après 3 renvois de la même tentative |
| **S7 Ligue, certificats, révision** | Se mesurer, être reconnu | E11 (ligue + organisation + résultat de la semaine), E14 (émission, PDF, partage, vérification), E16 (Leitner), E18 (bourse) | Certificat émis sur mobile vérifiable sur `verify.karatou.academy` ; clôture de ligue testée sur une base de staging |
| **S8 Hors ligne, notifications, performance** | Robustesse terrain | E17, téléchargement de module, file hors ligne + indicateur de synchro, rappels locaux (quotidien, série en danger), « vidéos en Wi-Fi uniquement », optimisation (FlashList, images, démarrage) | Une leçon téléchargée se fait entièrement en mode avion puis se synchronise ; démarrage à froid < 3 s sur Android milieu de gamme ; APK < 40 Mo |
| **S9 QA + publication** | Mise en store | E2E Maestro (onboarding, leçon, certificat), audit accessibilité, bêta TestFlight + test interne Play (20 à 50 apprenants, 2 semaines), fiches stores FR/EN, formulaires de confidentialité (Apple) et Data safety (Google), soumission | Sessions sans crash ≥ 99,5 % en bêta ; app publiée sur les deux stores |

### Critères « v1 complète »

1. Installation → onboarding → compte → 1ʳᵉ leçon terminée en moins de 12 minutes.
2. Progression, XP et certificats identiques sur le web et le mobile.
3. Les 52 leçons jouables en FR/EN/HA ; au moins 8 leçons avec des exercices rédigés de type Brilliant.
4. Série, objectif, quêtes, badges et ligue fonctionnels, calculés côté serveur.
5. Mode hors ligne fiable sur les modules téléchargés, sans perte ni XP en double.
6. Publiée sur Google Play et l'App Store.

### Indicateurs à suivre dès la bêta

Rétention J1, J7, J30 · leçons par apprenant actif par semaine · % de jours où l'objectif est atteint · part des séries ≥ 7 jours · taux d'abandon par étape · taux de complétion des modules · certificats émis et partagés.

---

## 12. Démarrer le nouveau projet

### 12.1 Checklist

1. Créer le repo GitHub `karatou-academy-mobile`.
2. Comptes : Expo/EAS, Apple Developer (99 $/an), Google Play Console (25 $ une fois).
3. Choisir l'identifiant d'app (proposition : `academy.karatou.app`) et le schéma de deep link `karatou`.
4. Copier `CLAUDE.md` à la racine et cette fiche dans `docs/FICHE-LANCEMENT.md`.
5. Lancer la piste B dans le repo web, B1 en premier.
6. Régler les variables `EXPO_PUBLIC_*` dans EAS (profils development, preview, production).

### 12.2 Prompt de démarrage pour Claude Code (nouveau repo)

```text
Lis CLAUDE.md et docs/FICHE-LANCEMENT.md en entier.
Nous démarrons le Sprint S1 « Fondations » (§11).
1. Initialise l'app Expo (TypeScript, Expo Router) avec l'arborescence de CLAUDE.md.
2. Configure NativeWind avec les tokens du §10 (couleurs, polices Literata, Inter, DM Mono, tailles).
3. Mets en place i18next avec fr/en/ha et un test de parité des clés.
4. Crée src/lib/supabase.ts (session persistée, autoRefreshToken) à partir de EXPO_PUBLIC_SUPABASE_URL / ANON_KEY,
   et le script npm "db:types".
5. Ajoute Sentry, PostHog (désactivés si la clé est absente), ESLint, Prettier, Jest et la CI GitHub Actions.
6. Construis le kit UI (Button 3D, Card, Chip, ProgressBar, Sheet, Avatar) et l'écran app/dev/ui.tsx qui les montre tous.
7. Configure eas.json (development, preview, production).
Ne touche pas au schéma Supabase. Termine par une PR avec des captures Android et iOS.
```

Pour les sprints suivants : « Sprint SX selon §11 de la fiche : livre les livrables listés et vérifie les critères d'acceptation. Références UX : §3.2 et §5. »

---

## 13. Risques et décisions à trancher

### Risques

| Risque | Impact | Parade |
|---|---|---|
| Corps des leçons absents de la base (51/52) | Le mobile n'a pas de contenu | **B1** avant S3 ; ensuite la base est l'unique source de vérité |
| Vidéos YouTube : réseau obligatoire, surtout en FR | Pas de vidéo hors ligne ; EN/HA en repli FR | Vidéo facultative dans la leçon, pastille de langue ; hébergement vidéo propre en v2 |
| Divergence Replit / GitHub sur le web | Migrations non appliquées en prod | Migrations poussées depuis GitHub (`npm run supabase:push`), vérification des advisors après chaque push |
| Population faible pour les ligues | Classements vides et démotivants | Règles de fusion (§7.6) + onglet Organisation |
| Qualité du Hausa pour les nouveaux exercices | Confiance des apprenants | Relecture native obligatoire avant publication |
| Revue Apple | Rejet | Suppression de compte in-app, Sign in with Apple si Google est proposé, politique de confidentialité à jour |
| Émission de certificat bloquée par un cours en brouillon | Apprenant bloqué à 100 % | Correctif B3 |

### Décisions (proposition par défaut entre parenthèses)

1. **Fournisseurs de connexion** (e-mail + Google + Apple).
2. **Mascotte** : en créer une, ou animer la tuile « K » du logo (tuile K en v1, mascotte en v1.1).
3. **Noms des ligues** : standard ou thème local, par exemple des arbres ou des matières du Sahel (standard en v1).
4. **Classements** : globaux + organisation, ou organisation seulement (les deux).
5. **Repo** séparé ou monorepo avec le web (repo séparé maintenant ; monorepo si on partage plus que les types).
6. **Analytics** : PostHog cloud UE ou Umami web seulement (PostHog).
7. **Qui valide le Hausa** et sous quel délai.
