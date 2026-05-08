# Wouli — Découvre Lyon

Application mobile-first de découverte d'événements à Lyon, ciblant les 18-28 ans.
Interface swipe vertical (TikTok/Tinder) + dashboard B2B pour les établissements.

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui
- Supabase (Auth, PostgreSQL, Storage, RLS)
- Déployé sur Vercel

## Lancer le projet en local

```bash
# Cloner le repo
git clone <GIT_URL>
cd wouli-app

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env .env.local
# (les valeurs Supabase sont déjà dans .env)

# Lancer le serveur de dev
npm run dev
```

L'app tourne sur `http://localhost:8080` par défaut.

## Variables d'environnement

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

## Commandes

```bash
npm run dev      # Serveur de développement
npm run build    # Build production
npm run lint     # Linter ESLint
npx tsc --noEmit # Vérification TypeScript
```

## Structure

```
src/
├── components/
│   ├── business/   # Dashboard B2B (analytics, événements)
│   ├── user/       # Interface utilisateur (swipe, profil)
│   └── admin/      # Interface admin (validation, scraper)
├── hooks/          # Hooks custom
├── services/       # Logique métier
└── pages/          # Pages principales
```

## Déploiement

Le projet est déployé automatiquement sur Vercel à chaque push.
Le fichier `vercel.json` gère le routage SPA (toutes les routes pointent vers `index.html`).

## Routes principales

| Route | Accès |
|-------|-------|
| `/app` | Utilisateurs connectés (swipe) |
| `/business` | Établissements partenaires |
| `/admin` | Administrateurs uniquement |
