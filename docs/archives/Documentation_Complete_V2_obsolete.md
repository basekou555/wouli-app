# 📚 DOCUMENTATION COMPLÈTE WOULI - Version 2.0
**Dernière mise à jour : aout 2025**  
**Statut : Beta avancée - Prêt pour tests pilotes**

---

## 🌟 INTRODUCTION AU PROJET

Wouli est né d'une observation simple mais puissante : les jeunes Lyonnais passent des heures à chercher quoi faire le soir, scrollant entre Instagram, Facebook Events et les sites d'établissements, pour finalement... rester chez eux. Notre mission est de transformer cette friction en fluidité, cette hésitation en action spontanée.

Imaginez une application où découvrir votre prochaine sortie est aussi simple et addictif que swiper sur Tinder. C'est exactement ce que nous construisons avec Wouli - mais nous allons plus loin. Pour les établissements, nous créons une plateforme d'analytics qui transforme des données brutes en insights actionnables, leur permettant enfin de comprendre et d'optimiser leur performance événementielle.

---

## 🎯 VISION PRODUIT & PHILOSOPHIE

### Notre Mission Fondamentale

Nous simplifions la vie sociale des jeunes urbains (18-28 ans) à Lyon en créant le pont le plus court entre l'envie de sortir et l'action de sortir. Pour les établissements, nous démocratisons l'accès à des analytics professionnelles, traditionnellement réservées aux grandes chaînes.

### Les Personas que Nous Servons

**Les Procrastinateurs Sociaux** représentent notre cœur de cible. Ce sont ces jeunes qui veulent sortir mais qui se perdent dans l'infinité des choix. Ils ouvrent Instagram, voient 50 stories d'événements, se sentent submergés et finissent sur Netflix. Wouli leur offre un choix simple : gauche ou droite.

**Les Couples en Galère** cherchent perpétuellement "qu'est-ce qu'on fait ce soir ?". Ils ont besoin d'inspiration rapide et de décisions sans friction. Notre système leur permet de liker les mêmes événements et de voir instantanément leurs matchs communs.

**Les Nouveaux Arrivants** à Lyon ne connaissent pas les bons spots. Wouli devient leur guide personnel, apprenant leurs préférences pour leur suggérer les perles cachées de la ville.

**Les Établissements Locaux** manquent de visibilité et de données. Contrairement aux grandes chaînes avec leurs départements marketing, ils naviguent à vue. Wouli leur donne enfin les outils pour comprendre leur audience et optimiser leur programmation.

### Nos Principes de Design

Le principe "**Mieux sans plus**" guide chaque décision. Nous préférons polir une fonctionnalité existante plutôt que d'en ajouter une nouvelle. Chaque élément doit avoir une raison d'être claire et apporter une valeur mesurable.

La philosophie "**Data-driven mais human-first**" signifie que nous utilisons les données pour informer, pas pour déshumaniser. Les métriques servent à raconter l'histoire humaine derrière les chiffres.

L'approche "**Context is king**" reconnaît qu'un chiffre isolé ne veut rien dire. 127 vues, c'est bien ou mal ? Cela dépend du contexte, de la moyenne, de la tendance. Nous fournissons toujours la perspective nécessaire.

---

## 🏗️ ARCHITECTURE TECHNIQUE ÉVOLUÉE

### Vue d'Ensemble du Stack

Notre architecture suit le principe de simplicité maximale avec scalabilité intégrée. Nous avons choisi des technologies matures et bien documentées pour minimiser la dette technique tout en permettant une croissance rapide.

```
Frontend Layer:
├── React 18 avec TypeScript strict
├── Vite pour des builds ultra-rapides
├── Tailwind CSS + shadcn/ui pour un design system cohérent
├── React Router v6 pour la navigation
└── React Query (à venir) pour la gestion du cache

Backend Layer:
├── Supabase (PostgreSQL + Auth + Realtime + Storage)
├── Edge Functions pour la logique métier complexe
├── Webhooks pour les intégrations tierces
└── API REST avec versioning

Analytics Layer:
├── Moteur de métriques custom en TypeScript
├── Système de snapshots pour l'historique
├── Calculs temps réel avec cache intelligent
└── Anthropic Claude API pour les insights IA (Phase 2)
```

### Structure du Code et Patterns

Notre organisation du code suit une architecture modulaire qui facilite la maintenance et l'évolution :

```
src/
├── components/
│   ├── business/
│   │   ├── analytics/      # Composants réutilisables d'analytics
│   │   │   ├── MetricCard.tsx
│   │   │   ├── PerformanceGauge.tsx
│   │   │   ├── ConversionFunnel.tsx
│   │   │   └── Sparkline.tsx
│   │   ├── dashboard/      # Composants spécifiques au dashboard
│   │   └── events/         # Gestion des événements
│   ├── user/
│   │   ├── swipe/         # Système de swipe
│   │   ├── profile/       # Profil et memories
│   │   └── discover/      # Découverte d'événements
│   └── shared/            # Composants partagés
│
├── hooks/                 # Logique métier réutilisable
│   ├── useAuth.ts        # Authentification globale
│   ├── useSwipeEvents.ts # Logique de swipe sans répétition
│   ├── useEventInteractionsToggle.ts # Like/Unlike réversible
│   └── useEventAnalytics.ts # Métriques et calculs
│
├── services/             # Couche service (en développement)
│   ├── AnalyticsService.ts
│   ├── EventService.ts
│   └── NotificationService.ts
│
├── utils/               # Fonctions utilitaires
│   ├── eventStatus.ts   # Gestion du cycle de vie
│   ├── dateHelpers.ts
│   └── calculations.ts
│
└── types/              # TypeScript interfaces
    ├── events.ts
    ├── analytics.ts
    └── user.ts
```

### Architecture Base de Données

Notre schéma de base de données a été conçu pour supporter à la fois les besoins immédiats et la croissance future :

```sql
-- Tables principales avec leurs relations

profiles (
  id UUID PRIMARY KEY,
  username TEXT UNIQUE,
  type 'user' | 'business',
  establishment_type TEXT, -- Pour les business
  created_at TIMESTAMP
)

events (
  id UUID PRIMARY KEY,
  title TEXT,
  description TEXT,
  date DATE,
  time TIME,
  category 'a-boire' | 'a-manger' | 'soirees' | 'activites',
  
  -- Métriques de base
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  participants INTEGER DEFAULT 0,
  
  -- Analytics avancées
  performance_score INTEGER,
  category_rank INTEGER,
  peak_views_time TIMESTAMP,
  avg_booking_advance INTEGER,
  
  -- Cycle de vie
  status 'active' | 'grace_period' | 'archived',
  archived_at TIMESTAMP,
  actual_participants INTEGER,
  no_show_count INTEGER
)

-- Tables de relations pour le tracking
event_views (
  user_id UUID,
  event_id UUID,
  viewed_at TIMESTAMP,
  UNIQUE(user_id, event_id)
)

event_likes (
  user_id UUID,
  event_id UUID,
  created_at TIMESTAMP
)

event_participants (
  user_id UUID,
  event_id UUID,
  confirmed_at TIMESTAMP,
  reminder_sent BOOLEAN DEFAULT FALSE
)

-- Analytics et historique
analytics_snapshots (
  id UUID PRIMARY KEY,
  entity_type 'event' | 'establishment',
  entity_id UUID,
  period_type 'hourly' | 'daily' | 'weekly',
  metrics JSONB, -- Flexible pour évolution
  benchmark JSONB,
  created_at TIMESTAMP
)
```

---

## 📊 SYSTÈME D'ANALYTICS MULTI-NIVEAUX

### Architecture Analytics : Macro et Micro

Notre système d'analytics fonctionne sur deux niveaux complémentaires qui donnent une vision complète de la performance.

**Le niveau MACRO** offre une vue d'ensemble de la santé globale de l'établissement. Imaginez un tableau de bord d'avion où le pilote voit d'un coup d'œil tous les indicateurs vitaux. Le score de performance global sur 100 agrège plusieurs métriques pour donner une note instantanée. Les tendances montrent l'évolution dans le temps, permettant de détecter rapidement les améliorations ou dégradations.

**Le niveau MICRO** plonge dans le détail de chaque événement. C'est comme passer d'une vue satellite à une vue street-level. Chaque événement a son propre funnel de conversion, ses patterns de consultation, sa vélocité de remplissage. Cette granularité permet d'identifier précisément ce qui fonctionne et ce qui peut être amélioré.

### Métriques Universelles et Contextualisées

Nous avons identifié des métriques universelles qui s'appliquent à tous les événements :

**Visibilité** mesure combien de personnes découvrent l'événement. Ce n'est pas juste un compteur de vues, mais une analyse de la portée réelle, du taux d'arrêt sur la carte, et de l'engagement initial.

**Engagement** traduit l'intérêt suscité. Au-delà des simples likes, nous analysons le temps passé à regarder l'événement, les retours sur la page, les partages potentiels.

**Conversion** représente le passage à l'action. Le ratio participants/vues raconte l'histoire de l'attractivité réelle. La vélocité indique à quelle vitesse l'événement se remplit, révélant son urgence perçue.

**Timing** analyse les patterns temporels. À quelle heure les gens consultent ? Combien de temps à l'avance réservent-ils ? Ces insights permettent d'optimiser les moments de publication.

### Focus Intelligents par Type

Chaque type d'établissement a ses spécificités que nous prenons en compte :

**Les restaurants** se concentrent sur l'anticipation. Les gens réservent-ils longtemps à l'avance ? Viennent-ils en couple ou en groupe ? La météo impacte-t-elle les réservations terrasse ?

**Les bars** analysent la fidélité et les patterns sociaux. Les clients reviennent-ils régulièrement ? L'afterwork fonctionne-t-il mieux que le late night ? Quel est l'effet d'entraînement social ?

**Les clubs** surveillent le momentum et la viralité. Comment l'événement gagne-t-il en popularité ? À quelle vitesse se propage-t-il dans les réseaux sociaux ? Quel est le point de bascule où "tout le monde veut y être" ?

**Les activités** étudient la récurrence et la composition des groupes. Les participants reviennent-ils ? Viennent-ils seuls ou accompagnés ? Quel est le niveau de satisfaction post-événement ?

### Benchmark Anonymisé et Contextuel

Le benchmark est au cœur de notre proposition de valeur. Un établissement ne veut pas juste savoir qu'il a eu 127 vues, il veut savoir si c'est bien par rapport à ses concurrents.

Notre système compare intelligemment les événements similaires (même catégorie, même zone géographique, même gamme de prix) pour donner une position relative. "Vous êtes 2ème sur 8 bars similaires cette semaine" a infiniment plus de valeur que "127 vues".

L'anonymisation protège la confidentialité commerciale tout en fournissant des insights actionnables. Les établissements voient leur position et les moyennes, mais jamais les données individuelles des concurrents.

---

## 🔄 CYCLE DE VIE DES ÉVÉNEMENTS

### Le Concept de Cycle de Vie Complet

Chaque événement dans Wouli suit un cycle de vie naturel, comme une représentation théâtrale qui passe par différents actes. Cette approche nous permet de capturer la valeur à chaque étape et d'offrir des expériences adaptées.

**Phase Active** : L'événement est dans le futur ou en cours. C'est le moment de maximum visibilité où tout est possible : découverte, engagement, inscription. Les métriques évoluent en temps réel, créant une dynamique d'urgence naturelle.

**Phase Grace Period** : Les 2 heures suivant la fin officielle. Cette période tampon reconnaît que la vie réelle n'est pas binaire. Les retardataires peuvent encore découvrir l'événement, les participants peuvent commencer à donner leur feedback, et nous commençons à collecter les données réelles de présence.

**Phase Archivée** : L'événement devient un souvenir. Pour les utilisateurs, il rejoint leurs "memories" - une collection personnelle de leurs sorties passées. Pour les établissements, il devient une donnée historique précieuse pour l'analyse et l'apprentissage.

### Le Système de Memories

Inspiré des stories rétrospectives d'Instagram et des souvenirs Snapchat, notre système de memories transforme les événements passés en valeur émotionnelle et analytique.

Pour les utilisateurs, c'est une façon de revivre leurs meilleures soirées, de voir leurs patterns de sortie, de se rappeler les bons moments. L'interface visuelle met en avant les photos et l'ambiance plutôt que les données froides.

Pour Wouli, c'est une mine d'or de données comportementales. Nous apprenons les préférences réelles, les associations (qui sort avec qui), les patterns de satisfaction. Ces données alimentent nos algorithmes de recommandation future.

### Métriques Post-Événement

L'archivage n'est pas qu'un rangement, c'est un moment de vérité où nous capturons les métriques finales :

**Taux de présence réel** compare les inscriptions aux présences effectives. Un taux de no-show élevé révèle un problème d'engagement ou de communication.

**Patterns d'arrivée** montrent à quelle heure les gens sont vraiment arrivés, permettant d'optimiser les futurs horaires.

**Satisfaction implicite** se déduit du comportement post-événement. Les participants likent-ils d'autres événements du même établissement ? Reviennent-ils ?

---

## 🚀 STRATÉGIE PRODUIT ET ROADMAP

### Philosophie de Développement

Notre approche suit le principe du "Minimum Lovable Product" plutôt que Minimum Viable Product. Chaque fonctionnalité, même basique, doit être suffisamment polie pour créer de la satisfaction, pas juste remplir un besoin.

Nous privilégions la profondeur sur la largeur. Plutôt que d'ajouter constamment de nouvelles fonctionnalités, nous perfectionnons celles qui existent. Un swipe parfait vaut mieux que dix fonctionnalités moyennes.

### Roadmap Structurée par Impact

**Phase Actuelle - Fondations Solides (v0.9)**
- Système d'authentification robuste ✅
- Analytics dashboard fonctionnel ✅
- Swipe sans répétition ✅
- Cycle de vie des événements ✅
- Architecture scalable ✅

**Sprint Immédiat - Polish & Performance (v1.0)**
- Service layer pour séparer logique métier
- Optimisations performance (mémoisation, lazy loading)
- Tests unitaires sur les calculs critiques
- Mode démo pour impressionner les pilotes
- Seeding intelligent de 50+ événements

**Trimestre 1 2025 - Intelligence Artificielle (v1.5)**
- Intégration Claude pour insights automatiques
- Recommandations personnalisées par ML
- Prédiction de performance événementielle
- Alertes intelligentes et proactives

**Trimestre 2 2025 - Social Layer (v2.0)**
- Système d'amis et groupes
- Planification de sorties collaboratives
- Social proof avancé (qui de tes amis y va)
- Partage et viralité intégrés

### Métriques de Succès

Nous mesurons notre succès sur trois axes complémentaires :

**Succès Technique** se mesure en performance (temps de chargement < 3s), en stabilité (0 erreur critique en production), et en maintenabilité (code coverage > 70%).

**Succès Produit** s'évalue par l'engagement (taux de rétention J7 > 40%), l'utilisation (50+ swipes par session), et la satisfaction (NPS > 50).

**Succès Business** se traduit en revenus (10 établissements × 30€ = 300€ MRR initial), en croissance (doublement tous les 3 mois), et en efficacité (CAC < 50€, LTV/CAC > 3).

---

## 🛠️ GUIDE TECHNIQUE POUR CONTRIBUTEURS

### Conventions et Standards

Notre code suit des conventions strictes pour maintenir la cohérence :

**Structure des composants** : Chaque composant suit un ordre précis - imports, types, constantes, hooks, handlers, render. Cette prévisibilité facilite la navigation et la maintenance.

**Naming patterns** : Les composants utilisent PascalCase, les hooks commencent par 'use', les handlers par 'handle', les constantes sont en UPPER_SNAKE_CASE.

**TypeScript strict** : Nous utilisons TypeScript en mode strict avec tous les checks activés. Chaque prop, chaque retour de fonction est typé explicitement.

### Patterns d'Architecture

**Separation of Concerns** : La logique métier vit dans les hooks et services, pas dans les composants. Les composants se concentrent sur la présentation et l'interaction utilisateur.

**Composition over Inheritance** : Nous construisons des fonctionnalités complexes en composant des éléments simples plutôt qu'en créant des hiérarchies complexes.

**Progressive Enhancement** : L'application fonctionne sans JavaScript (SSR), puis s'enrichit progressivement. Les animations sont des bonus, pas des nécessités.

### Processus de Développement

**Git Flow** : Main est sacré et toujours déployable. Develop intègre les features finies. Chaque feature a sa branche avec un nom descriptif.

**Code Review** : Chaque PR doit être revue par au moins une personne. Les reviews vérifient la logique, les performances, l'accessibilité et la maintenabilité.

**Testing Strategy** : Tests unitaires pour la logique métier, tests d'intégration pour les workflows critiques, tests E2E pour les parcours utilisateur principaux.

---

## 💡 DÉCISIONS CLÉS ET APPRENTISSAGES

### Pourquoi Supabase plutôt que Firebase

Cette décision reflète notre philosophie open-source et notre besoin de contrôle. Supabase nous offre PostgreSQL, un standard industriel, plutôt qu'une base propriétaire. Les Row Level Security policies nous donnent une sécurité fine impossible avec Firebase. Le coût prévisible évite les mauvaises surprises de facturation.

### Pourquoi le Swipe comme Interaction Principale

Le swipe n'est pas qu'un effet de mode. C'est une interaction qui force la décision binaire, réduisant la paralysie du choix. C'est familier grâce à Tinder, réduisant la courbe d'apprentissage. C'est addictif, créant un engagement naturel. C'est mobile-first, parfait pour notre audience.

### Pourquoi Commencer par Lyon

Lyon est notre laboratoire parfait. Assez grande pour avoir une scène événementielle riche (2ème ville de France), assez petite pour créer un effet de réseau rapide. La population étudiante importante match notre cible. La proximité géographique facilite le contact avec les établissements.

### Architecture Monolithique vs Microservices

Nous avons choisi de commencer monolithique pour itérer rapidement. Les microservices ajoutent une complexité prématurée pour une petite équipe. Notre architecture modulaire nous permet d'extraire des services plus tard si nécessaire. Le pragmatisme prime sur la pureté architecturale.

---

## 🔮 VISION LONG TERME

### Wouli dans 3 Ans

Nous voyons Wouli devenir LE réflexe sortie pour les jeunes urbains français. Présents dans les 10 plus grandes villes, avec 100k+ utilisateurs actifs mensuels. Pour les établissements, nous serons l'outil d'analytics et d'optimisation événementielle de référence.

### Impact Sociétal

Au-delà du business, Wouli combat l'isolement social des jeunes urbains. Nous facilitons les rencontres, créons des souvenirs, dynamisons la vie locale. Pour les établissements indépendants, nous nivelons le terrain de jeu face aux grandes chaînes.

### Évolution Technologique

L'IA deviendra centrale, non pas comme gadget mais comme assistant intelligent. Prédiction des goûts, optimisation automatique des événements, matching social intelligent. La réalité augmentée pourrait enrichir la découverte. Le metaverse... on verra, restons pragmatiques.

---

## 📞 RESSOURCES ET CONTACTS

### Liens Essentiels
- **Repository GitHub** : [URL]
- **Lovable Project** : https://lovable.dev/projects/52458b2e-f3fe-4dc0-8d62-3920a4f53937
- **Supabase Dashboard** : [URL]
- **Documentation API** : [URL]

### Pour Contribuer
1. Fork le repository
2. Créer une branche feature/votre-feature
3. Suivre les conventions de code
4. Tester localement
5. Créer une PR avec description détaillée

### Support
- **Questions techniques** : Issues GitHub
- **Questions produit** : [Email]
- **Questions business** : [Email]

---

**Rappel de notre mission** : Chaque ligne de code, chaque pixel, chaque décision doit servir un objectif simple - connecter les Lyonnais avec les expériences qui les attendent. Ensemble, transformons les "qu'est-ce qu'on fait ce soir ?" en "c'était une super soirée !" 🚀