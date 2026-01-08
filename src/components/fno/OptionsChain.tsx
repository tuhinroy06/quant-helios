import { useState, useMemo } from "react";
import { calculateOptionPricing, OptionParams } from "@/lib/options-calculator";

interface OptionsChainProps {
  currentPrice: number;
  volatility: number;
  riskFreeRate: number;
  daysToExpiry: number;
  onSelectOption: (type: 'call' | 'put', strike: number, premium: number) => void;
}

export const OptionsChain = ({
  currentPrice,
  volatility,
  riskFreeRate,
  daysToExpiry,
  onSelectOption,
}: OptionsChainProps) => {
  const [selectedStrikes, setSelectedStrikes] = useState<Set<string>>(new Set());

  // Generate strikes around current price
  const strikes = useMemo(() => {
    const step = currentPrice > 100 ? 5 : currentPrice > 50 ? 2.5 : 1;
    const strikesArray: number[] = [];
    
    // Generate 10 strikes above and below current price
    for (let i = -10; i <= 10; i++) {
      const strike = Math.round((currentPrice + i * step) * 100) / 100;
      if (strike > 0) strikesArray.push(strike);
    }
    
    return strikesArray;
  }, [currentPrice]);

  // Calculate options for each strike
  const optionsData = useMemo(() => {
    const T = daysToExpiry / 365;
    
    return strikes.map((strike) => {
      const baseParams: Omit<OptionParams, 'optionType'> = {
        S: currentPrice,
        K: strike,
        T,
        r: riskFreeRate,
        sigma: volatility,
      };

      const callPricing = calculateOptionPricing({ ...baseParams, optionType: 'call' });
      const putPricing = calculateOptionPricing({ ...baseParams, optionType: 'put' });

      return {
        strike,
        call: callPricing,
        put: putPricing,
        isATM: Math.abs(strike - currentPrice) < (currentPrice * 0.02),
        isITM: {
          call: currentPrice > strike,
          put: currentPrice < strike,
        },
      };
    });
  }, [strikes, currentPrice, volatility, riskFreeRate, daysToExpiry]);

  const handleSelect = (type: 'call' | 'put', strike: number, premium: number) => {
    const key = `${type}-${strike}`;
    const newSelected = new Set(selectedStrikes);
    
    if (selectedStrikes.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    
    setSelectedStrikes(newSelected);
    onSelectOption(type, strike, premium);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th colSpan={4} className="text-center py-2 text-green-500 bg-green-500/10">CALLS</th>
            <th className="py-2 bg-white/5">Strike</th>
            <th colSpan={4} className="text-center py-2 text-red-500 bg-red-500/10">PUTS</th>
          </tr>
          <tr className="border-b border-border text-muted-foreground text-xs">
            <th className="py-2 px-2 text-left bg-green-500/5">Δ</th>
            <th className="py-2 px-2 text-right bg-green-500/5">Bid</th>
            <th className="py-2 px-2 text-right bg-green-500/5">Ask</th>
            <th className="py-2 px-2 text-center bg-green-500/5">Select</th>
            <th className="py-2 px-2 text-center bg-white/5 font-bold text-foreground">$</th>
            <th className="py-2 px-2 text-center bg-red-500/5">Select</th>
            <th className="py-2 px-2 text-right bg-red-500/5">Bid</th>
            <th className="py-2 px-2 text-right bg-red-500/5">Ask</th>
            <th className="py-2 px-2 text-right bg-red-500/5">Δ</th>
          </tr>
        </thead>
        <tbody>
          {optionsData.map((row) => {
            const isCallSelected = selectedStrikes.has(`call-${row.strike}`);
            const isPutSelected = selectedStrikes.has(`put-${row.strike}`);
            
            // Simulate bid/ask spread (ask = price, bid = 95% of price)
            const callBid = (row.call.price * 0.95).toFixed(2);
            const callAsk = row.call.price.toFixed(2);
            const putBid = (row.put.price * 0.95).toFixed(2);
            const putAsk = row.put.price.toFixed(2);

            return (
              <tr
                key={row.strike}
                className={`border-b border-border hover:bg-white/5 ${
                  row.isATM ? "bg-yellow-500/10" : ""
                }`}
              >
                {/* Calls */}
                <td className={`py-2 px-2 text-left ${row.isITM.call ? "bg-green-500/10" : ""}`}>
                  <span className={row.call.delta >= 0.5 ? "text-green-500" : "text-muted-foreground"}>
                    {row.call.delta.toFixed(2)}
                  </span>
                </td>
                <td className={`py-2 px-2 text-right ${row.isITM.call ? "bg-green-500/10" : ""}`}>
                  ${callBid}
                </td>
                <td className={`py-2 px-2 text-right font-medium ${row.isITM.call ? "bg-green-500/10" : ""}`}>
                  ${callAsk}
                </td>
                <td className={`py-2 px-2 text-center ${row.isITM.call ? "bg-green-500/10" : ""}`}>
                  <button
                    onClick={() => handleSelect('call', row.strike, row.call.price)}
                    className={`w-6 h-6 rounded border ${
                      isCallSelected
                        ? "bg-green-500 border-green-500"
                        : "border-border hover:border-green-500"
                    }`}
                  >
                    {isCallSelected && <span className="text-white text-xs">✓</span>}
                  </button>
                </td>

                {/* Strike */}
                <td className={`py-2 px-2 text-center font-bold ${row.isATM ? "text-yellow-500" : "text-foreground"}`}>
                  ${row.strike}
                  {row.isATM && <span className="text-xs ml-1">(ATM)</span>}
                </td>

                {/* Puts */}
                <td className={`py-2 px-2 text-center ${row.isITM.put ? "bg-red-500/10" : ""}`}>
                  <button
                    onClick={() => handleSelect('put', row.strike, row.put.price)}
                    className={`w-6 h-6 rounded border ${
                      isPutSelected
                        ? "bg-red-500 border-red-500"
                        : "border-border hover:border-red-500"
                    }`}
                  >
                    {isPutSelected && <span className="text-white text-xs">✓</span>}
                  </button>
                </td>
                <td className={`py-2 px-2 text-right font-medium ${row.isITM.put ? "bg-red-500/10" : ""}`}>
                  ${putAsk}
                </td>
                <td className={`py-2 px-2 text-right ${row.isITM.put ? "bg-red-500/10" : ""}`}>
                  ${putBid}
                </td>
                <td className={`py-2 px-2 text-right ${row.isITM.put ? "bg-red-500/10" : ""}`}>
                  <span className={row.put.delta <= -0.5 ? "text-red-500" : "text-muted-foreground"}>
                    {row.put.delta.toFixed(2)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500/30 rounded" />
          <span>ITM Call</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500/30 rounded" />
          <span>ITM Put</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500/30 rounded" />
          <span>ATM</span>
        </div>
      </div>
    </div>
  );
};
