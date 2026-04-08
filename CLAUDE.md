# CLAUDE.md — Contexte Projet Wouli

> Ce fichier est lu automatiquement par Claude Code à chaque session.
> Il contient tout ce qu'il faut savoir pour travailler sur Wouli sans introduction.

---

## 🎯 C'est quoi Wouli ?

Application mobile-first de découverte d'événements à Lyon, ciblant les 18-28 ans.
Interface TikTok/Tinder : swipe vertical pour découvrir des sorties spontanées.
Deux faces : app utilisateur (swipe) + dashboard B2B pour les établissements (analytics).

**Philosophie :** "Mieux sans plus" — polir l'existant avant d'ajouter du nouveau.
**Objectif utilisateur :** Transformer "qu'est-ce qu'on fait ce soir ?" en soirée mémorable, le plus simplement possible.

---

## 🏗️ Stack Technique

```
Frontend : React 18 + TypeScript strict + Vite + Tailwind CSS + shadcn/ui + React Router v6
Backend  : Supabase (PostgreSQL + Auth + Realtime + Storage + RLS + Edge Functions)
Scraper  : Node.js + Puppeteer (tourne en local sur Windows, séparé du repo principal)
```

**Repo Lovable (origine) :** https://lovable.dev/projects/52458b2e-f3fe-4dc0-8d62-3920a4f53937

---

## 📁 Structure du Projet

```
src/
├── components/
│   ├── business/
│   │   ├── analytics/       # MetricCard, PerformanceGauge, ConversionFunnel, Sparkline
│   │   ├── dashboard/       # Composants dashboard B2B
│   │   └── events/          # Gestion événements côté établissement
│   ├── user/
│   │   ├── swipe/           # Système de swipe (CRITIQUE - voir section dédiée)
│   │   └── profile/         # Profil utilisateur
│   └── admin/               # Interface admin (validation, scraper control, dashboard)
├── hooks/                   # Hooks custom (useFriends, useEventChat, useNotifications...)
├── services/                # Logique métier séparée des composants
└── pages/                   # Pages principales
```

---

## ⚠️ ZONES CRITIQUES — Ne pas toucher sans lire

### 1. Système de Swipe (FRAGILE)
**Fichier :** `src/components/user/swipe/WouliEventCard.tsx` (lignes 274-288)
**Lib :** `react-tinder-card` — nécessite une hauteur explicite sur le container parent.
**Architecture :** Cascade de 5 niveaux de hauteur : `h-screen → flex-1 → max-h-full → absolute inset-0 → TinderCard`
**Règle absolue :** Ne jamais modifier le layout de `UserApp.tsx` sans relire la doc du swipe.
Chaque niveau dépend du précédent — casser un maillon casse tout.

### 2. Scraper Instagram (SÉPARÉ)
Le scraper tourne en **local sur Windows** à `C:\projets\wouli-scraper\`
Il est **indépendant** du repo principal de l'app.
V5 est la version stable de référence — ne pas "optimiser" ce qui fonctionne.
Il scrape ~23 comptes Instagram lyonnais → Supabase (status "pending") → validation admin manuelle.

### 3. Sécurité Supabase
Des vulnérabilités ont été identifiées et partiellement corrigées :
- RLS policies sur toutes les tables sensibles
- Edge Functions doivent être authentifiées
- Jamais exposer les clés service_role côté client

---

## 🗄️ Base de Données Supabase (tables principales)

```sql
events              -- Événements (status: pending/validated/rejected/archived)
establishments      -- Établissements partenaires
profiles            -- Profils utilisateurs
user_preferences    -- Préférences pour le système de reco
user_interactions   -- Tracking comportemental (swipes, views, timing)
friendships         -- Relations bidirectionnelles entre users
event_conversations -- Chats temporaires liés aux événements
messages            -- Messages dans les chats
scraped_posts       -- Hash MD5 URLs pour anti-doublons scraper
```

**RLS activé** sur toutes les tables — toujours vérifier les policies avant d'écrire des queries.

---

## 🧠 Système de Recommandation (Algorithme)

Poids de l'algorithme :
- 40% Préférences utilisateur
- 25% Influence sociale (amis)
- 15% Urgence (événements proches)
- 10% Découverte (nouveauté)
- 10% Contexte (heure, météo, etc.)

Onboarding Spotify-style : 5+ mots-clés sélectionnés parmi catégories Lyon-specific.

---

## 🖥️ Interface Admin (4 pages)

1. **Dashboard** — métriques globales et alertes
2. **Validation** — workflow principal, objectif 2 clics/événement (était 8+)
3. **Scraper Control** — monitoring et lancement scraper
4. **Monitoring** — logs et erreurs

---

## 📐 Règles de Développement

### TOUJOURS
- Mobile-first dans chaque décision
- Vérifier si le composant existe avant d'en créer un nouveau
- Vérifier les colonnes Supabase avant d'écrire une query
- TypeScript strict — tout typer explicitement
- Tester sur mobile (ou viewport mobile) avant de valider

### JAMAIS
- Modifier le système de swipe sans lire la doc dédiée
- Toucher à la V5 du scraper au-delà de ce qui est demandé
- Ajouter une feature sans qu'elle serve "qu'est-ce qu'on fait ce soir ?"
- Fake personnes dans la base (fake metrics OK)
- Exposer des clés Supabase en clair

### Approche chirurgicale
- Modifications ciblées plutôt que refacto globale
- Lire l'existant AVANT d'écrire
- Si quelque chose fonctionne → ne pas y toucher

---

## 🔄 Workflow de Session Type

1. **Lire ce fichier** (déjà fait si tu lis ça)
2. **Lire les fichiers concernés** avant de modifier
3. **Modification chirurgicale** — ne toucher qu'à ce qui est demandé
4. **Vérifier mobile** après chaque modification visible

---

## 🔧 Commandes Utiles

```bash
# Lancer le serveur de dev
npm run dev

# Build
npm run build

# Vérification TypeScript
npx tsc --noEmit

# Linter
npm run lint
```

**Variables d'environnement nécessaires (.env.local) :**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## 📌 Contexte Business

- Fenêtre compétitive estimée : 12-18 mois avant que des concurrents entrent sur Lyon
- Objectif immédiat : signer 10 établissements pilotes (stratégie cold call en cours)
- Modèle : ~30€/mois/établissement en phase pilote
- Concurrent principal actuel : Instagram (découverte organique)

---

## 📚 Documentation Étendue

Les fichiers de documentation complète sont dans `/docs/` (ou dans le knowledge base Claude.ai) :
- `DOCUMENTATION_COMPLÈTE_WOULI` — vision, architecture, roadmap
- `STRATÉGIE_RECOMMANDATIONS` — algorithme détaillé
- `STRATÉGIE_SOCIALE` — features sociales et règles
- `ARCHITECTURE_SWIPE` — doc critique du système de swipe
- `DOCUMENTATION_SCRAPER` — tout sur le scraper Puppeteer

---

*Dernière mise à jour : avril 2026*
*Maintenu par Basekou — Projet Wouli, Lyon*
