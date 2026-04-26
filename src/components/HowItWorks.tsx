import { UserPlus, Search, MessageCircle, Star } from "lucide-react";

const steps = [
  { icon: UserPlus, title: "Create Your Account", desc: "Join with Gmail, university email, or any valid address" },
  { icon: Search, title: "Discover Talent", desc: "Search by category, deliverable, or specialist skill" },
  { icon: MessageCircle, title: "Align and Hire", desc: "Message, confirm scope, and place the order with clarity" },
  { icon: Star, title: "Build Reputation", desc: "Collect reviews, repeat work, and grow long-term trust" },
];

const HowItWorks = () => (
  <section className="py-16">
    <div className="container mx-auto px-4">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-foreground">How SkillSwap Works</h2>
        <p className="mt-2 text-muted-foreground">Four clear steps to move from profile to paid opportunity</p>
      </div>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, i) => (
          <div key={i} className="relative text-center">
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
