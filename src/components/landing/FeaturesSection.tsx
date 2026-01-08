import { motion } from "framer-motion";
import { Sparkles, Shield, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Strategy Builder",
    description: "Natural language to trading logic. Describe what you want, and watch it come to life.",
  },
  {
    icon: Shield,
    title: "Risk-Free Practice",
    description: "Paper trading with real market data. Learn without the stakes.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Understand every trade. Visualize performance and refine your approach.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-32 md:py-48 px-6 bg-background relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/[0.01] to-transparent" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-32"
        >
          <p className="text-muted-foreground text-sm uppercase tracking-widest mb-4">Why Choose Us</p>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-foreground leading-[0.95]">
            Built for
            <br />
            <span className="text-foreground/40">modern traders</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative"
            >
              {/* Card with subtle border */}
              <div className="relative p-8 rounded-2xl border border-border bg-card/30 hover:bg-card/50 hover:border-border/60 transition-all duration-500">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-secondary/80 transition-colors">
                  <feature.icon className="w-6 h-6 text-foreground/70" />
                </div>
                
                {/* Content */}
                <h3 className="font-display text-xl md:text-2xl font-light text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-base font-light leading-relaxed">
                  {feature.description}
                </p>

                {/* Decorative line */}
                <div className="absolute bottom-8 left-8 w-8 h-px bg-foreground/10 group-hover:w-12 group-hover:bg-foreground/20 transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
