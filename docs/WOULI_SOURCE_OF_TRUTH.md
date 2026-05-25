# 🎯 WOULI - Source of Truth V1.4

**Last Updated:** 2024-12-16  
**Status:** Dual track actif (Wouli Lyon + Agence Créateurs)  
**Projet Age:** ~14 mois (depuis 26 mars 2025)

---

## 🎯 VISION & STRATÉGIE

### **STRATÉGIE ACTIVE : DUAL TRACK ✅ (16 Déc 2024)**

**Décision :** Wouli Lyon + Agence Créateurs en parallèle

**Justification :**
- ✅ Wouli niveau satisfaisant atteint (ou proche)
- ✅ Claude Code booste vélocité → limite = imagination
- ✅ Agence = test rapide, feedback immédiat
- ✅ Conviction forte : créateurs voient valeur immédiatement
- ✅ Différenciation claire : rapidité (template Wouli vs dev from scratch)

**Allocation Temps (Post-CDI 22 juin) :**
- **Wouli :** 40% (~4h/semaine) - Maintenance + polish + growth passif
- **Agence :** 60% (~6h/semaine) - Prospection + démos + delivery

---

### Pitch Wouli

**Version actuelle (draft) :**
Wouli aide les 18-28 ans à Lyon à répondre "qu'est-ce qu'on fait ce soir ?" via une app de découverte événementielle. Swipe sur events locaux, algo perso, feed social amis.

**À améliorer :**
- [ ] Plus punchy (1 phrase killer)
- [ ] Différenciation claire vs Instagram

---

### Pitch Agence ✨ NOUVEAU

**Version 1.0 (16 Déc 2024) :**
J'aide les créateurs de contenu événementiel local à structurer leur business en créant des applications mobiles qui transforment leur audience en revenus. App livrée en 7 jours vs 3 mois, basée sur tech éprouvée Wouli.

**Proposition Valeur :**
- ⚡ **Rapidité :** 7 jours vs 3 mois (template Wouli customisé)
- 💰 **Pricing accessible :** 50-500€/mois + % revenus app
- 🎯 **Timing stratégique :** Intervenir quand audience monétisable
- 🤝 **Revenue share :** Accompagnement long terme
- 🚀 **Tech éprouvée :** 14 mois retour expérience Wouli

**Positionnement :**
"Accélérateur digital pour créateurs contenu local" (comme managers/agents créateurs, mais côté tech/produit)

---

### Business Model

#### Wouli Lyon (B2B Établissements)
- Gratuit users, payant établissements
- Dashboard analytics + canal acquisition
- **Statut :** ⏸️ Pause prospection (attente 50 users actifs)

#### Agence Créateurs (B2C) ✨ NOUVEAU

**Tarification Mensuelle :**
- 50€/mois : <5K followers, pas monétisé
- 150€/mois : 5-20K followers, premiers revenus ⭐ CIBLE
- 300€/mois : 20-50K followers, revenus réguliers
- 500€/mois : 50K+ followers, business établi

**Revenue Share :**
- 5-15% revenus générés via app
- Alignement long terme, accessible créateurs sans revenus

**Services Inclus :**
- App white-label (template Wouli)
- Design custom + déploiement stores
- Hébergement + maintenance + support
- Dashboard analytics + updates mensuelles

**Délai :** 7 jours

---

### Objectifs Sept 2026

#### Wouli
- App stable & belle
- 3 pilotes business signés
- 50 users actifs hebdo
- Scraper 100% auto

#### Agence ✨ NOUVEAU
- 5-10 créateurs prospectés
- 2-3 démos créées
- 1 client signé
- Pricing validé
- Template réutilisable

---

### Contexte CDI

**Début CDI :** 22 juin 2025  
**Impact :** 5-10h/semaine pour projets  
**Motivation :** Apprendre vente B2B (transférable à Wouli + Agence)  
**Corrélation Git :** Pause février 2026 (0 commits) = réflexion décision

---

## 💻 PRODUCT STATE

### Architecture Technique

#### Système Swipe - Fragilité Connue

**⚠️ CRITIQUE :** Le swipe repose sur une cascade de 5 niveaux de contraintes de hauteur. Modifier un maillon casse toute la chaîne.

**Chaîne de dépendances :**
```
h-screen → flex-1 → max-h-full → absolute inset-0 → TinderCard
```

**Règles strictes UserApp.tsx :**
- Ligne 73 : `h-screen` (référence hauteur globale)
- Ligne 97 : `flex-1` (container cartes)
- Ligne 99 : `relative` + `max-h-full` (positionnement)
- Ligne 102 : `absolute inset-0` (TinderCard)

**Piège BottomNavigation :**
- `position: fixed` = hors flux document
- Prend 60px EN PLUS du 100vh
- Peut causer overlap sur mobile

**⚠️ Avant toute modification layout :** Consulter `docs/archives/Architecture_Swipe.md` (checklist complète + guide debug)

**Top 3 Symptômes Régression :**
1. **Cartes invisibles** → Vérifier `relative` ligne 99
2. **Swipe cassé** → Vérifier hauteur explicite container
3. **Scroll horizontal** → Vérifier `overflow-hidden` lignes 73, 97

---

### App Wouli

**Déployé :** Web app (Vercel)

**Features Live :**
- ✅ Discovery événements (swipe Tinder natif depuis 13 mai)
- ✅ Filtres & recherche
- ✅ Profil + système amis basique
- ✅ Recommandations V2.0 (algo sophistiqué)

**Work In Progress :**
- 🚧 Redesign dark mode (amber/coral)
- 🚧 Page Profil refonte
- 🚧 UI polish

**Décision en Attente :**
- ❓ **Swipe vs Scroll** : Implémenté 13 mai, débat réouvert
  - A/B test requis (20-30 users)
  - Critères : temps passé, rétention J7

**Statut :** ✅ Niveau satisfaisant, vélocité Claude Code = limite imagination

---

### Template Agence ✨ NOUVEAU

**Base :** Wouli codebase (14 mois dev)

**Features V1.0 :**
- Page unique événements (scroll/list)
- Filtres (date, catégorie, lieu)
- Transcription events
- Design custom (couleurs, logo, fonts)
- Dashboard analytics basique

**Roadmap :**
- Notifications push
- Profils users + favoris
- Calendrier personnel
- Billetterie intégrée

**Stack :** React Native/PWA, Supabase, Tailwind

**Delivery :** 7 jours (J1-2 découverte, J3-5 dev, J6 tests, J7 déploiement)

**Statut :** 🟡 Démo fonctionnelle (créatrice Lorient), template à valider

---

### Features Sociales - Architecture Détaillée

**Positionnement :** "Social Hybride" - pas un réseau social, un outil de coordination pour sortir IRL.

#### Système Amis - Bidirectionnel
- **Connexion réelle :** Demande + Acceptation (pas follow unilatéral)
- **Privacy first :** Contrôle visibilité
- **Cercle restreint :** Qualité > Quantité
- **Pas de DM ouvert :** Chat uniquement entre amis confirmés

#### Chat Contextuel Événement
- **Temporaire :** Disparaît 24h après événement
- **Privé :** Seulement entre amis participants
- **Groupes flexibles :** Créer/modifier participants
- **Focus coordination :** "On se retrouve où ?" pas small talk

#### Viralité Organique
- **Partage externe :** Lien unique user/event
- **Preview limitée :** 3 swipes max non-inscrits
- **Conversion naturelle :** "Inscris-toi pour rejoindre [Ami]"

**Statut :** 🚧 Features basiques live, architecture complète en roadmap

---

### Système Tags & Attribution Événements

**Migration BDD (6 Déc 2024) :** Passage de 6 catégories rigides → 8 tags flexibles

**8 Tags Granulaires :**
- Musique (électro, rock, jazz, hip-hop, etc.)
- Ambiance (chill, festif, romantique, énergique)
- Social (solo-friendly, groupes, networking, rencontres)
- Type lieu (bar, club, restaurant, musée, plein air)
- Moment (afterwork, soirée, brunch, nocturne)
- Prix (gratuit, abordable, premium)
- Public (étudiants, jeunes pro, couples, familles)
- Activités (danse, dégustation, jeux, spectacle)

**Logique Attribution :**
```
Event scrapé Instagram
→ Extraction venue_instagram
→ Matching avec business_configs.instagram_handle
→ Si match : event.business_id = business.id
→ Dashboard business = seulement events attribués
```

**Avantages :**
- Recommandations précises (combinaison tags vs catégorie unique)
- Benchmark intelligent (comparer events vraiment similaires)
- Attribution automatique events → établissements clients

**Statut :** ✅ Migration complète, opérationnel

---

### Algorithme Recommandations V2.0

**Formule Globale :**
```
Score Final = 40% Préférences + 25% Social + 15% Urgence 
              + 10% Discovery + 10% Context
```

**Détails Poids :**

1. **Préférences (40%)** : Tags likés vs tags event
   - Match parfait tag : +10 points
   - Tag opposé : -5 points
   - Onboarding : minimum 5 keywords style Spotify

2. **Social (25%)** : Amis participants
   - 1 ami : +8 points
   - 2-3 amis : +15 points
   - 4+ amis : +20 points

3. **Urgence (15%)** : Proximité temporelle
   - Ce soir : +15 points
   - Demain : +10 points
   - Cette semaine : +5 points

4. **Discovery (10%)** : Nouveauté
   - Event jamais swipé : +5 points
   - Établissement nouveau : +3 points

5. **Context (10%)** : Météo, jour semaine
   - Vendredi soir : boost clubs +5
   - Dimanche : boost brunches +5
   - Pluie : boost lieux couverts +3

**North Star Metrics :**
- Primary : Weekly Active Users >60%
- Secondary : Engagement >30 swipes/session
- Tertiary : Satisfaction post-event >4.2/5

**Statut :** ✅ V2.0 implémenté (Fév 2026)

---

### Scraper Wouli

**Version Active :** V5 stabilisé

**Performance (V5 fixé 19 mai) :**
- Comptes : 150+ Instagram
- Yield : ~100 events/run
- Fréquence : Hebdomadaire
- Contrôle : Telegram bot (quasi-prêt)

**Sources :**
- Instagram (primaire, 150+ comptes)
- Shotgun.live (200+ events, usage irrégulier)
- Resident Advisor (ajouté 12 mai)

**Intégration Notion (10 mai) :**
- CSV Notion (200+ établissements) → accounts-v5.json
- Category mapping 30+ types
- Sync auto via update.bat

**Statut :** ✅ Performant, scalable

---

### Scraper - Guide Opérationnel

#### Installation & Setup

**Prérequis :** Node.js 18+, Compte Instagram, Compte Supabase

**Dépendances clés :**
```bash
npm install puppeteer-extra puppeteer-extra-plugin-stealth
npm install @supabase/supabase-js dotenv
```

**Configuration `.env` :**
```env
INSTAGRAM_USERNAME=xxx
INSTAGRAM_PASSWORD=xxx
SUPABASE_URL=xxx
SUPABASE_SERVICE_KEY=xxx
SUPABASE_ADMIN_UUID=b8750c46-6717-4427-aac4-3e5c1e5a86c5
TEST_MODE=false
HEADLESS=false
```

**Commandes :**
```bash
# Production (tous comptes)
node scraper-v5-wouli.js

# Test (1 compte, 3 posts)
TEST_MODE=true HEADLESS=false node scraper-v5-wouli.js
```

---

#### Top 3 Erreurs & Solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| **Connexion échouée** | Instagram changé | Mode manuel (HEADLESS=false) |
| **Screenshot échoué** | Article non trouvé | Fallback zone fixe automatique |
| **Image trop lourde** | Screenshot >3MB | Réduire clip width/height |

**⚠️ Troubleshooting complet :** `docs/archives/Documentation_Scraper.md`

---

#### Leçons Clés V1→V5

**✅ Ce qui fonctionne :**
- Configuration Puppeteer simple (`waitUntil: 'networkidle2'`)
- Screenshots HD (deviceScaleFactor: 2) vs URLs Instagram (CORS)
- Mode manuel connexion (fallback fiable)
- Batch processing (10 events à la fois)

**❌ Pièges évités :**
- Sur-optimisation V3 (régression stabilité)
- URLs Instagram directes (bloquées CORS, expirent)
- Tentatives contournement CORS (complexes, instables)

---

### Tech Stack

**Frontend :** React 18, TypeScript, Vite, Tailwind, shadcn/ui  
**Backend :** Supabase  
**Scraper :** Puppeteer + stealth, Node.js, Telegram API  
**Tooling :** gpt-engineer (mars-avril 2025) → Lovable (mai 2025-avril 2026) → Claude Code (avril 2026+)

---

## 💼 BUSINESS & OPERATIONS

### Metrics

#### Wouli (Mai 2026)
- Events : ~200-400
- Users actifs : <10
- Pilotes : 0 signés
- Revenue : 0€

#### Agence ✨ (Déc 2024)
- Prospects contactés : 1
- Démos créées : 1
- Intérêt validé : 1
- Conversions : 0
- Revenue : 0€

---

### État Commercial Wouli

**Prospection :** 200+ établissements Notion, quelques appels

**Pilotes historiques :**
- Août 2025 : "2 prêts"
- Mai 2026 : Jamais recontactés

**Learnings :**
- ✅ Canal acquisition = seul levier fort
- ❌ "Je connais ma clientèle"
- ❌ "Pas besoin nouveau canal"
- ❌ "App pas prouvée"

**Diagnostic :**
- Client mal défini
- Pain points faibles
- Marché diffus

**Décision :** ⏸️ Pause (attente 50 users)

---

### État Commercial Agence ✨ NOUVEAU

**Premier Contact : Créatrice Lorient (16 Déc)**

**Profil :**
- Établie (plusieurs années)
- Facebook : posts réguliers
- Audience : Pays de l'Orient
- Business : Pas encore monétisé

**Approche :**
- Cold outreach + démo rapide

**Résultat :**
- ✅ Besoin validé (elle développe app elle-même)
- ✅ Pain point confirmé
- 🟡 Timing sous-optimal (déjà en dev)
- 🟢 Porte pas fermée
- 🔴 Son dev actuel = lent (projet avance lentement)

**Key Insight :**
- Rapidité = argument #1
- Fenêtre timing étroite

---

### Learnings Commerciaux Agence

**✅ Fonctionne :**
- Approche directe (cold + démo)
- Validation immédiate
- Rapidité = USP

**🔴 Bloque :**
- Fenêtre étroite
- Compétition existe
- Stade monétisation délicat

**🎯 Opportunités :**
- Positionnement "accélérateur digital"
- Revenue share
- Template éprouvé

---

### Stratégie Prospection Agence

**Profil Cible :**
- Créateur contenu événementiel local
- 2-3+ posts/semaine
- Audience engagée
- **Pas encore d'app**

**Stades Monétisation :**
- Stade 1 (0-5K) : 50€/mois + 15%
- **Stade 2 (5-20K) : 150€/mois + 10%** ⭐ PRIORITÉ
- Stade 3 (20-50K) : 300€/mois + 5%
- Stade 4 (50K+) : 500€/mois custom

**Sourcing :**
- Facebook Groups événements
- Instagram hashtags locaux
- TikTok créateurs locaux
- Collectifs/associations

**Pipeline Objectif (4 semaines) :**
- S1 : 20 sourcés, 10 contactés
- S2 : 10 suivants, 1-2 démos
- S3 : Affiner pitch
- S4 : 1 client signé OU validation "pas de marché"

---

## 📱 GROWTH & COMMUNITY

### Marketing Wouli

**Canaux Actifs :**
- TikTok perso : 101 followers
- Instagram Wouli : 32
- Instagram perso : 9
- Twitch : 37 (work sessions)

**Objectif Sept 2026 :**
- >5 posts/semaine
- Mix : 40% build public, 30% events, 30% tips

---

### Marketing Agence ✨ NOUVEAU

**Objectif :** 5-10 créateurs qualifiés/mois

**Canaux :**
- LinkedIn (nouveau)
- Twitter/X (build public)
- TikTok (repurpose)
- Cold DM direct

**Mix Contenu :**
- 50% case studies
- 30% process
- 20% tips monétisation

**Metrics (3 mois) :**
- 50 contactés
- 10 qualifiés
- 3 démos
- 1 client payant

---

### Communauté Users Wouli

**Personas :**
- Léa (25-30, proactive, spontanéité)
- Tom & Julie (28-35, couple, routine)
- Marco (23-28, nouveau Lyonnais)

**Acquisition :**
- TikTok prioritaire
- Bouche-à-oreille
- Micro-influenceurs

**Retention :**
- Notif 18h "Ce soir ?"
- Algo perso
- Features sociales

---

## 📚 DECISIONS LOG

### 6 Décembre 2024 : Migration BDD - Système Tags

**Contexte :** Préparer scaling commercial + améliorer recommandations

**Problème :** 6 catégories rigides = recommandations imprécises

**Décision :** Migration vers 8 tags flexibles granulaires  
(Musique, Ambiance, Social, Type lieu, Moment, Prix, Public, Activités)

**Migration technique :**
- event_tags (array), tag_weights, attribution venue_instagram → business_id
- Scripts SQL exécutés, tests 10/10 validés

**Impact :**
- Recommandations précises (combinaison tags vs catégorie unique)
- Benchmark intelligent
- Attribution auto events → clients

**Statut :** ✅ Production

---

### 22 Décembre 2024 : Interface Admin Optimisée

**Contexte :** Validation manuelle 8+ clics/event = friction

**Décision :** 7 prompts Lovable refonte UX

**Améliorations :**
- Actions rapides : 8 clics → 2 clics
- Filtres avancés combinables
- Batch actions

**Résultat :** Vélocité validation x4

**Statut :** ✅ Opérationnel

---

### 2024-12-16 : Dual Track Validé ✨ MAJEUR

**Contexte :**
- Test pivot agence devient concret
- Premier prospect validé
- Conviction forte

**Décision :** Wouli (40% temps) + Agence (60% temps)

**Justification :**
- Wouli niveau satisfaisant
- Claude Code = vélocité
- Agence = tests rapides
- Compatible CDI

**Objectifs 3 mois :**
- Wouli : 50 users, app polie
- Agence : 1 client, template validé

**Critères abandon agence :** 0 client après 50 prospects

**Critères pivot full agence :** 3+ clients récurrents

**Statut :** ✅ Actif

---

### 2024-12-16 : Premier Prospect Agence

**Créatrice Lorient :**
- Besoin validé
- Timing sous-optimal
- Dev lent actuel

**Learnings :**
- Rapidité = différenciateur
- Fenêtre timing critique
- Approche fonctionne

**Action :** Tester 5-10 autres (validation marché > conversion unique)

---

### 2024-12-16 : Pricing Agence Défini

**Mensuel :** 50-500€ selon audience  
**Revenue Share :** 5-15% revenus app  
**Délai :** 7 jours  
**Services :** App + design + stores + maintenance + analytics

**Validation requise :** 3 clients confirment pricing

---

### 2024-12-16 : Documentation System

**Décision :** Single file + workflow @update  
**Statut :** ✅ V1.4 générée  
**Location :** `/mnt/project/WOULI_SOURCE_OF_TRUTH.md` (copie Claude) + `docs/` (repo Git)

---

### Mai 19, 2026 : Décision CDI

**CDI accepté :** Début 22 juin 2025  
**Motivation :** Apprendre vente B2B  
**Impact :** 5-10h/semaine projets  
**Update 16 déc :** Wouli 4h + Agence 6h

---

### 13 Mai 2026 : Swipe Tinder Natif

**Implémenté :** 13 mai  
**Statut :** Débat réouvert  
**Action requise :** A/B test 20-30 users

---

### 12 Mai 2026 : Multi-Sources + Bot Telegram

**Multi-sources :** Resident Advisor + Shotgun  
**Bot Telegram :** Quasi-prêt (bugs)

---

### 10 Mai 2026 : Notion Integration

**CSV → accounts-v5.json**  
**200+ établissements Lyon**  
**Statut :** ✅ Opérationnel

---

### 9-12 Mai 2026 : Crise Scraper V5

**6 versions en 4 jours**  
**Résultat :** ✅ V5 fixé 19 mai

---

### 9 Avril 2026 : Migration Claude Code

**Lovable → Claude Code**  
**Vélocité confirmée :** "limite = imagination"

---

### Février 2026 : Pause Projet

**0 commits**  
**Raison :** Réflexion CDI

---

### Décembre 2025 : Peak Dev

**153 commits**  
**Raison :** Temps + streams Twitch

---

### 26 Mars 2025 : Premier Commit

**Outil :** gpt-engineer-app  
**Stack :** Vite + React + shadcn/ui

---

## 🤔 QUESTIONS OUVERTES

### Stratégie

**🟢 RÉSOLU : Équilibre CDI / Side Project**
- ✅ Dual track validé (16 déc)
- ✅ Automatisation Wouli prioritaire
- ✅ Agence = push actif

**🟢 NOUVEAU : Validation Pivot Agence**
- Test 4 semaines
- 1 client OU "pas de marché"
- Deadline : 14 janvier 2025

---

### Produit Wouli

**🔴 Swipe vs Scroll**
- Implémenté 13 mai
- Débat réouvert
- A/B test requis

**🟡 Redesign Dark Mode**
- En attente scraper stable

---

### Business

**🔴 Définition Client B2B Wouli**
- Focus 1 segment requis

**🔴 Chicken & Egg**
- Users first validé
- Seuil : 50 actifs hebdo

**🟢 Pricing Agence**
- Défini : 50-500€/mois + revenue share
- À valider avec vrais clients

---

### Automatisation (Pré-CDI)

**🟢 Scraper**
- [ ] Cron hebdo auto
- [ ] Monitoring erreurs
- [ ] Auto-validation

**🟢 Social**
- [ ] Batch 10-15 posts
- [ ] Scheduler
- [ ] Templates

---

## 📊 GIT INSIGHTS

**Période :** 26 Mars 2025 → 14 Mai 2026 (14 mois)  
**Total Commits :** 750  
**Tools :** gpt-engineer → Lovable → Claude Code

**Commits/Mois :**
```
2025-03:   7
2025-04:  12
2025-05:  47
2025-06:  88
2025-07:  32
2025-08: 108
2025-09:  88
2025-10:  41
2025-11: 101
2025-12: 153 ← PEAK
2026-01:  16
2026-02:   0 ← PAUSE
2026-03:   1
2026-04:   4
2026-05:  52
```

**Moments Critiques :**
- 20 Mai 2025 : 16 reverts (bugs + refonte)
- Déc 2025 : 153 commits (temps + streams)
- Fév 2026 : 0 commits (pause CDI)
- 9 Avril 2026 : Migration Claude Code
- 9-12 Mai 2026 : V5 crisis (6 versions)
- 13 Mai 2026 : Swipe natif

---

## 🔄 CHANGELOG

### 2024-12-16 - V1.5
- ✅ Architecture technique swipe ajoutée (fragilité cascade hauteurs)
- ✅ Scraper guide opérationnel (installation, troubleshooting, leçons V1-V5)
- ✅ Features sociales architecture détaillée (amis, chat, viralité)
- ✅ Système tags & attribution events explicité (8 tags vs 6 catégories)
- ✅ Algorithme recommandations V2.0 formules précises
- ✅ Migration BDD 6 déc + Interface Admin 22 déc ajoutées DECISIONS_LOG
- ✅ Docs obsolètes archivés (workflow cleanup établi)

### 2024-12-16 - V1.4
- ✅ Dual track Wouli + Agence validé
- ✅ Premier prospect agence documenté
- ✅ Pricing agence défini
- ✅ Stratégie prospection créée
- ✅ Workflow @update hybrid Git setupé
- ✅ Documentation system finalisé

### 2024-12-16 - V1.3
- Git history analysis (750 commits)
- Dates précises DECISIONS_LOG
- Timeline tools evolution
- Activity patterns

### 2024-12-16 - V1.2
- Analyse historique conversations
- Corrections Basekou

### 2024-12-16 - V1.1
- Corrections initiales

### 2024-12-16 - V1.0
- Création initiale

---

**FIN DU DOCUMENT V1.4**
