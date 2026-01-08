import { motion } from "framer-motion";
import { Brain, Shield, BarChart3, Zap } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Strategy Creation",
    description: "Describe your trading ideas in natural language. Our AI translates them into executable strategies.",
  },
  {
    icon: Shield,
    title: "Risk-Free Learning",
    description: "Paper trading with real market data. Learn and iterate without risking a single dollar.",
  },
  {
    icon: BarChart3,
    title: "Deep Analytics",
    description: "Comprehensive backtesting with metrics that matter: Sharpe ratio, max drawdown, win rate, and more.",
  },
  {
    icon: Zap,
    title: "Real-Time Execution",
    description: "When you're ready, deploy strategies to live markets with confidence.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-32 px-6 bg-background relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/3 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase mb-4">
            Features
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground">
            Everything you need
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group flex gap-6 p-6 rounded-2xl hover:bg-card/50 transition-colors"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                <feature.icon className="w-7 h-7 text-foreground group-hover:text-accent transition-colors" />
              </div>

              {/* Content */}
              <div>
                <h3 className="font-display text-xl font-medium text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
