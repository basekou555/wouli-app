# TRANSMISSION — Session du 19 août 2026

> Document de passation pour reprendre le travail sans rien relire.
> Statut : **livré et poussé**. Une action manuelle reste côté utilisateur.

---

## Problème traité

Les `image_url` des events Instagram en base pointaient vers des URLs CDN Instagram (`scontent.cdninstagram.com`). Ces URLs contiennent une signature temporelle : une fois expirée, elles renvoient **403 permanent**, irréversible. Résultat : ~32 events avec affiches mortes.

**Cause racine :** le scraper stockait l'URL brute Instagram sans télécharger l'image au moment du scrape.

---

## Ce qui a été fait

### Fix 1 — Défense primaire : scraper patché

**Fichier :** `scraper-v5-wouli.js` (hors repo — Windows local `C:\projets\wouli-scraper\`)
**Commit miroir :** `a963f2f`

Le scraper télécharge maintenant le flyer et le dépose sur **Supabase Storage** (`events-images/`) **avant** d'insérer l'event. L'`image_url` insérée pointe directement vers Storage → URL pérenne, pas d'expiration.

> Ce patch est committé en miroir dans le repo, mais **doit être copié manuellement** sur la machine Windows.

---

### Fix 2 — Filet de secours : extract-event v25

**Fichier :** `supabase/functions/extract-event/index.ts` — fonction `persistFlyer()` (lignes ~353–378)
**Commit :** `1d21e41`
**Déployé :** v25 via Supabase MCP

`persistFlyer()` était appelé par le cron pour persister l'image si le scraper ne l'avait pas fait. Problème : un fetch nu sur `scontent.cdninstagram.com` retournait 403 même quand l'URL était encore fraîche (Instagram bloque sans User-Agent crédible).

**Fix appliqué :** ajout de headers navigateur + Referer Instagram dans le fetch :

```typescript
const res = await fetch(srcUrl, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "Referer": "https://www.instagram.com/",
  },
});
```

Le cron peut désormais persister une image fraîche si le scraper n'a pas pu le faire.

---

### Probe de confirmation

5 events Instagram live-testés via `net.http_get()` SQL → **5/5 → 403 confirmé**.
Les 32 events existants avec images mortes sont **définitivement irrécupérables** sans re-scrape.
Table temporaire `_img_probe5` droppée après lecture.

---

## Ce qui reste à faire (côté utilisateur — Windows)

| # | Action | Détail |
|---|--------|--------|
| 1 | Copier le scraper patché | Depuis le repo (`scraper-v5-wouli.js`) vers `C:\projets\wouli-scraper\` |
| 2 | Re-scraper les 23 comptes Instagram lyonnais | Lance le scraper V5 normalement — les nouvelles captures pousseront les images sur Storage |
| 3 | Vérifier dans l'admin | Les events re-scrappés devraient afficher leurs affiches + couleur adaptative dans l'app |

> **Une fois le re-scrape fait**, les 32 events morts seront soit remplacés par de nouveaux events avec images vivantes, soit toujours visibles sans image (les events passés ne re-apparaîtront pas automatiquement).

---

## Optionnel (non urgent)

Les ~23 events web/CDN (Shotgun, larayonne.com) ont des URLs encore vivantes (200 OK au moment du probe). Un backfill sur Storage est possible mais pas prioritaire — ces URLs ne sont pas signées temporellement et durent plus longtemps.

---

## État du repo

- **Branche :** `claude/vibrant-ptolemy-Ojdhs`
- **PR :** #26 (draft)
- **Dernier commit poussé :** `1d21e41` — "extract-event: durcir persistFlyer avec en-têtes navigateur (filet Instagram)"
- **Edge Function :** `extract-event` déployée en **v25** sur le projet Supabase `ddvboxgescsptvhkjgjl`

---

## Fichiers touchés cette session

| Fichier | Rôle | Statut |
|---------|------|--------|
| `supabase/functions/extract-event/index.ts` | Edge Function d'enrichissement IA | Modifié + déployé v25 |
| `scraper-v5-wouli.js` | Scraper Instagram (miroir repo) | Modifié — à copier sur Windows |

---

*Rédigé le 19 août 2026 — Session Wouli / Fix images Instagram expirées*
