import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-primary">Skill</span>
          <span className="text-2xl font-extrabold tracking-tight text-foreground">Swap</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/explore" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Explore
          </Link>
          <Link to="/explore?cat=web-dev" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Categories
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            How It Works
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/explore">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          {user ? (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to="/profile">
                  <User className="mr-1 h-3.5 w-3.5" />
                  Profile
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

        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="animate-fade-in border-t border-border bg-card p-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link to="/explore" className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setMobileOpen(false)}>
              Explore
            </Link>
            <Link to="/how-it-works" className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary" onClick={() => setMobileOpen(false)}>
              How It Works
            </Link>
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to="/profile" onClick={() => setMobileOpen(false)}>Profile</Link>
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>Sign In</Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild>
                    <Link to="/auth?signup=true" onClick={() => setMobileOpen(false)}>Join Free</Link>
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
