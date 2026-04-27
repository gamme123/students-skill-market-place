CREATE TABLE public.idea_workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL UNIQUE,
  team_lead_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  project_title TEXT,
  launch_status TEXT NOT NULL DEFAULT 'Planning' CHECK (launch_status IN ('Planning', 'Private Beta', 'Public Launch')),
  is_converted BOOLEAN NOT NULL DEFAULT false,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.idea_workspaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view idea workspaces"
ON public.idea_workspaces
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create idea workspaces"
ON public.idea_workspaces
FOR INSERT
WITH CHECK (auth.uid() = team_lead_user_id);

CREATE POLICY "Team leads can update idea workspaces"
ON public.idea_workspaces
FOR UPDATE
USING (auth.uid() = team_lead_user_id);

CREATE TRIGGER update_idea_workspaces_updated_at
BEFORE UPDATE ON public.idea_workspaces
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_idea_workspaces_idea_id ON public.idea_workspaces(idea_id);

CREATE TABLE public.idea_workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.idea_workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'StudentHub collaborator',
  is_lead BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT idea_workspace_members_unique UNIQUE (workspace_id, user_id)
);

ALTER TABLE public.idea_workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view workspace members"
ON public.idea_workspace_members
FOR SELECT
USING (true);

CREATE POLICY "Users can add themselves to workspace members"
ON public.idea_workspace_members
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_idea_workspace_members_workspace_id ON public.idea_workspace_members(workspace_id);
CREATE INDEX idx_idea_workspace_members_user_id ON public.idea_workspace_members(user_id);

CREATE TABLE public.idea_workspace_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.idea_workspaces(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  owner_role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Todo' CHECK (status IN ('Todo', 'In Progress', 'Done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.idea_workspace_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view workspace tasks"
ON public.idea_workspace_tasks
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create workspace tasks"
ON public.idea_workspace_tasks
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update workspace tasks"
ON public.idea_workspace_tasks
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_idea_workspace_tasks_updated_at
BEFORE UPDATE ON public.idea_workspace_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_idea_workspace_tasks_workspace_id ON public.idea_workspace_tasks(workspace_id);

CREATE TABLE public.idea_workspace_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.idea_workspaces(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  owner_role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Todo' CHECK (status IN ('Todo', 'In Progress', 'Done')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.idea_workspace_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view workspace milestones"
ON public.idea_workspace_milestones
FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create workspace milestones"
ON public.idea_workspace_milestones
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update workspace milestones"
ON public.idea_workspace_milestones
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_idea_workspace_milestones_updated_at
BEFORE UPDATE ON public.idea_workspace_milestones
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_idea_workspace_milestones_workspace_id ON public.idea_workspace_milestones(workspace_id);

CREATE TABLE public.idea_workspace_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES public.idea_workspaces(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.idea_workspace_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view workspace messages"
ON public.idea_workspace_messages
FOR SELECT
USING (true);

CREATE POLICY "Users can create their own workspace messages"
ON public.idea_workspace_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_idea_workspace_messages_workspace_id ON public.idea_workspace_messages(workspace_id);
