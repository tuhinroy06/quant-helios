import { useEffect, useRef } from "react";
import { createChart, IChartApi, ISeriesApi } from "lightweight-charts";

interface PerformancePoint {
  date: string;
  value: number;
}

interface PerformanceChartProps {
  data: PerformancePoint[];
  height?: number;
}

export const PerformanceChart = ({ data, height = 224 }: PerformanceChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

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
        scaleMargins: { top: 0.15, bottom: 0.15 },
      },
      timeScale: {
        borderColor: "hsl(220 15% 14%)",
        timeVisible: false,
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

    const areaSeries = chart.addAreaSeries({
      lineColor: "hsl(38 60% 50%)",
      topColor: "hsla(38, 60%, 50%, 0.2)",
      bottomColor: "hsla(38, 60%, 50%, 0)",
      lineWidth: 2,
      priceFormat: {
        type: "custom",
        formatter: (price: number) => `${price.toFixed(1)}%`,
      },
    });

    seriesRef.current = areaSeries;

    // Parse dates like "Jan 15" format from date-fns
    const currentYear = new Date().getFullYear();
    const formattedData = data
      .map((point, index) => {
        // Try parsing the date format "MMM d"
        const months: Record<string, number> = {
          Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
          Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
        };
        
        const parts = point.date.split(" ");
        if (parts.length === 2) {
          const month = months[parts[0]];
          const day = parseInt(parts[1], 10);
          if (month !== undefined && !isNaN(day)) {
            const date = new Date(currentYear, month, day);
            return {
              time: date.toISOString().split("T")[0] as string,
              value: point.value,
            };
          }
        }
        
        // Fallback: use index-based dates
        const fallbackDate = new Date(currentYear, 0, index + 1);
        return {
          time: fallbackDate.toISOString().split("T")[0] as string,
          value: point.value,
        };
      })
      .sort((a, b) => a.time.localeCompare(b.time));

    // Remove duplicates by keeping the last value for each date
    const uniqueData = formattedData.reduce((acc, curr) => {
      const existing = acc.find((d) => d.time === curr.time);
      if (existing) {
        existing.value = curr.value;
      } else {
        acc.push(curr);
      }
      return acc;
    }, [] as typeof formattedData);

    if (uniqueData.length > 0) {
      areaSeries.setData(uniqueData);
      chart.timeScale().fitContent();
    }

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
        No performance data available
      </div>
    );
  }

  return <div ref={containerRef} style={{ height }} />;
};
