import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Full-bleed hero background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Gradient overlay for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/50 via-transparent to-background/50" />
      
      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-radial-gradient pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, hsl(220 20% 4% / 0.4) 100%)'
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Eyebrow */}
          <motion.p
            className="text-label text-muted-foreground mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            AI-Powered Trading Strategies
          </motion.p>

          {/* Main headline - full contrast */}
          <h1 className="font-display text-display-xl text-foreground mb-6">
            Design and understand
            <br />
            <span className="text-muted-foreground">trading strategies</span>
            <br />
            with AI
          </h1>

          {/* Subtext - improved contrast */}
          <motion.p 
            className="text-body-lg text-muted-foreground max-w-2xl mx-auto mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Test, practice, and learn before risking real money. 
            Build confidence with paper trading and AI-powered insights.
          </motion.p>

          {/* CTAs - premium pill buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Link to="/auth">
              <button className="group flex items-center gap-4 bg-foreground text-background pl-6 pr-3 py-3 rounded-full text-base font-medium hover:bg-foreground/90 transition-all duration-300 shadow-glow-sm hover:shadow-glow-md">
                <span>Start Building</span>
                <span className="flex items-center justify-center w-10 h-10 bg-background/10 rounded-full">
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </Link>
            <Link to="/learn" className="group">
              <span className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                See How It Works
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </span>
            </Link>
          </motion.div>

          {/* Trust indicator */}
          <motion.div
            className="mt-16 flex items-center justify-center gap-3 text-muted-foreground/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="w-2 h-2 rounded-full bg-green-500/60" />
            <span className="text-sm">No credit card required • Start with paper trading</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <div className="flex flex-col items-center gap-3 text-muted-foreground/40">
          <span className="text-label">Scroll</span>
          <ChevronDown className="w-4 h-4 scroll-indicator" />
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
