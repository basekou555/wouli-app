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
