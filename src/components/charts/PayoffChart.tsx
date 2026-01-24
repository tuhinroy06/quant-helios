import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  OptionLeg,
  generatePayoffDiagram,
  calculateBreakevens,
  calculateMaxProfitLoss,
} from "@/lib/options-calculator";

interface PayoffChartProps {
  legs: OptionLeg[];
  currentPrice: number;
  priceRange?: number;
  height?: number;
}

export const PayoffChart = ({
  legs,
  currentPrice,
  priceRange = 0.3,
  height = 256,
}: PayoffChartProps) => {
  // Generate payoff data
  const payoffData = useMemo(() => {
    if (legs.length === 0) return [];
    return generatePayoffDiagram(legs, currentPrice, priceRange);
  }, [legs, currentPrice, priceRange]);

  // Calculate breakevens with currentPrice
  const breakevens = useMemo(() => {
    if (legs.length === 0) return [];
    return calculateBreakevens(legs, currentPrice);
  }, [legs, currentPrice]);

  // Calculate max profit/loss with currentPrice
  const { maxProfit, maxLoss } = useMemo(() => {
    if (legs.length === 0) return { maxProfit: 0, maxLoss: 0 };
    return calculateMaxProfitLoss(legs, currentPrice);
  }, [legs, currentPrice]);

  // Format chart data for Recharts
  const chartData = useMemo(() => {
    return payoffData.map((point) => ({
      price: point.price,
      payoff: point.netPayoff,
      // Split into profit/loss for gradient coloring
      profit: point.netPayoff > 0 ? point.netPayoff : 0,
      loss: point.netPayoff < 0 ? point.netPayoff : 0,
    }));
  }, [payoffData]);

  // Calculate domain for axes
  const priceDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 0];
    const prices = chartData.map((d) => d.price);
    return [Math.min(...prices), Math.max(...prices)];
  }, [chartData]);

  const payoffDomain = useMemo(() => {
    if (chartData.length === 0) return [-100, 100];
    const payoffs = chartData.map((d) => d.payoff);
    const min = Math.min(...payoffs);
    const max = Math.max(...payoffs);
    const padding = (max - min) * 0.1 || 50;
    return [min - padding, max + padding];
  }, [chartData]);

  // Format price for display
  const formatPrice = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  const formatPayoff = (value: number) => `₹${value.toFixed(0)}`;

  if (legs.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        Add options to see payoff diagram
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <div className="p-2 md:p-3 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground">Max Profit</p>
          <p
            className={`text-sm md:text-lg font-medium ${
              maxProfit >= 0 ? "text-green-500" : "text-destructive"
            }`}
          >
            {maxProfit === Infinity ? "Unlimited" : `₹${maxProfit.toFixed(0)}`}
          </p>
        </div>
        <div className="p-2 md:p-3 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground">Max Loss</p>
          <p
            className={`text-sm md:text-lg font-medium ${
              maxLoss >= 0 ? "text-green-500" : "text-destructive"
            }`}
          >
            {maxLoss === -Infinity ? "Unlimited" : `₹${maxLoss.toFixed(0)}`}
          </p>
        </div>
        <div className="p-2 md:p-3 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground">Breakeven</p>
          <p className="text-sm md:text-lg font-medium text-foreground truncate">
            {breakevens.length > 0
              ? breakevens.map((b) => `₹${b.toFixed(0)}`).join(", ")
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              {/* Gradient for profit area (green) */}
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05} />
              </linearGradient>
              {/* Gradient for loss area (red) */}
              <linearGradient id="lossGradient" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />

            <XAxis
              dataKey="price"
              type="number"
              domain={priceDomain}
              tickFormatter={formatPrice}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              tickCount={6}
            />

            <YAxis
              domain={payoffDomain}
              tickFormatter={formatPayoff}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              axisLine={{ stroke: "hsl(var(--border))" }}
              tickLine={{ stroke: "hsl(var(--border))" }}
              width={60}
            />

            {/* Zero line (breakeven reference) */}
            <ReferenceLine
              y={0}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />

            {/* Current price vertical line */}
            <ReferenceLine
              x={currentPrice}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              label={{
                value: "Current",
                position: "top",
                fill: "hsl(var(--primary))",
                fontSize: 10,
              }}
            />

            {/* Breakeven vertical lines */}
            {breakevens.map((be, idx) => (
              <ReferenceLine
                key={idx}
                x={be}
                stroke="hsl(var(--accent-foreground))"
                strokeDasharray="2 2"
                strokeWidth={1}
              />
            ))}

            {/* Main payoff area - using split coloring */}
            <Area
              type="monotone"
              dataKey="payoff"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#profitGradient)"
              fillOpacity={1}
              isAnimationActive={false}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              formatter={(value: number) => [
                `₹${value.toFixed(2)}`,
                value >= 0 ? "Profit" : "Loss",
              ]}
              labelFormatter={(label: number) => `Price: ₹${label.toLocaleString("en-IN")}`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-primary rounded-full" />
          <span className="text-muted-foreground">Current Price</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-0.5 bg-muted-foreground rounded-full" style={{ borderStyle: "dashed" }} />
          <span className="text-muted-foreground">Breakeven</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500/30 border border-green-500 rounded" />
          <span className="text-muted-foreground">Profit Zone</span>
        </div>
      </div>
    </div>
  );
};
