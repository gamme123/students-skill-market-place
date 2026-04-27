import {
  ideas as seedIdeas,
  type CollaborationRole,
  type IdeaDifficulty,
  type IdeaItem,
  type IdeaStage,
  type IdeaVisibility,
} from "@/data/ideas";

const IDEAS_STORAGE_KEY = "studenthub.ideaHub.ideas";
const INTERACTIONS_STORAGE_KEY = "studenthub.ideaHub.interactions";

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

export const getStoredIdeas = () => readJson<IdeaItem[]>(IDEAS_STORAGE_KEY, []);

const saveStoredIdeas = (ideas: IdeaItem[]) => writeJson(IDEAS_STORAGE_KEY, ideas);

const getStoredInteractions = () => readJson<IdeaInteractionMap>(INTERACTIONS_STORAGE_KEY, {});

const saveStoredInteractions = (interactions: IdeaInteractionMap) => writeJson(INTERACTIONS_STORAGE_KEY, interactions);

const withInteractionState = (idea: IdeaItem, interactions: IdeaInteractionMap): IdeaItem => {
  const state = interactions[idea.id];
  if (!state) return idea;

  const votes = state.votes;
  const joinRequests = state.joinRequests;

  return {
    ...idea,
    votes,
    joinRequests,
    trendScore: buildTrendScore(votes, joinRequests),
    interestLevel: buildInterestLevel(votes, joinRequests),
  };
};

export const getIdeaHubFeed = () => {
  const interactions = getStoredInteractions();
  return [...seedIdeas, ...getStoredIdeas()]
    .map((idea) => withInteractionState(idea, interactions))
    .sort((a, b) => {
      const scoreDelta = b.trendScore - a.trendScore;
      if (scoreDelta !== 0) return scoreDelta;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
};

export const createIdeaDraft = (input: IdeaDraftInput, author: IdeaAuthor) => {
  const now = new Date().toISOString();
  const idea: IdeaItem = {
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
  };

  const nextIdeas = [idea, ...getStoredIdeas()];
  saveStoredIdeas(nextIdeas);

  const interactions = getStoredInteractions();
  interactions[idea.id] = {
    votes: idea.votes,
    joinRequests: 0,
    voted: false,
    joinedRole: null,
  };
  saveStoredInteractions(interactions);

  return idea;
};

export const voteForIdea = (ideaId: string) => {
  const feed = getIdeaHubFeed();
  const idea = feed.find((item) => item.id === ideaId);
  if (!idea) return { ok: false, reason: "Idea not found" as const };

  const interactions = getStoredInteractions();
  const current = interactions[ideaId] ?? {
    votes: idea.votes,
    joinRequests: idea.joinRequests,
    voted: false,
    joinedRole: null,
  };

  if (current.voted) {
    return { ok: false, reason: "already-voted" as const };
  }

  interactions[ideaId] = {
    ...current,
    votes: current.votes + 1,
    voted: true,
  };
  saveStoredInteractions(interactions);

  return { ok: true as const };
};

export const requestIdeaCollaboration = (ideaId: string, role: CollaborationRole) => {
  const feed = getIdeaHubFeed();
  const idea = feed.find((item) => item.id === ideaId);
  if (!idea) return { ok: false, reason: "Idea not found" as const };

  const interactions = getStoredInteractions();
  const current = interactions[ideaId] ?? {
    votes: idea.votes,
    joinRequests: idea.joinRequests,
    voted: false,
    joinedRole: null,
  };

  if (current.joinedRole) {
    return { ok: false, reason: "already-joined" as const, joinedRole: current.joinedRole };
  }

  interactions[ideaId] = {
    ...current,
    joinRequests: current.joinRequests + 1,
    joinedRole: role,
  };
  saveStoredInteractions(interactions);

  return { ok: true as const };
};

export const getCurrentIdeaInteraction = (ideaId: string) => getStoredInteractions()[ideaId] ?? null;

export const getIdeasByAuthor = (userId: string | undefined) => {
  if (!userId) return [];
  return getIdeaHubFeed().filter((idea) => idea.authorUserId === userId);
};

export const getIdeaContributionSummary = (userId: string | undefined) => {
  const authoredIdeas = getIdeasByAuthor(userId);

  return {
    totalIdeas: authoredIdeas.length,
    totalVotes: authoredIdeas.reduce((sum, idea) => sum + idea.votes, 0),
    totalJoinRequests: authoredIdeas.reduce((sum, idea) => sum + idea.joinRequests, 0),
    authoredIdeas,
  };
};
