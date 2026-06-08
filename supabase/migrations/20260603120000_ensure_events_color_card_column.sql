-- Garantit l'existence de la colonne color_card sur events.
-- La couleur de fond adaptative des cartes (EventCard) est calculée et stockée
-- à la source par l'edge function extract-event. Idempotent : sans effet si la
-- colonne existe déjà (cas de la prod où elle a été ajoutée hors-migration).
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS color_card text;

COMMENT ON COLUMN public.events.color_card IS
  'Couleur de fond adaptative de la carte (hex), couleur dominante assombrie de l''affiche, calculée par extract-event.';
