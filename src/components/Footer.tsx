import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container mx-auto px-4 py-14">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-bold text-foreground">StudentHub</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            A global marketplace and collaboration layer for students, creators, researchers, and emerging builders who want to turn skill into reputation and opportunity.
          </p>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/explore" className="hover:text-foreground">Browse services</Link></li>
            <li><Link to="/explore?cat=web-dev" className="hover:text-foreground">Web development</Link></li>
            <li><Link to="/explore?cat=tutoring" className="hover:text-foreground">Tutoring</Link></li>
            <li><Link to="/explore?cat=graphic-design" className="hover:text-foreground">Graphic design</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/auth" className="hover:text-foreground">Sign in</Link></li>
            <li><Link to="/auth?signup=true" className="hover:text-foreground">Create account</Link></li>
            <li><Link to="/profile" className="hover:text-foreground">Profile</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/how-it-works" className="hover:text-foreground">How it works</Link></li>
            <li><Link to="/explore" className="hover:text-foreground">Marketplace</Link></li>
            <li><Link to="/" className="hover:text-foreground">Homepage</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        Copyright 2026 StudentHub. Designed for globally credible student talent.
      </div>
    </div>
  </footer>
);

export default Footer;
