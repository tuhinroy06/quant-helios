import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <>
      {/* Centered Logo at very top */}
      <motion.div 
        className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <Link to="/" className="font-display text-lg tracking-wide text-foreground/80 hover:text-foreground transition-colors">
          AlgoTrade Pro
        </Link>
      </motion.div>

      {/* Left navigation - micro1 style stacked links */}
      <motion.nav 
        className="fixed left-8 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Link 
          to="/learn" 
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Learn
        </Link>
        <Link 
          to="/pricing" 
          className="text-sm text-white/60 hover:text-white transition-colors"
        >
          Pricing
        </Link>
      </motion.nav>

      {/* Top-right CTA - micro1 style: arrow LEFT, text RIGHT */}
      <motion.div 
        className="fixed top-8 right-8 z-50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Link to="/auth">
          <button className="group flex items-center gap-3 bg-white text-black pr-5 pl-2 py-2 rounded-full text-sm font-medium hover:bg-white/90 transition-colors">
            <span className="flex items-center justify-center w-8 h-8 bg-black rounded-full">
              <ArrowRight className="w-4 h-4 text-white transition-transform group-hover:translate-x-0.5" />
            </span>
            <span>Get Started</span>
          </button>
        </Link>
      </motion.div>
    </>
  );
};

export default Navbar;
