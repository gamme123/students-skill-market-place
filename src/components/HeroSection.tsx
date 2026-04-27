import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Bot, BriefcaseBusiness, Search, ShieldCheck, Sparkles, Users, Workflow } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const stats = [
  { label: "Global-ready creators", value: "1.8k+" },
  { label: "Projects and gigs shipped", value: "12k+" },
  { label: "Average trust rating", value: "4.9/5" },
];

const signals = [
  { icon: BriefcaseBusiness, title: "Marketplace", detail: "Sell services, research, code, design, and academic deliverables." },
  { icon: Workflow, title: "Collaboration", detail: "Move from one-off gigs into teams, portfolios, and long-term project building." },
  { icon: Bot, title: "AI direction", detail: "Designed for smart matching, portfolio growth, and future learning assistance." },
];

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(query.trim() ? `/explore?q=${encodeURIComponent(query.trim())}` : "/explore");
  };

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(86,108,255,0.18),transparent_28%),radial-gradient(circle_at_88%_12%,rgba(166,106,255,0.20),transparent_24%),linear-gradient(180deg,rgba(247,248,255,0.96),rgba(239,242,255,0.94))]" />
      <div className="container relative mx-auto grid gap-16 px-4 py-16 md:grid-cols-[1.02fr_0.98fr] md:items-center md:py-24">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-2 text-sm font-medium text-primary shadow-card">
            <Sparkles className="h-4 w-4" />
            Reimagined as a globally credible student platform
          </div>

          <h1 className="font-display mt-6 max-w-4xl text-4xl font-bold leading-[1.02] tracking-tight text-foreground md:text-5xl lg:text-6xl">
            StudentHub turns student talent, ideas, and projects into real global opportunity.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            Built as a modern marketplace and collaboration layer for ambitious students, StudentHub helps people sell expertise,
            showcase proof of work, discover project partners, and grow a professional identity that feels investor-grade and
            internationally relevant.
          </p>

          <form
            onSubmit={handleSearch}
            className="glass-panel mt-9 flex flex-col gap-3 rounded-[1.9rem] border border-white/70 p-3 shadow-hero sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search AI research help, product design, React builds, or exam coaching"
                className="h-12 rounded-2xl border-0 bg-white/75 pl-11 shadow-none focus-visible:ring-1"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="rounded-2xl px-6">
              Explore opportunities
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted-foreground">
            {["UI system design", "Python automation", "Research presentation", "Startup pitch deck"].map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/explore?q=${encodeURIComponent(term)}`)}
                className="rounded-full border border-border/80 bg-white/70 px-4 py-2 transition-colors hover:border-primary hover:text-primary"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="glass-panel rounded-[1.5rem] border border-white/70 p-5 shadow-card">
                <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="absolute -left-10 top-16 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -right-6 bottom-16 h-36 w-36 rounded-full bg-accent/25 blur-3xl" />

          <div className="glass-panel relative overflow-hidden rounded-[2rem] border border-white/60 p-4 shadow-hero">
            <img
              src={heroImage}
              alt="Students collaborating and sharing skills"
              className="h-full w-full rounded-[1.5rem] object-cover"
            />

            <div className="absolute left-8 top-8 max-w-[240px] rounded-[1.4rem] border border-white/70 bg-white/88 p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Professional identity</p>
                  <p className="text-xs text-muted-foreground">Profiles designed for trust, proof, and discovery.</p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-8 right-8 max-w-[250px] rounded-[1.4rem] border border-white/70 bg-white/88 p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Global trust layer</p>
                  <p className="text-xs text-muted-foreground">Messaging, reviews, verification signals, and safer buyer confidence.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {signals.map(({ icon: Icon, title, detail }) => (
              <div key={title} className="glass-panel flex items-start gap-4 rounded-[1.4rem] border border-white/70 p-4 shadow-card">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
