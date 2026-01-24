import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";

interface EquityPoint {
  date: string;
  value: number;
}

interface EquityCurveChartProps {
  data: EquityPoint[];
  height?: number;
}

export const EquityCurveChart = ({ data, height = 256 }: EquityCurveChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    // Create chart
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "hsl(220, 10%, 50%)",
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
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
        timeVisible: true,
        secondsVisible: false,
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

    // Create area series
    const areaSeries = chart.addAreaSeries({
      lineColor: "hsl(38, 60%, 50%)",
      topColor: "hsla(38, 60%, 50%, 0.25)",
      bottomColor: "hsla(38, 60%, 50%, 0)",
      lineWidth: 2,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `₹${(price / 100000).toFixed(1)}L`,
      },
    });

    seriesRef.current = areaSeries;

    // Format data for lightweight-charts
    const formattedData = data
      .map((point) => {
        const date = new Date(point.date);
        if (isNaN(date.getTime())) return null;
        return {
          time: point.date.split("T")[0] as string,
          value: point.value,
        };
      })
      .filter((d): d is { time: string; value: number } => d !== null)
      .sort((a, b) => a.time.localeCompare(b.time));

    if (formattedData.length > 0) {
      areaSeries.setData(formattedData);
      chart.timeScale().fitContent();
    }

    // Handle resize
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
        No equity data available
      </div>
    );
  }

  return <div ref={containerRef} style={{ height }} />;
};
