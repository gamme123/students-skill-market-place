import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Filter,
  Flame,
  Globe2,
  Landmark,
  Lightbulb,
  MessageSquareText,
  Rocket,
  Search,
  Sparkles,
  ThumbsUp,
  Users2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  collaborationRoles,
  ideaCategories,
  type CollaborationRole,
  type IdeaDifficulty,
  type IdeaStage,
  type IdeaVisibility,
} from "@/data/ideas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import {
  createIdeaComment,
  createIdeaDraft,
  fetchIdeaComments,
  fetchIdeaHubFeed,
  getCurrentIdeaInteraction,
  requestIdeaCollaboration,
  voteForIdea,
  type IdeaComment,
} from "@/lib/ideaHub";
import { toast } from "sonner";

const roleTone: Record<string, string> = {
  Developer: "bg-primary/10 text-primary",
  Designer: "bg-accent/10 text-accent",
  Researcher: "bg-emerald-500/10 text-emerald-700",
  Strategist: "bg-sky-500/10 text-sky-700",
  Writer: "bg-violet-500/10 text-violet-700",
};

const stageOptions: IdeaStage[] = ["Concept", "Validation", "Building", "Ready for Marketplace"];
const difficultyOptions: IdeaDifficulty[] = ["Beginner", "Intermediate", "Advanced"];
const visibilityOptions: IdeaVisibility[] = ["Public", "Private", "Team"];
const journeySteps: IdeaStage[] = ["Concept", "Validation", "Building", "Ready for Marketplace"];

const defaultForm = {
  title: "",
  description: "",
  category: "AI",
  visibility: "Public" as IdeaVisibility,
  stage: "Concept" as IdeaStage,
  difficulty: "Beginner" as IdeaDifficulty,
  tags: "",
  rolesNeeded: ["Developer"] as CollaborationRole[],
};

const getIdeaScore = (votes: number, joinRequests: number, difficulty: IdeaDifficulty, startupMode?: boolean) => {
  const difficultyBoost = difficulty === "Advanced" ? 0.6 : difficulty === "Intermediate" ? 0.35 : 0.15;
  const startupBoost = startupMode ? 0.45 : 0.1;
  return Math.min(9.9, Number((5.2 + votes / 120 + joinRequests / 16 + difficultyBoost + startupBoost).toFixed(1)));
};

const IdeaHub = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [form, setForm] = useState(defaultForm);
  const [joinRole, setJoinRole] = useState<Record<string, CollaborationRole>>({});
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [commentsByIdea, setCommentsByIdea] = useState<Record<string, IdeaComment[]>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["idea-hub"],
    queryFn: fetchIdeaHubFeed,
  });

  const ideas = data ?? [];

  useEffect(() => {
    let cancelled = false;

    const loadComments = async () => {
      const entries = await Promise.all(
        ideas.map(async (idea) => [idea.id, await fetchIdeaComments(idea.id)] as const),
      );

      if (!cancelled) {
        setCommentsByIdea(Object.fromEntries(entries));
      }
    };

    if (ideas.length) {
      void loadComments();
    } else {
      setCommentsByIdea({});
    }

    return () => {
      cancelled = true;
    };
  }, [ideas]);

  const filteredIdeas = useMemo(() => {
    return ideas.filter((idea) => {
      const matchesCategory = activeCategory === "All" || idea.category === activeCategory;
      const normalizedQuery = query.trim().toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        idea.title.toLowerCase().includes(normalizedQuery) ||
        idea.description.toLowerCase().includes(normalizedQuery) ||
        idea.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, ideas, query]);

  const trendingIdeas = [...ideas].sort((a, b) => b.trendScore - a.trendScore).slice(0, 3);
  const recommendedIdeas = [...ideas]
    .sort((a, b) => b.votes + b.joinRequests - (a.votes + a.joinRequests))
    .slice(0, 2);

  const userCreatedIdeas = user ? ideas.filter((idea) => idea.authorUserId === user.id) : [];

  const refreshIdeas = async () => {
    await queryClient.invalidateQueries({ queryKey: ["idea-hub"] });
    if (user?.id) {
      await queryClient.invalidateQueries({ queryKey: ["idea-summary", user.id] });
    }

    const nextFeed = await fetchIdeaHubFeed();
    const commentEntries = await Promise.all(
      nextFeed.map(async (idea) => [idea.id, await fetchIdeaComments(idea.id)] as const),
    );
    setCommentsByIdea(Object.fromEntries(commentEntries));
  };

  const toggleRole = (role: CollaborationRole) => {
    setForm((current) => ({
      ...current,
      rolesNeeded: current.rolesNeeded.includes(role)
        ? current.rolesNeeded.filter((item) => item !== role)
        : [...current.rolesNeeded, role],
    }));
  };

  const handlePostIdea = async () => {
    if (!user) {
      toast.error("Sign in first to post an idea.");
      return;
    }

    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Add a title and description so your idea is clear.");
      return;
    }

    if (!form.rolesNeeded.length) {
      toast.error("Choose at least one collaborator role.");
      return;
    }

    await createIdeaDraft(
      {
        title: form.title,
        description: form.description,
        category: form.category,
        visibility: form.visibility,
        stage: form.stage,
        difficulty: form.difficulty,
        rolesNeeded: form.rolesNeeded,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      },
      {
        userId: user.id,
        displayName: user.user_metadata?.display_name || user.email?.split("@")[0] || "Student founder",
        title: "Idea author and builder",
      },
    );

    setForm(defaultForm);
    await refreshIdeas();
    toast.success("Your idea is now live in Idea Hub.");
  };

  const handleVote = async (ideaId: string) => {
    const result = await voteForIdea(ideaId, user?.id);
    if (!result.ok) {
      toast.message("You already voted for this idea in this browser.");
      return;
    }

    await refreshIdeas();
    toast.success("Vote recorded.");
  };

  const handleJoin = async (ideaId: string) => {
    if (!user) {
      toast.error("Sign in first to request collaboration.");
      return;
    }

    const chosenRole = joinRole[ideaId] ?? "Developer";
    const result = await requestIdeaCollaboration(ideaId, chosenRole, user.id);
    if (!result.ok) {
      toast.message(
        result.reason === "already-joined"
          ? `You already requested to join this idea as ${result.joinedRole?.toLowerCase()}.`
          : "This join request could not be saved.",
      );
      return;
    }

    await refreshIdeas();
    toast.success(`Collaboration request sent as ${chosenRole.toLowerCase()}.`);
  };

  const handleComment = async (ideaId: string) => {
    if (!user) {
      toast.error("Sign in first to comment on ideas.");
      return;
    }

    const draft = commentDrafts[ideaId]?.trim();
    if (!draft) {
      toast.error("Write a short comment first.");
      return;
    }

    const comment = await createIdeaComment(ideaId, draft, {
      userId: user.id,
      displayName: user.user_metadata?.display_name || user.email?.split("@")[0] || "Student contributor",
      title: "Idea Hub contributor",
    });

    if (!comment) {
      toast.error("That comment could not be saved.");
      return;
    }

    setCommentDrafts((current) => ({ ...current, [ideaId]: "" }));
    await refreshIdeas();
    toast.success("Comment added.");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <section className="gradient-hero relative overflow-hidden rounded-[2rem] px-6 py-10 text-primary-foreground shadow-hero md:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_34%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-medium text-white/90">
                <Sparkles className="h-4 w-4" />
                StudentHub Idea Hub
              </div>
              <h1 className="font-display mt-6 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
                Share ideas, find collaborators, validate demand, and turn concepts into real projects.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/85">
                Idea Hub is the layer that moves StudentHub beyond a freelance marketplace. Students can propose ventures,
                test interest, assemble teams, and convert promising ideas into products or marketplace offers.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => document.getElementById("idea-post-form")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Post an idea
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10" asChild>
                  <Link to={user ? "/profile" : "/auth"}>{user ? "View your profile" : "Sign in to collaborate"}</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-1">
              <div className="glass-panel rounded-[1.5rem] border border-white/70 p-5 text-foreground shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Live idea posting</p>
                    <p className="text-xs text-muted-foreground">Post concepts now and keep them after refresh</p>
                  </div>
                </div>
              </div>
              <div className="glass-panel rounded-[1.5rem] border border-white/70 p-5 text-foreground shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Users2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Join requests</p>
                    <p className="text-xs text-muted-foreground">Students can pick a role and request to collaborate</p>
                  </div>
                </div>
              </div>
              <div className="glass-panel rounded-[1.5rem] border border-white/70 p-5 text-foreground shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                    <ThumbsUp className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Persistent interaction</p>
                    <p className="text-xs text-muted-foreground">Likes and comments now survive refreshes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {isLoading ? (
              <div className="rounded-[1.5rem] border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-card">
                Loading Idea Hub ecosystem...
              </div>
            ) : null}

            {filteredIdeas.map((idea) => {
              const interaction = getCurrentIdeaInteraction(idea.id);
              const selectedRole = joinRole[idea.id] ?? idea.rolesNeeded[0] ?? "Developer";
              const ideaScore = getIdeaScore(idea.votes, idea.joinRequests, idea.difficulty, idea.startupMode);
              const comments = commentsByIdea[idea.id] ?? [];
              const currentJourneyIndex = journeySteps.indexOf(idea.stage);

              return (
                <div key={idea.id} className="glass-panel rounded-[1.5rem] border border-white/70 p-5 shadow-card">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="rounded-full border-primary/30 text-primary">
                          {idea.category}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          {idea.visibility}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          {idea.stage}
                        </Badge>
                        <Badge variant="secondary" className="rounded-full">
                          {idea.difficulty}
                        </Badge>
                        {idea.isUserGenerated ? (
                          <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">New</Badge>
                        ) : null}
                      </div>
                      <h3 className="font-display mt-4 text-2xl font-bold text-foreground">{idea.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">{idea.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {idea.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="w-full max-w-xs space-y-3">
                      <div className="rounded-2xl bg-background/75 p-4 text-sm text-foreground">
                        <p className="font-semibold">Posted by {idea.author}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{idea.authorTitle}</p>
                      </div>
                      <div className="rounded-2xl bg-background/75 p-4 text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">Roles needed</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {idea.rolesNeeded.map((role) => (
                            <span key={role} className={`rounded-full px-3 py-1 text-xs ${roleTone[role]}`}>
                              {role}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-5">
                    <div className="rounded-2xl bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Idea score</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{ideaScore}/10</p>
                    </div>
                    <div className="rounded-2xl bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Trend score</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{idea.trendScore}</p>
                    </div>
                    <div className="rounded-2xl bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Votes</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{idea.votes}</p>
                    </div>
                    <div className="rounded-2xl bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Join requests</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{idea.joinRequests}</p>
                    </div>
                    <div className="rounded-2xl bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Comments</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{idea.comments}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Rocket className="h-4 w-4 text-primary" />
                      Guided idea to startup journey
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-4">
                      {journeySteps.map((step, index) => {
                        const complete = index < currentJourneyIndex;
                        const active = index === currentJourneyIndex;

                        return (
                          <div
                            key={step}
                            className={`rounded-2xl border px-4 py-3 text-sm ${
                              active
                                ? "border-primary bg-primary/10 text-primary"
                                : complete
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-border bg-background/80 text-muted-foreground"
                            }`}
                          >
                            <p className="font-semibold">{step}</p>
                            <p className="mt-1 text-xs">{active ? "Current step" : complete ? "Completed" : "Upcoming"}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
                    <div className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Rocket className="h-4 w-4 text-primary" />
                        Idea incubator mode
                      </div>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {idea.startupMode
                          ? "This idea is positioned as a startup-track concept with execution milestones and team-building potential."
                          : "This idea is currently closer to marketplace monetization than startup incubation."}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(idea.milestones ?? []).map((milestone) => (
                          <span
                            key={milestone}
                            className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground"
                          >
                            {milestone}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-background/80 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <BriefcaseBusiness className="h-4 w-4 text-accent" />
                            Recruiter mode
                          </div>
                          <p className="mt-2 text-xs leading-6 text-muted-foreground">{idea.recruiterInterest}</p>
                        </div>
                        <div className="rounded-2xl bg-background/80 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Landmark className="h-4 w-4 text-primary" />
                            Investor mode
                          </div>
                          <p className="mt-2 text-xs leading-6 text-muted-foreground">{idea.investorInterest}</p>
                        </div>
                        <div className="rounded-2xl bg-background/80 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <BarChart3 className="h-4 w-4 text-emerald-600" />
                            Competition track
                          </div>
                          <p className="mt-2 text-xs leading-6 text-muted-foreground">{idea.competitionTrack}</p>
                        </div>
                        <div className="rounded-2xl bg-background/80 p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Globe2 className="h-4 w-4 text-sky-600" />
                            Connected tools
                          </div>
                          <p className="mt-2 text-xs leading-6 text-muted-foreground">{(idea.connectedTools ?? []).join(" • ")}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Bot className="h-4 w-4 text-primary" />
                      AI validation feedback
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{idea.aiFeedback}</p>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Idea to project path:</span> {idea.conversionPath}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <select
                        className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
                        value={selectedRole}
                        onChange={(event) =>
                          setJoinRole((current) => ({ ...current, [idea.id]: event.target.value as CollaborationRole }))
                        }
                      >
                        {idea.rolesNeeded.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <Button variant="outline" className="rounded-xl" onClick={() => handleJoin(idea.id)}>
                        {interaction?.joinedRole ? `Joined as ${interaction.joinedRole}` : "Join idea"}
                      </Button>
                      <Button variant="outline" className="rounded-xl" onClick={() => handleVote(idea.id)}>
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        {interaction?.voted ? "Voted" : "Upvote"}
                      </Button>
                      <Button className="rounded-xl">
                        Convert to project
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <MessageSquareText className="h-4 w-4 text-primary" />
                      Comments and validation
                    </div>
                    <div className="mt-4 space-y-3">
                      {comments.length ? (
                        comments.slice(0, 3).map((comment) => (
                          <div key={comment.id} className="rounded-2xl bg-background/80 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-foreground">{comment.authorName}</p>
                              <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</p>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{comment.authorTitle}</p>
                            <p className="mt-3 text-sm leading-7 text-muted-foreground">{comment.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-2xl border border-dashed border-border bg-background/70 p-4 text-sm text-muted-foreground">
                          No comments yet. Be the first to validate or challenge this idea.
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                      <Textarea
                        placeholder="Share feedback, validation questions, or improvement ideas"
                        className="min-h-24 rounded-2xl"
                        value={commentDrafts[idea.id] ?? ""}
                        onChange={(event) =>
                          setCommentDrafts((current) => ({ ...current, [idea.id]: event.target.value }))
                        }
                      />
                      <Button className="rounded-xl sm:self-start" onClick={() => handleComment(idea.id)}>
                        Add comment
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-6">
            <div className="glass-panel rounded-[1.8rem] border border-white/70 p-6 shadow-card">
              <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">Trending ideas</p>
                  <h3 className="font-display text-2xl font-bold text-foreground">What students are reacting to</h3>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {trendingIdeas.map((idea) => (
                  <div key={idea.id} className="rounded-[1.3rem] border border-border/70 bg-background/75 p-4">
                    <p className="text-sm font-semibold text-foreground">{idea.title}</p>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                      {idea.interestLevel} interest • {idea.votes} votes • {idea.joinRequests} join requests
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[1.8rem] border border-white/70 p-6 shadow-card">
              <div className="flex items-center gap-3">
                <Globe2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Ideas for you</p>
                  <h3 className="font-display text-2xl font-bold text-foreground">Recommended by skill adjacency</h3>
                </div>
              </div>
              <div className="mt-5 space-y-4">
                {recommendedIdeas.map((idea) => (
                  <div key={idea.id} className="rounded-[1.3rem] border border-border/70 bg-background/75 p-4">
                    <p className="text-sm font-semibold text-foreground">{idea.title}</p>
                    <p className="mt-2 text-xs leading-6 text-muted-foreground">
                      {idea.category} • roles open: {idea.rolesNeeded.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-[1.8rem] border border-white/70 p-6 shadow-card">
              <div className="flex items-center gap-3">
                <MessageSquareText className="h-5 w-5 text-emerald-700" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Phase 1 progress</p>
                  <h3 className="font-display text-2xl font-bold text-foreground">What is working now</h3>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
                <p>1. Students can post ideas with category, stage, tags, and visibility.</p>
                <p>2. Other students can upvote, comment, and request to join ideas with a specific role.</p>
                <p>3. New ideas, comments, and interaction counts persist after refresh in the live browser.</p>
                <p>4. Each idea now shows a guided journey from concept to marketplace-ready launch.</p>
                <p>5. Idea cards now show incubator, idea score, recruiter, investor, and integration cues.</p>
                <p>6. Profile pages can now reflect Idea Hub contribution signals.</p>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3">
                <Rocket className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Roadmap</p>
                  <h3 className="font-display text-2xl font-bold text-foreground">What comes after this layer</h3>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
                <p>- Persist ideas in Supabase with real multi-user collaboration</p>
                <p>- Add team workspaces and recruiter or investor dashboards</p>
                <p>- Connect Idea Hub conversion into services and project dashboards</p>
                <p>- Introduce AI idea generation, evaluator feedback, and co-founder matching</p>
              </div>
            </div>
          </div>
        </section>

        <section id="idea-post-form" className="mt-10 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="glass-panel rounded-[1.8rem] border border-white/70 p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">Post an idea</p>
                <h2 className="font-display mt-3 text-3xl font-bold text-foreground">Launch a real concept into StudentHub</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  This MVP saves your ideas in the browser right now, so the flow already works on the live site while we prepare deeper backend storage.
                </p>
              </div>
              <div className="rounded-2xl bg-primary/10 px-4 py-3 text-right text-sm">
                <p className="font-semibold text-primary">{userCreatedIdeas.length}</p>
                <p className="text-muted-foreground">Ideas you posted</p>
              </div>
            </div>

            {user ? (
              <div className="mt-6 space-y-4">
                <Input
                  placeholder="Idea title"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="h-12 rounded-2xl"
                />
                <Textarea
                  placeholder="Describe the problem, the opportunity, and why students should care."
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="min-h-32 rounded-2xl"
                />

                <div className="grid gap-4 md:grid-cols-3">
                  <select
                    className="h-12 rounded-2xl border border-input bg-background px-4 text-sm"
                    value={form.category}
                    onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  >
                    {ideaCategories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-12 rounded-2xl border border-input bg-background px-4 text-sm"
                    value={form.stage}
                    onChange={(event) => setForm((current) => ({ ...current, stage: event.target.value as IdeaStage }))}
                  >
                    {stageOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <select
                    className="h-12 rounded-2xl border border-input bg-background px-4 text-sm"
                    value={form.visibility}
                    onChange={(event) => setForm((current) => ({ ...current, visibility: event.target.value as IdeaVisibility }))}
                  >
                    {visibilityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_220px]">
                  <Input
                    placeholder="Tags, separated by commas"
                    value={form.tags}
                    onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                    className="h-12 rounded-2xl"
                  />
                  <select
                    className="h-12 rounded-2xl border border-input bg-background px-4 text-sm"
                    value={form.difficulty}
                    onChange={(event) => setForm((current) => ({ ...current, difficulty: event.target.value as IdeaDifficulty }))}
                  >
                    {difficultyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-sm font-semibold text-foreground">Roles you want to recruit</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {collaborationRoles.map((role) => {
                      const selected = form.rolesNeeded.includes(role);
                      return (
                        <button
                          key={role}
                          type="button"
                          className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "border border-border bg-background text-muted-foreground hover:text-foreground"
                          }`}
                          onClick={() => toggleRole(role)}
                        >
                          {role}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Button className="rounded-xl" onClick={handlePostIdea}>
                  Publish idea
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="mt-6 rounded-[1.5rem] border border-dashed border-border bg-secondary/40 p-6">
                <p className="text-sm leading-7 text-muted-foreground">
                  Sign in to publish ideas, build your founder profile, and start receiving collaboration requests.
                </p>
                <Button className="mt-4 rounded-xl" asChild>
                  <Link to="/auth">Sign in to post</Link>
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-[1.8rem] border border-border bg-card p-6 shadow-card">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">Idea discovery</p>
                <h2 className="font-display mt-3 text-3xl font-bold text-foreground">Explore live concepts and momentum signals</h2>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                Smart filters
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search AI, startups, research, or design ideas"
                  className="h-12 rounded-2xl pl-11"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {["All", ...ideaCategories].map((category) => (
                  <Badge
                    key={category}
                    variant={activeCategory === category ? "default" : "secondary"}
                    className="cursor-pointer rounded-full px-4 py-2 text-xs"
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default IdeaHub;
