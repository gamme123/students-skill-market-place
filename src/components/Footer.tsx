import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-card">
    <div className="container mx-auto px-4 py-12">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <span className="text-xl font-extrabold text-primary">Skill</span>
          <span className="text-xl font-extrabold text-foreground">Swap</span>
          <p className="mt-3 text-sm text-muted-foreground">
            The marketplace where students trade skills, learn together, and build their portfolios.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Explore</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/explore" className="hover:text-foreground">Browse Services</Link></li>
            <li><Link to="/explore?cat=web-dev" className="hover:text-foreground">Web Development</Link></li>
            <li><Link to="/explore?cat=tutoring" className="hover:text-foreground">Tutoring</Link></li>
            <li><Link to="/explore?cat=graphic-design" className="hover:text-foreground">Design</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/how-it-works" className="hover:text-foreground">How It Works</Link></li>
            <li><a href="#" className="hover:text-foreground">About Us</a></li>
            <li><a href="#" className="hover:text-foreground">Blog</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Support</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><a href="#" className="hover:text-foreground">Help Center</a></li>
            <li><a href="#" className="hover:text-foreground">Terms of Service</a></li>
            <li><a href="#" className="hover:text-foreground">Privacy Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
        © 2026 SkillSwap. Built by students, for students.
      </div>
    </div>
  </footer>
);

export default Footer;
