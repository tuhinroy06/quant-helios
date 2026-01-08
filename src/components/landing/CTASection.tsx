import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-40 px-6 bg-background relative overflow-hidden">
      {/* Subtle center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-white/[0.015] rounded-full blur-3xl" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-display text-5xl md:text-8xl font-light text-foreground leading-[0.95] mb-10">
            Ready to build
            <br />
            <span className="text-foreground/50">your first strategy?</span>
          </h2>

          <p className="text-muted-foreground text-base md:text-lg mb-12 max-w-md mx-auto font-light">
            Start with paper trading. Learn the markets. 
            Real trading comes when you're ready.
          </p>

          <Link to="/auth">
            <button className="group flex items-center gap-3 bg-foreground text-background pl-8 pr-3 py-3 rounded-full text-base font-medium hover:bg-foreground/90 transition-colors mx-auto">
              <span>Start Building</span>
              <span className="flex items-center justify-center w-10 h-10 bg-background rounded-full">
                <ArrowRight className="w-5 h-5 text-foreground transition-transform group-hover:translate-x-0.5" />
              </span>
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
