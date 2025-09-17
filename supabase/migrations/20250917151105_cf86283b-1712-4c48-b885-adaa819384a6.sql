-- Créer la table friendships
CREATE TABLE public.friendships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Empêcher de s'ajouter soi-même et les doublons
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- Activer RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Users can create friendship requests" 
ON public.friendships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their friendships" 
ON public.friendships 
FOR SELECT 
USING ((auth.uid() = user_id) OR (auth.uid() = friend_id));

CREATE POLICY "Users can update their friendships" 
ON public.friendships 
FOR UPDATE 
USING ((auth.uid() = user_id) OR (auth.uid() = friend_id))
WITH CHECK ((auth.uid() = user_id) OR (auth.uid() = friend_id));

CREATE POLICY "Users can delete their friendships" 
ON public.friendships 
FOR DELETE 
USING ((auth.uid() = user_id) OR (auth.uid() = friend_id));

-- Créer le trigger de mise à jour du timestamp
CREATE TRIGGER update_friendships_updated_at
BEFORE UPDATE ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.update_friendships_updated_at();

-- Créer les fonctions RPC

-- Envoyer une demande d'ami
CREATE OR REPLACE FUNCTION public.send_friend_request(p_friend_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_friendship_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() = p_friend_id THEN
    RAISE EXCEPTION 'Cannot add yourself as friend';
  END IF;
  
  -- Vérifier si une relation existe déjà
  IF EXISTS (
    SELECT 1 FROM friendships 
    WHERE (user_id = auth.uid() AND friend_id = p_friend_id)
       OR (user_id = p_friend_id AND friend_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Friendship already exists or pending';
  END IF;
  
  INSERT INTO friendships (user_id, friend_id, status)
  VALUES (auth.uid(), p_friend_id, 'pending')
  RETURNING id INTO new_friendship_id;
  
  RETURN new_friendship_id;
END;
$$;

-- Accepter une demande d'ami
CREATE OR REPLACE FUNCTION public.accept_friend_request(p_friendship_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  UPDATE friendships
  SET status = 'accepted', 
      accepted_at = now()
  WHERE id = p_friendship_id
    AND friend_id = auth.uid()
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$;

-- Rejeter une demande d'ami
CREATE OR REPLACE FUNCTION public.reject_friend_request(p_friendship_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  DELETE FROM friendships
  WHERE id = p_friendship_id
    AND (friend_id = auth.uid() OR user_id = auth.uid())
    AND status = 'pending';
  
  RETURN FOUND;
END;
$$;

-- Récupérer les amis acceptés
CREATE OR REPLACE FUNCTION public.get_accepted_friends(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  friend_id UUID,
  status TEXT,
  requested_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  friend_profile JSONB,
  user_profile JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    f.id,
    f.user_id,
    f.friend_id,
    f.status,
    f.requested_at,
    f.accepted_at,
    f.created_at,
    f.updated_at,
    CASE 
      WHEN f.user_id = p_user_id THEN
        jsonb_build_object(
          'id', fp.id,
          'username', fp.username,
          'avatar_url', fp.avatar_url,
          'city', fp.city,
          'type', fp.type,
          'created_at', fp.created_at
        )
      ELSE NULL
    END as friend_profile,
    CASE 
      WHEN f.friend_id = p_user_id THEN
        jsonb_build_object(
          'id', up.id,
          'username', up.username,
          'avatar_url', up.avatar_url,
          'city', up.city,
          'type', up.type,
          'created_at', up.created_at
        )
      ELSE NULL
    END as user_profile
  FROM friendships f
  LEFT JOIN profiles fp ON (f.friend_id = fp.id AND f.user_id = p_user_id)
  LEFT JOIN profiles up ON (f.user_id = up.id AND f.friend_id = p_user_id)
  WHERE (f.user_id = p_user_id OR f.friend_id = p_user_id)
    AND f.status = 'accepted'
  ORDER BY f.accepted_at DESC;
END;
$$;

-- Récupérer les demandes reçues
CREATE OR REPLACE FUNCTION public.get_received_requests(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  friend_id UUID,
  status TEXT,
  requested_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  user_profile JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    f.id,
    f.user_id,
    f.friend_id,
    f.status,
    f.requested_at,
    f.accepted_at,
    f.created_at,
    f.updated_at,
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'avatar_url', p.avatar_url,
      'city', p.city,
      'type', p.type,
      'created_at', p.created_at
    ) as user_profile
  FROM friendships f
  JOIN profiles p ON f.user_id = p.id
  WHERE f.friend_id = p_user_id
    AND f.status = 'pending'
  ORDER BY f.requested_at DESC;
END;
$$;

-- Récupérer les demandes envoyées
CREATE OR REPLACE FUNCTION public.get_sent_requests(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  user_id UUID,
  friend_id UUID,
  status TEXT,
  requested_at TIMESTAMP WITH TIME ZONE,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  friend_profile JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    f.id,
    f.user_id,
    f.friend_id,
    f.status,
    f.requested_at,
    f.accepted_at,
    f.created_at,
    f.updated_at,
    jsonb_build_object(
      'id', p.id,
      'username', p.username,
      'avatar_url', p.avatar_url,
      'city', p.city,
      'type', p.type,
      'created_at', p.created_at
    ) as friend_profile
  FROM friendships f
  JOIN profiles p ON f.friend_id = p.id
  WHERE f.user_id = p_user_id
    AND f.status = 'pending'
  ORDER BY f.requested_at DESC;
END;
$$;

-- Vérifier le statut d'amitié
CREATE OR REPLACE FUNCTION public.get_friendship_status(p_user_id UUID, p_other_user_id UUID)
RETURNS TABLE(status TEXT, data JSONB)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  friendship_row friendships;
  result_status TEXT := 'none';
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  SELECT * INTO friendship_row 
  FROM friendships 
  WHERE (user_id = p_user_id AND friend_id = p_other_user_id)
     OR (user_id = p_other_user_id AND friend_id = p_user_id);
  
  IF FOUND THEN
    IF friendship_row.status = 'accepted' THEN
      result_status := 'friends';
    ELSIF friendship_row.status = 'pending' THEN
      IF friendship_row.user_id = p_user_id THEN
        result_status := 'sent';
      ELSE
        result_status := 'received';
      END IF;
    ELSIF friendship_row.status = 'blocked' THEN
      result_status := 'blocked';
    END IF;
    
    RETURN QUERY SELECT result_status, row_to_json(friendship_row)::jsonb;
  ELSE
    RETURN QUERY SELECT 'none'::TEXT, NULL::jsonb;
  END IF;
END;
$$;

-- Compter les demandes en attente
CREATE OR REPLACE FUNCTION public.count_pending_requests(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending_count INTEGER;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  SELECT COUNT(*)::INTEGER INTO pending_count
  FROM friendships
  WHERE friend_id = p_user_id
    AND status = 'pending';
  
  RETURN pending_count;
END;
$$;