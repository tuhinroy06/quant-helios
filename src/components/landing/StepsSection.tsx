import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Describe Your Strategy",
    description: "Tell our AI what you want to achieve. No coding required.",
  },
  {
    number: "02",
    title: "Backtest & Refine",
    description: "See how your strategy performs against historical data.",
  },
  {
    number: "03",
    title: "Paper Trade",
    description: "Practice with simulated money in real market conditions.",
  },
  {
    number: "04",
    title: "Go Live",
    description: "Deploy your strategy when you're confident and ready.",
  },
];

const StepsSection = () => {
  return (
    <section className="py-40 px-6 bg-background relative">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24"
        >
          <h2 className="font-display text-5xl md:text-7xl font-light text-foreground leading-tight">
            Four steps to
            <br />
            <span className="text-foreground/50">confident trading</span>
          </h2>
        </motion.div>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex items-start gap-8 md:gap-16 group"
            >
              <span className="font-display text-4xl md:text-6xl font-light text-foreground/20 group-hover:text-foreground/40 transition-colors">
                {step.number}
              </span>
              <div className="pt-2 md:pt-4">
                <h3 className="font-display text-2xl md:text-3xl font-light text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-base md:text-lg font-light max-w-md">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
