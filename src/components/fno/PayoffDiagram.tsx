import { useMemo } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { OptionLeg, generatePayoffDiagram, calculateBreakevens, calculateMaxProfitLoss } from "@/lib/options-calculator";

interface PayoffDiagramProps {
  legs: OptionLeg[];
  currentPrice: number;
  priceRange?: number;
}

export const PayoffDiagram = ({ legs, currentPrice, priceRange = 0.3 }: PayoffDiagramProps) => {
  const payoffData = useMemo(() => {
    if (legs.length === 0) return [];
    return generatePayoffDiagram(legs, currentPrice, priceRange);
  }, [legs, currentPrice, priceRange]);

  const breakevens = useMemo(() => {
    if (legs.length === 0) return [];
    return calculateBreakevens(legs);
  }, [legs]);

  const { maxProfit, maxLoss } = useMemo(() => {
    if (legs.length === 0) return { maxProfit: 0, maxLoss: 0 };
    return calculateMaxProfitLoss(legs);
  }, [legs]);

  if (legs.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-muted-foreground">
        Add options to see payoff diagram
      </div>
    );
  }

  const minPayoff = Math.min(...payoffData.map(d => d.netPayoff));
  const maxPayoff = Math.max(...payoffData.map(d => d.netPayoff));
  const yAxisDomain = [
    Math.floor(minPayoff * 1.1),
    Math.ceil(maxPayoff * 1.1)
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground">Max Profit</p>
          <p className={`text-lg font-medium ${maxProfit >= 0 ? "text-[hsl(142_71%_45%)]" : "text-destructive"}`}>
            {maxProfit === Infinity ? "Unlimited" : `₹${maxProfit.toFixed(2)}`}
          </p>
        </div>
        <div className="p-3 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground">Max Loss</p>
          <p className={`text-lg font-medium ${maxLoss >= 0 ? "text-[hsl(142_71%_45%)]" : "text-destructive"}`}>
            {maxLoss === -Infinity ? "Unlimited" : `₹${maxLoss.toFixed(2)}`}
          </p>
        </div>
        <div className="p-3 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground">Breakeven(s)</p>
          <p className="text-lg font-medium text-foreground">
            {breakevens.length > 0 ? breakevens.map(b => `₹${b}`).join(", ") : "N/A"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={payoffData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3} />
                <stop offset="50%" stopColor="hsl(142 71% 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="hsl(0 72% 51%)" stopOpacity={0.3} />
                <stop offset="50%" stopColor="hsl(0 72% 51%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 14%)" />
            <XAxis
              dataKey="price"
              stroke="hsl(220 15% 25%)"
              tick={{ fill: "hsl(220 10% 50%)", fontSize: 12 }}
              tickFormatter={(value) => `₹${value}`}
            />
            <YAxis
              stroke="hsl(220 15% 25%)"
              tick={{ fill: "hsl(220 10% 50%)", fontSize: 12 }}
              domain={yAxisDomain}
              tickFormatter={(value) => `₹${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(220 18% 6%)",
                border: "1px solid hsl(220 15% 14%)",
                borderRadius: "8px",
              }}
              labelFormatter={(value) => `Stock Price: ₹${value}`}
              formatter={(value: number) => [
                `₹${value.toFixed(2)}`,
                "Net P/L"
              ]}
            />
            
            {/* Zero line */}
            <ReferenceLine y={0} stroke="hsl(220 15% 25%)" strokeDasharray="3 3" />
            
            {/* Current price line */}
            <ReferenceLine
              x={currentPrice}
              stroke="hsl(0 0% 98%)"
              strokeDasharray="5 5"
              label={{
                value: "Current",
                fill: "hsl(0 0% 98%)",
                fontSize: 12,
                position: "top"
              }}
            />

            {/* Breakeven lines */}
            {breakevens.map((be, idx) => (
              <ReferenceLine
                key={idx}
                x={be}
                stroke="hsl(38 92% 50%)"
                strokeDasharray="3 3"
              />
            ))}

            {/* Payoff area */}
            <Area
              type="monotone"
              dataKey="netPayoff"
              stroke="hsl(142 71% 45%)"
              fill="url(#profitGradient)"
              strokeWidth={2}
              isAnimationActive={false}
              dot={false}
              activeDot={{ r: 4, fill: "hsl(142 71% 45%)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-foreground rounded-full" />
          <span className="text-muted-foreground">Current Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-accent rounded-full" />
          <span className="text-muted-foreground">Breakeven</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[hsl(142_71%_45%)] rounded-full" />
          <span className="text-muted-foreground">Profit Zone</span>
        </div>
      </div>
    </div>
  );
};
