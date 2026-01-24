// Centralized pricing configuration for the application
// All prices are in INR (Indian Rupees)

export interface PricingPlan {
  id: string;
  name: string;
  price: number | null; // null for custom pricing
  currency: "INR";
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  cta: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "INR",
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
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    currency: "INR",
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
    popular: true,
    cta: "Start Free Trial",
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    currency: "INR",
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
  },
];

export const formatPrice = (price: number | null, currency: "INR" = "INR"): string => {
  if (price === null) return "Custom";
  if (price === 0) return "₹0";
  return `₹${price.toLocaleString("en-IN")}`;
};

export const getPlanById = (id: string): PricingPlan | undefined => {
  return PRICING_PLANS.find((plan) => plan.id === id);
};
