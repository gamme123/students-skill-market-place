import { Navigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, BriefcaseBusiness, GraduationCap, PencilLine } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ServiceCard from "@/components/ServiceCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCurrentUserProfile, fetchCurrentUserServices } from "@/lib/marketplace";

const Profile = () => {
  const { user, loading } = useAuth();

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
                  <p className="text-sm uppercase tracking-[0.3em] text-white/75">Student profile</p>
                  <h1 className="mt-2 text-3xl font-bold">{displayName}</h1>
                  <p className="mt-2 max-w-2xl text-sm text-white/85">
                    {profile?.bio || "Complete your profile in Supabase to show your skills, experience, and academic strengths to buyers."}
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
                <span className="text-sm font-medium text-muted-foreground">University</span>
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

        <section className="mt-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Your services</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Services loaded from Supabase will appear here as soon as you create them.
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
