import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import CTASection from "@/components/CTASection";

const buyerPoints = [
  "Discover student specialists across research, design, code, tutoring, and digital work.",
  "Message creators before committing so project scope, timing, and expectations stay clear.",
  "Use profiles, reviews, and category signals to choose talent with more confidence.",
  "Build repeat relationships with rising talent instead of restarting from zero every time.",
];

const sellerPoints = [
  "Launch your profile with Gmail, university email, or any valid email provider.",
  "Publish services that turn academic strength and practical skills into real opportunity.",
  "Grow a portfolio, review history, and stronger market identity over time.",
  "Position yourself for gigs today and bigger collaborations later.",
];

const HowItWorksPage = () => (
  <div className="min-h-screen">
    <Header />
    <div className="container mx-auto px-4 py-12">
      <h1 className="font-display mb-2 text-center text-3xl font-bold text-foreground">How StudentHub works</h1>
      <p className="mb-8 text-center text-muted-foreground">
        The platform is designed to help students move from hidden talent to visible opportunity.
      </p>
    </div>
    <HowItWorks />
    <section className="bg-secondary/50 py-16">
      <div className="container mx-auto grid gap-8 px-4 md:grid-cols-2">
        <div className="glass-panel rounded-[1.5rem] border border-white/70 p-8 shadow-card">
          <h3 className="mb-3 font-display text-xl font-bold text-foreground">For buyers and teams</h3>
          <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
            {buyerPoints.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
        <div className="glass-panel rounded-[1.5rem] border border-white/70 p-8 shadow-card">
          <h3 className="mb-3 font-display text-xl font-bold text-foreground">For student sellers</h3>
          <ul className="space-y-3 text-sm leading-7 text-muted-foreground">
            {sellerPoints.map((item) => (
              <li key={item}>- {item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
    <CTASection />
    <Footer />
  </div>
);

export default HowItWorksPage;
