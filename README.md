# 🔪 Killer Ondorse

Jeu du Killer 100 % en ligne, sans maître du jeu, pour jouer entre collègues
(@ondorse.co). React + Vite + Firebase (Auth Google + Firestore temps réel),
hébergé gratuitement sur GitHub Pages.

## Règles implémentées

- Connexion **Google restreinte au domaine @ondorse.co**. Chaque joueur saisit son prénom.
- Salle d'attente avant le lancement. **L'admin (`mohammad@ondorse.co`) lance la partie et joue aussi.**
- L'admin peut **téléverser / coller sa propre liste de gages** avant le lancement.
- Au lancement : chaîne circulaire aléatoire (chacun a une cible + un gage).
- **Kill** : tu déclares avoir killé ta cible → ta cible reçoit « Quelqu'un déclare t'avoir killé,
  est-ce correct ? » Oui/Non. Si Oui, le gage du killé passe au killer et la chaîne se raccourcit.
- **Contre-kill (auto-défense)** : tu accuses la personne qui te chasse. Si tu as raison, elle meurt ;
  si tu te trompes, **tu** meurs et ton gage va à ton vrai chasseur.
- **Tableau de bord temps réel** : joueurs en vie (kills + qui ils ont tué) et joueurs morts.
- **Fin** : dernier survivant gagne. L'admin peut réinitialiser pour relancer.

## 1. Créer le projet Firebase (gratuit)

1. Va sur <https://console.firebase.google.com> → **Ajouter un projet**.
2. Dans **Build > Authentication > Sign-in method**, active **Google**.
3. Dans **Build > Firestore Database**, crée une base (mode production, région EU).
4. Onglet **Rules** de Firestore : colle le contenu de [`firestore.rules`](firestore.rules) et publie.
5. **Paramètres du projet** (roue crantée) > section *Tes applications* > icône Web `</>` :
   enregistre une app, puis copie l'objet `firebaseConfig`.

> Astuce : si ton email admin n'est pas `mohammad@ondorse.co`, change-le dans `firestore.rules`
> **et** dans `VITE_ADMIN_EMAIL`.

## 2. Lancer en local

```bash
cp .env.example .env       # puis colle ta config Firebase dans .env
npm install
npm run dev
```

Ouvre l'URL affichée. Connecte-toi avec un compte @ondorse.co.

## 3. Déployer gratuitement sur GitHub Pages

1. Crée un repo GitHub et pousse ce code sur la branche `main`.
2. Dans le repo : **Settings > Pages > Build and deployment > Source = GitHub Actions**.
3. **Settings > Secrets and variables > Actions > New repository secret** : ajoute les secrets
   correspondant à ton `.env` :
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`,
     `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`
   - (optionnels) `VITE_ALLOWED_DOMAIN`, `VITE_ADMIN_EMAIL`
4. À chaque push sur `main`, le workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
   build et déploie automatiquement. L'URL apparaît dans l'onglet **Actions** / **Pages**.
5. **Important** : dans Firebase **Authentication > Settings > Authorized domains**, ajoute le
   domaine de ta page (`<utilisateur>.github.io`), sinon la connexion Google sera bloquée.

## Architecture

```
src/
  config.ts        constantes (domaine autorisé, email admin, id de partie)
  firebase.ts      init Firebase
  hooks.ts         auth + abonnements Firestore temps réel
  game.ts          logique de jeu + mutations (chaîne, kill, contre-kill, reset)
  types.ts         types Game / Player / KillRequest
  components/      écrans React (login, salle d'attente, jeu, fin…)
```

## Notes

- **Modèle de confiance** : il n'y a pas de serveur (offre gratuite). La résolution des kills se fait
  côté client, donc les joueurs peuvent techniquement écrire les données. C'est volontaire et suffisant
  pour un jeu interne convivial.
- Une seule partie globale (`games/current`), réinitialisable par l'admin.
- Minimum 3 joueurs et au moins 1 gage pour lancer.
