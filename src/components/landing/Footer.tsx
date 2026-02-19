import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const Footer = forwardRef<HTMLElement>(function Footer(_, ref) {
  return (
    <footer ref={ref} className="py-16 md:py-20 px-6 md:px-12 bg-background relative">
      {/* Top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-16">
          {/* Brand */}
          <div>
            <Link to="/" className="font-display text-xl text-foreground hover:text-foreground/80 transition-colors">
              AlgoTrade Pro
            </Link>
            <p className="text-muted-foreground text-sm mt-3 max-w-xs">
              Design, test, and refine trading strategies with AI assistance.
            </p>
          </div>

          {/* Navigation */}
          <nav className="flex flex-wrap gap-x-10 gap-y-4">
            {[
              { label: "Learn", href: "/learn" },
              { label: "Pricing", href: "/pricing" },
              { label: "Sign In", href: "/auth" },
            ].map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="group text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                {link.label}
                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between gap-4">
          <p className="text-sm text-muted-foreground/60">
            © {new Date().getFullYear()} AlgoTrade Pro. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
