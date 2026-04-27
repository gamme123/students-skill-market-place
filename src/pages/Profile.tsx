import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, BookOpen, BriefcaseBusiness, CheckCircle2, GraduationCap, Lightbulb, PencilLine, ShieldCheck, Sparkles, Star, Users2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCurrentUserProfile, fetchCurrentUserServices } from "@/lib/marketplace";
import { getIdeaContributionSummary } from "@/lib/ideaHub";

const Profile = () => {
  const { user, loading } = useAuth();
  const [ideaSummary, setIdeaSummary] = useState(() => getIdeaContributionSummary(user?.id));

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => fetchCurrentUserProfile(user?.id),
    enabled: Boolean(user?.id),
  });

  const servicesQuery = useQuery({
    queryKey: ["my-services", user?.id],
    queryFn: () => fetchCurrentUserServices(user?.id),
    enabled: Boolean(user?.id),
  });

  useEffect(() => {
    setIdeaSummary(getIdeaContributionSummary(user?.id));
  }, [user?.id]);

  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const profile = profileQuery.data;
  const services = servicesQuery.data ?? [];
  const displayName = profile?.displayName || user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Student";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const verificationChecks = [
    { label: "Email verified", complete: Boolean(user?.email_confirmed_at) },
    { label: "Display name added", complete: Boolean(profile?.displayName?.trim()) },
    { label: "Bio completed", complete: Boolean(profile?.bio?.trim()) },
    { label: "University or organization added", complete: Boolean(profile?.university?.trim()) },
    { label: "At least one service published", complete: services.length > 0 },
  ];

  const completedChecks = verificationChecks.filter((item) => item.complete).length;
  const completionScore = Math.round((completedChecks / verificationChecks.length) * 100);
  const trustScore = Math.min(
    98,
    35 +
      (user?.email_confirmed_at ? 15 : 0) +
      (profile?.bio ? 15 : 0) +
      (profile?.university ? 10 : 0) +
      Math.min(20, services.length * 6) +
      Math.min(18, ideaSummary.totalIdeas * 6),
  );

  const portfolioHighlights = services.slice(0, 3).map((service, index) => ({
    id: service.id,
    title: service.title,
    category: service.category,
    proof:
      service.reviewCount > 0
        ? `${service.reviewCount} reviews and a ${service.rating}/5 rating`
        : `Delivery promise: ${service.deliveryDays} day turnaround`,
    outcome:
      index === 0
        ? "Strong headline service for profile visibility"
        : index === 1
          ? "Useful as proof of niche capability"
          : "Supports broader portfolio breadth",
    tags: service.tags.slice(0, 3),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-card">
          <div className="gradient-hero relative overflow-hidden px-6 py-10 text-primary-foreground md:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.18),transparent_35%)]" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/15 text-2xl font-bold">
                  {initials || "SS"}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/75">Verified identity layer</p>
                  <h1 className="font-display mt-2 text-3xl font-bold">{displayName}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-white/85">
                    {profile?.bio || "Complete your profile in Supabase to show your skills, work style, and professional strengths to buyers and collaborators."}
                  </p>
                </div>
              </div>
              <Button variant="secondary" className="w-full md:w-auto">
                <PencilLine className="mr-2 h-4 w-4" />
                Edit profile soon
              </Button>
            </div>
          </div>

          <div className="grid gap-4 px-6 py-6 md:grid-cols-3 md:px-10">
            <div className="rounded-2xl border border-border bg-background p-5">
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-muted-foreground">University or organization</span>
                </div>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {profile?.university || "Add your university"}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center gap-3">
                <BriefcaseBusiness className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Active services</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">{services.length}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Account email</span>
              </div>
              <p className="mt-3 text-lg font-semibold text-foreground">{user?.email || "No email found"}</p>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-panel rounded-[1.8rem] border border-white/70 p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">Trust score</p>
                <h2 className="font-display mt-3 text-3xl font-bold text-foreground">{trustScore}/100</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  StudentHub uses profile depth, verified signals, and proof of activity to help buyers feel more confident.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {verificationChecks.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm">
                  <span className="text-foreground">{item.label}</span>
                  <span className={item.complete ? "text-primary" : "text-muted-foreground"}>
                    {item.complete ? <CheckCircle2 className="h-4 w-4" /> : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-[1.8rem] border border-white/70 p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">Portfolio readiness</p>
                <h2 className="font-display mt-3 text-3xl font-bold text-foreground">{completionScore}% complete</h2>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  A stronger profile increases marketplace trust, improves conversion, and gives StudentHub a more globally credible feel.
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <BadgeCheck className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Signals complete</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{completedChecks}/{verificationChecks.length}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Published services</p>
                <p className="mt-2 text-2xl font-bold text-foreground">{services.length}</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Profile status</p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {completionScore >= 80 ? "Strong" : completionScore >= 50 ? "Growing" : "Early stage"}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">Portfolio highlights</p>
            <h2 className="font-display mt-3 text-3xl font-bold text-foreground">Turn listings into proof of work</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              StudentHub should not only show services. It should help each seller build a visible record of expertise, delivery style, and trust.
            </p>
          </div>

          {portfolioHighlights.length ? (
            <div className="grid gap-5 lg:grid-cols-3">
              {portfolioHighlights.map((item) => (
                <div key={item.id} className="glass-panel rounded-[1.6rem] border border-white/70 p-6 shadow-card">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{item.category}</p>
                    <Star className="h-4 w-4 text-accent" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.outcome}</p>
                  <div className="mt-4 rounded-2xl bg-background/70 p-4 text-sm text-foreground">
                    <span className="font-semibold">Proof signal:</span> {item.proof}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-secondary/40 p-10 text-center">
              <h3 className="font-display text-xl font-semibold text-foreground">No portfolio proof yet</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                As soon as you publish services, StudentHub can start turning them into visible portfolio highlights and stronger credibility signals.
              </p>
              <Button asChild className="mt-6">
                <Link to="/explore">Study the marketplace</Link>
              </Button>
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">Idea Hub contributions</p>
            <h2 className="font-display mt-3 text-3xl font-bold text-foreground">Founder signals on your profile</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
              StudentHub should show not only what you sell, but also what you invent, validate, and lead with other students.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Ideas posted</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{ideaSummary.totalIdeas}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-muted-foreground">Total votes earned</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{ideaSummary.totalVotes}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-5">
              <div className="flex items-center gap-3">
                <Users2 className="h-5 w-5 text-emerald-600" />
                <span className="text-sm font-medium text-muted-foreground">Join requests received</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{ideaSummary.totalJoinRequests}</p>
            </div>
          </div>

          {ideaSummary.authoredIdeas.length ? (
            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              {ideaSummary.authoredIdeas.slice(0, 3).map((idea) => (
                <div key={idea.id} className="glass-panel rounded-[1.6rem] border border-white/70 p-6 shadow-card">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{idea.category}</p>
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold text-foreground">{idea.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{idea.stage} stage with {idea.interestLevel.toLowerCase()} interest.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-background/70 p-4 text-sm text-foreground">
                      <span className="font-semibold">Votes:</span> {idea.votes}
                    </div>
                    <div className="rounded-2xl bg-background/70 p-4 text-sm text-foreground">
                      <span className="font-semibold">Join requests:</span> {idea.joinRequests}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-3xl border border-dashed border-border bg-secondary/40 p-10 text-center">
              <h3 className="font-display text-xl font-semibold text-foreground">No Idea Hub contributions yet</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Publish your first idea to start building founder credibility and collaboration momentum on your profile.
              </p>
              <Button asChild className="mt-6">
                <Link to="/ideas">Open Idea Hub</Link>
              </Button>
            </div>
          )}
        </section>

        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">Your services</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                These are the live marketplace listings currently attached to your identity layer.
              </p>
            </div>
          </div>

          {servicesQuery.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-[300px] rounded-3xl" />
              ))}
            </div>
          ) : services.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-secondary/40 p-10 text-center">
              <h3 className="text-xl font-semibold text-foreground">No services yet</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Your account is connected and ready. The next step would be adding a seller dashboard or a create-service form.
              </p>
              <Button asChild className="mt-6">
                <Link to="/explore">Browse marketplace</Link>
              </Button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
