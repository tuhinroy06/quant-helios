import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Check, ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <Link
            to="/auth"
            className="text-sm text-foreground hover:text-muted-foreground transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="font-display text-4xl md:text-5xl font-light text-foreground mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start free, upgrade when you're ready. No hidden fees, no surprises.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative bg-card/50 border rounded-2xl p-8 ${
                plan.popular
                  ? "border-white/30 ring-1 ring-white/10"
                  : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-white text-black text-xs font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-foreground font-medium text-lg mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-display font-light text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="text-muted-foreground text-sm mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/auth"
                className={`group w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                  plan.popular
                    ? "bg-white text-black hover:bg-white/90"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQ Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-20 text-center"
        >
          <p className="text-muted-foreground mb-4">Have questions?</p>
          <p className="text-foreground">
            Email us at{" "}
            <a
              href="mailto:support@algotradepro.com"
              className="underline underline-offset-4 hover:text-muted-foreground transition-colors"
            >
              support@algotradepro.com
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;
