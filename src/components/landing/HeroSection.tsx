import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Deep radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(30,30,30,1)_0%,_rgba(8,8,8,1)_70%)]" />
      
      {/* Subtle center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-white/[0.02] rounded-full blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Main headline - very large, thin, elegant */}
          <h1 className="font-display text-[clamp(3rem,12vw,10rem)] font-light leading-[0.95] tracking-tight text-foreground mb-12">
            Design and understand
            <br />
            <span className="text-foreground/60">trading strategies</span>
            <br />
            with AI
          </h1>

          {/* Subtext - subtle and refined */}
          <motion.p 
            className="text-muted-foreground text-base md:text-lg max-w-lg mx-auto mb-14 leading-relaxed font-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Test, practice, and learn before risking real money. 
            Build confidence with paper trading and AI-powered insights.
          </motion.p>

          {/* CTA - micro1 style pill with arrow circle */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
          >
            <Link to="/auth">
              <button className="group flex items-center gap-3 bg-white text-black pr-8 pl-3 py-3 rounded-full text-base font-medium hover:bg-white/90 transition-colors">
                <span className="flex items-center justify-center w-10 h-10 bg-black rounded-full">
                  <ArrowRight className="w-5 h-5 text-white transition-transform group-hover:translate-x-0.5" />
                </span>
                <span>Start Building</span>
              </button>
            </Link>
            <Link to="/learn">
              <span className="text-muted-foreground hover:text-foreground text-sm transition-colors cursor-pointer">
                How It Works
              </span>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
