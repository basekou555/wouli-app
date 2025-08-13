-- Fix the remaining function that doesn't have proper search_path set
-- Update the update_event_counters function
CREATE OR REPLACE FUNCTION public.update_event_counters()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF TG_TABLE_NAME = 'event_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE events SET likes = (SELECT COUNT(*) FROM event_likes WHERE event_id = NEW.event_id) WHERE id = NEW.event_id;
      UPDATE business_events SET likes = (SELECT COUNT(*) FROM event_likes WHERE event_id = NEW.event_id) WHERE id = NEW.event_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE events SET likes = (SELECT COUNT(*) FROM event_likes WHERE event_id = OLD.event_id) WHERE id = OLD.event_id;
      UPDATE business_events SET likes = (SELECT COUNT(*) FROM event_likes WHERE event_id = OLD.event_id) WHERE id = OLD.event_id;
      RETURN OLD;
    END IF;
  END IF;
  
  IF TG_TABLE_NAME = 'event_participants' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE events SET participants = (SELECT COUNT(*) FROM event_participants WHERE event_id = NEW.event_id) WHERE id = NEW.event_id;
      UPDATE business_events SET participants = (SELECT COUNT(*) FROM event_participants WHERE event_id = NEW.event_id) WHERE id = NEW.event_id;
      RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE events SET participants = (SELECT COUNT(*) FROM event_participants WHERE event_id = OLD.event_id) WHERE id = OLD.event_id;
      UPDATE business_events SET participants = (SELECT COUNT(*) FROM event_participants WHERE event_id = OLD.event_id) WHERE id = OLD.event_id;
      RETURN OLD;
    END IF;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Update the set_events_pending_validation function
CREATE OR REPLACE FUNCTION public.set_events_pending_validation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('approved', 'rejected') THEN
     IF NEW.validated_at IS NULL THEN
       NEW.validated_at := now();
     END IF;
     IF NEW.validated_by IS NULL THEN
       NEW.validated_by := auth.uid();
     END IF;
  END IF;
  RETURN NEW;
END;
$function$;