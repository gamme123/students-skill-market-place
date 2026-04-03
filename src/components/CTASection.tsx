import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="gradient-hero rounded-2xl px-8 py-14 text-center text-primary-foreground shadow-hero">
        <h2 className="mb-3 text-3xl font-bold">Ready to Share Your Skills?</h2>
        <p className="mx-auto mb-8 max-w-md text-sm opacity-90">
          Join thousands of students already earning and learning on SkillSwap. It's free to get started.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" size="lg">
            Start Selling <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          <Button variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
            Browse Services
          </Button>
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
