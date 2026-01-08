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
    <section className="py-32 md:py-48 px-6 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-20 md:mb-32"
        >
          <p className="text-muted-foreground text-sm uppercase tracking-widest mb-4">The Process</p>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-light text-foreground leading-[0.95]">
            Four steps to
            <br />
            <span className="text-foreground/40">confident trading</span>
          </h2>
        </motion.div>

        {/* Timeline layout */}
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 md:left-12 top-0 bottom-0 w-px bg-gradient-to-b from-border via-border/50 to-transparent" />
          
          <div className="space-y-16 md:space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative flex items-start gap-8 md:gap-16 group pl-4"
              >
                {/* Step number with circle */}
                <div className="relative flex-shrink-0">
                  <div className="w-8 h-8 md:w-16 md:h-16 rounded-full bg-background border border-border flex items-center justify-center group-hover:border-foreground/30 transition-colors duration-300">
                    <span className="font-display text-sm md:text-xl font-light text-foreground/40 group-hover:text-foreground/70 transition-colors">
                      {step.number}
                    </span>
                  </div>
                  {/* Pulse dot */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-foreground/20 group-hover:bg-foreground/50 transition-colors pulse-dot" />
                </div>
                
                {/* Content */}
                <div className="pt-0 md:pt-4 flex-1">
                  <h3 className="font-display text-xl md:text-3xl font-light text-foreground mb-3 group-hover:text-foreground transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-base md:text-lg font-light max-w-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Large watermark number */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:block">
                  <span className="font-display text-[10rem] font-light text-foreground/[0.02] leading-none">
                    {step.number}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StepsSection;
