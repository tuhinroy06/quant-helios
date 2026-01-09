import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "forever",
      description: "Perfect for exploring and learning",
      features: [
        "3 strategies",
        "Paper trading",
        "Basic backtesting",
        "Community support",
        "Educational resources",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      price: "₹999",
      period: "/month",
      description: "For serious retail traders",
      features: [
        "Unlimited strategies",
        "Advanced backtesting",
        "F&O simulator",
        "AI stock ranking",
        "Priority support",
        "API access",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For institutions and teams",
      features: [
        "Everything in Pro",
        "Live trading integration",
        "Custom indicators",
        "Dedicated support",
        "Team collaboration",
        "SLA guarantee",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-warm-500/[0.03] via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-warm-500/[0.02] rounded-full blur-[150px] pointer-events-none" />
      
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 md:pt-40 pb-16 px-6 md:px-12 relative">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <span className="text-label text-warm-500 mb-4 block">PRICING</span>
            <h1 className="font-display text-display-xl text-foreground mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-body-lg text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees, no surprises.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className={`group relative bg-card/50 border rounded-2xl p-8 transition-all duration-300 ${
                  plan.popular
                    ? "border-warm-500/50 shadow-lg shadow-warm-500/10"
                    : "border-border hover:border-warm-500/30"
                }`}
              >
                {/* Popular glow */}
                {plan.popular && (
                  <>
                    <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-warm-500/20 to-transparent pointer-events-none" />
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-warm-500 text-background text-xs font-medium px-4 py-1.5 rounded-full">
                        Most Popular
                      </span>
                    </div>
                  </>
                )}

                <div className="relative mb-8">
                  <h3 className="text-foreground font-medium text-lg mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-display-md font-display text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mt-3">{plan.description}</p>
                </div>

                <ul className="relative space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-sm">
                      <div className="flex items-center justify-center w-5 h-5 bg-warm-500/20 rounded-full">
                        <Check className="w-3 h-3 text-warm-500" />
                      </div>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to="/auth" className="relative block">
                  <button
                    className={`group/btn w-full flex items-center justify-center gap-3 px-6 py-4 rounded-full text-sm font-medium transition-all duration-300 ${
                      plan.popular
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "bg-secondary text-foreground hover:bg-warm-500/20 hover:text-warm-500"
                    }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Teaser */}
      <section className="py-20 px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="max-w-6xl mx-auto text-center"
        >
          <p className="text-muted-foreground mb-4">Have questions?</p>
          <p className="text-foreground">
            Email us at{" "}
            <a
              href="mailto:support@algotradepro.com"
              className="text-warm-500 hover:text-warm-400 transition-colors underline underline-offset-4"
            >
              support@algotradepro.com
            </a>
          </p>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
