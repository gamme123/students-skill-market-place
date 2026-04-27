import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bot,
  Filter,
  Flame,
  Globe2,
  Lightbulb,
  MessageSquareText,
  Rocket,
  Search,
  Sparkles,
  Users2,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ideas, ideaCategories } from "@/data/ideas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const roleTone: Record<string, string> = {
  Developer: "bg-primary/10 text-primary",
  Designer: "bg-accent/10 text-accent",
  Researcher: "bg-emerald-500/10 text-emerald-700",
  Strategist: "bg-sky-500/10 text-sky-700",
  Writer: "bg-violet-500/10 text-violet-700",
};

const IdeaHub = () => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

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
  }, [activeCategory, query]);

  const trendingIdeas = [...ideas].sort((a, b) => b.trendScore - a.trendScore).slice(0, 3);
  const recommendedIdeas = [...ideas].sort((a, b) => b.votes - a.votes).slice(0, 2);

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
                StudentHub Idea Hub MVP
              </div>
              <h1 className="font-display mt-6 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
                Share ideas, find collaborators, validate demand, and turn concepts into real projects.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/85">
                Idea Hub is the layer that moves StudentHub beyond a freelance marketplace. Students can propose ventures,
                test interest, assemble teams, and convert promising ideas into products or marketplace offers.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button variant="secondary" size="lg">
                  Post an idea
                </Button>
                <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                  Request collaboration
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
                    <p className="text-sm font-semibold">Idea posting</p>
                    <p className="text-xs text-muted-foreground">Title, category, tags, stage, and visibility</p>
                  </div>
                </div>
              </div>
              <div className="glass-panel rounded-[1.5rem] border border-white/70 p-5 text-foreground shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Users2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Collaboration requests</p>
                    <p className="text-xs text-muted-foreground">Developers, designers, researchers, and strategists</p>
                  </div>
                </div>
              </div>
              <div className="glass-panel rounded-[1.5rem] border border-white/70 p-5 text-foreground shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">AI feedback direction</p>
                    <p className="text-xs text-muted-foreground">Validation cues and smarter matching roadmap</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.8rem] border border-border bg-card p-6 shadow-card">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">Idea discovery</p>
                <h2 className="font-display mt-3 text-3xl font-bold text-foreground">
                  Explore trending and recommended concepts
                </h2>
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

            <div className="mt-8 space-y-4">
              {filteredIdeas.map((idea) => (
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

                  <div className="mt-5 grid gap-3 md:grid-cols-4">
                    <div className="rounded-2xl bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Trend score</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{idea.trendScore}</p>
                    </div>
                    <div className="rounded-2xl bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Votes</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{idea.votes}</p>
                    </div>
                    <div className="rounded-2xl bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Comments</p>
                      <p className="mt-2 text-xl font-bold text-foreground">{idea.comments}</p>
                    </div>
                    <div className="rounded-2xl bg-background/75 p-4">
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Interest</p>
                      <p className="mt-2 text-sm font-semibold text-foreground">{idea.interestLevel}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.4rem] border border-border/70 bg-background/75 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <Bot className="h-4 w-4 text-primary" />
                      AI validation feedback
                    </div>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{idea.aiFeedback}</p>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">Idea to project path:</span> {idea.conversionPath}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" className="rounded-xl">
                        Join idea
                      </Button>
                      <Button variant="outline" className="rounded-xl">
                        Vote and comment
                      </Button>
                      <Button className="rounded-xl">
                        Convert to project
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                      {idea.interestLevel} interest • {idea.votes} votes • {idea.comments} comments
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
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">Collaboration flow</p>
                  <h3 className="font-display text-2xl font-bold text-foreground">How MVP collaboration can work</h3>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
                <p>1. A student posts an idea with category, stage, tags, and visibility.</p>
                <p>2. Other students discover it, vote, and request to join with a clear role.</p>
                <p>3. The idea owner forms a team and opens a workspace direction.</p>
                <p>4. The team can later convert the idea into a project or marketplace service.</p>
              </div>
            </div>

            <div className="rounded-[1.8rem] border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3">
                <Rocket className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Roadmap</p>
                  <h3 className="font-display text-2xl font-bold text-foreground">What comes after MVP</h3>
                </div>
              </div>
              <div className="mt-5 space-y-3 text-sm leading-7 text-muted-foreground">
                <p>- AI idea generation and evaluator</p>
                <p>- Co-founder matching and multilingual idea translation</p>
                <p>- Polls, milestone tracking, and private workspaces</p>
                <p>- Conversion from idea to active team project dashboard</p>
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
