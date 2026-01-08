import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-border/30">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <span className="font-display text-sm text-muted-foreground">
          © 2025 AlgoTrade Pro
        </span>
        
        <div className="flex items-center gap-8">
          <Link to="/learn" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Learn
          </Link>
          <Link to="/pricing" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
