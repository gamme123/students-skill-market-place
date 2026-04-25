import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, LogOut, User, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navItems = [
  { label: "Explore", to: "/explore" },
  { label: "Categories", to: "/explore?cat=web-dev" },
  { label: "How It Works", to: "/how-it-works" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const displayName = user?.user_metadata?.display_name || user?.email?.split("@")[0] || "Profile";

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/85 backdrop-blur-xl">
      <div className="container mx-auto flex h-18 items-center justify-between px-4 py-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-card">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-extrabold tracking-tight text-foreground">SkillSwap</p>
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Student marketplace</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/explore" aria-label="Search services">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          {user ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile">
                  <User className="mr-1 h-3.5 w-3.5" />
                  {displayName}
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="mr-1 h-3.5 w-3.5" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth?signup=true">Join Free</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="rounded-xl border border-border p-2 md:hidden"
          onClick={() => setMobileOpen((value) => !value)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="animate-fade-in border-t border-border bg-card p-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <div className="grid grid-cols-2 gap-2 pt-2">
              {user ? (
                <>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/profile" onClick={() => setMobileOpen(false)}>
                      Profile
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setMobileOpen(false);
                      handleSignOut();
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>
                      Sign In
                    </Link>
                  </Button>
                  <Button size="sm" className="w-full" asChild>
                    <Link to="/auth?signup=true" onClick={() => setMobileOpen(false)}>
                      Join Free
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
