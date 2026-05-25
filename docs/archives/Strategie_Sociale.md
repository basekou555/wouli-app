## 🎯 VISION & PHILOSOPHIE

### Positionnement : "Social Hybride"
Wouli n'est **PAS** un réseau social de plus. C'est un **outil de coordination sociale** pour sortir spontanément à Lyon. Le social sert à :
- **Voir** qui de tes amis sort (social proof)
- **Coordonner** les sorties ensemble (utilité pratique)
- **Partager** les bons plans (viralité organique)

**Principe fondamental** : Chaque feature sociale doit faciliter la rencontre IRL, pas la remplacer.

---

## 🏗️ ARCHITECTURE SOCIALE

### Système d'Amis - Bidirectionnel
- **Connexion réelle** : Demande + Acceptation (pas de follow unilatéral)
- **Pas de DM ouvert** : Chat uniquement entre amis confirmés
- **Privacy first** : Chacun contrôle sa visibilité
- **Cercle restreint** : Qualité > Quantité

### Chat Contextuel Événement
- **Temporaire** : Disparaît 24h après l'événement
- **Privé** : Seulement entre amis qui participent
- **Groupes flexibles** : Créer/modifier les participants
- **Focus coordination** : "On se retrouve où ?" pas "Comment ça va ?"

### Viralité Organique
- **Partage externe** : Lien unique par user/event
- **Preview limitée** : 3 swipes max pour non-inscrits
- **Conversion naturelle** : "Inscris-toi pour rejoindre Marie"
- **Tracking référent** : Mesurer qui ramène des users

---

## 📋 FONCTIONNALITÉS DÉTAILLÉES

### Phase 1 : Social Proof & Connexions (2 semaines)

#### 1. Système d'Amis
```
TABLES:
- friendships (user_id, friend_id, status, requested_at, accepted_at)
- Status : pending | accepted | blocked

FEATURES:
✓ Recherche par username
✓ Import contacts (hash only)
✓ Demandes entrantes/sortantes
✓ Notifications d'acceptation
```

#### 2. Profils Enrichis
```
DONNÉES:
- Bio (140 caractères)
- Stats : X amis, X sorties/mois
- Privacy settings granulaires

VISIBILITÉ:
- Likes d'events : everyone | friends | nobody
- Participations : everyone | friends | nobody  
- Demandes d'ami : on | off
```

#### 3. Social Proof sur Events
```
AFFICHAGE:
- "Marie et 2 amis participent" + avatars 20px
- "15 personnes intéressées" (métrique agrégée)
- Ordre : Amis proches > Amis > Anonyme

RÈGLES:
- Fake metrics OK (arrondir, augmenter)
- Fake people JAMAIS
```

### Phase 2 : Coordination & Chat (2 semaines)

#### 4. Chat Événement
```
ARCHITECTURE:
- event_conversations (event_id, created_by, expires_at)
- participants (conversation_id, user_id, can_add)
- messages (content, sender_id, created_at)

LOGIQUE:
- Créer groupe avec amis qui ont liké/participent
- Ajouter/retirer participants (amis only)
- Auto-expire : date_event + 24h
- Nom auto : "Sortie [Event]" (modifiable)

LIMITATIONS:
- Max 20 participants/groupe
- Texte only (photos en v2)
- Pas de chat général public
```

#### 5. Notifications Intelligentes
```
TYPES PRIORITAIRES:
✓ "Tom a accepté ta demande d'ami"
✓ "3 amis vont au Sucre ce soir" 
✓ "Rappel : Event dans 2h"
✓ "Marie t'a ajouté au groupe [Event]"

JAMAIS:
✗ "X a liké un event"
✗ "Nouveau message" (sauf urgent)
✗ Spam marketing
```

### Phase 3 : Viralité & Growth (1 semaine)

#### 6. Partage Viral
```
FLOW:
1. Marie partage event → Lien unique wouli.app/e/[id]?ref=marie
2. Tom clique → Voit belle carte event
3. Peut swiper 3 events max (teasing)
4. "Inscris-toi pour participer"
5. Sign up → Auto-suggestion "Ajouter Marie"

TRACKING:
- Conversions par référent
- Events les plus partagés
- Taux inscription après preview
```

---

## 📊 ROADMAP & PRIORITÉS

### Sprint 1 (Semaine 1-2) - Fondations
1. ✅ Tables friendships + RLS
2. ✅ UI recherche/ajout d'amis  
3. ✅ Social proof basique sur cartes
4. ✅ Privacy settings profil

**Livrable** : Les users peuvent se connecter et voir leurs amis sur les events

### Sprint 2 (Semaine 3-4) - Coordination
5. ✅ Chat événement (groupes privés)
6. ✅ Notifications essentielles
7. ✅ Inviter amis à events
8. ✅ Real-time Supabase

**Livrable** : Les amis peuvent s'organiser pour sortir ensemble

### Sprint 3 (Semaine 5) - Croissance
9. ✅ Landing pages publiques events
10. ✅ Système de partage avec tracking
11. ✅ Import contacts (optionnel)
12. ✅ Onboarding optimisé

**Livrable** : Acquisition virale activée

### Backlog Premium (Plus tard)
- Chat permanent entre amis (payant)
- Memories post-event avec photos
- Groupes d'amis permanents
- Suggestions d'amis intelligentes
- Stories à la Instagram

---

## 📈 MÉTRIQUES DE SUCCÈS

### KPIs Phase 1 (1 mois)
- **30%** des users ajoutent minimum 1 ami
- **50%** des participants utilisent le chat event
- **20%** des users invitent un ami externe
- **10%** de conversion sur partages viraux

### North Star Metrics
- **Rétention J7** : 40% reviennent chaque semaine
- **Viralité K-factor** : 0.3 (chaque user amène 0.3 nouveau)
- **Engagement** : 3+ interactions sociales par session

---

## ⚠️ POINTS D'ATTENTION & RISQUES

### Risques Identifiés
1. **Masse critique** : Mitigation → Fake metrics (pas fake people)
2. **Modération chat** : Mitigation → Chat privé only, pas de DM inconnus
3. **Complexité UX** : Mitigation → Features progressives, onboarding clair
4. **Coûts infra** : Mitigation → Supabase jusqu'à 100 users, puis réévaluer

### Principes Non-Négociables
- **Jamais** de fake personnes (fake metrics OK)
- **Jamais** de chat avec inconnus (sécurité)
- **Jamais** de spam notifs (respect utilisateur)
- **Toujours** focus sur rencontre IRL (pas virtual)

### Estimations Coûts
- **0-100 users** : Gratuit (Supabase free tier)
- **100-1000 users** : ~25€/mois (Supabase Pro)
- **1000+ users** : ~100€/mois (scaling nécessaire)

---

## 🔧 STACK TECHNIQUE SOCIALE

### Backend
```typescript
// Supabase Tables
- profiles (enrichis avec privacy_settings)
- friendships (relations bidirectionnelles)
- event_conversations (chats temporaires)
- conversation_participants
- messages (real-time)
- notifications

// RLS Policies
- Amis peuvent voir selon privacy
- Chat seulement entre amis
- Notifications personnelles only
```

### Frontend
```typescript
// Composants Clés
- <FriendsList /> : Liste avec statuts
- <EventChat /> : Panel/modal chat
- <SocialProof /> : Avatars sur cartes
- <ShareModal /> : Génération liens
- <NotificationCenter /> : Badge + liste

// Hooks Custom
- useFriends() : Liste et statuts
- useEventChat() : Messages real-time  
- useNotifications() : Badge + updates
```

### Optimisations
- Memoization des listes d'amis
- Lazy loading des messages
- Cache des avatars
- Debounce des notifications

---

## 💡 DÉCISIONS STRATÉGIQUES VALIDÉES

1. **Chat contextuel only** → Permanent en premium
2. **Amis bidirectionnels** → Pas de follow public
3. **Privacy granulaire** → User en contrôle
4. **Partage = growth** → Priorité acquisition
5. **Fake metrics OK** → Fake people jamais
6. **Notifications FOMO** → Jamais de spam
7. **Mobile first** → Desktop secondaire

---

## 🚀 PROCHAINES ÉTAPES

### Immédiat (Cette semaine)
1. Implémenter système d'amis avec Lovable
2. Tester import contacts
3. Ajouter social proof sur cartes

### Court terme (2 semaines)
4. Chat événement fonctionnel
5. Système de partage viral
6. Notifications basiques

### Validation (Semaine 3)
7. Tests avec 10 beta users
8. Mesurer les KPIs
9. Itérer selon feedback

---

## 📝 NOTES POUR L'IMPLÉMENTATION

### Pour Lovable
- Toujours préciser "mobile-first"
- Utiliser Tailwind + shadcn/ui
- Demander TypeScript
- Activer Supabase RLS
- Real-time pour chat

### Pour les Pilotes
- Emphasizer coordination (pas réseau social)
- Montrer valeur immédiate (voir ses amis)
- Privacy rassurante (contrôle total)
- Chat temporaire (pas d'historique gênant)

---

**Philosophie finale** : Le social dans Wouli doit créer des moments IRL, pas des likes virtuels. Chaque feature doit répondre à : "Est-ce que ça aide les gens à sortir ensemble ce soir ?"