CREATE TABLE public.ideas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  visibility TEXT NOT NULL CHECK (visibility IN ('Public', 'Private', 'Team')),
  stage TEXT NOT NULL CHECK (stage IN ('Concept', 'Validation', 'Building', 'Ready for Marketplace')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  tags TEXT[] DEFAULT '{}',
  roles_needed TEXT[] DEFAULT '{}',
  ai_feedback TEXT NOT NULL,
  author_title TEXT NOT NULL DEFAULT 'Idea author',
  conversion_path TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active public or team ideas"
ON public.ideas
FOR SELECT
USING (is_active = true AND visibility IN ('Public', 'Team'));

CREATE POLICY "Owners can view their own private ideas"
ON public.ideas
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ideas"
ON public.ideas
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ideas"
ON public.ideas
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ideas"
ON public.ideas
FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_ideas_updated_at
BEFORE UPDATE ON public.ideas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_ideas_user_id ON public.ideas(user_id);
CREATE INDEX idx_ideas_category ON public.ideas(category);
CREATE INDEX idx_ideas_stage ON public.ideas(stage);

CREATE TABLE public.idea_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT idea_votes_unique UNIQUE (idea_id, user_id)
);

ALTER TABLE public.idea_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view idea votes"
ON public.idea_votes
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own idea votes"
ON public.idea_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own idea votes"
ON public.idea_votes
FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_idea_votes_idea_id ON public.idea_votes(idea_id);
CREATE INDEX idx_idea_votes_user_id ON public.idea_votes(user_id);

CREATE TABLE public.idea_join_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT idea_join_requests_unique UNIQUE (idea_id, user_id)
);

ALTER TABLE public.idea_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view idea join requests"
ON public.idea_join_requests
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own join requests"
ON public.idea_join_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own join requests"
ON public.idea_join_requests
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own join requests"
ON public.idea_join_requests
FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_idea_join_requests_updated_at
BEFORE UPDATE ON public.idea_join_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_idea_join_requests_idea_id ON public.idea_join_requests(idea_id);
CREATE INDEX idx_idea_join_requests_user_id ON public.idea_join_requests(user_id);
