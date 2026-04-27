import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";
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

type IdeaRow = Tables<"ideas">;
type ProfileRow = Tables<"profiles">;
type IdeaVoteRow = Tables<"idea_votes">;
type IdeaJoinRequestRow = Tables<"idea_join_requests">;
type IdeaCommentRow = Tables<"idea_comments">;

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
  createdAt: string;
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

const isSchemaError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes("Could not find the table") ||
    message.includes("idea_votes") ||
    message.includes("idea_join_requests") ||
    message.includes("idea_comments") ||
    message.includes("ideas")
  );
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

export const fetchIdeaHubFeed = async (): Promise<IdeaItem[]> => {
  if (!isSupabaseConfigured) {
    return mapLocalFeed();
  }

  try {
    const { data: ideaRows, error: ideaError } = await supabase
      .from("ideas")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (ideaError) throw ideaError;
    if (!ideaRows?.length) return mapLocalFeed();

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

    return ideaRows.map((idea) => {
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
  } catch (error) {
    if (!isSchemaError(error)) {
      console.error("Failed to fetch Idea Hub feed", error);
    }
    return mapLocalFeed();
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

export const fetchIdeaWorkspaces = async (): Promise<IdeaWorkspace[]> => getStoredWorkspaces();

export const createIdeaWorkspace = async (
  idea: IdeaItem,
  owner: IdeaAuthor,
  chosenRole: CollaborationRole,
): Promise<IdeaWorkspace> => {
  const existing = getStoredWorkspaces().find((workspace) => workspace.ideaId === idea.id);
  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
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
    milestones: idea.milestones ?? defaultMilestonesForStage(idea.stage),
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
