import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import MobileNav from "./MobileNav";

const Navbar = () => {
  return (
    <>
      {/* Centered Logo at very top */}
      <motion.div 
        className="fixed top-6 md:top-8 left-1/2 -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Link 
          to="/" 
          className="font-display text-lg tracking-wide text-foreground hover:text-foreground/80 transition-colors"
        >
          AlgoTrade Pro
        </Link>
      </motion.div>

      {/* Left navigation - fixed at top */}
      <motion.nav 
        className="fixed left-8 md:left-12 top-8 z-50 hidden md:flex flex-row items-center gap-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Link 
          to="/learn" 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Learn
        </Link>
        <Link 
          to="/pricing" 
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Pricing
        </Link>
      </motion.nav>

      {/* Top-right CTA */}
      <motion.div 
        className="fixed top-8 right-8 md:right-12 z-50 hidden md:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Link to="/auth">
          <button className="group flex items-center gap-3 bg-foreground text-background pl-2.5 pr-5 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 transition-all duration-300 shadow-sm">
            <span className="flex items-center justify-center w-7 h-7 bg-background/10 rounded-full">
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
            <span>Get Started</span>
          </button>
        </Link>
      </motion.div>

      {/* Mobile Navigation */}
      <MobileNav />
    </>
  );
};

export default Navbar;
