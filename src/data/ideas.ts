export type IdeaVisibility = "Public" | "Private" | "Team";
export type CollaborationRole = "Developer" | "Designer" | "Researcher" | "Strategist" | "Writer";

export interface IdeaItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  visibility: IdeaVisibility;
  stage: "Concept" | "Validation" | "Building" | "Ready for Marketplace";
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  trendScore: number;
  votes: number;
  comments: number;
  interestLevel: string;
  aiFeedback: string;
  author: string;
  authorTitle: string;
  rolesNeeded: CollaborationRole[];
  conversionPath: string;
}

export const ideaCategories = [
  "AI",
  "Web",
  "Research",
  "Business",
  "EdTech",
  "Health",
  "Design",
  "Climate",
];

export const ideas: IdeaItem[] = [
  {
    id: "idea-1",
    title: "AI study copilot for African university students",
    description:
      "A multilingual study assistant that helps students summarize lecture notes, generate quizzes, and track weak topics across different courses.",
    category: "AI",
    tags: ["AI", "EdTech", "Study Tools"],
    visibility: "Public",
    stage: "Validation",
    difficulty: "Intermediate",
    trendScore: 96,
    votes: 214,
    comments: 42,
    interestLevel: "Very high",
    aiFeedback: "Strong market relevance. Clear educational pain point and strong room for portfolio + subscription value.",
    author: "Helen M.",
    authorTitle: "Product-minded CS student",
    rolesNeeded: ["Developer", "Designer", "Researcher"],
    conversionPath: "Could become a SaaS study product and a tutoring marketplace add-on.",
  },
  {
    id: "idea-2",
    title: "Startup-ready design library for student founders",
    description:
      "A reusable UI system and pitch asset kit for student founders building MVPs, decks, landing pages, and early investor materials.",
    category: "Design",
    tags: ["Branding", "Design Systems", "Startup"],
    visibility: "Public",
    stage: "Concept",
    difficulty: "Beginner",
    trendScore: 88,
    votes: 163,
    comments: 25,
    interestLevel: "High",
    aiFeedback: "Good collaboration potential. Attractive for designers and founders; strongest if paired with templates and consulting offers.",
    author: "Daniel K.",
    authorTitle: "Student founder and brand designer",
    rolesNeeded: ["Designer", "Strategist", "Writer"],
    conversionPath: "Can convert into a sellable marketplace package, template store, or founder services bundle.",
  },
  {
    id: "idea-3",
    title: "Research collaboration hub for final-year students",
    description:
      "A structured space for thesis teams, capstone groups, and student researchers to form teams, assign milestones, and publish outputs.",
    category: "Research",
    tags: ["Research", "Teams", "Capstone"],
    visibility: "Team",
    stage: "Building",
    difficulty: "Advanced",
    trendScore: 84,
    votes: 141,
    comments: 31,
    interestLevel: "Growing",
    aiFeedback: "Strong academic workflow relevance. Needs milestone, role, and document support to stand out.",
    author: "Meron A.",
    authorTitle: "Research lead",
    rolesNeeded: ["Researcher", "Developer", "Strategist"],
    conversionPath: "Can evolve into a team workspace and academic project management product.",
  },
  {
    id: "idea-4",
    title: "Freelance launchpad for student video editors",
    description:
      "A niche accelerator that helps student editors package offers, collect reviews, and win recurring clients across social media and startup work.",
    category: "Business",
    tags: ["Video", "Creator Economy", "Freelancing"],
    visibility: "Public",
    stage: "Ready for Marketplace",
    difficulty: "Intermediate",
    trendScore: 79,
    votes: 122,
    comments: 18,
    interestLevel: "High",
    aiFeedback: "Very practical and monetizable. Best positioned as a services category plus portfolio accelerator.",
    author: "Abel T.",
    authorTitle: "Creator growth specialist",
    rolesNeeded: ["Strategist", "Writer", "Designer"],
    conversionPath: "Can become both a marketplace category and a micro-incubator for creator service teams.",
  },
];
