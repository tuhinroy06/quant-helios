import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { formatINR } from "@/lib/indian-stocks";

interface TradeData {
  trade: number;
  pnl: number;
  pnlPct: number;
}

interface PnLHistogramChartProps {
  data: TradeData[];
  height?: number;
}

export const PnLHistogramChart = ({ data, height = 192 }: PnLHistogramChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "hsl(220, 10%, 50%)",
        fontFamily: "Inter, sans-serif",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "hsl(220, 15%, 14%)" },
        horzLines: { color: "hsl(220, 15%, 14%)" },
      },
      rightPriceScale: {
        borderColor: "hsl(220, 15%, 14%)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "hsl(220, 15%, 14%)",
        fixLeftEdge: true,
        fixRightEdge: true,
      },
      crosshair: {
        vertLine: {
          color: "hsl(220, 10%, 40%)",
          labelBackgroundColor: "hsl(220, 18%, 10%)",
        },
        horzLine: {
          color: "hsl(220, 10%, 40%)",
          labelBackgroundColor: "hsl(220, 18%, 10%)",
        },
      },
    });

    chartRef.current = chart;

    const histogramSeries = chart.addHistogramSeries({
      priceFormat: {
        type: "custom",
        formatter: (price: number) => formatINR(price),
      },
    });

    seriesRef.current = histogramSeries;

    // Format data using trade number as timeline
    // We use a synthetic date based on trade number
    const baseDate = new Date("2024-01-01");
    const formattedData = data.map((trade) => {
      const date = new Date(baseDate);
      date.setDate(date.getDate() + trade.trade);
      return {
        time: date.toISOString().split("T")[0] as string,
        value: trade.pnl,
        color: trade.pnl >= 0 ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)",
      };
    });

    histogramSeries.setData(formattedData);
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
  }, [data, height]);

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center text-muted-foreground"
        style={{ height }}
      >
        No trade data available
      </div>
    );
  }

  return <div ref={containerRef} style={{ height }} />;
};
