-- Ajouter RLS sur venue_instagram_mapping
ALTER TABLE venue_instagram_mapping ENABLE ROW LEVEL SECURITY;

-- Policy pour que les business puissent gérer leur mapping
CREATE POLICY "Business can manage their mapping"
ON venue_instagram_mapping
FOR ALL
USING (venue_id = auth.uid() OR venue_id IS NULL)
WITH CHECK (venue_id = auth.uid() OR venue_id IS NULL);

-- Recréer la fonction avec SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.claim_venue_events(p_venue_id uuid, p_instagram_handle text)
RETURNS TABLE(claimed_count integer, event_ids uuid[])
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
DECLARE
  v_claimed_count INTEGER;
  v_event_ids UUID[];
BEGIN
  -- Mettre à jour ou insérer dans le mapping
  INSERT INTO venue_instagram_mapping (instagram_handle, venue_name, venue_id)
  VALUES (p_instagram_handle, p_instagram_handle, p_venue_id)
  ON CONFLICT (instagram_handle) DO UPDATE SET venue_id = p_venue_id;
  
  -- Récupérer les IDs AVANT l'update avec array_agg()
  SELECT array_agg(id) INTO v_event_ids
  FROM events
  WHERE venue_instagram = p_instagram_handle
    AND (venue_id IS NULL OR venue_id != p_venue_id);
  
  -- Compter avec array_length()
  v_claimed_count := COALESCE(array_length(v_event_ids, 1), 0);
  
  -- Attribuer les events si trouvés
  IF v_claimed_count > 0 THEN
    UPDATE events
    SET 
      venue_id = p_venue_id,
      claimed = TRUE
    WHERE id = ANY(v_event_ids);
  END IF;
  
  RETURN QUERY SELECT v_claimed_count, COALESCE(v_event_ids, ARRAY[]::uuid[]);
END;
$function$;