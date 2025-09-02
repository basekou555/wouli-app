-- Create friendships table
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure no duplicate friendships (both directions should be treated as one)
  CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
  -- Prevent self-friendship
  CONSTRAINT no_self_friendship CHECK (user_id != friend_id)
);

-- Enable RLS
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

-- Users can view friendships they are involved in
CREATE POLICY "Users can view their friendships" 
ON public.friendships 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can create friendship requests
CREATE POLICY "Users can create friendship requests" 
ON public.friendships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update friendships they are involved in (to accept requests)
CREATE POLICY "Users can update their friendships" 
ON public.friendships 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = friend_id)
WITH CHECK (auth.uid() = user_id OR auth.uid() = friend_id);

-- Users can delete friendships they are involved in
CREATE POLICY "Users can delete their friendships" 
ON public.friendships 
FOR DELETE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Create index for performance
CREATE INDEX idx_friendships_user_id ON public.friendships(user_id);
CREATE INDEX idx_friendships_friend_id ON public.friendships(friend_id);
CREATE INDEX idx_friendships_status ON public.friendships(status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_friendships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    NEW.accepted_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic timestamp updates
CREATE TRIGGER update_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_friendships_updated_at();