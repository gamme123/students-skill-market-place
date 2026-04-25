import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => (
  <section className="py-20">
    <div className="container mx-auto px-4">
      <div className="gradient-hero overflow-hidden rounded-[2rem] px-8 py-14 text-primary-foreground shadow-hero md:px-12">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">Start strong</p>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">Ready to share your skills or hire another student?</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/85">
              Your marketplace now has a cleaner experience, real authentication, and a Supabase-ready data layer. The next step is filling it with real student offers.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:justify-end">
            <Button variant="secondary" size="lg" asChild>
              <Link to="/auth?signup=true">
                Create account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white/30 text-primary-foreground hover:bg-white/10"
              asChild
            >
              <Link to="/explore">Browse services</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
