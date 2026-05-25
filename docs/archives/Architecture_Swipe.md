# Architecture du Système de Swipe - Wouli

> ⚠️ **DOCUMENTATION CRITIQUE** : Ce fichier documente la fragilité du système de swipe.  
> **À lire AVANT toute modification de layout dans UserApp.tsx**

---

## 1. Vue d'Ensemble

### Principe de Fonctionnement

Le système de swipe de Wouli repose sur la bibliothèque **`react-tinder-card`** (WouliEventCard.tsx, lignes 274-288).

**Contrainte fondamentale :** Cette bibliothèque **nécessite impérativement** un container parent avec une hauteur explicite pour fonctionner correctement.

### Architecture Actuelle

L'architecture est une **cascade de 5 niveaux de contraintes de hauteur** :

```
h-screen → flex-1 → max-h-full → absolute inset-0 → TinderCard
```

**Fragilité critique :** Chaque niveau dépend du précédent. Modifier un maillon casse toute la chaîne.

---

## 2. Chaîne de Dépendances Critique

### Structure Complète (avec numéros de lignes)

```
UserApp.tsx
│
├─ Ligne 73: <div className="h-screen bg-background flex flex-col overflow-hidden">
│  └─ Définit 100vh comme hauteur de référence globale
│  └─ flex flex-col : active le layout flex vertical
│  └─ overflow-hidden : empêche scroll horizontal/vertical
│
├─ Ligne 75: <div className="bg-card p-4 flex-shrink-0">
│  └─ Header avec filtres de catégories
│  └─ flex-shrink-0 : hauteur AUTO, ne participe PAS au flex-1
│
├─ Ligne 97: <div className="flex-1 flex items-start justify-center px-3 pt-4 overflow-hidden">
│  └─ Zone centrale qui prend TOUT l'espace restant après le header
│  └─ flex-1 : calcule automatiquement la hauteur disponible
│  └─ overflow-hidden : critique pour éviter débordements
│     │
│     └─ Ligne 99: <div className="relative w-full max-w-[400px] mx-auto max-h-full">
│        └─ Container des cartes avec contraintes
│        └─ relative : OBLIGATOIRE pour absolute des cartes enfants
│        └─ max-h-full : hérite de la hauteur du parent flex-1
│        └─ max-w-[400px] : limite la largeur sur desktop
│           │
│           └─ Ligne 102: <div className="absolute inset-0 z-10">
│              └─ Carte actuelle (currentIndex)
│              └─ absolute inset-0 : remplit le container relative
│              └─ z-10 : au-dessus de la carte preview (z-0)
│                 │
│                 └─ WouliEventCard.tsx ligne 274-288
│                    └─ TinderCard className="absolute w-full h-full"
│                    └─ Reçoit la hauteur du container absolute parent
│
└─ Ligne 160: <BottomNavigation />
   └─ fixed bottom-0 : en dehors du flux, ne compte PAS dans h-screen
```

### Règles Critiques à RESPECTER ABSOLUMENT

| Niveau | Ligne | Classe Critique | Conséquence si Modifiée |
|--------|-------|-----------------|------------------------|
| 1 | 73 | `h-screen` | Toute la cascade perd sa référence de hauteur |
| 2 | 97 | `flex-1` | Container de cartes n'a plus de hauteur définie |
| 3 | 99 | `relative` | Les cartes `absolute` ne se positionnent plus correctement |
| 4 | 99 | `max-h-full` | Cartes débordent du container |
| 5 | 102 | `absolute inset-0` | TinderCard n'a plus de hauteur explicite → CASSE |

**⚠️ RÈGLES STRICTES :**
- ❌ **NE JAMAIS** changer `h-screen` sans plan de migration complet
- ❌ **NE JAMAIS** retirer `relative` du container ligne 99
- ❌ **NE JAMAIS** retirer `absolute inset-0` des cartes lignes 102 et 130
- ❌ **NE JAMAIS** modifier `flex-1` ligne 97 sans refactor complet
- ❌ **NE JAMAIS** retirer `overflow-hidden` lignes 73 et 97

---

## 3. BottomNavigation - Le Piège Invisible

### Configuration Actuelle

**BottomNavigation.tsx, ligne 33 :**
```tsx
className="fixed bottom-0 left-0 right-0 h-[60px] bg-white px-4"
```

### Le Problème du `position: fixed`

**Comportement CSS :**
- `position: fixed` retire l'élément du flux normal du document
- L'élément est positionné par rapport au viewport, pas au parent

**Impact sur UserApp :**
```
UserApp calcule avec h-screen = 100vh
Mais BottomNavigation prend 60px EN PLUS (hors flux)
Résultat : hauteur réelle disponible = 100vh - 60px
```

### Impact Visuel par Device

| Device | Résolution | Problème Observé |
|--------|-----------|------------------|
| Desktop | ≥1024px | ✅ Pas de problème visible (écran assez grand) |
| Mobile Portrait | 375x667px | ⚠️ Cards peuvent chevaucher la nav de 20-40px |
| Mobile Paysage | 667x375px | ❌ **Problème critique**, boutons inaccessibles |
| iOS Safari | Variable | ❌ Barres système aggravent le problème (safe-area non gérée) |

### Règles Strictes

- ❌ **NE JAMAIS** passer BottomNavigation en `relative` dans UserApp sans refactor grid complet
- ❌ **NE JAMAIS** modifier la hauteur `h-[60px]` sans ajuster les calculs parent
- ⚠️ **Si modification nécessaire** : créer un prop `mode="inline" | "fixed"` et tester sur 5+ devices

### Solution Temporaire si Overlap Constaté

```tsx
// UserApp.tsx, ligne 97
className="flex-1 flex items-start justify-center px-3 pt-4 pb-16 overflow-hidden"
//                                                             ^^^^^ +padding-bottom
```

---

## 4. Zone d'Action Safe

### ✅ MODIFICATIONS SANS RISQUE

**Vous POUVEZ modifier librement :**

| Zone | Fichiers | Exemples |
|------|----------|----------|
| **Contenu visuel des cartes** | WouliEventCard.tsx | Textes, couleurs, polices, images, badges |
| **Logique métier** | UserApp.tsx, useAllEvents.ts | Filtres par catégorie, algorithme de tri |
| **Animations CSS internes** | WouliEventCard.tsx | Transitions, hover states, vibrations |
| **Composants enfants** | UrgentBadge, SocialProof, EventActions | Tout sauf leur positionnement |
| **Callbacks événementiels** | UserApp.tsx | onLike, onParticipate, onSwipeLeft/Right |
| **État local** | UserApp.tsx | likedEvents, participatingEvents, currentIndex |

### ❌ ZONES DE DANGER ABSOLU

**NE JAMAIS TOUCHER sans plan détaillé et tests exhaustifs :**

| Zone | Fichiers | Lignes | Pourquoi c'est critique |
|------|----------|--------|------------------------|
| **Structure de hauteur** | UserApp.tsx | 73-158 | Cascade de dépendances |
| **Positionnement cartes** | UserApp.tsx | 99, 102, 130 | absolute/relative/inset-0 |
| **Position navigation** | BottomNavigation.tsx | 33 | fixed hors flux |
| **Props TinderCard** | WouliEventCard.tsx | 274-288 | className, swipeThreshold |
| **Classes layout Tailwind** | UserApp.tsx | 73, 97, 99 | flex, h-*, max-h-* |

---

## 5. Checklist Avant Modification du Layout

### ⚠️ OBLIGATOIRE : À lire AVANT tout changement dans UserApp.tsx

#### Avant de Toucher le Code

- [ ] J'ai lu SWIPE_ARCHITECTURE.md en entier
- [ ] Je comprends la cascade de dépendances de hauteur (section 2)
- [ ] Je comprends pourquoi BottomNavigation est `fixed` (section 3)
- [ ] J'ai identifié quel maillon de la chaîne je vais modifier
- [ ] J'ai un plan de rollback immédiat (commit ID noté : ____________)

#### Pendant la Modification

- [ ] Je n'ai modifié QU'UN SEUL maillon à la fois
- [ ] J'ai conservé tous les positionnements `relative`/`absolute`
- [ ] Les classes de hauteur sont intactes OU remplacées par équivalent exact
- [ ] Je n'ai PAS touché aux lignes 99, 102, 130 (sauf si c'est le but)

#### Après Modification - Tests Obligatoires

**Devices à tester (minimum) :**

| Device | Test Swipe | Test Overlap | Notes |
|--------|------------|--------------|-------|
| Desktop (Chrome) | [ ] ✅ / ❌ | [ ] ✅ / ❌ | Résolution 1920x1080 |
| Mobile Portrait | [ ] ✅ / ❌ | [ ] ✅ / ❌ | iPhone SE (375x667) ou équivalent |
| Mobile Paysage | [ ] ✅ / ❌ | [ ] ✅ / ❌ | Rotate 90° |
| iOS Safari | [ ] ✅ / ❌ | [ ] ✅ / ❌ | Safe-area problématique |
| Android Chrome | [ ] ✅ / ❌ | [ ] ✅ / ❌ | Galaxy S21 ou équivalent |

**Checklist visuelle :**
- [ ] Le swipe gauche/droite fonctionne sur toutes les cartes
- [ ] Aucun overlap entre cartes et BottomNavigation
- [ ] Les cartes suivantes (preview z-0) sont visibles en transparence
- [ ] Pas de scroll horizontal inattendu
- [ ] Les boutons Like/Dislike/Participer sont accessibles
- [ ] Les transitions sont fluides (60fps)

**🚨 SI UN SEUL TEST ÉCHOUE → ROLLBACK IMMÉDIAT**

---

## 6. Symptômes de Régression (Guide de Debugging)

### Page Blanche Totale

**Symptôme :** L'app ne charge pas, écran blanc.

**Cause Probable :** Erreur JavaScript critique (souvent cascade de hauteur cassée)

**Diagnostic :**
1. Ouvrir Console navigateur (F12)
2. Chercher erreur React/TypeScript
3. Vérifier ligne mentionnée dans la stack trace

**Lignes Suspectes :**
- UserApp.tsx ligne 73 (`h-screen`)
- UserApp.tsx ligne 97 (`flex-1`)
- WouliEventCard.tsx ligne 274-288 (TinderCard)

**Action :** Rollback immédiat, analyser les logs

---

### Cartes Invisibles (mais page chargée)

**Symptôme :** Page UserApp chargée, header visible, mais aucune carte.

**Cause Probable :** Positionnement `absolute`/`relative` cassé

**Diagnostic :**
1. Ouvrir DevTools (F12)
2. Inspecter élément `div.absolute.inset-0` (ligne 102)
3. Vérifier que le parent a `position: relative`
4. Vérifier hauteur calculée du container

**Lignes Suspectes :**
- UserApp.tsx ligne 99 (`relative` manquant)
- UserApp.tsx ligne 102 (`absolute inset-0` modifié)

**Action :**
```tsx
// Restaurer
<div className="relative w-full max-w-[400px] mx-auto max-h-full">
//              ^^^^^^^^ CRITIQUE
```

---

### Swipe qui ne Fonctionne Plus

**Symptôme :** Cartes visibles mais impossibles à swiper.

**Cause Probable :** TinderCard n'a plus de hauteur explicite

**Diagnostic :**
1. Ouvrir DevTools (F12)
2. Inspecter le container `relative` ligne 99
3. Mesurer sa hauteur calculée (computed height)
4. Si hauteur = 0px → Cascade cassée

**Lignes Suspectes :**
- UserApp.tsx ligne 97 (`flex-1` modifié ou supprimé)
- UserApp.tsx ligne 99 (`max-h-full` modifié)
- UserApp.tsx ligne 73 (`h-screen` changé)

**Action :**
```tsx
// Vérifier cascade complète
h-screen → flex-1 → max-h-full → absolute inset-0
```

---

### Overlap avec BottomNavigation

**Symptôme :** Cartes ou boutons cachés derrière la navigation.

**Cause Probable :** Calcul de hauteur incorrect (100vh vs 100vh - 60px)

**Diagnostic :**
1. Ouvrir DevTools sur mobile (Device Toolbar)
2. Vérifier position des boutons Like/Dislike/Participer
3. Mesurer distance avec bottom de la page

**Ligne Suspecte :**
- UserApp.tsx ligne 73 (`h-screen` ne compte pas BottomNav)

**Solution Temporaire :**
```tsx
// Ajouter padding-bottom
<div className="flex-1 flex items-start justify-center px-3 pt-4 pb-16 overflow-hidden">
//                                                             ^^^^^^ +64px
```

**Solution Long Terme :**
- Utiliser `calc(100vh - 60px)` ou CSS custom properties
- Gérer `env(safe-area-inset-bottom)` pour iOS

---

### Scroll Horizontal Inattendu

**Symptôme :** Possibilité de scroller horizontalement sur la page.

**Cause Probable :** Cartes sortent du container `max-w-[400px]`

**Diagnostic :**
1. Ouvrir DevTools (F12)
2. Inspecter largeur des cartes
3. Vérifier si `overflow-hidden` est présent

**Lignes Suspectes :**
- UserApp.tsx ligne 99 (`w-full max-w-[400px]`)
- UserApp.tsx ligne 73 ou 97 (`overflow-hidden` manquant)

**Action :**
```tsx
// Vérifier présence sur DEUX niveaux
<div className="h-screen ... overflow-hidden">  {/* Ligne 73 */}
  <div className="flex-1 ... overflow-hidden">   {/* Ligne 97 */}
```

---

### Cartes Preview (z-0) Invisible

**Symptôme :** Seule la carte actuelle est visible, pas de preview de la suivante.

**Cause Probable :** z-index conflict ou transform scale cassé

**Diagnostic :**
1. Ouvrir DevTools (F12)
2. Inspecter `div.absolute.z-0` ligne 130
3. Vérifier `transform: scale(0.95)` appliqué
4. Vérifier `opacity: 0.5` appliqué

**Lignes Suspectes :**
- UserApp.tsx ligne 130 (`transform scale-95 opacity-50`)
- UserApp.tsx ligne 130 (`pointer-events-none`)

**Action :**
```tsx
// Restaurer classes complètes
<div className="absolute inset-0 z-0 transform scale-95 opacity-50 pointer-events-none">
//                                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ CRITIQUE
```

---

## 7. Roadmap d'Amélioration

> ⚠️ **NE PAS IMPLÉMENTER MAINTENANT**  
> Cette section documente les améliorations futures, pas à faire immédiatement.

### Court Terme (1-2 semaines)

**Objectif :** Stabiliser l'existant sans refactor majeur

- [ ] **Safe-areas iOS** : Ajouter `env(safe-area-inset-bottom)` pour iOS Safari
  ```css
  /* index.css */
  .app-container {
    height: calc(100vh - env(safe-area-inset-bottom, 0px));
  }
  ```

- [ ] **Prop mode pour BottomNavigation** : Créer variant inline/fixed
  ```tsx
  <BottomNavigation mode="fixed" /> {/* UserApp */}
  <BottomNavigation mode="inline" /> {/* Autres pages */}
  ```

- [ ] **Documentation breakpoints** : Documenter comportement à 320px, 375px, 768px, 1024px

- [ ] **Tests devices** : Tester sur minimum 5 devices physiques
  - iPhone SE (320x568)
  - iPhone 14 (390x844)
  - Samsung S21 (360x800)
  - iPad (768x1024)
  - MacBook (1440x900)

---

### Moyen Terme (1-2 mois)

**Objectif :** Rendre le système plus maintenable et robuste

- [ ] **Composant `SwipeLayout` dédié** : Isoler toute la logique layout
  ```tsx
  <SwipeLayout>
    <SwipeCard event={currentEvent} />
    <SwipePreview event={nextEvent} />
  </SwipeLayout>
  ```

- [ ] **CSS Custom Properties** : Remplacer cascade Tailwind
  ```css
  :root {
    --header-height: 80px;
    --nav-height: 60px;
    --safe-area-bottom: env(safe-area-inset-bottom, 0px);
    --swipe-container-height: calc(
      100vh - var(--header-height) - var(--nav-height) - var(--safe-area-bottom)
    );
  }
  ```

- [ ] **Tests visuels automatisés** : Playwright + screenshot comparison
  ```typescript
  test('swipe cards render correctly', async ({ page }) => {
    await page.goto('/app');
    await expect(page).toHaveScreenshot('swipe-desktop.png');
  });
  ```

- [ ] **Storybook** : Isoler cartes pour tests
  ```tsx
  export const Default = () => <WouliEventCard event={mockEvent} />;
  export const WithFriends = () => <WouliEventCard event={mockEventWithFriends} />;
  ```

---

### Long Terme (3-6 mois)

**Objectif :** Migration vers une solution moderne et pérenne

#### Option 1 : Migrer vers `@use-gesture/react`

**Avantages :**
- Plus moderne que `react-tinder-card`
- Meilleur support TypeScript
- Contrôle fin des gestures
- Déjà dans les dépendances du projet

**Migration :**
```tsx
import { useGesture } from '@use-gesture/react';
import { useSpring, animated } from '@react-spring/web';

const [{ x, y, rot }, api] = useSpring(() => ({ x: 0, y: 0, rot: 0 }));

const bind = useGesture({
  onDrag: ({ offset: [ox, oy] }) => {
    api.start({ x: ox, y: oy, rot: ox / 10 });
  },
  onDragEnd: ({ offset: [ox] }) => {
    if (Math.abs(ox) > 100) handleSwipe(ox > 0 ? 'right' : 'left');
    else api.start({ x: 0, y: 0, rot: 0 });
  }
});
```

#### Option 2 : CSS Grid + Touch Events Natifs

**Avantages :**
- Zéro dépendance externe
- Contrôle total
- Performance maximale

**Inconvénients :**
- Temps de développement élevé
- Gestion complexe des edge cases

#### Option 3 : `framer-motion`

**Avantages :**
- Déjà dans les dépendances
- Excellente documentation
- Animations fluides out-of-the-box

**Migration :**
```tsx
import { motion } from 'framer-motion';

<motion.div
  drag="x"
  dragConstraints={{ left: 0, right: 0 }}
  onDragEnd={(e, { offset, velocity }) => {
    if (Math.abs(offset.x) > 100) handleSwipe(offset.x > 0 ? 'right' : 'left');
  }}
>
  <WouliEventCard event={currentEvent} />
</motion.div>
```

---

### PWA & Responsive

**Objectifs spécifiques :**

- [ ] **Fullscreen mode** : Gérer `display-mode: fullscreen` dans PWA
- [ ] **Orientation changes** : Gérer rotation device
  ```typescript
  useEffect(() => {
    const handleOrientationChange = () => {
      // Recalculer hauteurs
    };
    window.addEventListener('orientationchange', handleOrientationChange);
  }, []);
  ```

- [ ] **Keyboard avoidance** : Sur mobile, quand clavier ouvert
- [ ] **Pull-to-refresh** : Désactiver sur page swipe (interfère avec drag vertical)

---

## Impact de Cette Documentation

### Bénéfices Immédiats

✅ **Comprendre POURQUOI le swipe casse facilement**
- Cascade de dépendances documentée avec numéros de lignes
- Visualisation claire de la chaîne fragile

✅ **Checklist avant modification = moins de régressions**
- Liste de vérification obligatoire (section 5)
- Tests minimum sur 5 devices

✅ **Guide de debugging = rollback rapide si problème**
- Symptômes visuels → Causes probables (section 6)
- Actions correctives immédiates

### Bénéfices Long Terme

✅ **Onboarding nouveaux développeurs facilité**
- Documentation complète et accessible
- Exemples concrets et numéros de lignes

✅ **Base de connaissances pour future refonte**
- Roadmap claire (section 7)
- Technologies alternatives évaluées

✅ **Documentation technique pour audit qualité**
- Architecture documentée
- Zones de fragilité identifiées

### Maintenance de Ce Document

**À faire après chaque refactor layout :**
- 📝 Mettre à jour les numéros de lignes (section 2)
- 📝 Ajouter nouveaux symptômes découverts (section 6)
- 📝 Documenter tentatives de fix (succès ET échecs)
- 📝 Mettre à jour roadmap avec avancement (section 7)

**Versioning :**
```
v1.0 - 2025-01-09 : Documentation initiale (commit b1ff20b)
v1.1 - [DATE]     : [Changements]
```

---

## Contact & Support

**En cas de doute :** TOUJOURS lire cette documentation AVANT de modifier UserApp.tsx.

**Si problème malgré cette doc :**
1. Vérifier section 6 (Symptômes de Régression)
2. Rollback au commit précédent
3. Documenter le problème rencontré dans une issue GitHub
4. Mettre à jour cette documentation avec le nouveau cas

---

**Dernière mise à jour :** 2025-01-09  
**Version :** 1.0  
**Commit de référence :** b1ff20b (Add borders to clickable elements)