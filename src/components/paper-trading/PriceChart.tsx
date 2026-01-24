import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, LineData } from "lightweight-charts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3, LineChart, RefreshCw } from "lucide-react";
import { useHistoricalPrices } from "@/hooks/useHistoricalPrices";
import { useAlphaVantagePrices } from "@/hooks/useAlphaVantagePrices";
import { useChartIndicators } from "@/hooks/useChartIndicators";
import { formatINRSimple, getStockBySymbol } from "@/lib/indian-stocks";
import { Button } from "@/components/ui/button";
import { ConnectionStatus } from "./ConnectionStatus";
import { IndicatorControls, IndicatorSettings } from "./IndicatorControls";

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

// Color constants for lightweight-charts (must be hex/rgba, not CSS variables)
const COLORS = {
  green: "#22c55e",
  red: "#ef4444",
  blue: "#3b82f6",
  yellow: "#eab308",
  purple: "#a855f7",
  cyan: "#06b6d4",
  orange: "#f97316",
  pink: "#ec4899",
  grid: "rgba(255, 255, 255, 0.1)",
  border: "rgba(255, 255, 255, 0.2)",
  text: "#a1a1aa",
};

export const PriceChart = ({ symbol }: PriceChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);
  const macdContainerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);
  const macdChartRef = useRef<IChartApi | null>(null);

  const seriesRef = useRef<ISeriesApi<"Candlestick"> | ISeriesApi<"Line"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  // Indicator series refs
  const sma20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbUpperSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbMiddleSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bbLowerSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const macdSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const signalSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const histogramSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  const [chartType, setChartType] = useState<ChartType>("candlestick");
  const [timeRange, setTimeRange] = useState<TimeRange>("3M");
  const [showVolume, setShowVolume] = useState(true);
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    sma20: false,
    ema50: false,
    bollinger: false,
    rsi: false,
    macd: false,
  });

  const { data, loading, error, refetch } = useHistoricalPrices({
    symbol,
    days: TIME_RANGE_DAYS[timeRange],
    enabled: !!symbol,
  });

  const { prices, loading: pricesLoading, isDataFresh, lastUpdated } = useAlphaVantagePrices({
    symbols: symbol ? [symbol] : [],
    enabled: !!symbol,
  });

  // Calculate indicators
  const calculatedIndicators = useChartIndicators(data);

  const currentPrice = prices[symbol];
  const stockInfo = getStockBySymbol(symbol);
  const price = currentPrice?.price || stockInfo?.price || 0;
  const changePercent = currentPrice?.changePercent || 0;
  const isPositive = changePercent >= 0;

  const handleIndicatorToggle = (indicator: keyof IndicatorSettings) => {
    setIndicators((prev) => ({ ...prev, [indicator]: !prev[indicator] }));
  };

  // Helper to create chart with common options
  const createChartWithOptions = (container: HTMLDivElement, height: number) => {
    return createChart(container, {
      width: container.clientWidth || 600,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: COLORS.text,
      },
      grid: {
        vertLines: { color: COLORS.grid },
        horzLines: { color: COLORS.grid },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: COLORS.border },
      timeScale: {
        borderColor: COLORS.border,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });
  };

  // Initialize main chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChartWithOptions(chartContainerRef.current, 350);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0] && chartRef.current) {
        const { width } = entries[0].contentRect;
        if (width > 0) {
          chartRef.current.applyOptions({ width });
        }
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, []);

  // Initialize RSI chart
  useEffect(() => {
    if (!rsiContainerRef.current || !indicators.rsi) return;

    const chart = createChartWithOptions(rsiContainerRef.current, 100);
    chart.timeScale().fitContent();
    rsiChartRef.current = chart;

    // Add RSI reference lines
    const rsiSeries = chart.addLineSeries({
      color: COLORS.orange,
      lineWidth: 2,
      priceScaleId: "right",
    });
    rsiSeriesRef.current = rsiSeries;

    // Sync time scales
    if (chartRef.current) {
      chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range && chartRef.current) {
          chartRef.current.timeScale().setVisibleLogicalRange(range);
        }
      });
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0] && rsiChartRef.current) {
        const { width } = entries[0].contentRect;
        if (width > 0) {
          rsiChartRef.current.applyOptions({ width });
        }
      }
    });
    resizeObserver.observe(rsiContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      rsiSeriesRef.current = null;
      chart.remove();
      rsiChartRef.current = null;
    };
  }, [indicators.rsi]);

  // Initialize MACD chart
  useEffect(() => {
    if (!macdContainerRef.current || !indicators.macd) return;

    const chart = createChartWithOptions(macdContainerRef.current, 100);
    chart.timeScale().fitContent();
    macdChartRef.current = chart;

    // Add MACD series
    const macdSeries = chart.addLineSeries({
      color: COLORS.blue,
      lineWidth: 2,
    });
    macdSeriesRef.current = macdSeries;

    const signalSeries = chart.addLineSeries({
      color: COLORS.orange,
      lineWidth: 2,
    });
    signalSeriesRef.current = signalSeries;

    const histogramSeries = chart.addHistogramSeries({
      color: COLORS.pink,
    });
    histogramSeriesRef.current = histogramSeries;

    // Sync time scales
    if (chartRef.current) {
      chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
        if (range && chartRef.current) {
          chartRef.current.timeScale().setVisibleLogicalRange(range);
        }
      });
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0] && macdChartRef.current) {
        const { width } = entries[0].contentRect;
        if (width > 0) {
          macdChartRef.current.applyOptions({ width });
        }
      }
    });
    resizeObserver.observe(macdContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      macdSeriesRef.current = null;
      signalSeriesRef.current = null;
      histogramSeriesRef.current = null;
      chart.remove();
      macdChartRef.current = null;
    };
  }, [indicators.macd]);

  // Update main chart data and overlay indicators
  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const chart = chartRef.current;
    const sortedData = [...data].sort((a, b) => a.time - b.time);

    // Remove old main series
    const removeSeriesSafely = (ref: React.MutableRefObject<ISeriesApi<any> | null>) => {
      try {
        if (ref.current) {
          chart.removeSeries(ref.current);
          ref.current = null;
        }
      } catch {
        ref.current = null;
      }
    };

    removeSeriesSafely(seriesRef);
    removeSeriesSafely(volumeSeriesRef);
    removeSeriesSafely(sma20SeriesRef);
    removeSeriesSafely(ema50SeriesRef);
    removeSeriesSafely(bbUpperSeriesRef);
    removeSeriesSafely(bbMiddleSeriesRef);
    removeSeriesSafely(bbLowerSeriesRef);

    // Add price series
    if (chartType === "candlestick") {
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: COLORS.green,
        downColor: COLORS.red,
        borderUpColor: COLORS.green,
        borderDownColor: COLORS.red,
        wickUpColor: COLORS.green,
        wickDownColor: COLORS.red,
      });
      const candleData: CandlestickData[] = sortedData.map((d) => ({
        time: d.time as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }));
      candlestickSeries.setData(candleData);
      seriesRef.current = candlestickSeries;
    } else {
      const lineSeries = chart.addLineSeries({
        color: COLORS.blue,
        lineWidth: 2,
      });
      const lineData: LineData[] = sortedData.map((d) => ({
        time: d.time as any,
        value: d.close,
      }));
      lineSeries.setData(lineData);
      seriesRef.current = lineSeries;
    }

    // Add volume
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        color: "rgba(59, 130, 246, 0.3)",
        priceFormat: { type: "volume" },
        priceScaleId: "",
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      const volumeData = sortedData.map((d) => ({
        time: d.time as any,
        value: d.volume || 0,
        color: d.close >= d.open ? "rgba(34, 197, 94, 0.4)" : "rgba(239, 68, 68, 0.4)",
      }));
      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;
    }

    // Add SMA 20
    if (indicators.sma20 && calculatedIndicators.sma20.length > 0) {
      const sma20Series = chart.addLineSeries({
        color: COLORS.yellow,
        lineWidth: 1,
        priceScaleId: "right",
      });
      const smaData: LineData[] = sortedData
        .map((d, i) => ({
          time: d.time as any,
          value: calculatedIndicators.sma20[i],
        }))
        .filter((d) => !isNaN(d.value));
      sma20Series.setData(smaData);
      sma20SeriesRef.current = sma20Series;
    }

    // Add EMA 50
    if (indicators.ema50 && calculatedIndicators.ema50.length > 0) {
      const ema50Series = chart.addLineSeries({
        color: COLORS.purple,
        lineWidth: 1,
        priceScaleId: "right",
      });
      const emaData: LineData[] = sortedData
        .map((d, i) => ({
          time: d.time as any,
          value: calculatedIndicators.ema50[i],
        }))
        .filter((d) => !isNaN(d.value));
      ema50Series.setData(emaData);
      ema50SeriesRef.current = ema50Series;
    }

    // Add Bollinger Bands
    if (indicators.bollinger && calculatedIndicators.bollinger.upper.length > 0) {
      const bbUpper = chart.addLineSeries({
        color: COLORS.cyan,
        lineWidth: 1,
        lineStyle: 2, // Dashed
        priceScaleId: "right",
      });
      const bbMiddle = chart.addLineSeries({
        color: COLORS.cyan,
        lineWidth: 1,
        priceScaleId: "right",
      });
      const bbLower = chart.addLineSeries({
        color: COLORS.cyan,
        lineWidth: 1,
        lineStyle: 2,
        priceScaleId: "right",
      });

      const upperData: LineData[] = sortedData
        .map((d, i) => ({ time: d.time as any, value: calculatedIndicators.bollinger.upper[i] }))
        .filter((d) => !isNaN(d.value));
      const middleData: LineData[] = sortedData
        .map((d, i) => ({ time: d.time as any, value: calculatedIndicators.bollinger.middle[i] }))
        .filter((d) => !isNaN(d.value));
      const lowerData: LineData[] = sortedData
        .map((d, i) => ({ time: d.time as any, value: calculatedIndicators.bollinger.lower[i] }))
        .filter((d) => !isNaN(d.value));

      bbUpper.setData(upperData);
      bbMiddle.setData(middleData);
      bbLower.setData(lowerData);

      bbUpperSeriesRef.current = bbUpper;
      bbMiddleSeriesRef.current = bbMiddle;
      bbLowerSeriesRef.current = bbLower;
    }

    chart.timeScale().fitContent();
  }, [data, chartType, showVolume, indicators, calculatedIndicators]);

  // Update RSI data
  useEffect(() => {
    if (!rsiSeriesRef.current || data.length === 0) return;

    const sortedData = [...data].sort((a, b) => a.time - b.time);
    const rsiData: LineData[] = sortedData
      .map((d, i) => ({
        time: d.time as any,
        value: calculatedIndicators.rsi[i],
      }))
      .filter((d) => !isNaN(d.value));

    rsiSeriesRef.current.setData(rsiData);
    rsiChartRef.current?.timeScale().fitContent();
  }, [data, calculatedIndicators.rsi]);

  // Update MACD data
  useEffect(() => {
    if (!macdSeriesRef.current || !signalSeriesRef.current || !histogramSeriesRef.current || data.length === 0) return;

    const sortedData = [...data].sort((a, b) => a.time - b.time);

    const macdLineData: LineData[] = sortedData
      .map((d, i) => ({ time: d.time as any, value: calculatedIndicators.macd.macd[i] }))
      .filter((d) => !isNaN(d.value));

    const signalLineData: LineData[] = sortedData
      .map((d, i) => ({ time: d.time as any, value: calculatedIndicators.macd.signal[i] }))
      .filter((d) => !isNaN(d.value));

    const histogramData = sortedData
      .map((d, i) => ({
        time: d.time as any,
        value: calculatedIndicators.macd.histogram[i],
        color: calculatedIndicators.macd.histogram[i] >= 0 ? COLORS.green : COLORS.red,
      }))
      .filter((d) => !isNaN(d.value));

    macdSeriesRef.current.setData(macdLineData);
    signalSeriesRef.current.setData(signalLineData);
    histogramSeriesRef.current.setData(histogramData);
    macdChartRef.current?.timeScale().fitContent();
  }, [data, calculatedIndicators.macd]);

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
              <ConnectionStatus loading={pricesLoading} isDataFresh={isDataFresh} lastUpdated={lastUpdated} />
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
                  isPositive ? "text-green-500" : "text-red-500"
                }`}
              >
                {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={refetch} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
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

        {/* Indicator Controls */}
        <div className="mt-3 pt-3 border-t border-border">
          <IndicatorControls indicators={indicators} onToggle={handleIndicatorToggle} />
        </div>
      </div>

      {/* Main Chart */}
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

      {/* RSI Panel */}
      {indicators.rsi && (
        <div className="border-t border-border">
          <div className="px-4 py-1 bg-muted/50">
            <span className="text-xs font-medium" style={{ color: COLORS.orange }}>RSI (14)</span>
          </div>
          <div ref={rsiContainerRef} className="w-full h-[100px] bg-card" />
        </div>
      )}

      {/* MACD Panel */}
      {indicators.macd && (
        <div className="border-t border-border">
          <div className="px-4 py-1 bg-muted/50">
            <span className="text-xs font-medium" style={{ color: COLORS.pink }}>MACD (12, 26, 9)</span>
          </div>
          <div ref={macdContainerRef} className="w-full h-[100px] bg-card" />
        </div>
      )}
    </div>
  );
};
