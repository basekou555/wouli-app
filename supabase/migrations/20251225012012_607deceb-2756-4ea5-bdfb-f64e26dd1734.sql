-- Ajouter colonne pour position de focus de l'image
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS image_focus_position VARCHAR(20) DEFAULT 'center';

-- Commentaire descriptif
COMMENT ON COLUMN events.image_focus_position IS 'Position de focus pour le crop image: top, center, bottom';