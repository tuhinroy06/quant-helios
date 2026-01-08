import { motion } from "framer-motion";
import { PenLine, BarChart3, Wallet, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Describe Your Strategy",
    description: "Tell our AI what you want to achieve. No coding required.",
    icon: PenLine,
  },
  {
    number: "02",
    title: "Backtest & Refine",
    description: "See how your strategy performs against historical data.",
    icon: BarChart3,
  },
  {
    number: "03",
    title: "Paper Trade",
    description: "Practice with simulated money in real market conditions.",
    icon: Wallet,
  },
  {
    number: "04",
    title: "Go Live",
    description: "Deploy your strategy when you're confident and ready.",
    icon: Rocket,
  },
];

const StepsSection = () => {
  return (
    <section className="py-32 md:py-40 px-6 md:px-12 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24"
        >
          <p className="text-label text-muted-foreground mb-4">The Process</p>
          <h2 className="font-display text-display-lg text-foreground">
            Four steps to
            <br />
            <span className="text-muted-foreground">confident trading</span>
          </h2>
        </motion.div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative p-8 rounded-2xl border border-border bg-card/30 hover:bg-card/50 hover:border-border/80 transition-all duration-500 h-full">
                {/* Step number */}
                <div className="flex items-center justify-between mb-8">
                  <span className="font-display text-3xl font-light text-muted-foreground/30 group-hover:text-warm-500/50 transition-colors duration-300">
                    {step.number}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-warm-500/10 transition-colors duration-300">
                    <step.icon className="w-4 h-4 text-foreground/50 group-hover:text-warm-500 transition-colors duration-300" />
                  </div>
                </div>
                
                {/* Content */}
                <h3 className="font-display text-xl font-normal text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-body-sm text-muted-foreground">
                  {step.description}
                </p>

                {/* Connecting line to next step */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-border" />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
