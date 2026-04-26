import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Search, ShieldCheck, Sparkles, Users } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const stats = [
  { label: "Verified creators", value: "1.8k+" },
  { label: "Projects delivered", value: "12k+" },
  { label: "Client satisfaction", value: "4.9/5" },
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(15,118,110,0.10),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(249,115,22,0.12),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,249,0.96))]" />
      <div className="container relative mx-auto grid gap-14 px-4 py-16 md:grid-cols-[1.08fr_0.92fr] md:items-center md:py-24">
        <div className="animate-fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Built for ambitious students and emerging global talent
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Launch talent, services, and reputation in a marketplace that feels modern, global, and trusted.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            SkillSwap helps students and early-career creators sell tutoring, design, coding, editing, research, and digital services with stronger profiles, faster discovery, and a brand that feels internationally credible.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-8 flex flex-col gap-3 rounded-[1.75rem] border border-border bg-card p-3 shadow-card sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search React websites, tutoring, editing, or design"
                className="h-12 rounded-2xl border-0 bg-secondary pl-11 shadow-none focus-visible:ring-1"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="rounded-2xl px-6">
              Search services
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2 text-sm text-muted-foreground">
            {["React website", "Python tutor", "Logo design", "Entrance exam prep"].map((term) => (
              <button
                key={term}
                onClick={() => navigate(`/explore?q=${encodeURIComponent(term)}`)}
                className="rounded-full border border-border bg-card px-4 py-2 transition-colors hover:border-primary hover:text-primary"
              >
                {term}
              </button>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[1.5rem] border border-border bg-card p-5 shadow-card">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="absolute -left-10 top-10 h-28 w-28 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -right-6 bottom-12 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card p-4 shadow-hero">
            <img
              src={heroImage}
              alt="Students collaborating and sharing skills"
              className="h-full w-full rounded-[1.5rem] object-cover"
            />
            <div className="absolute left-8 top-8 rounded-2xl bg-white/90 p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Global-ready talent</p>
                  <p className="text-xs text-muted-foreground">Profiles built for trust, proof, and discovery</p>
                </div>
              </div>
            </div>
            <div className="absolute bottom-8 right-8 rounded-2xl bg-white/90 p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Professional buying experience</p>
                  <p className="text-xs text-muted-foreground">Auth, messaging, and review-ready structure</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
