import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const authHighlights = [
  "Create a talent profile in minutes",
  "Use Gmail, university email, or any valid email address",
  "Start browsing, selling, or hiring right away",
];

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get("signup") === "true");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user, loading, signIn, signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsSignUp(searchParams.get("signup") === "true");
  }, [searchParams]);

  const toggleMode = (nextIsSignUp: boolean) => {
    const next = new URLSearchParams(searchParams);
    if (nextIsSignUp) {
      next.set("signup", "true");
    } else {
      next.delete("signup");
    }
    setSearchParams(next, { replace: true });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    if (isSignUp) {
      if (!displayName.trim()) {
        toast.error("Please enter your name");
        setSubmitting(false);
        return;
      }

      const { error } = await signUp(email, password, displayName.trim());
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Account created. Check your email to verify your account.");
        navigate("/");
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Welcome back");
        navigate("/profile");
      }
    }

    setSubmitting(false);
  };

  if (!loading && user) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="grid overflow-hidden rounded-[2rem] border border-border bg-card shadow-card lg:grid-cols-[1.04fr_0.96fr]">
          <section className="gradient-hero relative overflow-hidden px-8 py-12 text-primary-foreground md:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.26),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.16),transparent_36%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-medium text-white/90">
                <Sparkles className="h-4 w-4" />
                Global account access powered by Supabase
              </div>

              <h1 className="font-display mt-8 max-w-lg text-4xl font-bold leading-tight">
                {isSignUp ? "Create your StudentHub account" : "Welcome back to your global workspace"}
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/85">
                {isSignUp
                  ? "Join with Gmail, a university address, or any valid email to showcase your skills, build trust, and start winning real opportunities."
                  : "Sign in to manage your profile, explore opportunities, and keep building a marketplace that feels credible across borders."}
              </p>

              <div className="mt-10 space-y-4">
                {authHighlights.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                    <span className="text-sm text-white/90">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-3xl bg-white/10 p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Auth foundation is ready</p>
                    <p className="text-xs text-white/80">
                      New accounts create profile records automatically through your Supabase trigger.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="px-6 py-10 md:px-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                  {isSignUp ? "Join now" : "Sign in"}
                </p>
                <h2 className="mt-3 text-3xl font-bold text-foreground">
                  {isSignUp ? "Set up your account" : "Access your profile"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Use any valid email address and your password to {isSignUp ? "create" : "access"} your account.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Full name</Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Your full name"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      required
                      maxLength={100}
                      className="h-11 rounded-xl"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@gmail.com or you@university.edu"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    maxLength={255}
                    className="h-11 rounded-xl"
                  />
                  <p className="text-xs text-muted-foreground">
                    Gmail, Outlook, university email, and other valid email providers are all allowed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter at least 6 characters"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    className="h-11 rounded-xl"
                  />
                </div>

                <Button type="submit" className="h-11 w-full rounded-xl" disabled={submitting}>
                  {submitting ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
                </Button>
              </form>

              <div className="mt-6 rounded-2xl bg-secondary/60 p-4 text-sm text-muted-foreground">
                {isSignUp ? "Already have an account?" : "Need a new account?"}{" "}
                <button
                  type="button"
                  onClick={() => toggleMode(!isSignUp)}
                  className="font-semibold text-primary hover:underline"
                >
                  {isSignUp ? "Sign in instead" : "Create one now"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
