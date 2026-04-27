import { BarChart3, BriefcaseBusiness, GitBranch, Globe2, Landmark, Languages, Rocket, Trophy, Users2, Video } from "lucide-react";

const ecosystemTracks = [
  {
    icon: Rocket,
    title: "Idea incubator mode",
    detail: "Turn raw concepts into startup-mode ideas with milestones, launch readiness, and progress visibility.",
  },
  {
    icon: Users2,
    title: "AI co-founder direction",
    detail: "Match students into stronger teams by missing roles, skill fit, and future work-style signals.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Marketplace conversion",
    detail: "Move validated ideas into services, products, or team offers that can earn real income.",
  },
  {
    icon: Landmark,
    title: "Recruiter and investor access",
    detail: "Surface high-signal teams, top ideas, and ambitious builders for hiring and funding visibility.",
  },
];

const globalSignals = [
  { icon: Globe2, label: "Global team formation" },
  { icon: Languages, label: "Multi-language ready" },
  { icon: Video, label: "Demo and pitch workflows" },
  { icon: Trophy, label: "Competitions and hackathons" },
  { icon: BarChart3, label: "Idea performance analytics" },
  { icon: GitBranch, label: "GitHub, Figma, and Drive integrations" },
];

const EcosystemShowcaseSection = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <div className="rounded-[2rem] border border-border bg-card p-7 shadow-card md:p-9">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">Ecosystem mode</p>
            <h2 className="font-display mt-4 text-3xl font-bold text-foreground md:text-5xl">
              StudentHub is evolving from a marketplace into an idea-to-startup ecosystem.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-8 text-muted-foreground">
              The long-term product story is bigger than gigs. The platform is being shaped to help students launch ideas,
              form serious teams, monetize outcomes, get discovered by recruiters or investors, and compete globally.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {globalSignals.map(({ icon: Icon, label }) => (
                <div key={label} className="glass-panel flex items-center gap-3 rounded-[1.2rem] border border-white/70 px-4 py-4 shadow-card">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {ecosystemTracks.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="glass-panel rounded-[1.6rem] border border-white/70 p-5 shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display mt-4 text-xl font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default EcosystemShowcaseSection;
