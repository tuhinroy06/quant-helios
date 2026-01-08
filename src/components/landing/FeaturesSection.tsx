import { motion } from "framer-motion";
import { Sparkles, Shield, BarChart3, Zap } from "lucide-react";

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
  {
    icon: Zap,
    title: "Real-Time Execution",
    description: "When you're ready, connect to your broker and trade with confidence.",
  },
];

function FeaturesSection() {
  return (
    <section className="py-32 md:py-40 px-6 md:px-12 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-warm-500/[0.02] to-transparent" />
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24"
        >
          <p className="text-label text-muted-foreground mb-4">Why Choose Us</p>
          <h2 className="font-display text-display-lg text-foreground">
            Built for
            <br />
            <span className="text-muted-foreground">modern traders</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group"
            >
              <div className="relative p-8 md:p-10 rounded-2xl border border-border bg-card/50 card-hover">
                {/* Warm accent on hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-warm-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-warm-500/10 transition-colors duration-300">
                    <feature.icon className="w-5 h-5 text-foreground/70 group-hover:text-warm-500 transition-colors duration-300" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-display text-display-md text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-body-md text-muted-foreground">
                    {feature.description}
                  </p>
                </div>

                {/* Corner accent */}
                <div className="absolute bottom-8 left-8 w-8 h-px bg-border group-hover:w-16 group-hover:bg-warm-500/40 transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
