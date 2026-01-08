import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="py-32 md:py-48 px-6 bg-background relative overflow-hidden">
      {/* Top border */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Subtle center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-white/[0.01] rounded-full blur-[100px]" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-muted-foreground text-sm uppercase tracking-widest mb-6">Get Started</p>
          
          <h2 className="font-display text-4xl md:text-6xl lg:text-8xl font-light text-foreground leading-[0.9] mb-10">
            Ready to build
            <br />
            <span className="text-foreground/40">your first strategy?</span>
          </h2>

          <p className="text-muted-foreground text-lg md:text-xl mb-14 max-w-lg mx-auto font-light leading-relaxed">
            Start with paper trading. Learn the markets. 
            Real trading comes when you're ready.
          </p>

          <Link to="/auth">
            <button className="group flex items-center gap-3 bg-primary text-primary-foreground pl-4 pr-8 py-3.5 rounded-full text-base font-medium hover:bg-primary/90 transition-all duration-300 mx-auto">
              <span className="flex items-center justify-center w-10 h-10 bg-primary-foreground/10 rounded-full">
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </span>
              <span>Start Building</span>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
});

CTASection.displayName = "CTASection";

export default CTASection;
