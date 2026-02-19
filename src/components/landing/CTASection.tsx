import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = forwardRef<HTMLElement>(function CTASection(_, ref) {
  return (
    <section ref={ref} className="py-32 md:py-40 px-6 md:px-12 bg-background relative overflow-hidden">
      {/* Top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Warm gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-500/[0.02] to-transparent" />
      
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-warm-500/[0.03] rounded-full blur-[120px]" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-label text-muted-foreground mb-6">Get Started</p>
          
          <h2 className="font-display text-display-lg text-foreground mb-6">
            Ready to build your
            <br />
            <span className="text-muted-foreground">first strategy?</span>
          </h2>
          
          <p className="text-body-lg text-muted-foreground max-w-xl mx-auto mb-12">
            Join traders who are learning and practicing with our AI-powered platform. Start with paper trading—no risk involved.
          </p>
          
          <Link to="/auth">
            <button className="group inline-flex items-center gap-4 bg-foreground text-background pl-8 pr-4 py-4 rounded-full text-base font-medium hover:bg-foreground/90 transition-all duration-300 shadow-glow-sm hover:shadow-glow-md">
              <span>Start Building</span>
              <span className="flex items-center justify-center w-10 h-10 bg-background/10 rounded-full">
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default CTASection;
