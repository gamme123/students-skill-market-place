import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-illustration.jpg";

const HeroSection = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <section className="relative overflow-hidden">
      <div className="gradient-hero absolute inset-0 opacity-5" />
      <div className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-2 md:items-center md:py-24">
        <div className="animate-fade-up">
          <span className="mb-4 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
            🎓 Built for Students
          </span>
          <h1 className="mb-4 text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Trade Skills,
            <br />
            <span className="text-primary">Grow Together</span>
          </h1>
          <p className="mb-8 max-w-md text-lg text-muted-foreground">
            Buy and sell student services — from coding to design to tutoring.
            Affordable, peer-powered, campus-ready.
          </p>

          <form onSubmit={handleSearch} className="flex max-w-md gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Try 'React website' or 'Python tutor'"
                className="pl-10"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit">
              Search <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>Popular:</span>
            {["Web Dev", "Logo Design", "Python Tutor", "Essay Help"].map((t) => (
              <button
                key={t}
                onClick={() => navigate(`/explore?q=${encodeURIComponent(t)}`)}
                className="rounded-full border border-border px-3 py-1 transition-colors hover:border-primary hover:text-primary"
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:block">
          <img
            src={heroImage}
            alt="Students collaborating and sharing skills"
            className="animate-float rounded-2xl shadow-hero"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
