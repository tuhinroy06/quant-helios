import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Deep atmospheric gradient */}
      <div className="absolute inset-0 bg-gradient-radial-center" />
      
      {/* Subtle center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-white/[0.015] rounded-full blur-[120px]" />
      
      {/* Floating abstract shapes */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full border border-white/[0.03]"
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
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full border border-white/[0.02]"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [360, 180, 0],
        }}
        transition={{ 
          duration: 45,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Main headline - dramatic scale */}
          <h1 className="font-display text-[clamp(2.5rem,10vw,9rem)] font-light leading-[0.9] tracking-tight text-foreground mb-8">
            Design and understand
            <br />
            <span className="text-foreground/50">trading strategies</span>
            <br />
            with AI
          </h1>

          {/* Subtext - refined and minimal */}
          <motion.p 
            className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto mb-16 leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}
          >
            Test, practice, and learn before risking real money. 
            Build confidence with paper trading and AI-powered insights.
          </motion.p>

          {/* CTAs - micro1 style pill buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <Link to="/auth">
              <button className="group flex items-center gap-3 bg-primary text-primary-foreground pl-4 pr-8 py-3.5 rounded-full text-base font-medium hover:bg-primary/90 transition-all duration-300">
                <span className="flex items-center justify-center w-10 h-10 bg-primary-foreground/10 rounded-full">
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
                </span>
                <span>Start Building</span>
              </button>
            </Link>
            <Link to="/learn" className="group">
              <span className="text-muted-foreground hover:text-foreground text-sm transition-colors flex items-center gap-2">
                How It Works
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-4 h-4 scroll-indicator" />
        </div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
