import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-border bg-background">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo */}
          <Link to="/" className="font-display text-xl font-medium text-foreground">
            AlgoTrade Pro
          </Link>

          {/* Links */}
          <nav className="flex gap-8">
            <Link to="/learn" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Learn
            </Link>
            <Link to="/pricing" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Pricing
            </Link>
            <Link to="/auth" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
              Sign In
            </Link>
          </nav>

          {/* Trust indicators */}
          <div className="flex items-center gap-4 text-muted-foreground text-xs">
            <span>No profit guarantees</span>
            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            <span>Paper trading first</span>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/50 text-center">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} AlgoTrade Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
