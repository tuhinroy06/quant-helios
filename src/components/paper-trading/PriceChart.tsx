import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData } from "lightweight-charts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, LineChart, RefreshCw } from "lucide-react";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";
import { useWebSocketPrices } from "@/hooks/useWebSocketPrices";
import { INDIAN_STOCKS, formatINRSimple, getStockBySymbol } from "@/lib/indian-stocks";
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from "./ConnectionStatus";

interface PriceChartProps {
  symbol: string;
}

type ChartType = "candlestick" | "line";
type TimeRange = "1M" | "3M" | "6M" | "1Y";

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  "1M": 30,
  "3M": 90,
  "6M": 180,
  "1Y": 365,
};

export const PriceChart = ({ symbol }: PriceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [timeRange, setTimeRange] = useState<TimeRange>("3M");
  const [showVolume, setShowVolume] = useState(true);

  const { data, loading, error, refetch } = useHistoricalPrices({
    symbol,
    days: TIME_RANGE_DAYS[timeRange],
    enabled: !!symbol,
  });

  const { prices, connected, connecting, lastUpdated } = useWebSocketPrices({
    symbols: symbol ? [symbol] : [],
    enabled: !!symbol,
  });

  const currentPrice = prices[symbol];
  const stockInfo = getStockBySymbol(symbol);
  const price = currentPrice?.price || stockInfo?.price || 0;
  const changePercent = currentPrice?.changePercent || 0;
  const isPositive = changePercent >= 0;

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "hsl(var(--muted-foreground))",
      },
      grid: {
        vertLines: { color: "hsl(var(--border) / 0.5)" },
        horzLines: { color: "hsl(var(--border) / 0.5)" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "hsl(var(--border))",
      },
      timeScale: {
        borderColor: "hsl(var(--border))",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        vertTouchDrag: false,
      },
    });

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // Update chart data
  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    // Remove old series safely (check if chart still has the series)
    try {
      if (seriesRef.current) {
        chartRef.current.removeSeries(seriesRef.current);
      }
    } catch (e) {
      // Series already removed or chart destroyed
    }
    try {
      if (volumeSeriesRef.current) {
        chartRef.current.removeSeries(volumeSeriesRef.current);
      }
    } catch (e) {
      // Series already removed or chart destroyed
    }

    // Add new series based on chart type
    if (chartType === "candlestick") {
      const candlestickSeries = chartRef.current.addCandlestickSeries({
        upColor: "hsl(142 71% 45%)",
        downColor: "hsl(0 72% 51%)",
        borderUpColor: "hsl(142 71% 45%)",
        borderDownColor: "hsl(0 72% 51%)",
        wickUpColor: "hsl(142 71% 45%)",
        wickDownColor: "hsl(0 72% 51%)",
      });

      const candleData: CandlestickData[] = data.map((d) => ({
        time: d.time as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));

      candlestickSeries.setData(candleData);
      seriesRef.current = candlestickSeries;
    } else {
      const lineSeries = chartRef.current.addLineSeries({
        color: "hsl(var(--primary))",
        lineWidth: 2,
      });

      const lineData: LineData[] = data.map((d) => ({
        time: d.time as any,
        value: d.close,
      }));

      lineSeries.setData(lineData);
      seriesRef.current = lineSeries;
    }

    // Add volume
    if (showVolume) {
      const volumeSeries = chartRef.current.addHistogramSeries({
        color: "hsl(var(--primary) / 0.3)",
        priceFormat: {
          type: "volume",
        },
        priceScaleId: "",
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      const volumeData = data.map((d) => ({
        time: d.time as any,
        value: d.volume || 0,
        color: d.close >= d.open ? "hsl(142 71% 45% / 0.4)" : "hsl(0 72% 51% / 0.4)",
      }));

      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;
    }

    chartRef.current.timeScale().fitContent();
  }, [data, chartType, showVolume]);

  if (!symbol) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">Select a stock to view chart</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium text-foreground">{symbol}</h3>
              <span className="text-sm text-muted-foreground">
                {stockInfo?.name || symbol}
              </span>
              <ConnectionStatus connected={connected} connecting={connecting} lastUpdated={lastUpdated} />
            </div>
            <div className="flex items-center gap-3 mt-1">
              <motion.span 
                key={price}
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                className="text-2xl font-semibold text-foreground"
              >
                {formatINRSimple(price)}
              </motion.span>
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  isPositive ? "text-[hsl(142_71%_45%)]" : "text-destructive"
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                {isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Time Range */}
          <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
            {(["1M", "3M", "6M", "1Y"] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Chart Type & Volume */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-secondary/50 rounded-lg p-1">
              <button
                onClick={() => setChartType("candlestick")}
                className={`p-1.5 rounded-md transition-colors ${
                  chartType === "candlestick"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Candlestick"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`p-1.5 rounded-md transition-colors ${
                  chartType === "line"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Line"
              >
                <LineChart className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                showVolume
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-secondary/50 text-muted-foreground"
              }`}
            >
              Vol
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative h-[350px] bg-card">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-full max-w-xs h-32 bg-secondary rounded-lg shimmer" />
              <div className="flex items-center gap-2 text-muted-foreground">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading chart...</span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-secondary/50 z-10">
            <div className="text-center">
              <p className="text-destructive mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={refetch}>
                Retry
              </Button>
            </div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full h-full bg-card" />
      </div>
    </div>
  );
};
