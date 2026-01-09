import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import MobileNav from "./MobileNav";

const Navbar = () => {
  return (
    <>
      {/* Desktop Navigation - proper centered layout */}
      <motion.nav 
        className="fixed top-6 md:top-8 left-0 right-0 z-50 hidden md:flex items-center justify-between px-8 md:px-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Left navigation */}
        <div className="flex items-center gap-6 w-[200px]">
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
        </div>

        {/* Centered Logo */}
        <Link 
          to="/" 
          className="font-display text-lg tracking-wide text-foreground hover:text-foreground/80 transition-colors"
        >
          AlgoTrade Pro
        </Link>

        {/* Right CTA */}
        <div className="flex justify-end w-[200px]">
          <Link to="/auth">
            <button className="group flex items-center gap-3 bg-foreground text-background pl-2.5 pr-5 py-2 rounded-full text-sm font-medium hover:bg-foreground/90 transition-all duration-300 shadow-sm">
              <span className="flex items-center justify-center w-7 h-7 bg-background/10 rounded-full">
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span>Get Started</span>
            </button>
          </Link>
        </div>
      </motion.nav>

      {/* Mobile Logo - centered */}
      <motion.div 
        className="fixed top-6 left-1/2 -translate-x-1/2 z-40 md:hidden"
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

      {/* Mobile Navigation */}
      <MobileNav />
    </>
  );
};

export default Navbar;
