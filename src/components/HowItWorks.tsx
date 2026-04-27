import { UserPlus, Search, MessageCircle, Star } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Build Identity", desc: "Create a professional profile with proof of skill, clear focus, and global credibility." },
  { icon: Search, title: "Discover Opportunity", desc: "Search by service, deliverable, niche, or collaborator fit across the marketplace." },
  { icon: MessageCircle, title: "Collaborate and Deliver", desc: "Align on scope, exchange files, and move from conversation to completed work." },
  { icon: Star, title: "Compound Reputation", desc: "Turn each project into reviews, visibility, and a stronger long-term portfolio." },
];

const HowItWorks = () => (
  <section className="py-18">
    <div className="container mx-auto px-4">
      <div className="mb-12 text-center">
        <h2 className="font-display text-3xl font-bold text-foreground">How StudentHub works</h2>
        <p className="mt-2 text-muted-foreground">A cleaner path from student skill to real opportunity, collaboration, and reputation.</p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <div key={i} className="glass-panel relative rounded-[1.6rem] border border-white/70 p-6 text-center shadow-card">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <step.icon className="h-6 w-6" />
            </div>
            <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              {i + 1}
            </span>
            <h3 className="mb-1 text-sm font-semibold text-foreground">{step.title}</h3>
            <p className="text-xs text-muted-foreground">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
