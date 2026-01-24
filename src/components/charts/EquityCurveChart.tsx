import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";
import { getLightweightChartTheme } from "@/lib/lightweight-charts-theme";

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

    const theme = getLightweightChartTheme();
    const el = containerRef.current;

    // Create chart
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
        timeVisible: true,
        secondsVisible: false,
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

    // Create area series
    const areaSeries = chart.addAreaSeries({
      lineColor: theme.primary,
      topColor: theme.primarySoft,
      bottomColor: "rgba(0, 0, 0, 0)",
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

    // Handle resize (important: container can be width=0 at mount)
    const handleResize = () => {
      const w = Math.floor(el.clientWidth);
      if (w > 0) chart.applyOptions({ width: w });
    };

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(handleResize) : null;
    ro?.observe(el);
    window.addEventListener("resize", handleResize);
    requestAnimationFrame(handleResize);

    return () => {
      ro?.disconnect();
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

  return <div ref={containerRef} className="w-full" style={{ height }} />;
};
