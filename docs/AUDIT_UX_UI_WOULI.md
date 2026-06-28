# Audit UX/UI Wouli — Grille d'analyse remplie

> Audit ancré dans le code réel (pas théorique). Chaque ligne renvoie à un fichier
> précis. Lecture : Wouli n'est pas un annuaire, c'est une **app de décision inspirée**
> — l'expérience doit transformer une hésitation en envie, puis en action.
>
> Méthode : pour chaque bloc → tableau `État actuel · Problème observé · Impact UX ·
> Recommandation · Priorité`, puis une note /5 et un verdict (Bloquant / Important / Secondaire).
>
> Échelle : 1 absent/problématique · 2 présent mais faible · 3 correct mais perfectible · 4 bon · 5 très solide.
>
> *Dernière passe : 2026-06-28.*

---

## ⚠️ Écart majeur repéré d'emblée (méta)

Le `CLAUDE.md` décrit le swipe comme un système Tinder horizontal (`react-tinder-card`)
critique et fragile. **En réalité, le feed live (`UserApp.tsx`) est un scroll vertical
TikTok (scroll-snap CSS)** avec `EventCard`. Le composant `SwipeCard.tsx` (swipe gauche/droite
framer-motion) existe **mais n'est branché nulle part** (`UserApp.tsx:316-335` rend `EventCard`
en direct). Il y a donc **deux paradigmes d'interaction concurrents** dans le repo, dont un mort.
→ Décider lequel est canonique avant tout le reste : ça conditionne les blocs 3, 4 et 6.

---

## 1) Promesse et rôle — **Note : 4/5 · Important**

| État actuel | Problème observé | Impact UX | Recommandation | Priorité |
|---|---|---|---|---|
| Hero `Home.tsx:42-51` : « Qu'est-ce qu'on fait ce soir ? » + « Swipe, like, participe ». Promesse claire, orientée inspiration/décision. | La promesse vit sur le **landing**, pas dans l'app. Une fois dans `/app`, plus aucun rappel du « ce soir » (header = Menu/Toggle/Filtres seulement, `UserApp.tsx:280-306`). | Bon hook marketing, mais la valeur n'est pas réaffirmée au moment de décider. | Réinjecter un micro-fil narratif dans l'app (ex. titre contextuel « Ce soir à Lyon · 23 sorties »). | Important |
| `ScrollPreview` montre le geste TikTok dès le hero. | Le mot « Swipe » est employé alors que l'app **scrolle** (vertical). Incohérence de vocabulaire. | Léger décalage attente/réalité au 1er usage. | Aligner le wording sur le geste réel (« scrolle ») OU rebrancher un vrai swipe. | Important |
| L'app ne ressemble pas à un annuaire : carte plein écran, énergie visuelle. | — | Différenciation OK vs Instagram. | Maintenir. | — |

**Verdict :** promesse forte et défendable, mais elle s'évapore une fois dans le produit.

---

## 2) Entrée utilisateur — **Note : 2/5 · 🚨 Bloquant**

| État actuel | Problème observé | Impact UX | Recommandation | Priorité |
|---|---|---|---|---|
| CTA Home « Découvrir les événements → » pointe vers `/app` (`Home.tsx:59`). | `/app` est sous `ProtectedRoute` (`App.tsx:73-77`). Sans session → redirection `/auth` (`ProtectedRoute.tsx:32-38`). **Impossible d'explorer sans compte.** | 🚨 Mur d'auth avant toute valeur. Pour une cible Gen Z (parcours courts), c'est le plus gros point de fuite du funnel. | Mode **découverte anonyme** : rendre le feed lisible sans login, déclencher l'auth seulement à l'action (like/participe). | Bloquant |
| Après auth, `ProtectedRoute.tsx:60-68` force l'onboarding (`needsOnboarding`) avant `/app`. | Onboarding = 4 étapes (welcome → prénom → **min. 5 mots-clés** → confirmation, `Onboarding.tsx` + `KeywordSelector.tsx:79`). | Double friction empilée : auth **puis** onboarding obligatoire avant le 1er événement vu. | Rendre l'onboarding **skippable / progressif** : laisser entrer dans le feed, apprendre les goûts via les swipes (le moteur le permet déjà, cf. bloc 9). | Bloquant |
| Le 1er geste (scroll) est satisfaisant une fois dedans. | Mais il arrive trop tard dans le parcours. | — | Avancer le « moment magique » avant le compte. | — |

**Verdict :** l'app demande l'engagement (compte + 5 mots-clés) **avant** d'avoir rien donné. À inverser en priorité absolue.

---

## 3) Découverte du contenu — **Note : 4/5 · Important**

| État actuel | Problème observé | Impact UX | Recommandation | Priorité |
|---|---|---|---|---|
| Feed vertical scroll-snap plein écran, 1 carte/écran (`UserApp.tsx:309-335`), preload à -3 cartes (`UserApp.tsx:154-158`). | — | Scroll fluide, envie de continuer : OK. | Maintenir. | — |
| `EventCard` hiérarchise énergie / titre / heure / lieu / prix / urgence selon 3 énergies (CLUB / SCENE / JOURNEE, `EventCard.tsx:46-83, 581-695`). | Logique très riche mais **`console.log` de debug à chaque rendu de carte** (`EventCard.tsx:75`). | Pollution console + coût perf au scroll (log à chaque carte visible). | Retirer le `console.log` (commentaire le dit lui-même : « à retirer une fois calibré »). | Important |
| Date « chaude » (Ce soir/Demain/Vendredi) au lieu d'une date froide (`formatHotDate`). | — | Très bon pour la décision. | Maintenir. | — |
| Couleur de carte extraite de l'image (`extractCardColor`, `EventCard.tsx:164-200`) avec `crossOrigin="anonymous"`. | Images Instagram via proxy → **canvas « tainted » → extraction échoue silencieusement** → fallback couleur fixe. Sur le contenu scrappé réel, l'adaptation couleur est souvent inopérante. | L'identité visuelle « couleur tirée de l'affiche » ne fonctionne pas sur la majorité du catalogue réel. | Stocker `color_card` côté serveur au moment du scrap/validation (le champ est déjà supporté, `EventCard.tsx:322`). | Important |

**Verdict :** la découverte est le point fort. Deux dettes : un log en prod et une extraction couleur cassée par CORS sur le contenu réel.

---

## 4) Navigation et structure — **Note : 3/5 · Important**

| État actuel | Problème observé | Impact UX | Recommandation | Priorité |
|---|---|---|---|---|
| Bottom nav 3 entrées : Découvrir `/app`, Explorer `/explore`, Profil `/profile` (`BottomNavigation.tsx:10-14`). | Pas d'entrée « Favoris / Sauvegardés » dans la nav alors que le like/bookmark est central (cf. bloc 11). | L'utilisateur like mais ne retrouve pas facilement ses likes → valeur perdue. | Exposer favoris en onglet ou raccourci visible. | Important |
| `/app` (feed swipe) et `/explore` (recherche + liste) coexistent. | **Rôles qui se chevauchent** : les deux montrent le même catalogue, les deux ont FeedModeToggle + FiltersDrawer. `/explore` re-filtre un feed déjà filtré (`Explore.tsx:50` passe `recommendedEvents` à `useSearchFilters`, puis `SearchResults` re-filtre). | Deux chemins concurrents pour « parcourir », risque de double filtrage et de confusion de rôle. | Différencier nettement : `/app` = découverte sérendipité, `/explore` = recherche intentionnelle (requête/quartier). | Important |
| Retours/transitions : feed garde `currentIndex`, scroll-to programmatique (`UserApp.tsx:81-86`). | Reset filtre/catégorie remet à l'index 0 brutalement (`UserApp.tsx:160-170`). | Acceptable. | — | Secondaire |
| Routes legacy redirigées proprement (`/profil`, `/event/:id`, `/search`, `App.tsx:83-95`). | — | Bon entretien. | — | — |

**Verdict :** l'architecture multiplie les chemins concurrents (app vs explore) sans rôles tranchés ; nav incomplète côté favoris.

---

## 5) Filtres et tri — **Note : 3/5 · Important**

| État actuel | Problème observé | Impact UX | Recommandation | Priorité |
|---|---|---|---|---|
| 3 axes pertinents : Catégorie / Prix / Quand (`FiltersDrawer.tsx:19-41`), bottom sheet propre, peu d'options. | Pas de filtre **quartier** (pourtant cité comme critère de décision réel) ni **énergie** (alors que la carte est construite autour de 3 énergies). | Manque deux critères de décision majeurs pour une sortie à Lyon. | Ajouter Quartier + Énergie (réutiliser `deriveEnergy`). | Important |
| Filtre « tonight » = `eventDate.toDateString() === now.toDateString()` (`useSearchFilters.ts:66-68`). | « Ce soir » inclut donc **tout aujourd'hui** (matin compris) et garde les events déjà passés (compare la date, pas l'heure). | Sémantique trompeuse sur le critère le plus utilisé (« ce soir »). | Borner « ce soir » à `now → 04h` et exclure les events déjà passés. | Important |
| Filtres modifiables/retirables : bouton Réinitialiser désactivé si aucun filtre (`FiltersDrawer.tsx:189-196`). | Pas de **chips de filtres actifs** visibles sur le feed (il faut rouvrir le drawer pour voir/retirer). | L'utilisateur perd le fil de ce qui est filtré. | Afficher les filtres actifs en chips retirables au-dessus du feed. | Important |
| Tri = score de reco (`WouliRecommendationEngine.rankEvents`, sort desc). | Aucun contrôle de tri exposé (récence, proximité). | OK pour le MVP mais peu transparent. | — | Secondaire |

**Verdict :** socle de filtres sain mais « ce soir » est sémantiquement faux et il manque quartier/énergie + un rappel des filtres actifs.

---

## 6) Hiérarchie visuelle — **Note : 4/5 · Important**

| État actuel | Problème observé | Impact UX | Recommandation | Priorité |
|---|---|---|---|---|
| Système 3 énergies très travaillé : tailles de titre dynamiques selon énergie/longueur/récurrence (`EventCard.tsx:268-287`), encre adaptée au fond, néon pour « unique ». | Complexité élevée concentrée dans **un seul fichier de 927 lignes** mêlant logique couleur HSL, dérivation d'énergie et rendu. | Maintenabilité/risque de régression élevés sur le composant le plus critique. | Extraire helpers couleur/énergie hors du composant (déjà amorcé via `cardTokens`). | Important |
| Le regard va d'abord à l'affiche puis au bloc info (zone infos plancher 30%, `EventCard.tsx:585-588`). | Lisibilité du titre blanc garantie par `ensureDark` côté SCENE, **mais** dépend de `adaptiveBg` issu de l'extraction CORS (souvent en échec → fond fallback). | Sur contenu réel, le calage couleur/contraste est moins fiable qu'en théorie. | Cf. bloc 3 : couleur serveur. | Important |
| Signaux d'urgence priorisés (badge « Unique », pastille sociale pulsée). | Badge « Détails » + croix + partage en superposition haut de carte : densité de contrôles non négligeable. | Légère charge visuelle en haut de carte. | Tester un regroupement des actions secondaires. | Secondaire |

**Verdict :** hiérarchie réfléchie et différenciante ; la dette est la fragilité (CORS) et la concentration du code.

---

## 7) Page détail — **Note : 4/5 · Important**

| État actuel | Problème observé | Impact UX | Recommandation | Priorité |
|---|---|---|---|---|
| Deux niveaux de détail : drawer rapide depuis la carte (`EventCard.tsx:774-893`) + page complète `/events/:id` (`EventPreview.tsx`). | **Redondance** : deux UI de détail distinctes à maintenir, au contenu proche (description, lieu, map). | Double maintenance + risque d'incohérence d'info. | Unifier sur un seul composant détail réutilisé en drawer et en page. | Important |
| `EventPreview` répond aux bonnes questions : badge « CE SOIR » (`:195`), social proof, capacité restante (`:208-220`), infos pratiques, lieu, CTA fixes. | Carte statique : map du drawer carte utilise **coordonnées Lyon en dur** (`EventCard.tsx:296`, `getLyonCoordinates`) → tous les events pointent au même endroit. | « Localisation » trompeuse dans le drawer rapide. | Géocoder l'adresse réelle ou retirer la map du drawer. | Important |
| CTA explicites et orientés action : Like / WhatsApp / « Je participe (n) » (`EventPreview.tsx:252-291`), haptique (`:71`). | — | Très bon pour la conversion. | Maintenir. | — |
| Infos critiques visibles avant scroll (titre + badge + social en haut). | — | OK. | — | — |

**Verdict :** fiche solide et orientée action ; à dédupliquer (drawer vs page) et corriger la map en dur.

---

## 8) Confiance et preuve — **Note : 3/5 · Important**

| État actuel | Problème observé | Impact UX | Recommandation | Priorité |
|---|---|---|---|---|
| Données réelles : events Supabase mappés proprement (`unifiedEventService.mapEventToUnified`), social réel (amis participants, `enrichEventsWithSocialData:15-46`). | Le `CLAUDE.md` autorise les « fake metrics » : badge « 📈 Populaire » si `views>100 || likes>20` (`WouliRecommendationEngine.ts:331`). Si les compteurs sont gonflés, la preuve devient indéfendable. | Risque de perte de crédibilité si l'utilisateur sent des chiffres artificiels. | Garder les **personnes** réelles (déjà la règle) et n'afficher « populaire » que sur signal défendable. | Important |
| Social proof texte + avatars d'amis (`EventCard.tsx:697-735`) : « X amis y vont ». | Fallback sans amis = pastille pulsée + « N personnes y vont » : dépend de `totalParticipants` réel. | Bon si les participants sont réels. | Vérifier qu'aucun seed fictif ne peuple `participants`. | Important |
| Landing affiche « 500+ Lyonnais · 100+ événements/mois » (`Home.tsx:79`). | Chiffres en dur non sourcés. | Faible risque, mais à assumer. | Rendre dynamique quand les volumes le permettent. | Secondaire |
| Fraîcheur : « ce soir » via badge urgence. | Pas d'indication de **source** (« vu sur Instagram », date de scrap). | L'utilisateur ne sait pas d'où vient l'info. | Afficher discrètement la source/fraîcheur. | Secondaire |

**Verdict :** socle de données réelles sain ; le danger est l'inflation des compteurs « populaire ».

---

## 9) Personnalisation — **Note : 4/5 · Important**

| État actuel | Problème observé | Impact UX | Recommandation | Priorité |
|---|---|---|---|---|
| Moteur de reco pondéré conforme à la spec : 40% préférences / 25% social / 15% urgence / 10% découverte / 10% contexte (`WouliRecommendationEngine.ts:40-46`), + pénalités répétition/prix/distance. | La personnalisation sert **la décision** (urgence, contexte horaire), pas juste « pour faire joli » : bon alignement produit. | — | Maintenir. | — |
| Apprentissage léger en continu : chaque like/dislike/participe → `learnFromInteraction` (`UserApp.tsx:173-219`, `usePreferenceLearning`), flush au `beforeunload`. | Ce signal léger existe **mais l'onboarding lourd (5 mots-clés) est quand même imposé en amont** (cf. bloc 2). Contradiction : on a de quoi apprendre sans gros onboarding. | Friction d'entrée inutile alors que le système apprend tout seul. | Rendre l'onboarding optionnel et s'appuyer sur l'apprentissage implicite. | Important (lié au bloc 2) |
| Contexte heure/jour/urgence calculé (`calculateContextScore`, `calculateUrgencyScore`). | Pas encore de personnalisation **quartier/budget** dans le scoring (distance penalty = 0, `:293-297`). | Personnalisation géographique absente. | Brancher quartier/distance quand la géoloc sera dispo. | Secondaire |
| `confidence_level` câblé mais figé à 0 (`WouliRecommendationEngine.ts:84`). | Le niveau de confiance n'est jamais calculé → impossible de moduler découverte vs exploitation. | Reco « plate » pour nouveaux vs habitués. | Calculer la confiance depuis le nombre d'interactions. | Secondaire |

**Verdict :** très bon moteur, déjà capable d'apprendre implicitement — ce qui rend l'onboarding obligatoire d'autant plus injustifié.

---

## 10) Ton et identité — **Note : 4/5 · Secondaire**

| État actuel | Problème observé | Impact UX | Recommandation | Priorité |
|---|---|---|---|---|
| Ton jeune, vivant, local : toasts « ❤️ Liké ! », « ✅ Tu participes ! » (`UserApp.tsx:194-217`), copy « Tu as tout swipé ! » (`SwipeFeedEmpty.tsx:80`). | — | Personnalité présente, cohérente Gen Z. | Maintenir. | — |
| Identité = système 3 énergies (CLUB / SCENE / JOURNEE) qui structure toute la carte. | Le dégradé violet→rose est **omniprésent** (Home, onboarding, boutons, empty state) au point de devenir générique « template ». | Risque de signature visuelle interchangeable avec n'importe quelle app. | Affirmer l'identité par les **3 énergies** plutôt que par le gradient violet/rose par défaut. | Important |
| Les 3 énergies tiennent visuellement sans casser la cohérence (tokens partagés `cardTokens`). | — | Cohérence OK. | — | — |

**Verdict :** vraie personnalité côté carte ; côté chrome (gradient violet/rose) c'est le pattern AI générique à dépasser.

---

## 11) Retention et retour — **Note : 2/5 · 🚨 Bloquant**

| État actuel | Problème observé | Impact UX | Recommandation | Priorité |
|---|---|---|---|---|
| Like/bookmark présents (`EventCard.tsx:752-760`), tab Favoris existe (`components/profile/FavoritesTab.tsx`). | **Aucun favori accessible depuis la bottom nav** (bloc 4) ; le bookmark n'a pas de destination visible. | L'action de sauvegarde ne crée pas de valeur récupérable → boucle de rétention cassée. | Donner une maison visible aux favoris + montrer leur utilité (rappel avant l'event). | Bloquant |
| Empty state propose « reviens cette semaine » + compte d'events à venir (`SwipeFeedEmpty.tsx:84-116`). | C'est le **seul** mécanisme de rappel ; aucune notif/push, aucun rappel avant une sortie sauvegardée. | Rien ne ramène activement l'utilisateur le « jour J ». | Rappels (event ce soir / ami participe) — même léger (web push PWA). | Bloquant |
| `RatingModal` post-sortie (`App.tsx:175-183`) crée une boucle de retour. | Bonne idée, mais isolée. | Potentiel sous-exploité. | Lier le rating au profil/historique pour nourrir la reco. | Important |
| Mémoires / historique existent (`UserMemories`, `UserHistory`). | Peu mis en avant dans le parcours principal. | Valeur de rétention enfouie. | Remonter ces surfaces. | Secondaire |

**Verdict :** la rétention est le point faible structurel : pas de raison active de revenir, et la sauvegarde ne mène nulle part de visible.

---

## 12) Faisabilité MVP — **Note : 3/5 · Important**

| État actuel | Problème observé | Impact UX | Recommandation | Priorité |
|---|---|---|---|---|
| Stack légère et adaptée équipe réduite : React+Vite+Supabase, pas de backend custom. | — | Bonne faisabilité globale. | Maintenir. | — |
| Surface produit déjà **large** : user app + explore + profil + amis + business dashboard + admin (4 pages) + reco + mémoires + rating. | Beaucoup de surfaces pour une équipe très réduite ; risque de dispersion vs « mieux sans plus ». | Maintenance étalée, polissage incomplet par endroits. | Concentrer l'effort sur le funnel user (blocs 2 & 11) avant d'élargir. | Important |
| `EventCard.tsx` = 927 lignes, logique couleur + énergie + rendu + 2 modals. | Complexité technique concentrée sur la pièce la plus critique (et déjà signalée « fragile »). | Coût de toute évolution de la carte. | Refacto ciblée (extraire helpers), pas globale. | Important |
| Deux paradigmes d'interaction (SwipeCard mort vs feed vertical) + 2 UI détail (drawer vs page). | Code mort et duplication = dette qui ralentit le MVP. | — | Supprimer le mort, unifier le détail. | Important |
| `TODO`/incohérences mineures : `console.log` debug en prod, map coords en dur. | Petites dettes visibles. | — | Nettoyage rapide. | Secondaire |

**Verdict :** faisable, mais la dette (carte monolithique, code mort, doublons) et l'étalement de la surface menacent le rythme.

---

## Tableau de bord des notes

| # | Bloc | Note /5 | Verdict |
|---|---|---|---|
| 1 | Promesse et rôle | 4 | Important |
| 2 | **Entrée utilisateur** | **2** | 🚨 **Bloquant** |
| 3 | Découverte du contenu | 4 | Important |
| 4 | Navigation et structure | 3 | Important |
| 5 | Filtres et tri | 3 | Important |
| 6 | Hiérarchie visuelle | 4 | Important |
| 7 | Page détail | 4 | Important |
| 8 | Confiance et preuve | 3 | Important |
| 9 | Personnalisation | 4 | Important |
| 10 | Ton et identité | 4 | Secondaire |
| 11 | **Retention et retour** | **2** | 🚨 **Bloquant** |
| 12 | Faisabilité MVP | 3 | Important |

**Moyenne : 3,2 / 5.** Produit visuellement abouti (découverte, carte, détail, reco) **plombé par les deux extrémités du funnel** : entrer (mur d'auth + onboarding imposé) et revenir (pas de favoris visibles, pas de rappel).

---

## Ordre de priorité d'action (recommandé)

1. **Bloc 2 — Entrée** : feed en découverte anonyme + onboarding skippable. *Plus gros gain de funnel, le moteur sait déjà apprendre tout seul (bloc 9).*
2. **Bloc 11 — Rétention** : favoris accessibles depuis la nav + un rappel « ce soir / ton ami y va ».
3. **Bloc 5 — Filtres** : corriger la sémantique « ce soir » + chips de filtres actifs + ajouter Quartier/Énergie.
4. **Bloc 3/6 — Couleur serveur** : remplacer l'extraction CORS (cassée sur Instagram) par `color_card` calculé au scrap. Retirer le `console.log`.
5. **Bloc 4/7 — Doublons** : trancher app vs explore ; unifier les 2 UI de détail ; supprimer `SwipeCard` mort.
6. **Bloc 8 — Confiance** : verrouiller la règle « populaire » sur des signaux défendables.
7. **Bloc 12 — Dette** : refacto ciblée d'`EventCard` (extraire couleur/énergie).

---

## Quick wins (< 1h chacun, faible risque)

- Retirer le `console.log` de `deriveEnergy` (`EventCard.tsx:75`).
- Borner le filtre « ce soir » à la plage soirée et exclure le passé (`useSearchFilters.ts:66`).
- Ajouter un onglet/raccourci Favoris dans `BottomNavigation.tsx`.
- Supprimer le composant mort `SwipeCard.tsx` (ou le rebrancher si c'est le paradigme voulu).
- Retirer ou géocoder la map à coordonnées Lyon en dur du drawer carte (`EventCard.tsx:296`).
