import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BarChart3, CheckCircle2, MessagesSquare, Rocket, Sparkles, Target, Trophy, Users2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { collaborationRoles, type CollaborationRole } from "@/data/ideas";
import { useAuth } from "@/contexts/AuthContext";
import {
  addWorkspaceTask,
  getCoFounderMatches,
  createIdeaWorkspace,
  fetchIdeaHubFeed,
  fetchIdeaWorkspaces,
  getGlobalCompetitionTracks,
  getIdeaFollowingState,
  getIdeaIntelligenceScore,
  getGlobalPlatformPreferences,
  getLocalizedPlatformCopy,
  getOpportunityMatches,
  getSimulationSnapshot,
  getWorkspaceContributionSnapshot,
  getWorkspaceHealth,
  joinIdeaWorkspace,
  sendWorkspaceMessage,
  updateWorkspaceMilestone,
  convertWorkspaceToProject,
  type IdeaWorkspace,
} from "@/lib/ideaHub";
import { toast } from "sonner";

const CollaborationPage = () => {
  const { user } = useAuth();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  const [draftMessage, setDraftMessage] = useState("");
  const [draftTask, setDraftTask] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [selectedRole, setSelectedRole] = useState<CollaborationRole>("Developer");
  const [workspaces, setWorkspaces] = useState<IdeaWorkspace[]>([]);

  const ideasQuery = useQuery({
    queryKey: ["idea-hub"],
    queryFn: fetchIdeaHubFeed,
  });

  const workspacesQuery = useQuery({
    queryKey: ["idea-workspaces"],
    queryFn: fetchIdeaWorkspaces,
  });

  useEffect(() => {
    setWorkspaces(workspacesQuery.data ?? []);
  }, [workspacesQuery.data]);

  useEffect(() => {
    if (!selectedWorkspaceId && (workspacesQuery.data ?? []).length) {
      setSelectedWorkspaceId(workspacesQuery.data?.[0]?.id ?? "");
    }
  }, [selectedWorkspaceId, workspacesQuery.data]);

  useEffect(() => {
    setProjectTitle(selectedWorkspace?.launch.projectTitle ?? "");
  }, [selectedWorkspace?.id, selectedWorkspace?.launch.projectTitle]);

  const workspaceMap = useMemo(
    () => new Map(workspaces.map((workspace) => [workspace.ideaId, workspace])),
    [workspaces],
  );

  const collaborationIdeas = useMemo(
    () =>
      (ideasQuery.data ?? []).filter(
        (idea) => idea.startupMode || idea.stage === "Building" || idea.stage === "Validation",
      ),
    [ideasQuery.data],
  );

  const selectedWorkspace = workspaces.find((workspace) => workspace.id === selectedWorkspaceId) ?? null;
  const selectedWorkspaceHealth = useMemo(() => getWorkspaceHealth(selectedWorkspace), [selectedWorkspace]);
  const contributionBoard = useMemo(() => getWorkspaceContributionSnapshot(selectedWorkspace), [selectedWorkspace]);
  const coFounderMatches = useMemo(() => getCoFounderMatches(selectedWorkspace, selectedRole), [selectedWorkspace, selectedRole]);
  const followedCategories = getIdeaFollowingState().categories;
  const globalPreferences = getGlobalPlatformPreferences();
  const localizedCopy = getLocalizedPlatformCopy(globalPreferences.language);
  const competitionTracks = getGlobalCompetitionTracks();
  const simulationSnapshot = useMemo(() => {
    const activeIdea = collaborationIdeas.find((idea) => idea.id === selectedWorkspace?.ideaId);
    return getSimulationSnapshot(activeIdea, selectedWorkspace);
  }, [collaborationIdeas, selectedWorkspace]);
  const opportunityMatches = useMemo(
    () => getOpportunityMatches(collaborationIdeas, workspaces, selectedRole, followedCategories).slice(0, 4),
    [collaborationIdeas, selectedRole, workspaces, followedCategories],
  );

  const refreshWorkspaces = async () => {
    const nextWorkspaces = await fetchIdeaWorkspaces();
    setWorkspaces(nextWorkspaces);
  };

  const currentMember = user
    ? {
        userId: user.id,
        displayName: user.user_metadata?.display_name || user.email?.split("@")[0] || "Student builder",
        title: "StudentHub collaborator",
      }
    : null;

  const handleCreateWorkspace = async (ideaId: string) => {
    if (!currentMember) {
      toast.error("Sign in first to create a workspace.");
      return;
    }

    const idea = collaborationIdeas.find((item) => item.id === ideaId);
    if (!idea) {
      toast.error("That idea could not be found.");
      return;
    }

    const nextWorkspace = await createIdeaWorkspace(idea, currentMember, selectedRole);
    await refreshWorkspaces();
    setSelectedWorkspaceId(nextWorkspace.id);
    toast.success("Team workspace created.");
  };

  const handleJoinWorkspace = async (workspaceId: string) => {
    if (!currentMember) {
      toast.error("Sign in first to join a workspace.");
      return;
    }

    const updated = await joinIdeaWorkspace(workspaceId, currentMember, selectedRole);
    if (!updated) {
      toast.error("That workspace could not be joined.");
      return;
    }

    await refreshWorkspaces();
    setSelectedWorkspaceId(updated.id);
    toast.success(`Joined the workspace as ${selectedRole.toLowerCase()}.`);
  };

  const handleSendMessage = async () => {
    if (!currentMember || !selectedWorkspace) {
      toast.error("Choose a workspace and sign in to chat.");
      return;
    }

    const updated = await sendWorkspaceMessage(selectedWorkspace.id, currentMember, selectedRole, draftMessage);
    if (!updated) {
      toast.error("That message could not be sent.");
      return;
    }

    setDraftMessage("");
    await refreshWorkspaces();
    toast.success("Message posted to the workspace.");
  };

  const handleAddTask = async () => {
    if (!selectedWorkspace) {
      toast.error("Choose a workspace first.");
      return;
    }

    const updated = await addWorkspaceTask(selectedWorkspace.id, draftTask, selectedRole);
    if (!updated) {
      toast.error("That task could not be created.");
      return;
    }

    setDraftTask("");
    await refreshWorkspaces();
    toast.success("Task added to the workspace board.");
  };

  const handleUpdateMilestone = async (
    milestoneId: string,
    status: "Todo" | "In Progress" | "Done",
  ) => {
    if (!selectedWorkspace) {
      toast.error("Choose a workspace first.");
      return;
    }

    const updated = await updateWorkspaceMilestone(selectedWorkspace.id, milestoneId, status);
    if (!updated) {
      toast.error("That milestone could not be updated.");
      return;
    }

    await refreshWorkspaces();
    toast.success("Milestone status updated.");
  };

  const handleConvertToProject = async () => {
    if (!selectedWorkspace) {
      toast.error("Choose a workspace first.");
      return;
    }

    const nextTitle = projectTitle.trim() || `${selectedWorkspace.ideaTitle} Launch`;
    const updated = await convertWorkspaceToProject(selectedWorkspace.id, nextTitle);
    if (!updated) {
      toast.error("That project conversion could not be completed.");
      return;
    }

    setProjectTitle(updated.launch.projectTitle ?? "");
    await refreshWorkspaces();
    toast.success("Workspace converted into a launch-ready project.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <section className="gradient-hero relative overflow-hidden rounded-[2rem] px-6 py-10 text-primary-foreground shadow-hero md:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_34%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-medium text-white/90">
                <Users2 className="h-4 w-4" />
                StudentHub Collaboration
              </div>
              <h1 className="font-display mt-6 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
                Build teams, assign roles, and move ideas into execution.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/85">
                {localizedCopy.collaboration}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              <div className="glass-panel rounded-[1.5rem] border border-white/70 p-5 text-foreground shadow-card">
                <p className="text-sm font-semibold">Opportunity ranking</p>
                <p className="mt-2 text-xs text-muted-foreground">Ideas are now prioritized by fit, traction, and execution readiness.</p>
              </div>
              <div className="glass-panel rounded-[1.5rem] border border-white/70 p-5 text-foreground shadow-card">
                <p className="text-sm font-semibold">Workspace health</p>
                <p className="mt-2 text-xs text-muted-foreground">See team strength, communication momentum, and missing roles at a glance.</p>
              </div>
              <div className="glass-panel rounded-[1.5rem] border border-white/70 p-5 text-foreground shadow-card">
                <p className="text-sm font-semibold">Smarter matching</p>
                <p className="mt-2 text-xs text-muted-foreground">Selected role and followed categories now influence what StudentHub recommends.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-[1.8rem] border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Role focus</p>
                  <h2 className="font-display mt-3 text-3xl font-bold text-foreground">Choose how you contribute</h2>
                </div>
                <Badge variant="secondary" className="rounded-full">{globalPreferences.visibilityMode} mode</Badge>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {collaborationRoles.map((role) => (
                  <Button
                    key={role}
                    type="button"
                    variant={selectedRole === role ? "default" : "outline"}
                    className="rounded-full"
                    onClick={() => setSelectedRole(role)}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[1.8rem] border border-white/70 p-6 shadow-card">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Global settings</p>
                  <h2 className="font-display text-2xl font-bold text-foreground">Scale view</h2>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Language</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{globalPreferences.language}</p>
                </div>
                <div className="rounded-2xl bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Currency</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{globalPreferences.currency}</p>
                </div>
                <div className="rounded-2xl bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Visibility mode</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{globalPreferences.visibilityMode}</p>
                </div>
                <div className="rounded-2xl bg-background/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Network scope</p>
                  <p className="mt-2 text-sm font-semibold text-foreground">{globalPreferences.networkScope}</p>
                </div>
              </div>
              <div className="mt-4 rounded-[1.3rem] border border-dashed border-border/70 bg-background/60 p-4 text-sm leading-7 text-muted-foreground">
                {globalPreferences.visibilityMode === "Investor"
                  ? localizedCopy.investor
                  : globalPreferences.visibilityMode === "Recruiter"
                    ? localizedCopy.recruiter
                    : "Student mode keeps the platform centered on collaboration, execution, and peer discovery."}
              </div>
            </div>

            <div className="glass-panel rounded-[1.8rem] border border-white/70 p-6 shadow-card">
              <div className="flex items-center gap-3">
                <Target className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Smart matching</p>
                  <h2 className="font-display text-2xl font-bold text-foreground">Best opportunities for your role</h2>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {opportunityMatches.map((match) => {
                  const idea = collaborationIdeas.find((item) => item.id === match.ideaId);
                  if (!idea) return null;

                  return (
                    <div key={match.ideaId} className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{idea.title}</p>
                          <p className="mt-2 text-xs leading-6 text-muted-foreground">{match.label} • {match.score}% match</p>
                        </div>
                        <Badge variant="secondary" className="rounded-full">{idea.stage}</Badge>
                      </div>
                      <div className="mt-3 space-y-2">
                        {match.reasons.map((reason) => (
                          <p key={reason} className="text-xs leading-6 text-muted-foreground">{reason}</p>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="glass-panel rounded-[1.8rem] border border-white/70 p-6 shadow-card">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Global competitions</p>
                  <h2 className="font-display text-2xl font-bold text-foreground">Hackathons and demo tracks</h2>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {competitionTracks.map((track) => (
                  <div key={track.id} className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{track.title}</p>
                        <p className="mt-2 text-xs leading-6 text-muted-foreground">{track.region} • {track.focus}</p>
                      </div>
                      <Badge variant="secondary" className="rounded-full">{track.deadline}</Badge>
                    </div>
                    <p className="mt-3 text-xs leading-6 text-muted-foreground">Reward: {track.reward}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[1.8rem] border border-white/70 p-6 shadow-card">
              <div className="flex items-center gap-3">
                <Trophy className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Incubator mode</p>
                  <h2 className="font-display text-2xl font-bold text-foreground">Idea to startup journey</h2>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
                <p>1. Form a core team around the right execution roles.</p>
                <p>2. Assign milestones and move them from planning into delivery.</p>
                <p>3. Capture contribution shares so the build story is transparent.</p>
                <p>4. Convert validated workspaces into launch-ready marketplace projects.</p>
              </div>
            </div>

            <div className="glass-panel rounded-[1.8rem] border border-white/70 p-6 shadow-card">
              <div className="flex items-center gap-3">
                <Rocket className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Workspace launchpad</p>
                  <h2 className="font-display text-2xl font-bold text-foreground">Convert active ideas into teams</h2>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {collaborationIdeas.slice(0, 6).map((idea) => {
                  const workspace = workspaceMap.get(idea.id);
                  const intelligenceScore = getIdeaIntelligenceScore(idea, workspace);
                  const workspaceHealth = getWorkspaceHealth(workspace);

                  return (
                    <div key={idea.id} className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-foreground">{idea.title}</p>
                          <p className="mt-2 text-xs leading-6 text-muted-foreground">
                            {idea.category} • {idea.stage} • open roles: {idea.rolesNeeded.join(", ")}
                          </p>
                        </div>
                        <Badge variant="secondary" className="rounded-full">{idea.interestLevel}</Badge>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-background/80 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Idea intelligence</p>
                          <p className="mt-2 text-2xl font-bold text-foreground">{intelligenceScore}/99</p>
                        </div>
                        <div className="rounded-2xl bg-background/80 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace health</p>
                          <p className="mt-2 text-2xl font-bold text-foreground">
                            {workspace ? `${workspaceHealth.score}/100` : "Not started"}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {workspace ? (
                          <>
                            <Button variant="outline" className="rounded-xl" onClick={() => setSelectedWorkspaceId(workspace.id)}>
                              Open workspace
                            </Button>
                            <Button className="rounded-xl" onClick={() => handleJoinWorkspace(workspace.id)}>
                              Join as {selectedRole}
                            </Button>
                          </>
                        ) : (
                          <Button className="rounded-xl" onClick={() => handleCreateWorkspace(idea.id)}>
                            Create workspace
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-[1.8rem] border border-white/70 p-6 shadow-card">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Active workspace</p>
                  <h2 className="font-display mt-3 text-3xl font-bold text-foreground">
                    {selectedWorkspace?.ideaTitle || "No workspace selected"}
                  </h2>
                </div>
                {selectedWorkspace ? (
                  <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">{selectedWorkspace.stage}</Badge>
                ) : null}
              </div>

              {selectedWorkspace ? (
                <div className="mt-6 space-y-6">
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-[1.3rem] border border-border/70 bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Members</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">{selectedWorkspace.members.length}</p>
                    </div>
                    <div className="rounded-[1.3rem] border border-border/70 bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Open roles</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">{selectedWorkspace.openRoles.length}</p>
                    </div>
                    <div className="rounded-[1.3rem] border border-border/70 bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sprint tasks</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">{selectedWorkspace.tasks.length}</p>
                    </div>
                    <div className="rounded-[1.3rem] border border-border/70 bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace health</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">{selectedWorkspaceHealth.score}/100</p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[1.3rem] border border-border/70 bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Launch status</p>
                      <p className="mt-2 text-2xl font-bold text-foreground">{selectedWorkspace.launch.launchStatus}</p>
                    </div>
                    <div className="rounded-[1.3rem] border border-border/70 bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Converted project</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {selectedWorkspace.launch.converted ? selectedWorkspace.launch.projectTitle : "Not converted yet"}
                      </p>
                    </div>
                    <div className="rounded-[1.3rem] border border-border/70 bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Contribution leaders</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">
                        {contributionBoard.length ? contributionBoard[0].displayName : "No activity yet"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[1.3rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Users2 className="h-4 w-4 text-primary" />
                        Team strength
                      </div>
                      <p className="mt-3 text-2xl font-bold text-foreground">{selectedWorkspaceHealth.teamStrength}/100</p>
                    </div>
                    <div className="rounded-[1.3rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Rocket className="h-4 w-4 text-accent" />
                        Execution strength
                      </div>
                      <p className="mt-3 text-2xl font-bold text-foreground">{selectedWorkspaceHealth.executionStrength}/100</p>
                    </div>
                    <div className="rounded-[1.3rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <BarChart3 className="h-4 w-4 text-emerald-600" />
                        Communication strength
                      </div>
                      <p className="mt-3 text-2xl font-bold text-foreground">{selectedWorkspaceHealth.communicationStrength}/100</p>
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Sparkles className="h-4 w-4 text-accent" />
                      Smart guidance
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {selectedWorkspaceHealth.missingRoles.length
                        ? `This team is strongest if it fills these remaining roles next: ${selectedWorkspaceHealth.missingRoles.join(", ")}.`
                        : "This workspace has all planned roles filled. The next leverage point is pushing more tasks toward done status."}
                    </p>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                    <div className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Users2 className="h-4 w-4 text-primary" />
                        AI co-founder matching
                      </div>
                      <div className="mt-4 space-y-3">
                        {coFounderMatches.length ? (
                          coFounderMatches.map((match) => (
                            <div key={match.role} className="rounded-2xl bg-background/80 p-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="text-sm font-semibold text-foreground">{match.role}</p>
                                <Badge variant="secondary" className="rounded-full">{match.matchScore}%</Badge>
                              </div>
                              <p className="mt-2 text-xs leading-6 text-muted-foreground">{match.summary}</p>
                              <p className="mt-1 text-xs leading-6 text-muted-foreground">{match.reason}</p>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-2xl border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
                            This team has no missing core roles right now, so co-founder matching is temporarily satisfied.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <BarChart3 className="h-4 w-4 text-emerald-600" />
                        Simulation lab
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-background/80 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Market interest</p>
                          <p className="mt-2 text-2xl font-bold text-foreground">{simulationSnapshot.marketInterest}/100</p>
                        </div>
                        <div className="rounded-2xl bg-background/80 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Revenue signal</p>
                          <p className="mt-2 text-sm font-semibold text-foreground">{simulationSnapshot.revenuePotential}</p>
                        </div>
                        <div className="rounded-2xl bg-background/80 p-4 sm:col-span-2">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Execution risk</p>
                          <p className="mt-2 text-sm font-semibold text-foreground">{simulationSnapshot.executionRisk}</p>
                          <p className="mt-3 text-xs leading-6 text-muted-foreground">{simulationSnapshot.verdict}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Rocket className="h-4 w-4 text-primary" />
                        Milestone ownership
                      </div>
                      <div className="mt-4 space-y-3">
                        {selectedWorkspace.milestoneBoard.map((milestone) => (
                          <div key={milestone.id} className="rounded-2xl bg-background/80 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{milestone.title}</p>
                                <p className="mt-1 text-xs text-muted-foreground">Owner role: {milestone.ownerRole}</p>
                              </div>
                              <select
                                className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                                value={milestone.status}
                                onChange={(event) =>
                                  handleUpdateMilestone(
                                    milestone.id,
                                    event.target.value as "Todo" | "In Progress" | "Done",
                                  )
                                }
                              >
                                <option value="Todo">Todo</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Done">Done</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <BarChart3 className="h-4 w-4 text-emerald-600" />
                        Contribution tracking
                      </div>
                      <div className="mt-4 space-y-3">
                        {contributionBoard.map((entry) => (
                          <div key={entry.userId} className="rounded-2xl bg-background/80 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{entry.displayName}</p>
                                <p className="mt-1 text-xs text-muted-foreground">{entry.role}</p>
                              </div>
                              <Badge variant="secondary" className="rounded-full">{entry.share}% share</Badge>
                            </div>
                            <p className="mt-3 text-xs leading-6 text-muted-foreground">{entry.summary}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
                    <div className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Users2 className="h-4 w-4 text-primary" />
                        Team members
                      </div>
                      <div className="mt-4 space-y-3">
                        {selectedWorkspace.members.map((member) => (
                          <div key={member.userId} className="rounded-2xl bg-background/80 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-foreground">{member.displayName}</p>
                              <Badge variant="secondary" className="rounded-full">{member.role}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {member.title}
                              {member.isLead ? " • Team lead" : ""}
                            </p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-2xl border border-dashed border-border bg-background/70 p-4 text-sm leading-7 text-muted-foreground">
                        Open roles: {selectedWorkspace.openRoles.length ? selectedWorkspace.openRoles.join(", ") : "All core roles filled"}
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <MessagesSquare className="h-4 w-4 text-primary" />
                        Workspace chat
                      </div>
                      <div className="mt-4 space-y-3">
                        {selectedWorkspace.messages.slice(0, 5).map((message) => (
                          <div key={message.id} className="rounded-2xl bg-background/80 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-foreground">{message.displayName}</p>
                              <p className="text-xs text-muted-foreground">{message.role}</p>
                            </div>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">{message.content}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <Textarea
                          placeholder="Share a blocker, propose the next sprint goal, or align the team."
                          className="min-h-24 rounded-2xl"
                          value={draftMessage}
                          onChange={(event) => setDraftMessage(event.target.value)}
                        />
                        <Button className="rounded-xl sm:self-start" onClick={handleSendMessage}>
                          Send update
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                    <div className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Task board
                      </div>
                      <div className="mt-4 space-y-3">
                        {selectedWorkspace.tasks.map((task) => (
                          <div key={task.id} className="rounded-2xl bg-background/80 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-foreground">{task.title}</p>
                              <Badge variant="secondary" className="rounded-full">{task.status}</Badge>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">Suggested owner: {task.ownerRole}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                        <Input
                          placeholder="Add the next concrete sprint task"
                          className="h-12 rounded-2xl"
                          value={draftTask}
                          onChange={(event) => setDraftTask(event.target.value)}
                        />
                        <Button className="rounded-xl" onClick={handleAddTask}>
                          Add task
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Sparkles className="h-4 w-4 text-accent" />
                        Execution milestones
                      </div>
                      <div className="mt-4 space-y-3">
                        {selectedWorkspace.milestones.map((milestone) => (
                          <div key={milestone} className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground">
                            {milestone}
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 rounded-2xl border border-dashed border-border bg-background/70 p-4 text-sm leading-7 text-muted-foreground">
                        Phase 5 can now build on this with milestone state, assignee ownership, and idea-to-project conversion logic.
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ArrowRight className="h-4 w-4 text-primary" />
                      Idea to project conversion
                    </div>
                    <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
                      <Input
                        placeholder="Name the launch-ready project"
                        className="h-12 rounded-2xl"
                        value={projectTitle}
                        onChange={(event) => setProjectTitle(event.target.value)}
                      />
                      <Button className="rounded-xl" onClick={handleConvertToProject}>
                        {selectedWorkspace.launch.converted ? "Update launch" : "Convert to project"}
                      </Button>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                      {selectedWorkspace.launch.converted
                        ? `This workspace has been converted into ${selectedWorkspace.launch.projectTitle} and is now tracked as a ${selectedWorkspace.launch.launchStatus?.toLowerCase()} release.`
                        : "When the team is ready, convert this workspace into a launch-ready marketplace project and keep the incubator story intact."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-border bg-secondary/40 p-6">
                  <p className="text-sm leading-7 text-muted-foreground">
                    Create the first workspace from an active idea on the left to unlock team formation, role slots,
                    chat, task tracking, and Phase 4 matching insights.
                  </p>
                  <Button className="mt-4 rounded-xl" asChild>
                    <Link to="/ideas">Return to Idea Hub</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CollaborationPage;
