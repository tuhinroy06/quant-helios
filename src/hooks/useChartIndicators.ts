import { useMemo } from "react";
import { OHLCData } from "./useHistoricalPrices";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  type MACDResult,
  type BollingerBands,
} from "@/lib/indicators";

export interface CalculatedIndicators {
  sma20: number[];
  ema50: number[];
  rsi: number[];
  macd: MACDResult;
  bollinger: BollingerBands;
}

export const useChartIndicators = (data: OHLCData[]): CalculatedIndicators => {
  return useMemo(() => {
    if (data.length === 0) {
      return {
        sma20: [],
        ema50: [],
        rsi: [],
        macd: { macd: [], signal: [], histogram: [] },
        bollinger: { upper: [], middle: [], lower: [] },
      };
    }

    // Extract close prices for indicator calculations
    const closePrices = data.map((d) => d.close);

    return {
      sma20: calculateSMA(closePrices, 20),
      ema50: calculateEMA(closePrices, 50),
      rsi: calculateRSI(closePrices, 14),
      macd: calculateMACD(closePrices, 12, 26, 9),
      bollinger: calculateBollingerBands(closePrices, 20, 2),
    };
  }, [data]);
};
