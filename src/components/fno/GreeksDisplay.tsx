import { Greeks } from "@/lib/options-calculator";
import { Info } from "lucide-react";

interface GreeksDisplayProps {
  greeks: Greeks;
  price: number;
}

export const GreeksDisplay = ({ greeks, price }: GreeksDisplayProps) => {
  const greekData = [
    {
      name: "Delta",
      symbol: "Δ",
      value: greeks.delta.toFixed(4),
      description: "Rate of change in option price relative to stock price",
      color: greeks.delta >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      name: "Gamma",
      symbol: "Γ",
      value: greeks.gamma.toFixed(4),
      description: "Rate of change in Delta",
      color: "text-blue-500",
    },
    {
      name: "Theta",
      symbol: "Θ",
      value: greeks.theta.toFixed(4),
      description: "Time decay per day",
      color: greeks.theta >= 0 ? "text-green-500" : "text-red-500",
    },
    {
      name: "Vega",
      symbol: "V",
      value: greeks.vega.toFixed(4),
      description: "Sensitivity to volatility (per 1%)",
      color: "text-purple-500",
    },
    {
      name: "Rho",
      symbol: "ρ",
      value: greeks.rho.toFixed(4),
      description: "Sensitivity to interest rates (per 1%)",
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Option Price */}
      <div className="p-4 bg-white/5 rounded-xl border border-border">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Option Price</span>
          <span className="text-2xl font-bold text-foreground">₹{price.toFixed(2)}</span>
        </div>
      </div>

      {/* Greeks Grid */}
      <div className="grid grid-cols-2 gap-3">
        {greekData.map((greek) => (
          <div
            key={greek.name}
            className="p-3 bg-secondary rounded-lg group relative"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-mono text-muted-foreground">{greek.symbol}</span>
                <span className="text-sm text-foreground">{greek.name}</span>
              </div>
              <Info className="w-3 h-3 text-muted-foreground opacity-50" />
            </div>
            <p className={`text-xl font-medium ${greek.color}`}>
              {greek.value}
            </p>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-card border border-border rounded-lg text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {greek.description}
            </div>
          </div>
        ))}
      </div>

      {/* Greeks Explanation */}
      <div className="p-4 bg-card/50 border border-border rounded-xl">
        <h4 className="text-foreground font-medium mb-3 text-sm">Understanding Greeks</h4>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li>
            <strong className="text-foreground">Delta (Δ)</strong>: How much the option price moves for ₹1 move in stock
          </li>
          <li>
            <strong className="text-foreground">Gamma (Γ)</strong>: How fast Delta changes
          </li>
          <li>
            <strong className="text-foreground">Theta (Θ)</strong>: How much value the option loses per day
          </li>
          <li>
            <strong className="text-foreground">Vega (V)</strong>: Sensitivity to volatility changes
          </li>
          <li>
            <strong className="text-foreground">Rho (ρ)</strong>: Sensitivity to interest rate changes
          </li>
        </ul>
      </div>
    </div>
  );
};
