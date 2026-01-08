import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-32 px-6 bg-gradient-dark relative overflow-hidden">
      {/* Gradient orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-4xl md:text-6xl font-medium text-foreground mb-6">
            Ready to build your
            <br />
            <span className="text-gradient-warm">first strategy?</span>
          </h2>

          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Start with paper trading. Learn the markets. Build confidence.
            Real trading comes when you're ready.
          </p>

          <Link to="/auth">
            <button className="group flex items-center gap-3 bg-foreground text-background px-10 py-5 rounded-full text-lg font-medium hover-lift mx-auto">
              Start Building
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
