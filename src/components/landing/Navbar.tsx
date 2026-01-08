import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 py-6 px-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <nav className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-display text-xl font-medium text-foreground">
          AlgoTrade Pro
        </Link>

        {/* Center links - hidden on mobile */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/learn" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            Learn
          </Link>
          <Link to="/pricing" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            Pricing
          </Link>
        </div>

        {/* CTA */}
        <Link to="/auth">
          <button className="group flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors">
            Sign In
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </Link>
      </nav>
    </motion.header>
  );
};

export default Navbar;
