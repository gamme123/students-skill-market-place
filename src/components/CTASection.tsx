import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Sparkles, Users2 } from "lucide-react";

const CTASection = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <div className="gradient-hero overflow-hidden rounded-[2rem] px-8 py-14 text-primary-foreground shadow-hero md:px-12">
        <div className="grid gap-8 md:grid-cols-[1.05fr_0.95fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">Next horizon</p>
            <h2 className="font-display mt-4 text-3xl font-bold md:text-4xl">StudentHub is being shaped as a marketplace, portfolio layer, and collaboration operating system.</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/85">
              The current release is the foundation. Next comes stronger portfolios, collaboration spaces, smart matching, and a product experience that can stand confidently in global startup conversations.
            </p>
          </div>
          <div className="space-y-3">
            <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 text-white" />
                <div>
                  <p className="text-sm font-semibold">Premium marketplace direction</p>
                  <p className="mt-1 text-xs leading-6 text-white/80">More polished discovery, stronger seller identity, and a cleaner global buyer experience.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4">
              <div className="flex items-start gap-3">
                <Users2 className="mt-0.5 h-5 w-5 text-white" />
                <div>
                  <p className="text-sm font-semibold">Collaboration-ready roadmap</p>
                  <p className="mt-1 text-xs leading-6 text-white/80">Ideas, teams, and proof-of-work flows that go beyond simple gig listings.</p>
                </div>
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-white/15 bg-white/10 p-4">
              <div className="flex items-start gap-3">
                <Bot className="mt-0.5 h-5 w-5 text-white" />
                <div>
                  <p className="text-sm font-semibold">AI-powered future</p>
                  <p className="mt-1 text-xs leading-6 text-white/80">Matching, evaluation, portfolio guidance, and opportunity intelligence are part of the longer-term vision.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/auth?signup=true">
                  Launch your profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white/30 text-primary-foreground hover:bg-white/10"
                asChild
              >
                <Link to="/explore">Explore the marketplace</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
