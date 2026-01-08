import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Warm atmospheric gradient */}
      <div className="absolute inset-0 bg-gradient-hero" />
      
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-warm-500/[0.03] rounded-full blur-[150px]" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(0 0% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 50%) 1px, transparent 1px)`,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Floating abstract shapes with warm tint */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full border border-warm-500/10"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ 
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-60 h-60 rounded-full border border-foreground/[0.03]"
        animate={{ 
          scale: [1, 1.15, 1],
          rotate: [360, 180, 0],
        }}
        transition={{ 
          duration: 50,
          repeat: Infinity,
          ease: "linear"
        }}
      />

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
