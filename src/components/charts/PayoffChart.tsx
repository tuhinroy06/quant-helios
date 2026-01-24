import { useEffect, useRef, useMemo } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { OptionLeg, generatePayoffDiagram, calculateBreakevens, calculateMaxProfitLoss } from "@/lib/options-calculator";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const breakevens = useMemo(() => {
    if (legs.length === 0) return [];
    return calculateBreakevens(legs);
  }, [legs]);

  const { maxProfit, maxLoss } = useMemo(() => {
    if (legs.length === 0) return { maxProfit: 0, maxLoss: 0 };
    return calculateMaxProfitLoss(legs);
  }, [legs]);

  useEffect(() => {
    if (!containerRef.current || legs.length === 0) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "hsl(220 10% 50%)",
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: "hsl(220 15% 14%)" },
        horzLines: { color: "hsl(220 15% 14%)" },
      },
      rightPriceScale: {
        borderColor: "hsl(220 15% 14%)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "hsl(220 15% 14%)",
        visible: false,
      },
      crosshair: {
        vertLine: {
          color: "hsl(220 10% 40%)",
          labelBackgroundColor: "hsl(220 18% 10%)",
        },
        horzLine: {
          color: "hsl(220 10% 40%)",
          labelBackgroundColor: "hsl(220 18% 10%)",
        },
      },
    });

    chartRef.current = chart;

    // Generate payoff data
    const payoffData = generatePayoffDiagram(legs, currentPrice, priceRange);

    // Use LineSeries for the payoff
    const lineSeries = chart.addLineSeries({
      color: "hsl(142 71% 45%)",
      lineWidth: 2,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `₹${price.toFixed(0)}`,
      },
    });

    seriesRef.current = lineSeries;

    // Convert payoff data to chart format
    // Use synthetic time values based on price
    const baseDate = new Date("2024-01-01");
    const chartData = payoffData.map((point, index) => ({
      time: new Date(baseDate.getTime() + index * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0] as string,
      value: point.netPayoff,
    }));

    lineSeries.setData(chartData);

    // Add zero line
    lineSeries.createPriceLine({
      price: 0,
      color: "hsl(220 15% 25%)",
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: false,
    });

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [legs, currentPrice, priceRange, height]);

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
      <div className="grid grid-cols-3 gap-4">
        <div className="p-3 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground">Max Profit</p>
          <p
            className={`text-lg font-medium ${
              maxProfit >= 0 ? "text-[hsl(142_71%_45%)]" : "text-destructive"
            }`}
          >
            {maxProfit === Infinity ? "Unlimited" : `₹${maxProfit.toFixed(2)}`}
          </p>
        </div>
        <div className="p-3 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground">Max Loss</p>
          <p
            className={`text-lg font-medium ${
              maxLoss >= 0 ? "text-[hsl(142_71%_45%)]" : "text-destructive"
            }`}
          >
            {maxLoss === -Infinity ? "Unlimited" : `₹${maxLoss.toFixed(2)}`}
          </p>
        </div>
        <div className="p-3 bg-secondary rounded-lg">
          <p className="text-xs text-muted-foreground">Breakeven(s)</p>
          <p className="text-lg font-medium text-foreground">
            {breakevens.length > 0
              ? breakevens.map((b) => `₹${b}`).join(", ")
              : "N/A"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div ref={containerRef} style={{ height }} />

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
