import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import {
  ideas as seedIdeas,
  type CollaborationRole,
  type IdeaDifficulty,
  type IdeaItem,
  type IdeaStage,
  type IdeaVisibility,
} from "@/data/ideas";
import { isSupabaseConfigured } from "@/lib/marketplace";

const IDEAS_STORAGE_KEY = "studenthub.ideaHub.ideas";
const INTERACTIONS_STORAGE_KEY = "studenthub.ideaHub.interactions";
const COMMENTS_STORAGE_KEY = "studenthub.ideaHub.comments";
const FOLLOWING_STORAGE_KEY = "studenthub.ideaHub.following";
const WORKSPACES_STORAGE_KEY = "studenthub.ideaHub.workspaces";
const GLOBAL_PREFS_STORAGE_KEY = "studenthub.global.preferences";

type IdeaRow = Tables<"ideas">;
type ProfileRow = Tables<"profiles">;
type IdeaVoteRow = Tables<"idea_votes">;
type IdeaJoinRequestRow = Tables<"idea_join_requests">;
type IdeaCommentRow = Tables<"idea_comments">;
type IdeaWorkspaceRow = Tables<"idea_workspaces">;
type IdeaWorkspaceMemberRow = Tables<"idea_workspace_members">;
type IdeaWorkspaceTaskRow = Tables<"idea_workspace_tasks">;
type IdeaWorkspaceMilestoneRow = Tables<"idea_workspace_milestones">;
type IdeaWorkspaceMessageRow = Tables<"idea_workspace_messages">;

interface IdeaInteractionState {
  votes: number;
  joinRequests: number;
  voted: boolean;
  joinedRole: CollaborationRole | null;
}

type IdeaInteractionMap = Record<string, IdeaInteractionState>;

export interface IdeaAuthor {
  userId: string;
  displayName: string;
  title: string;
}

export interface IdeaDraftInput {
  title: string;
  description: string;
  category: string;
  tags: string[];
  visibility: IdeaVisibility;
  stage: IdeaStage;
  difficulty: IdeaDifficulty;
  rolesNeeded: CollaborationRole[];
}

export interface IdeaContributionSummary {
  totalIdeas: number;
  totalVotes: number;
  totalJoinRequests: number;
  authoredIdeas: IdeaItem[];
}

export interface IdeaFollowingState {
  ideaIds: string[];
  categories: string[];
}

export interface IdeaHubActivitySnapshot {
  followedIdeas: number;
  followedCategories: number;
  votesCast: number;
  collaborationRequests: number;
  authoredIdeas: number;
}

export interface WorkspaceMember {
  userId: string;
  displayName: string;
  role: CollaborationRole;
  title: string;
  joinedAt: string;
  isLead?: boolean;
}

export interface WorkspaceMessage {
  id: string;
  userId: string;
  displayName: string;
  role: CollaborationRole;
  content: string;
  createdAt: string;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  ownerRole: CollaborationRole;
  status: "Todo" | "In Progress" | "Done";
}

export interface WorkspaceMilestone {
  id: string;
  title: string;
  ownerRole: CollaborationRole;
  status: "Todo" | "In Progress" | "Done";
}

export interface ProjectLaunchRecord {
  converted: boolean;
  projectTitle?: string;
  convertedAt?: string;
  launchStatus?: "Planning" | "Private Beta" | "Public Launch";
}

export interface IdeaWorkspace {
  id: string;
  ideaId: string;
  ideaTitle: string;
  category: string;
  stage: IdeaStage;
  members: WorkspaceMember[];
  openRoles: CollaborationRole[];
  tasks: WorkspaceTask[];
  messages: WorkspaceMessage[];
  milestones: string[];
  milestoneBoard: WorkspaceMilestone[];
  launch: ProjectLaunchRecord;
  createdAt: string;
}

export interface WorkspaceHealthSnapshot {
  score: number;
  teamStrength: number;
  executionStrength: number;
  communicationStrength: number;
  missingRoles: CollaborationRole[];
}

export interface OpportunityMatch {
  ideaId: string;
  score: number;
  label: string;
  reasons: string[];
}

export interface WorkspaceContributionSnapshot {
  userId: string;
  displayName: string;
  role: CollaborationRole;
  points: number;
  share: number;
  summary: string;
}

export interface GlobalPlatformPreferences {
  language: "English" | "Swahili" | "French" | "Afan Oromo";
  currency: "USD" | "KES" | "EUR";
  visibilityMode: "Student" | "Recruiter" | "Investor";
  networkScope: "Global" | "Local";
}

export interface CompetitionTrack {
  id: string;
  title: string;
  region: string;
  reward: string;
  deadline: string;
  focus: string;
}

export interface SkillDnaProfile {
  builderScore: number;
  leadershipScore: number;
  researchScore: number;
  creativityScore: number;
  workStyle: string;
  behaviorTag: string;
  topStrengths: string[];
}

export interface CoFounderMatch {
  role: CollaborationRole;
  matchScore: number;
  summary: string;
  reason: string;
}

export interface SimulationSnapshot {
  marketInterest: number;
  revenuePotential: string;
  executionRisk: string;
  verdict: string;
}

export interface IdeaComment {
  id: string;
  ideaId: string;
  authorName: string;
  authorTitle: string;
  authorUserId?: string;
  content: string;
  createdAt: string;
}

const canUseStorage = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined";

const readJson = <T,>(key: string, fallback: T): T => {
  if (!canUseStorage()) return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = <T,>(key: string, value: T) => {
  if (!canUseStorage()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const buildInterestLevel = (votes: number, joins: number) => {
  const momentum = votes + joins * 4;
  if (momentum >= 180) return "Very high";
  if (momentum >= 110) return "High";
  if (momentum >= 60) return "Growing";
  return "Early";
};

const buildTrendScore = (votes: number, joins: number) => Math.min(99, Math.round(votes * 0.32 + joins * 4 + 20));

const buildAiFeedback = (input: IdeaDraftInput) => {
  const roleSignal = input.rolesNeeded.length
    ? ` Clear collaborator demand across ${input.rolesNeeded.join(", ").toLowerCase()}.`
    : "";
  return `Promising ${input.category.toLowerCase()} concept in the ${input.stage.toLowerCase()} stage. Focus on validating demand, clarifying the first user problem, and defining a simple MVP.${roleSignal}`;
};

const buildConversionPath = (input: IdeaDraftInput) =>
  `Validate the concept, form a ${input.rolesNeeded.length ? input.rolesNeeded[0].toLowerCase() : "core"}-led team, then convert it into a marketplace project or startup MVP.`;

const defaultMilestonesForStage = (stage: IdeaStage) => {
  switch (stage) {
    case "Concept":
      return ["Problem framing", "First validation interviews", "Opportunity brief"];
    case "Validation":
      return ["Prototype MVP", "Early testers", "Signal review"];
    case "Building":
      return ["Active build sprint", "Closed beta", "Launch prep"];
    default:
      return ["Marketplace packaging", "Demo assets", "Revenue launch"];
  }
};

const defaultToolsForCategory = (category: string) => {
  if (category === "Design") return ["Figma", "Drive", "LinkedIn"];
  if (category === "Research") return ["Drive", "Notion", "GitHub"];
  if (category === "AI" || category === "Web") return ["GitHub", "Drive", "Pitch deck"];
  return ["Drive", "LinkedIn"];
};

const formatDisplayTitle = (raw: string | null | undefined) => raw?.trim() || "Student builder";

const getStoredIdeas = () => readJson<IdeaItem[]>(IDEAS_STORAGE_KEY, []);

const saveStoredIdeas = (ideas: IdeaItem[]) => writeJson(IDEAS_STORAGE_KEY, ideas);

const getStoredInteractions = () => readJson<IdeaInteractionMap>(INTERACTIONS_STORAGE_KEY, {});

const saveStoredInteractions = (interactions: IdeaInteractionMap) => writeJson(INTERACTIONS_STORAGE_KEY, interactions);

const getStoredComments = () => readJson<Record<string, IdeaComment[]>>(COMMENTS_STORAGE_KEY, {});

const saveStoredComments = (comments: Record<string, IdeaComment[]>) => writeJson(COMMENTS_STORAGE_KEY, comments);

const getStoredFollowing = () =>
  readJson<IdeaFollowingState>(FOLLOWING_STORAGE_KEY, {
    ideaIds: [],
    categories: [],
  });

const saveStoredFollowing = (following: IdeaFollowingState) => writeJson(FOLLOWING_STORAGE_KEY, following);

const getStoredWorkspaces = () => readJson<IdeaWorkspace[]>(WORKSPACES_STORAGE_KEY, []);

const saveStoredWorkspaces = (workspaces: IdeaWorkspace[]) => writeJson(WORKSPACES_STORAGE_KEY, workspaces);
const getStoredGlobalPreferences = () =>
  readJson<GlobalPlatformPreferences>(GLOBAL_PREFS_STORAGE_KEY, {
    language: "English",
    currency: "USD",
    visibilityMode: "Student",
    networkScope: "Global",
  });

const saveStoredGlobalPreferences = (preferences: GlobalPlatformPreferences) =>
  writeJson(GLOBAL_PREFS_STORAGE_KEY, preferences);

const defaultMilestoneRoles = (roles: CollaborationRole[]) => {
  const primary = roles[0] ?? "Developer";
  const secondary = roles[1] ?? primary;
  const third = roles[2] ?? secondary;
  return [primary, secondary, third];
};

const translatedSummaries = {
  English: {
    collaboration: "Build teams, assign roles, and move ideas into execution.",
    investor: "Investor mode highlights the ideas with the clearest traction and launch signal.",
    recruiter: "Recruiter mode surfaces teams with visible execution and portfolio momentum.",
  },
  Swahili: {
    collaboration: "Jenga timu, gawa majukumu, na geuza mawazo kuwa utekelezaji halisi.",
    investor: "Mwonekano wa wawekezaji unaangazia mawazo yenye mvuto na dalili wazi za uzinduzi.",
    recruiter: "Mwonekano wa waajiri unaonyesha timu zenye utekelezaji unaoonekana na kasi ya wasifu wa kazi.",
  },
  French: {
    collaboration: "Formez des equipes, attribuez des roles et transformez les idees en execution.",
    investor: "Le mode investisseur met en avant les idees avec le meilleur signal de traction et de lancement.",
    recruiter: "Le mode recruteur met en avant les equipes avec une execution visible et un portefeuille solide.",
  },
  "Afan Oromo": {
    collaboration: "Garee ijaaraa, gahee qoodaa, yaadota gara hojiitti jijjiiraa.",
    investor: "Haalli invastaraa yaadota harkifannaa fi mallattoo eegalcha cimaa qaban irratti xiyyeeffata.",
    recruiter: "Haalli qacarrii gareewwan hojii isaanii mul'atan fi poortiifooliyoo cimaa qaban agarsiisa.",
  },
} as const;

const withInteractionState = (idea: IdeaItem, interactions: IdeaInteractionMap): IdeaItem => {
  const state = interactions[idea.id];
  if (!state) return idea;

  return {
    ...idea,
    votes: state.votes,
    joinRequests: state.joinRequests,
    trendScore: buildTrendScore(state.votes, state.joinRequests),
    interestLevel: buildInterestLevel(state.votes, state.joinRequests),
  };
};

const buildLocalIdea = (input: IdeaDraftInput, author: IdeaAuthor) => {
  const now = new Date().toISOString();
  return {
    id: `idea-user-${Date.now()}`,
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    tags: input.tags,
    visibility: input.visibility,
    stage: input.stage,
    difficulty: input.difficulty,
    trendScore: buildTrendScore(1, 0),
    votes: 1,
    comments: 0,
    joinRequests: 0,
    interestLevel: buildInterestLevel(1, 0),
    aiFeedback: buildAiFeedback(input),
    author: author.displayName,
    authorTitle: author.title,
    authorUserId: author.userId,
    rolesNeeded: input.rolesNeeded,
    conversionPath: buildConversionPath(input),
    createdAt: now,
    isUserGenerated: true,
    startupMode: input.stage !== "Ready for Marketplace",
    milestones: defaultMilestonesForStage(input.stage),
    connectedTools: defaultToolsForCategory(input.category),
    recruiterInterest: input.category === "AI" ? "High product talent signal" : "Strong execution signal",
    investorInterest: input.stage === "Validation" || input.stage === "Building" ? "Potential incubator fit" : "Early concept watchlist",
    competitionTrack: `${input.category} spotlight`,
  } satisfies IdeaItem;
};

const ensureLocalInteraction = (idea: IdeaItem) => {
  const interactions = getStoredInteractions();
  interactions[idea.id] = interactions[idea.id] ?? {
    votes: idea.votes,
    joinRequests: idea.joinRequests,
    voted: false,
    joinedRole: null,
  };
  saveStoredInteractions(interactions);
};

const mapLocalFeed = () => {
  const interactions = getStoredInteractions();
  const comments = getStoredComments();
  return [...seedIdeas, ...getStoredIdeas()]
    .map((idea) => {
      const localComments = comments[idea.id] ?? [];
      return {
        ...withInteractionState(idea, interactions),
        comments: idea.comments + localComments.length,
      };
    })
    .sort((a, b) => {
      const scoreDelta = b.trendScore - a.trendScore;
      if (scoreDelta !== 0) return scoreDelta;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

const mergeIdeaFeeds = (primaryIdeas: IdeaItem[], fallbackIdeas: IdeaItem[]) => {
  const seenIds = new Set(primaryIdeas.map((idea) => idea.id));
  return [
    ...primaryIdeas,
    ...fallbackIdeas.filter((idea) => !seenIds.has(idea.id)),
  ].sort((a, b) => {
    const scoreDelta = b.trendScore - a.trendScore;
    if (scoreDelta !== 0) return scoreDelta;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

const isSchemaError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Could not find the table") ||
    message.includes("idea_votes") ||
    message.includes("idea_join_requests") ||
    message.includes("idea_comments") ||
    message.includes("ideas") ||
    message.includes("idea_workspaces") ||
    message.includes("idea_workspace_members") ||
    message.includes("idea_workspace_tasks") ||
    message.includes("idea_workspace_milestones") ||
    message.includes("idea_workspace_messages")
  );
};

const mapSupabaseWorkspace = (
  workspace: IdeaWorkspaceRow,
  idea: IdeaRow | undefined,
  members: IdeaWorkspaceMemberRow[],
  tasks: IdeaWorkspaceTaskRow[],
  milestones: IdeaWorkspaceMilestoneRow[],
  messages: IdeaWorkspaceMessageRow[],
  profiles: ProfileRow[],
): IdeaWorkspace => {
  const profileMap = new Map(profiles.map((profile) => [profile.user_id, profile]));
  const ideaTitle = idea?.title ?? workspace.project_title ?? "Workspace";
  const stage = (idea?.stage ?? "Validation") as IdeaStage;
  const category = idea?.category ?? "AI";

  return {
    id: workspace.id,
    ideaId: workspace.idea_id,
    ideaTitle,
    category,
    stage: workspace.is_converted ? "Ready for Marketplace" : stage,
    members: members.map((member) => ({
      userId: member.user_id,
      displayName: formatDisplayTitle(profileMap.get(member.user_id)?.display_name),
      role: member.role as CollaborationRole,
      title: member.title,
      joinedAt: member.joined_at,
      isLead: member.is_lead,
    })),
    openRoles: ((idea?.roles_needed ?? []) as CollaborationRole[]).filter(
      (role) => !members.some((member) => member.role === role),
    ),
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      ownerRole: task.owner_role as CollaborationRole,
      status: task.status as WorkspaceTask["status"],
    })),
    messages: messages.map((message) => ({
      id: message.id,
      userId: message.user_id,
      displayName: formatDisplayTitle(profileMap.get(message.user_id)?.display_name),
      role: message.role as CollaborationRole,
      content: message.content,
      createdAt: message.created_at,
    })),
    milestones: milestones.map((milestone) => milestone.title),
    milestoneBoard: milestones.map((milestone) => ({
      id: milestone.id,
      title: milestone.title,
      ownerRole: milestone.owner_role as CollaborationRole,
      status: milestone.status as WorkspaceMilestone["status"],
    })),
    launch: {
      converted: workspace.is_converted,
      projectTitle: workspace.project_title ?? undefined,
      convertedAt: workspace.converted_at ?? undefined,
      launchStatus: workspace.launch_status as ProjectLaunchRecord["launchStatus"],
    },
    createdAt: workspace.created_at,
  };
};

const mapSupabaseIdea = (
  idea: IdeaRow,
  profile: ProfileRow | undefined,
  votes: IdeaVoteRow[] | undefined,
  joins: IdeaJoinRequestRow[] | undefined,
  comments: IdeaCommentRow[] | undefined,
): IdeaItem => {
  const voteCount = votes?.length ?? 0;
  const joinCount = joins?.length ?? 0;
  const commentCount = comments?.length ?? 0;

  return {
    id: idea.id,
    title: idea.title,
    description: idea.description,
    category: idea.category,
    tags: idea.tags ?? [],
    visibility: idea.visibility as IdeaVisibility,
    stage: idea.stage as IdeaStage,
    difficulty: idea.difficulty as IdeaDifficulty,
    trendScore: buildTrendScore(voteCount, joinCount),
    votes: voteCount,
    comments: commentCount,
    joinRequests: joinCount,
    interestLevel: buildInterestLevel(voteCount, joinCount),
    aiFeedback: idea.ai_feedback,
    author: formatDisplayTitle(profile?.display_name),
    authorTitle: idea.author_title,
    authorUserId: idea.user_id,
    rolesNeeded: (idea.roles_needed ?? []) as CollaborationRole[],
    conversionPath: idea.conversion_path,
    createdAt: idea.created_at,
    isUserGenerated: true,
    startupMode: idea.stage !== "Ready for Marketplace",
    milestones: defaultMilestonesForStage(idea.stage as IdeaStage),
    connectedTools: defaultToolsForCategory(idea.category),
    recruiterInterest: idea.category === "AI" ? "High product talent signal" : "Strong execution signal",
    investorInterest:
      idea.stage === "Validation" || idea.stage === "Building" ? "Potential incubator fit" : "Early concept watchlist",
    competitionTrack: `${idea.category} spotlight`,
  };
};

const groupByIdeaId = <T extends { idea_id: string }>(rows: T[]) =>
  rows.reduce(
    (map, row) => {
      const list = map.get(row.idea_id) ?? [];
      list.push(row);
      map.set(row.idea_id, list);
      return map;
    },
    new Map<string, T[]>(),
  );

const groupByWorkspaceId = <T extends { workspace_id: string }>(rows: T[]) =>
  rows.reduce(
    (map, row) => {
      const list = map.get(row.workspace_id) ?? [];
      list.push(row);
      map.set(row.workspace_id, list);
      return map;
    },
    new Map<string, T[]>(),
  );

export const fetchIdeaHubFeed = async (): Promise<IdeaItem[]> => {
  const fallbackFeed = mapLocalFeed();

  if (!isSupabaseConfigured) {
    return fallbackFeed;
  }

  try {
    const { data: ideaRows, error: ideaError } = await supabase
      .from("ideas")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (ideaError) throw ideaError;
    if (!ideaRows?.length) return fallbackFeed;

    const userIds = [...new Set(ideaRows.map((idea) => idea.user_id))];
    const ideaIds = ideaRows.map((idea) => idea.id);

    const [
      { data: profiles, error: profilesError },
      { data: votes, error: votesError },
      { data: joins, error: joinsError },
      { data: comments, error: commentsError },
    ] =
      await Promise.all([
        supabase.from("profiles").select("*").in("user_id", userIds),
        supabase.from("idea_votes").select("*").in("idea_id", ideaIds),
        supabase.from("idea_join_requests").select("*").in("idea_id", ideaIds),
        supabase.from("idea_comments").select("*").in("idea_id", ideaIds).order("created_at", { ascending: false }),
      ]);

    if (profilesError) throw profilesError;
    if (votesError) throw votesError;
    if (joinsError) throw joinsError;
    if (commentsError) throw commentsError;

    const profileMap = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));
    const votesByIdea = groupByIdeaId(votes ?? []);
    const joinsByIdea = groupByIdeaId(joins ?? []);
    const commentsByIdea = groupByIdeaId(comments ?? []);

    const liveIdeas = ideaRows.map((idea) => {
      const mapped = mapSupabaseIdea(
        idea,
        profileMap.get(idea.user_id),
        votesByIdea.get(idea.id),
        joinsByIdea.get(idea.id),
        commentsByIdea.get(idea.id),
      );
      ensureLocalInteraction(mapped);
      return mapped;
    });

    return mergeIdeaFeeds(liveIdeas, fallbackFeed);
  } catch (error) {
    if (!isSchemaError(error)) {
      console.error("Failed to fetch Idea Hub feed", error);
    }
    return fallbackFeed;
  }
};

export const createIdeaDraft = async (input: IdeaDraftInput, author: IdeaAuthor) => {
  if (!isSupabaseConfigured) {
    const localIdea = buildLocalIdea(input, author);
    saveStoredIdeas([localIdea, ...getStoredIdeas()]);
    ensureLocalInteraction(localIdea);
    return localIdea;
  }

  try {
    const payload: TablesInsert<"ideas"> = {
      user_id: author.userId,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category,
      visibility: input.visibility,
      stage: input.stage,
      difficulty: input.difficulty,
      tags: input.tags,
      roles_needed: input.rolesNeeded,
      ai_feedback: buildAiFeedback(input),
      author_title: author.title,
      conversion_path: buildConversionPath(input),
      is_active: true,
    };

    const { data, error } = await supabase.from("ideas").insert(payload).select("*").single();
    if (error) throw error;

    const localInteraction = getStoredInteractions();
    localInteraction[data.id] = {
      votes: 0,
      joinRequests: 0,
      voted: false,
      joinedRole: null,
    };
    saveStoredInteractions(localInteraction);

    return mapSupabaseIdea(data, undefined, [], [], []);
  } catch (error) {
    if (!isSchemaError(error)) {
      console.error("Failed to create Idea Hub idea in Supabase", error);
    }

    const localIdea = buildLocalIdea(input, author);
    saveStoredIdeas([localIdea, ...getStoredIdeas()]);
    ensureLocalInteraction(localIdea);
    return localIdea;
  }
};

export const voteForIdea = async (ideaId: string, userId: string | undefined) => {
  const interactions = getStoredInteractions();

  if (interactions[ideaId]?.voted) {
    return { ok: false as const, reason: "already-voted" as const };
  }

  if (isSupabaseConfigured && userId) {
    try {
      const payload: TablesInsert<"idea_votes"> = {
        idea_id: ideaId,
        user_id: userId,
      };

      const { error } = await supabase.from("idea_votes").insert(payload);
      if (error) {
        if ((error as { code?: string }).code === "23505") {
          interactions[ideaId] = {
            ...(interactions[ideaId] ?? { votes: 0, joinRequests: 0, joinedRole: null }),
            voted: true,
          } as IdeaInteractionState;
          saveStoredInteractions(interactions);
          return { ok: false as const, reason: "already-voted" as const };
        }
        throw error;
      }

      interactions[ideaId] = {
        ...(interactions[ideaId] ?? { votes: 0, joinRequests: 0, joinedRole: null }),
        voted: true,
      } as IdeaInteractionState;
      saveStoredInteractions(interactions);
      return { ok: true as const };
    } catch (error) {
      if (!isSchemaError(error)) {
        console.error("Failed to save idea vote in Supabase", error);
      }
    }
  }

  const feed = mapLocalFeed();
  const idea = feed.find((item) => item.id === ideaId);
  if (!idea) return { ok: false as const, reason: "not-found" as const };

  interactions[ideaId] = {
    votes: (interactions[ideaId]?.votes ?? idea.votes) + 1,
    joinRequests: interactions[ideaId]?.joinRequests ?? idea.joinRequests,
    voted: true,
    joinedRole: interactions[ideaId]?.joinedRole ?? null,
  };
  saveStoredInteractions(interactions);
  return { ok: true as const };
};

export const requestIdeaCollaboration = async (
  ideaId: string,
  role: CollaborationRole,
  userId: string | undefined,
) => {
  const interactions = getStoredInteractions();

  if (interactions[ideaId]?.joinedRole) {
    return {
      ok: false as const,
      reason: "already-joined" as const,
      joinedRole: interactions[ideaId].joinedRole,
    };
  }

  if (isSupabaseConfigured && userId) {
    try {
      const payload: TablesInsert<"idea_join_requests"> = {
        idea_id: ideaId,
        user_id: userId,
        role,
      };

      const { error } = await supabase.from("idea_join_requests").insert(payload);
      if (error) {
        if ((error as { code?: string }).code === "23505") {
          interactions[ideaId] = {
            ...(interactions[ideaId] ?? { votes: 0, joinRequests: 0, voted: false }),
            joinedRole: role,
          } as IdeaInteractionState;
          saveStoredInteractions(interactions);
          return { ok: false as const, reason: "already-joined" as const, joinedRole: role };
        }
        throw error;
      }

      interactions[ideaId] = {
        ...(interactions[ideaId] ?? { votes: 0, joinRequests: 0, voted: false }),
        joinedRole: role,
      } as IdeaInteractionState;
      saveStoredInteractions(interactions);
      return { ok: true as const };
    } catch (error) {
      if (!isSchemaError(error)) {
        console.error("Failed to save idea join request in Supabase", error);
      }
    }
  }

  const feed = mapLocalFeed();
  const idea = feed.find((item) => item.id === ideaId);
  if (!idea) return { ok: false as const, reason: "not-found" as const };

  interactions[ideaId] = {
    votes: interactions[ideaId]?.votes ?? idea.votes,
    joinRequests: (interactions[ideaId]?.joinRequests ?? idea.joinRequests) + 1,
    voted: interactions[ideaId]?.voted ?? false,
    joinedRole: role,
  };
  saveStoredInteractions(interactions);
  return { ok: true as const };
};

export const getCurrentIdeaInteraction = (ideaId: string) => getStoredInteractions()[ideaId] ?? null;

export const getIdeaFollowingState = () => getStoredFollowing();

export const toggleFollowedIdea = (ideaId: string) => {
  const following = getStoredFollowing();
  const alreadyFollowing = following.ideaIds.includes(ideaId);
  const ideaIds = alreadyFollowing
    ? following.ideaIds.filter((id) => id !== ideaId)
    : [ideaId, ...following.ideaIds];

  const nextState = { ...following, ideaIds };
  saveStoredFollowing(nextState);
  return {
    following: !alreadyFollowing,
    state: nextState,
  };
};

export const toggleFollowedCategory = (category: string) => {
  const following = getStoredFollowing();
  const alreadyFollowing = following.categories.includes(category);
  const categories = alreadyFollowing
    ? following.categories.filter((item) => item !== category)
    : [category, ...following.categories];

  const nextState = { ...following, categories };
  saveStoredFollowing(nextState);
  return {
    following: !alreadyFollowing,
    state: nextState,
  };
};

export const getIdeaHubActivitySnapshot = (
  userId: string | undefined,
  feed: IdeaItem[],
): IdeaHubActivitySnapshot => {
  const following = getStoredFollowing();
  const interactions = getStoredInteractions();
  const interactionValues = Object.values(interactions);

  return {
    followedIdeas: following.ideaIds.length,
    followedCategories: following.categories.length,
    votesCast: interactionValues.filter((item) => item.voted).length,
    collaborationRequests: interactionValues.filter((item) => item.joinedRole).length,
    authoredIdeas: userId ? feed.filter((idea) => idea.authorUserId === userId).length : 0,
  };
};

export const fetchIdeaContributionSummary = async (userId: string | undefined): Promise<IdeaContributionSummary> => {
  if (!userId) {
    return {
      totalIdeas: 0,
      totalVotes: 0,
      totalJoinRequests: 0,
      authoredIdeas: [],
    };
  }

  const feed = await fetchIdeaHubFeed();
  const authoredIdeas = feed.filter((idea) => idea.authorUserId === userId);

  return {
    totalIdeas: authoredIdeas.length,
    totalVotes: authoredIdeas.reduce((sum, idea) => sum + idea.votes, 0),
    totalJoinRequests: authoredIdeas.reduce((sum, idea) => sum + idea.joinRequests, 0),
    authoredIdeas,
  };
};

export const fetchIdeaComments = async (ideaId: string): Promise<IdeaComment[]> => {
  if (!isSupabaseConfigured) {
    return getStoredComments()[ideaId] ?? [];
  }

  try {
    const { data: rows, error } = await supabase
      .from("idea_comments")
      .select("*")
      .eq("idea_id", ideaId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    if (!rows?.length) return getStoredComments()[ideaId] ?? [];

    const userIds = [...new Set(rows.map((row) => row.user_id))];
    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("user_id", userIds);
    if (profilesError) throw profilesError;

    const profileMap = new Map((profiles ?? []).map((profile) => [profile.user_id, profile]));

    return rows.map((row) => ({
      id: row.id,
      ideaId: row.idea_id,
      authorName: formatDisplayTitle(profileMap.get(row.user_id)?.display_name),
      authorTitle: profileMap.get(row.user_id)?.bio?.trim() || "Student contributor",
      authorUserId: row.user_id,
      content: row.content,
      createdAt: row.created_at,
    }));
  } catch (error) {
    if (!isSchemaError(error)) {
      console.error("Failed to fetch idea comments", error);
    }
    return getStoredComments()[ideaId] ?? [];
  }
};

export const createIdeaComment = async (
  ideaId: string,
  content: string,
  author: IdeaAuthor,
): Promise<IdeaComment | null> => {
  const trimmed = content.trim();
  if (!trimmed) return null;

  if (isSupabaseConfigured) {
    try {
      const payload: TablesInsert<"idea_comments"> = {
        idea_id: ideaId,
        user_id: author.userId,
        content: trimmed,
      };

      const { data, error } = await supabase.from("idea_comments").insert(payload).select("*").single();
      if (error) throw error;

      return {
        id: data.id,
        ideaId: data.idea_id,
        authorName: author.displayName,
        authorTitle: author.title,
        authorUserId: author.userId,
        content: data.content,
        createdAt: data.created_at,
      };
    } catch (error) {
      if (!isSchemaError(error)) {
        console.error("Failed to create idea comment in Supabase", error);
      }
    }
  }

  const nextComment: IdeaComment = {
    id: `comment-${Date.now()}`,
    ideaId,
    authorName: author.displayName,
    authorTitle: author.title,
    authorUserId: author.userId,
    content: trimmed,
    createdAt: new Date().toISOString(),
  };

  const commentMap = getStoredComments();
  commentMap[ideaId] = [nextComment, ...(commentMap[ideaId] ?? [])];
  saveStoredComments(commentMap);
  return nextComment;
};

export const fetchIdeaWorkspaces = async (): Promise<IdeaWorkspace[]> => {
  if (!isSupabaseConfigured) {
    return getStoredWorkspaces();
  }

  try {
    const { data: workspaceRows, error: workspaceError } = await supabase
      .from("idea_workspaces")
      .select("*")
      .order("created_at", { ascending: false });

    if (workspaceError) throw workspaceError;
    if (!workspaceRows?.length) return getStoredWorkspaces();

    const workspaceIds = workspaceRows.map((workspace) => workspace.id);
    const ideaIds = workspaceRows.map((workspace) => workspace.idea_id);

    const [
      { data: ideas, error: ideasError },
      { data: members, error: membersError },
      { data: tasks, error: tasksError },
      { data: milestones, error: milestonesError },
      { data: messages, error: messagesError },
    ] = await Promise.all([
      supabase.from("ideas").select("*").in("id", ideaIds),
      supabase.from("idea_workspace_members").select("*").in("workspace_id", workspaceIds),
      supabase.from("idea_workspace_tasks").select("*").in("workspace_id", workspaceIds).order("created_at", { ascending: false }),
      supabase
        .from("idea_workspace_milestones")
        .select("*")
        .in("workspace_id", workspaceIds)
        .order("created_at", { ascending: true }),
      supabase
        .from("idea_workspace_messages")
        .select("*")
        .in("workspace_id", workspaceIds)
        .order("created_at", { ascending: false }),
    ]);

    if (ideasError) throw ideasError;
    if (membersError) throw membersError;
    if (tasksError) throw tasksError;
    if (milestonesError) throw milestonesError;
    if (messagesError) throw messagesError;

    const userIds = [
      ...new Set([
        ...workspaceRows.map((workspace) => workspace.team_lead_user_id),
        ...(members ?? []).map((member) => member.user_id),
        ...(messages ?? []).map((message) => message.user_id),
      ]),
    ];

    const { data: profiles, error: profilesError } = await supabase.from("profiles").select("*").in("user_id", userIds);
    if (profilesError) throw profilesError;

    const ideasById = new Map((ideas ?? []).map((idea) => [idea.id, idea]));
    const membersByWorkspace = groupByWorkspaceId(members ?? []);
    const tasksByWorkspace = groupByWorkspaceId(tasks ?? []);
    const milestonesByWorkspace = groupByWorkspaceId(milestones ?? []);
    const messagesByWorkspace = groupByWorkspaceId(messages ?? []);

    return workspaceRows.map((workspace) =>
      mapSupabaseWorkspace(
        workspace,
        ideasById.get(workspace.idea_id),
        membersByWorkspace.get(workspace.id) ?? [],
        tasksByWorkspace.get(workspace.id) ?? [],
        milestonesByWorkspace.get(workspace.id) ?? [],
        messagesByWorkspace.get(workspace.id) ?? [],
        profiles ?? [],
      ),
    );
  } catch (error) {
    if (!isSchemaError(error)) {
      console.error("Failed to fetch idea workspaces", error);
    }
    return getStoredWorkspaces();
  }
};

export const getWorkspaceHealth = (workspace: IdeaWorkspace | null | undefined): WorkspaceHealthSnapshot => {
  if (!workspace) {
    return {
      score: 0,
      teamStrength: 0,
      executionStrength: 0,
      communicationStrength: 0,
      missingRoles: [],
    };
  }

  const teamStrength = Math.min(100, workspace.members.length * 22 + (workspace.openRoles.length === 0 ? 16 : 0));
  const milestoneBoard = workspace.milestoneBoard ?? [];
  const executionStrength = Math.min(
    100,
    workspace.tasks.filter((task) => task.status === "Done").length * 24 +
      workspace.tasks.filter((task) => task.status === "In Progress").length * 14 +
      milestoneBoard.filter((milestone) => milestone.status === "Done").length * 18 +
      milestoneBoard.filter((milestone) => milestone.status === "In Progress").length * 10,
  );
  const communicationStrength = Math.min(100, workspace.messages.length * 12);

  const score = Math.round(teamStrength * 0.45 + executionStrength * 0.35 + communicationStrength * 0.2);

  return {
    score,
    teamStrength,
    executionStrength,
    communicationStrength,
    missingRoles: workspace.openRoles,
  };
};

export const getIdeaIntelligenceScore = (idea: IdeaItem, workspace?: IdeaWorkspace | null) => {
  const marketSignal = Math.min(100, idea.votes * 0.28 + idea.joinRequests * 4 + idea.comments * 1.5);
  const workspaceHealth = getWorkspaceHealth(workspace);
  const executionSignal = workspace ? workspaceHealth.score : idea.stage === "Building" ? 42 : idea.stage === "Validation" ? 28 : 16;
  const categoryMomentum = idea.category === "AI" || idea.category === "EdTech" ? 8 : 4;

  return Math.min(99, Math.round(marketSignal * 0.52 + executionSignal * 0.4 + categoryMomentum));
};

export const getOpportunityMatches = (
  ideas: IdeaItem[],
  workspaces: IdeaWorkspace[],
  preferredRole: CollaborationRole,
  followedCategories: string[] = [],
): OpportunityMatch[] => {
  const workspaceMap = new Map(workspaces.map((workspace) => [workspace.ideaId, workspace]));

  return ideas
    .map((idea) => {
      const workspace = workspaceMap.get(idea.id);
      const intelligenceScore = getIdeaIntelligenceScore(idea, workspace);
      const roleMatch = idea.rolesNeeded.includes(preferredRole) || workspace?.openRoles.includes(preferredRole);
      const categoryAffinity = followedCategories.includes(idea.category);
      const earlyStageBonus = idea.stage === "Validation" || idea.stage === "Building" ? 10 : 0;
      const roleBonus = roleMatch ? 18 : 0;
      const categoryBonus = categoryAffinity ? 8 : 0;
      const workspaceBonus = workspace ? Math.round(getWorkspaceHealth(workspace).score * 0.18) : 0;
      const score = Math.min(99, intelligenceScore + roleBonus + categoryBonus + earlyStageBonus + workspaceBonus);

      const reasons = [
        roleMatch ? `${preferredRole} is needed here` : `Team fit is broader than ${preferredRole.toLowerCase()}`,
        workspace
          ? `${workspace.members.length} member${workspace.members.length === 1 ? "" : "s"} already executing`
          : "Still open for first workspace formation",
        categoryAffinity ? `Aligned with your followed ${idea.category} interest` : `${idea.category} has active momentum`,
      ];

      return {
        ideaId: idea.id,
        score,
        label: score >= 88 ? "High fit" : score >= 74 ? "Strong fit" : "Emerging fit",
        reasons,
      };
    })
    .sort((a, b) => b.score - a.score);
};

export const createIdeaWorkspace = async (
  idea: IdeaItem,
  owner: IdeaAuthor,
  chosenRole: CollaborationRole,
): Promise<IdeaWorkspace> => {
  if (isSupabaseConfigured) {
    try {
      const { data: existing, error: existingError } = await supabase
        .from("idea_workspaces")
        .select("*")
        .eq("idea_id", idea.id)
        .maybeSingle();

      if (existingError) throw existingError;

      if (existing) {
        const existingWorkspaces = await fetchIdeaWorkspaces();
        const matchedWorkspace = existingWorkspaces.find((workspace) => workspace.id === existing.id);
        if (matchedWorkspace) return matchedWorkspace;
      }

      const milestoneTitles = idea.milestones ?? defaultMilestonesForStage(idea.stage);
      const [firstRole, secondRole, thirdRole] = defaultMilestoneRoles(idea.rolesNeeded);

      const { data: workspaceRow, error: workspaceError } = await supabase
        .from("idea_workspaces")
        .insert({
          idea_id: idea.id,
          team_lead_user_id: owner.userId,
        })
        .select("*")
        .single();

      if (workspaceError) throw workspaceError;

      const workspaceId = workspaceRow.id;
      const operations = await Promise.all([
        supabase.from("idea_workspace_members").insert({
          workspace_id: workspaceId,
          user_id: owner.userId,
          role: chosenRole,
          title: owner.title,
          is_lead: true,
        }),
        supabase.from("idea_workspace_tasks").insert([
          {
            workspace_id: workspaceId,
            title: "Align the first MVP scope",
            owner_role: "Strategist",
            status: "Todo",
          },
          {
            workspace_id: workspaceId,
            title: "Assign delivery roles and owners",
            owner_role: "Developer",
            status: "In Progress",
          },
        ]),
        supabase.from("idea_workspace_messages").insert({
          workspace_id: workspaceId,
          user_id: owner.userId,
          role: chosenRole,
          content: "Workspace created. Let's define the MVP and assign the first sprint clearly.",
        }),
        supabase.from("idea_workspace_milestones").insert([
          {
            workspace_id: workspaceId,
            title: milestoneTitles[0] ?? "Problem framing",
            owner_role: firstRole,
            status: "In Progress",
          },
          {
            workspace_id: workspaceId,
            title: milestoneTitles[1] ?? "Prototype MVP",
            owner_role: secondRole,
            status: "Todo",
          },
          {
            workspace_id: workspaceId,
            title: milestoneTitles[2] ?? "Launch prep",
            owner_role: thirdRole,
            status: "Todo",
          },
        ]),
      ]);

      const failingOperation = operations.find((operation) => operation.error);
      if (failingOperation?.error) throw failingOperation.error;

      const nextWorkspaces = await fetchIdeaWorkspaces();
      const nextWorkspace = nextWorkspaces.find((workspace) => workspace.id === workspaceId);
      if (nextWorkspace) return nextWorkspace;
    } catch (error) {
      if (!isSchemaError(error)) {
        console.error("Failed to create workspace in Supabase", error);
      }
    }
  }

  const existing = getStoredWorkspaces().find((workspace) => workspace.ideaId === idea.id);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const milestoneTitles = idea.milestones ?? defaultMilestonesForStage(idea.stage);
  const [firstRole, secondRole, thirdRole] = defaultMilestoneRoles(idea.rolesNeeded);
  const nextWorkspace: IdeaWorkspace = {
    id: `workspace-${idea.id}`,
    ideaId: idea.id,
    ideaTitle: idea.title,
    category: idea.category,
    stage: idea.stage,
    members: [
      {
        userId: owner.userId,
        displayName: owner.displayName,
        role: chosenRole,
        title: owner.title,
        joinedAt: now,
        isLead: true,
      },
    ],
    openRoles: idea.rolesNeeded.filter((role) => role !== chosenRole),
    tasks: [
      {
        id: `task-${Date.now()}-1`,
        title: "Align the first MVP scope",
        ownerRole: "Strategist",
        status: "Todo",
      },
      {
        id: `task-${Date.now()}-2`,
        title: "Assign delivery roles and owners",
        ownerRole: "Developer",
        status: "In Progress",
      },
    ],
    messages: [
      {
        id: `message-${Date.now()}`,
        userId: owner.userId,
        displayName: owner.displayName,
        role: chosenRole,
        content: "Workspace created. Let's define the MVP and assign the first sprint clearly.",
        createdAt: now,
      },
    ],
    milestones: milestoneTitles,
    milestoneBoard: [
      {
        id: `milestone-${Date.now()}-1`,
        title: milestoneTitles[0] ?? "Problem framing",
        ownerRole: firstRole,
        status: "In Progress",
      },
      {
        id: `milestone-${Date.now()}-2`,
        title: milestoneTitles[1] ?? "Prototype MVP",
        ownerRole: secondRole,
        status: "Todo",
      },
      {
        id: `milestone-${Date.now()}-3`,
        title: milestoneTitles[2] ?? "Launch prep",
        ownerRole: thirdRole,
        status: "Todo",
      },
    ],
    launch: {
      converted: false,
      launchStatus: "Planning",
    },
    createdAt: now,
  };

  saveStoredWorkspaces([nextWorkspace, ...getStoredWorkspaces()]);
  return nextWorkspace;
};

export const joinIdeaWorkspace = async (
  workspaceId: string,
  member: IdeaAuthor,
  role: CollaborationRole,
): Promise<IdeaWorkspace | null> => {
  if (isSupabaseConfigured) {
    try {
      const { data: existingMember, error: memberCheckError } = await supabase
        .from("idea_workspace_members")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("user_id", member.userId)
        .maybeSingle();

      if (memberCheckError) throw memberCheckError;

      if (!existingMember) {
        const [memberResult, messageResult] = await Promise.all([
          supabase.from("idea_workspace_members").insert({
            workspace_id: workspaceId,
            user_id: member.userId,
            role,
            title: member.title,
          }),
          supabase.from("idea_workspace_messages").insert({
            workspace_id: workspaceId,
            user_id: member.userId,
            role,
            content: `Joined the workspace as ${role.toLowerCase()} and is ready to contribute.`,
          }),
        ]);

        if (memberResult.error) throw memberResult.error;
        if (messageResult.error) throw messageResult.error;
      }

      const nextWorkspaces = await fetchIdeaWorkspaces();
      return nextWorkspaces.find((workspace) => workspace.id === workspaceId) ?? null;
    } catch (error) {
      if (!isSchemaError(error)) {
        console.error("Failed to join workspace in Supabase", error);
      }
    }
  }

  const workspaces = getStoredWorkspaces();
  const workspace = workspaces.find((item) => item.id === workspaceId);
  if (!workspace) return null;

  if (workspace.members.some((item) => item.userId === member.userId)) {
    return workspace;
  }

  const now = new Date().toISOString();
  const updated: IdeaWorkspace = {
    ...workspace,
    members: [
      ...workspace.members,
      {
        userId: member.userId,
        displayName: member.displayName,
        role,
        title: member.title,
        joinedAt: now,
      },
    ],
    openRoles: workspace.openRoles.filter((item) => item !== role),
    messages: [
      {
        id: `message-${Date.now()}`,
        userId: member.userId,
        displayName: member.displayName,
        role,
        content: `Joined the workspace as ${role.toLowerCase()} and is ready to contribute.`,
        createdAt: now,
      },
      ...workspace.messages,
    ],
  };

  saveStoredWorkspaces(workspaces.map((item) => (item.id === workspaceId ? updated : item)));
  return updated;
};

export const sendWorkspaceMessage = async (
  workspaceId: string,
  member: IdeaAuthor,
  role: CollaborationRole,
  content: string,
): Promise<IdeaWorkspace | null> => {
  const trimmed = content.trim();
  if (!trimmed) return null;

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from("idea_workspace_messages").insert({
        workspace_id: workspaceId,
        user_id: member.userId,
        role,
        content: trimmed,
      });

      if (error) throw error;

      const nextWorkspaces = await fetchIdeaWorkspaces();
      return nextWorkspaces.find((workspace) => workspace.id === workspaceId) ?? null;
    } catch (error) {
      if (!isSchemaError(error)) {
        console.error("Failed to send workspace message in Supabase", error);
      }
    }
  }

  const workspaces = getStoredWorkspaces();
  const workspace = workspaces.find((item) => item.id === workspaceId);
  if (!workspace) return null;

  const updated: IdeaWorkspace = {
    ...workspace,
    messages: [
      {
        id: `message-${Date.now()}`,
        userId: member.userId,
        displayName: member.displayName,
        role,
        content: trimmed,
        createdAt: new Date().toISOString(),
      },
      ...workspace.messages,
    ],
  };

  saveStoredWorkspaces(workspaces.map((item) => (item.id === workspaceId ? updated : item)));
  return updated;
};

export const addWorkspaceTask = async (
  workspaceId: string,
  title: string,
  ownerRole: CollaborationRole,
): Promise<IdeaWorkspace | null> => {
  const trimmed = title.trim();
  if (!trimmed) return null;

  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from("idea_workspace_tasks").insert({
        workspace_id: workspaceId,
        title: trimmed,
        owner_role: ownerRole,
        status: "Todo",
      });

      if (error) throw error;

      const nextWorkspaces = await fetchIdeaWorkspaces();
      return nextWorkspaces.find((workspace) => workspace.id === workspaceId) ?? null;
    } catch (error) {
      if (!isSchemaError(error)) {
        console.error("Failed to add workspace task in Supabase", error);
      }
    }
  }

  const workspaces = getStoredWorkspaces();
  const workspace = workspaces.find((item) => item.id === workspaceId);
  if (!workspace) return null;

  const updated: IdeaWorkspace = {
    ...workspace,
    tasks: [
      {
        id: `task-${Date.now()}`,
        title: trimmed,
        ownerRole,
        status: "Todo",
      },
      ...workspace.tasks,
    ],
  };

  saveStoredWorkspaces(workspaces.map((item) => (item.id === workspaceId ? updated : item)));
  return updated;
};

export const updateWorkspaceMilestone = async (
  workspaceId: string,
  milestoneId: string,
  status: "Todo" | "In Progress" | "Done",
): Promise<IdeaWorkspace | null> => {
  if (isSupabaseConfigured) {
    try {
      const patch: TablesUpdate<"idea_workspace_milestones"> = { status };
      const { error } = await supabase.from("idea_workspace_milestones").update(patch).eq("id", milestoneId);

      if (error) throw error;

      const nextWorkspaces = await fetchIdeaWorkspaces();
      return nextWorkspaces.find((workspace) => workspace.id === workspaceId) ?? null;
    } catch (error) {
      if (!isSchemaError(error)) {
        console.error("Failed to update workspace milestone in Supabase", error);
      }
    }
  }

  const workspaces = getStoredWorkspaces();
  const workspace = workspaces.find((item) => item.id === workspaceId);
  if (!workspace) return null;

  const updated: IdeaWorkspace = {
    ...workspace,
    milestoneBoard: (workspace.milestoneBoard ?? []).map((milestone) =>
      milestone.id === milestoneId ? { ...milestone, status } : milestone,
    ),
  };

  saveStoredWorkspaces(workspaces.map((item) => (item.id === workspaceId ? updated : item)));
  return updated;
};

export const convertWorkspaceToProject = async (
  workspaceId: string,
  projectTitle: string,
): Promise<IdeaWorkspace | null> => {
  const trimmed = projectTitle.trim();
  if (!trimmed) return null;

  if (isSupabaseConfigured) {
    try {
      const patch: TablesUpdate<"idea_workspaces"> = {
        is_converted: true,
        project_title: trimmed,
        converted_at: new Date().toISOString(),
        launch_status: "Private Beta",
      };

      const { error } = await supabase.from("idea_workspaces").update(patch).eq("id", workspaceId);
      if (error) throw error;

      const nextWorkspaces = await fetchIdeaWorkspaces();
      return nextWorkspaces.find((workspace) => workspace.id === workspaceId) ?? null;
    } catch (error) {
      if (!isSchemaError(error)) {
        console.error("Failed to convert workspace in Supabase", error);
      }
    }
  }

  const workspaces = getStoredWorkspaces();
  const workspace = workspaces.find((item) => item.id === workspaceId);
  if (!workspace) return null;

  const updated: IdeaWorkspace = {
    ...workspace,
    stage: "Ready for Marketplace",
    launch: {
      converted: true,
      projectTitle: trimmed,
      convertedAt: new Date().toISOString(),
      launchStatus: "Private Beta",
    },
  };

  saveStoredWorkspaces(workspaces.map((item) => (item.id === workspaceId ? updated : item)));
  return updated;
};

export const getWorkspaceContributionSnapshot = (workspace: IdeaWorkspace | null | undefined): WorkspaceContributionSnapshot[] => {
  if (!workspace) return [];

  const totalMessages = workspace.messages.length;
  const totalTasks = workspace.tasks.length;
  const totalMilestones = (workspace.milestoneBoard ?? []).length;

  const entries = workspace.members.map((member) => {
    const messagePoints = workspace.messages.filter((message) => message.userId === member.userId).length * 4;
    const taskPoints = workspace.tasks.filter((task) => task.ownerRole === member.role).length * 6;
    const milestonePoints = (workspace.milestoneBoard ?? []).filter((milestone) => milestone.ownerRole === member.role).length * 8;
    const leadBonus = member.isLead ? 6 : 0;
    const points = messagePoints + taskPoints + milestonePoints + leadBonus + 5;

    return {
      userId: member.userId,
      displayName: member.displayName,
      role: member.role,
      points,
      summary: `${messagePoints / 4} updates, ${taskPoints / 6} tasks, ${milestonePoints / 8} milestones`,
    };
  });

  const totalPoints = entries.reduce((sum, entry) => sum + entry.points, 0) || 1;

  return entries
    .map((entry) => ({
      ...entry,
      share: Math.round((entry.points / totalPoints) * 100),
      summary:
        totalMessages || totalTasks || totalMilestones
          ? entry.summary
          : "Initial team member with baseline contribution share",
    }))
    .sort((a, b) => b.points - a.points);
};

export const getGlobalPlatformPreferences = () => getStoredGlobalPreferences();

export const updateGlobalPlatformPreferences = (
  patch: Partial<GlobalPlatformPreferences>,
): GlobalPlatformPreferences => {
  const nextPreferences = {
    ...getStoredGlobalPreferences(),
    ...patch,
  };

  saveStoredGlobalPreferences(nextPreferences);
  return nextPreferences;
};

export const getLocalizedPlatformCopy = (language: GlobalPlatformPreferences["language"]) => translatedSummaries[language];

export const getGlobalCompetitionTracks = (): CompetitionTrack[] => [
  {
    id: "comp-africa-ai",
    title: "Africa AI Campus Sprint",
    region: "Africa",
    reward: "$3,000 launch grant",
    deadline: "May 30",
    focus: "AI and student productivity",
  },
  {
    id: "comp-europe-climate",
    title: "Europe Climate Builder Week",
    region: "Europe",
    reward: "Mentor access and investor showcase",
    deadline: "June 12",
    focus: "Climate and sustainability",
  },
  {
    id: "comp-global-edtech",
    title: "Global EdTech Demo Day",
    region: "Global",
    reward: "Recruiter visibility and demo slots",
    deadline: "June 28",
    focus: "Education and collaboration",
  },
];

export const getSkillDnaProfile = (input: {
  servicesCount: number;
  ideasCount: number;
  votesEarned: number;
  joinRequestsReceived: number;
  collaborationRequestsSent?: number;
}): SkillDnaProfile => {
  const builderScore = Math.min(96, 34 + input.servicesCount * 10 + input.ideasCount * 8);
  const leadershipScore = Math.min(94, 28 + input.ideasCount * 12 + input.joinRequestsReceived * 2);
  const researchScore = Math.min(90, 24 + input.votesEarned / 8 + input.ideasCount * 6);
  const creativityScore = Math.min(95, 30 + input.ideasCount * 10 + input.votesEarned / 10);

  const behaviorTag =
    leadershipScore >= 72 ? "Leader-builder" : builderScore >= 72 ? "Execution-focused" : "Emerging collaborator";
  const workStyle =
    researchScore >= 70 ? "Structured and insight-driven" : creativityScore >= 70 ? "Creative and fast-moving" : "Adaptive and learning quickly";

  const strengths = [
    builderScore >= 70 ? "Shipping ability" : "Hands-on growth",
    leadershipScore >= 70 ? "Team orchestration" : "Collaboration momentum",
    creativityScore >= 70 ? "Original idea generation" : "Practical opportunity spotting",
  ];

  return {
    builderScore,
    leadershipScore,
    researchScore,
    creativityScore,
    workStyle,
    behaviorTag,
    topStrengths: strengths,
  };
};

export const getCoFounderMatches = (
  workspace: IdeaWorkspace | null | undefined,
  preferredRole: CollaborationRole,
): CoFounderMatch[] => {
  if (!workspace) return [];

  return workspace.openRoles.slice(0, 3).map((role, index) => {
    const baseScore = role === preferredRole ? 91 : 78 - index * 4;
    return {
      role,
      matchScore: Math.max(64, baseScore),
      summary:
        role === "Designer"
          ? "Best next hire to sharpen product clarity and demo readiness."
          : role === "Researcher"
            ? "Best next hire to reduce risk and validate demand faster."
            : role === "Strategist"
              ? "Best next hire to improve positioning, roadmap, and launch discipline."
              : role === "Writer"
                ? "Best next hire to strengthen pitch, documentation, and go-to-market assets."
                : "Best next hire to accelerate product execution and sprint velocity.",
      reason: `${role} is still missing from the active team structure.`,
    };
  });
};

export const getSimulationSnapshot = (
  idea: IdeaItem | null | undefined,
  workspace: IdeaWorkspace | null | undefined,
): SimulationSnapshot => {
  if (!idea) {
    return {
      marketInterest: 0,
      revenuePotential: "Unknown",
      executionRisk: "Unknown",
      verdict: "Pick an idea first to run the simulation.",
    };
  }

  const workspaceHealth = getWorkspaceHealth(workspace);
  const marketInterest = Math.min(96, Math.round(idea.votes * 0.18 + idea.joinRequests * 3 + workspaceHealth.score * 0.35));
  const revenuePotential =
    marketInterest >= 78 ? "High potential" : marketInterest >= 58 ? "Promising niche" : "Needs stronger demand proof";
  const executionRisk =
    workspaceHealth.score >= 72 ? "Moderate" : workspaceHealth.score >= 45 ? "Elevated" : "High";
  const verdict =
    marketInterest >= 75 && workspaceHealth.score >= 60
      ? "This concept is strong enough to justify a beta launch path."
      : marketInterest >= 55
        ? "Validate demand more deeply before expanding the build scope."
        : "Refine the problem statement and team shape before investing heavily.";

  return {
    marketInterest,
    revenuePotential,
    executionRisk,
    verdict,
  };
};
