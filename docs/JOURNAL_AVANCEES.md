# Journal des avancées — Wouli

> Compte rendu vivant pour donner du contexte aux sessions Claude (et à l'équipe).
> But : éviter de re-traiter ce qui est déjà réglé. **Lire avant de proposer des « corrections » sur les titres, les couleurs de carte ou l'énergie.**

---

## 🔄 RECENTRAGE — Semaine du 23 juin 2026

> ⚠️ **À lire en premier.** Cette entrée prime sur les sections « validé / ne pas régresser » ci-dessous. Plusieurs acquis de design sont désormais **sous revue**.

### Décision stratégique
- **Focus unique Wouli.** Agence mise de côté, cadre CDI abandonné.
- **Retour au postulat de base :** la seule question qui compte → *« l'app permet-elle, en 5 min, de savoir où sortir ? »*. Le fond avant la forme.
- **Growth :** partenariats visibilité avec établissements (gratuit-gratuit), à lancer avec Léa (stratégie de contenu, 1 format récurrent à tester).

### Produit — état réel
- **Scroll définitif** (plus de swipe vertical).
- **Scraper :** nettement plus performant + IA d'enrichissement (`extract-event`).
  - 🔴 **Goulot = validation :** ~5 events retraités toutes les 4-6h → diffusion trop lente, des events passent leur date. Backlog réel ~150 en attente. Cible : absorber ~150 events/semaine.
  - 🔵 Idée : outil de découverte auto de nouveaux comptes Instagram à scraper.
- **Déploiement :** 🔴 la dernière version ne sort pas sur le domaine cible (preview OK mais URL non présentable / domaine = ancienne version).

### ⚠️ SOUS REVUE — ne plus traiter comme « figé »
Le gros chantier design des dernières semaines est **remis en question** : il manque une **marque / un branding**, donc le design est « creux » (bons éléments isolés, mais ça ne résonne pas). Sont concernés :
- le système d'**énergies** (CLUB / SCÈNE / JOURNÉE)
- les **états de cartes** et la logique de **couleurs** (`color_card`)
- le système de **tags**

➡️ **Avant de re-corriger ou défendre ces éléments, vérifier qu'ils survivent au travail de branding à venir.** La vision produit et les fonctionnalités restent jugées bonnes ; c'est la couche identité/sens qui manque.

---

## 🟢 État actuel (à jour : juin 2026)

### Pipeline d'extraction — la source de vérité, c'est l'IA
L'edge function Supabase **`extract-event`** lit la description + le flyer (vision) et remplit AU PROPRE tous les champs d'un événement : titre nettoyé, énergie (CLUB/SCÈNE/JOURNÉE), date/heure réelles, lineup, prix, catégorie, **couleur de carte** (`color_card`).

➡️ **Conséquence importante :** pour tout event repassé par l'IA, `energy`, le **titre propre**, le **prix** et la **couleur** viennent déjà nettoyés du serveur. Le code de la carte (`EventCard.tsx`) ne fait que des **filets de secours** côté client pour les events pas encore traités. Ne pas « re-corriger » côté client ce que l'IA gère déjà.

- Fournisseur configurable : `EXTRACT_PROVIDER = gemini` (défaut, free tier) ou `anthropic`.
- Sécurité : header `x-extract-secret` exigé si `EXTRACT_SECRET` est défini ; `verify_jwt` activé.

### Couleur des cartes (validé, ne pas régresser)
- **CLUB** → dégradé de la **couleur dominante** de l'affiche (`color_card`).
- **SCÈNE** → fondu de la photo vers la **couleur dominante**.
- **JOURNÉE** → **PAS** la couleur de la photo. Identité « de jour » par **accent sémantique selon le sous-type**, sur fond papier crème fixe :
  - à-manger → terracotta `#C9683B`
  - à-boire → ambre `#D99A2B`
  - activités → sauge `#7E8C5A`
  - fallback → ocre doux `#B5853F`

`color_card` est calculé **à la source** (Deno fetch les images Instagram sans blocage CORS, là où le navigateur échouait). Fallback gracieux : couleur par défaut si l'image est inaccessible.

### Détection d'énergie — `deriveEnergy()` (filet client)
Utilisée seulement si `event.energy` (serveur) est absent. Priorité :
1. signal DJ (`dj`, `mix`, `b2b`) → CLUB
2. signaux SCÈNE dans titre **+ tags** (`concert`, `live`, `spectacle`, `théâtre`)
3. salle connue dans le venue (`transbordeur`, `radiant`, `ninkasi`, `théâtre`, `salle`) → SCÈNE
4. `event_type === 'soirees'` : **< 22h → SCÈNE**, **≥ 22h → CLUB**
5. défaut → JOURNÉE

Un `console.log("[deriveEnergy] …")` trace l'énergie + les signaux (à **retirer une fois calibré**).

### Prix
`getPriceInfo()` ajoute « € » si le prix est numérique sans devise (`"30"` → `"30€"`).

---

## ✅ Sujets DÉJÀ réglés — ne pas rouvrir sans raison

- **Titres « caption » Instagram** : résolu **côté IA** (titre propre ≤ 60 caractères à l'extraction). Le filet client `cleanTitle()` retombe sur le nom du lieu uniquement pour les events non traités (caption = `–`/`:` + > 5 mots).
  - 👉 **Le titre n'est PAS jugé « trop long » sur sa longueur de texte.** Le seul vrai problème = **quand il déborde sur plus de 2 lignes** dans la carte. C'est déjà géré par `line-clamp-2` + `titleFontSize()`. Ne traiter QUE les cas de débordement réel constatés.
- **Couleur dominante bloquée par le CORS navigateur** : résolu en calculant `color_card` côté serveur (edge function).
- **Identité visuelle des 3 énergies** : tranchée et validée (voir ci-dessus).

---

## 🟡 Points ouverts / à surveiller

- **Logs `[deriveEnergy]`** encore actifs pour calibrer → à retirer une fois les classements jugés corrects.
- **Signaux volontairement larges** (demandés) pouvant faire des faux positifs : `'salle'` (peut matcher une adresse) et `'live'` (sous-chaîne, ex. « Olivier »). Resserrer avec des limites de mots si les logs montrent des erreurs.
- **Titres > 2 lignes** : seul critère de « titre problématique ». Vérifier au cas par cas sur la preview, ne pas sur-filtrer.
- **Backfill couleurs anciens events** : peu utile (URLs Instagram périmées → fetch échoue). La couleur se remplit surtout sur les **nouveaux scrapes** (URL fraîche au moment de l'extraction).

---

## 🔍 Comment vérifier

- Preview Vercel de la PR (branche `claude/vibrant-ptolemy-Ojdhs`).
- Console navigateur (F12) → lignes `[deriveEnergy]` en swipant.
- Côté data : logs de l'edge function (`extract-event`) + décompte SQL des `color_card` non nulles après un run d'extraction.

---

*Fichiers clés : `src/components/EventCard.tsx`, `src/utils/eventCardHelpers.ts`, `supabase/functions/extract-event/index.ts`.*
