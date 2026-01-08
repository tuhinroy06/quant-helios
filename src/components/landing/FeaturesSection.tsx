import { motion } from "framer-motion";

const features = [
  {
    title: "AI Strategy Builder",
    description: "Natural language to trading logic. Describe what you want, and watch it come to life.",
  },
  {
    title: "Risk-Free Practice",
    description: "Paper trading with real market data. Learn without the stakes.",
  },
  {
    title: "Deep Analytics",
    description: "Understand every trade. Visualize performance and refine your approach.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-40 px-6 bg-background relative overflow-hidden">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/[0.01] to-transparent" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="font-display text-5xl md:text-7xl font-light text-foreground leading-tight">
            Built for
            <br />
            <span className="text-foreground/50">modern traders</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group"
            >
              <div className="h-px w-12 bg-foreground/20 mb-8 group-hover:w-20 group-hover:bg-foreground/40 transition-all duration-300" />
              <h3 className="font-display text-xl md:text-2xl font-light text-foreground mb-4">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-base font-light leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
