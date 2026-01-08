import { motion } from "framer-motion";
import { Lightbulb, TestTube2, TrendingUp, Rocket } from "lucide-react";

const steps = [
  {
    icon: Lightbulb,
    number: "01",
    title: "Describe your idea",
    description: "Tell the AI your trading concept in plain English. No coding required.",
  },
  {
    icon: TestTube2,
    number: "02",
    title: "Test safely",
    description: "Backtest against historical data to see how your strategy would have performed.",
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Paper trade",
    description: "Practice with virtual money using real market data. Zero risk, full learning.",
  },
  {
    icon: Rocket,
    number: "04",
    title: "Go live",
    description: "When you're confident, deploy your strategy to real markets.",
  },
];

const StepsSection = () => {
  return (
    <section className="py-32 px-6 bg-gradient-dark">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase mb-4">
            How it works
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-medium text-foreground">
            From idea to execution
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="group relative bg-gradient-card border border-border rounded-2xl p-8 hover-lift"
            >
              {/* Step number */}
              <span className="text-muted-foreground/30 font-display text-6xl font-bold absolute top-4 right-6">
                {step.number}
              </span>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-accent/10 transition-colors">
                <step.icon className="w-6 h-6 text-foreground group-hover:text-accent transition-colors" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-medium text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
