import { useEffect, useRef, useMemo } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { OptionLeg, generatePayoffDiagram, calculateBreakevens, calculateMaxProfitLoss } from "@/lib/options-calculator";
import { getLightweightChartTheme } from "@/lib/lightweight-charts-theme";

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

    const theme = getLightweightChartTheme();
    const el = containerRef.current;

    const chart = createChart(el, {
      width: Math.max(1, el.clientWidth),
      height,
      layout: {
        background: { color: "transparent" },
        textColor: theme.text,
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
      },
      grid: {
        vertLines: { color: theme.grid },
        horzLines: { color: theme.grid },
      },
      rightPriceScale: {
        borderColor: theme.border,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: theme.border,
        visible: false,
      },
      crosshair: {
        vertLine: {
          color: theme.crosshair,
          labelBackgroundColor: theme.labelBg,
        },
        horzLine: {
          color: theme.crosshair,
          labelBackgroundColor: theme.labelBg,
        },
      },
    });

    chartRef.current = chart;

    // Generate payoff data
    const payoffData = generatePayoffDiagram(legs, currentPrice, priceRange);

    // Use LineSeries for the payoff
    const lineSeries = chart.addLineSeries({
      color: theme.primary,
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
      color: theme.border,
      lineWidth: 1,
      lineStyle: 2,
      axisLabelVisible: false,
    });

    chart.timeScale().fitContent();

    const handleResize = () => {
      const w = Math.floor(el.clientWidth);
      if (w > 0) chart.applyOptions({ width: w });
    };

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(handleResize) : null;
    ro?.observe(el);
    window.addEventListener("resize", handleResize);
    // Ensure a post-layout resize in case initial width was 0
    requestAnimationFrame(handleResize);

    return () => {
      ro?.disconnect();
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
      <div ref={containerRef} className="w-full" style={{ height }} />

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
