import { Bot, BriefcaseBusiness, CheckCircle2, Layers3, ShieldCheck, Sparkles, Users2, Workflow } from "lucide-react";

const buyerPoints = [
  "Find student specialists for code, design, research, tutoring, and digital execution.",
  "Review clearer profiles, proof-of-work signals, and category expertise before hiring.",
  "Move from one-off tasks into longer-term collaborations with trusted rising talent.",
];

const sellerPoints = [
  "Turn real skills into paid services, stronger reputation, and visible portfolio proof.",
  "Use one profile to show academic strengths, practical execution, and delivery history.",
  "Position yourself for freelance work now and bigger startup, team, or client opportunities later.",
];

const ecosystemCards = [
  {
    icon: Layers3,
    title: "Project marketplace",
    detail: "A structured layer for code, design, research, writing, tutoring, and business deliverables.",
  },
  {
    icon: Workflow,
    title: "Collaboration hub",
    detail: "A future-ready path for idea sharing, smart team formation, and building serious student-led work together.",
  },
  {
    icon: ShieldCheck,
    title: "Trust and reputation",
    detail: "Ratings, identity signals, delivery history, and proof of work designed to increase confidence on both sides.",
  },
  {
    icon: Bot,
    title: "AI-powered direction",
    detail: "StudentHub is being shaped for smart matching, idea scoring, opportunity guidance, and future portfolio intelligence.",
  },
];

const PlatformOverviewSection = () => (
  <section className="py-20">
    <div className="container mx-auto space-y-10 px-4">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">Who StudentHub serves</p>
        <h2 className="font-display mt-4 text-3xl font-bold text-foreground md:text-5xl">
          More than student gigs. StudentHub is being shaped as a serious global opportunity layer.
        </h2>
        <p className="mt-4 text-base leading-8 text-muted-foreground">
          The platform should work for buyers who need capable execution, sellers who want reputation and income,
          and future collaborators who want to build projects, ideas, and portfolios that matter beyond campus.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-[1.8rem] border border-white/70 p-7 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <BriefcaseBusiness className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">For buyers</p>
              <h3 className="font-display text-2xl font-bold text-foreground">Hire student talent with more confidence</h3>
            </div>
          </div>
          <div className="space-y-4">
            {buyerPoints.map((point) => (
              <div key={point} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-primary" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel rounded-[1.8rem] border border-white/70 p-7 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <Users2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-accent">For sellers</p>
              <h3 className="font-display text-2xl font-bold text-foreground">Build identity, income, and long-term credibility</h3>
            </div>
          </div>
          <div className="space-y-4">
            {sellerPoints.map((point) => (
              <div key={point} className="flex gap-3 text-sm leading-7 text-muted-foreground">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[2rem] border border-border/60 bg-secondary/35 p-7 md:p-8">
        <div className="mb-8 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-2 text-sm font-medium text-primary shadow-card">
            <Sparkles className="h-4 w-4" />
            Platform vision
          </div>
          <h3 className="font-display mt-4 text-3xl font-bold text-foreground">The roadmap is a marketplace first, then a startup, collaboration, and portfolio ecosystem.</h3>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            That means the homepage should communicate both what works today and what StudentHub is growing into:
            a place for talent discovery, proof-of-work, smarter matching, incubator-style execution, and meaningful student-led collaboration.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {ecosystemCards.map(({ icon: Icon, title, detail }) => (
            <div key={title} className="glass-panel rounded-[1.5rem] border border-white/70 p-5 shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h4 className="mt-4 font-display text-xl font-bold text-foreground">{title}</h4>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default PlatformOverviewSection;
