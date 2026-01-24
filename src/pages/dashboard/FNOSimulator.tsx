import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator, BarChart3, Layers, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { PayoffDiagram } from "@/components/fno/PayoffDiagram";
import { GreeksDisplay } from "@/components/fno/GreeksDisplay";
import { OptionsChain } from "@/components/fno/OptionsChain";
import { MarketStatusBadge } from "@/components/paper-trading/MarketStatusBadge";
import { useLivePrices } from "@/hooks/useLivePrices";
import { 
  OptionLeg, 
  calculateOptionPricing, 
  getStrategyLegs, 
  STRATEGY_DESCRIPTIONS,
  StrategyTemplate 
} from "@/lib/options-calculator";

const FNOSimulator = () => {
  const [activeTab, setActiveTab] = useState<"calculator" | "chain" | "strategies">("calculator");
  const [selectedUnderlying, setSelectedUnderlying] = useState("NIFTY");
  const [currentPrice, setCurrentPrice] = useState(22500);
  const [strike, setStrike] = useState(22500);
  const [daysToExpiry, setDaysToExpiry] = useState(30);
  const [volatility, setVolatility] = useState(0.18);
  const [riskFreeRate, setRiskFreeRate] = useState(0.065);
  const [optionType, setOptionType] = useState<"call" | "put">("call");
  const [legs, setLegs] = useState<OptionLeg[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyTemplate | null>(null);

  const { prices, marketStatus, loading: pricesLoading } = useLivePrices({
    symbols: [selectedUnderlying],
    refreshInterval: 10000,
  });

  // Update current price when live price updates
  useEffect(() => {
    const livePrice = prices[selectedUnderlying];
    if (livePrice?.price) {
      setCurrentPrice(livePrice.price);
      // Update strike to ATM on first load
      if (strike === 22500 && selectedUnderlying === "NIFTY") {
        setStrike(Math.round(livePrice.price / 50) * 50); // Round to nearest 50
      }
    }
  }, [prices, selectedUnderlying, strike]);

  const pricing = useMemo(() => {
    return calculateOptionPricing({
      S: currentPrice,
      K: strike,
      T: daysToExpiry / 365,
      r: riskFreeRate,
      sigma: volatility,
      optionType,
    });
  }, [currentPrice, strike, daysToExpiry, riskFreeRate, volatility, optionType]);

  const handleSelectOption = (type: 'call' | 'put', strikePrice: number, premium: number) => {
    const newLeg: OptionLeg = { type, strike: strikePrice, premium, quantity: 1 };
    setLegs(prev => [...prev, newLeg]);
  };

  const handleSelectStrategy = (strategy: StrategyTemplate) => {
    setSelectedStrategy(strategy);
    const strategyLegs = getStrategyLegs(strategy, currentPrice, pricing.price);
    setLegs(strategyLegs);
  };

  const tabs = [
    { id: "calculator" as const, label: "Greeks Calculator", icon: Calculator },
    { id: "chain" as const, label: "Options Chain", icon: Layers },
    { id: "strategies" as const, label: "Strategy Templates", icon: BookOpen },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/dashboard/overview" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <h1 className="font-display text-3xl font-light text-foreground">F&O Simulator</h1>
            </div>
            <MarketStatusBadge 
              status={marketStatus} 
              source={prices[selectedUnderlying]?.source}
              showSource={true}
            />
          </div>
          <p className="text-muted-foreground mb-8">Options pricing, Greeks, and payoff visualization using real-time market data.</p>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id ? "bg-white text-black" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Panel - Inputs */}
            <div className="space-y-6">
              {activeTab === "calculator" && (
                <div className="bg-card/50 border border-border rounded-xl p-6">
                  <h3 className="text-foreground font-medium mb-4">Option Parameters</h3>
                  <div className="space-y-4">
                    {/* Underlying Selection */}
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Underlying</label>
                      <select 
                        value={selectedUnderlying} 
                        onChange={(e) => setSelectedUnderlying(e.target.value)}
                        className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground"
                      >
                        <option value="NIFTY">NIFTY 50</option>
                        <option value="BANKNIFTY">BANK NIFTY</option>
                        <option value="RELIANCE">RELIANCE</option>
                        <option value="TCS">TCS</option>
                        <option value="HDFCBANK">HDFC BANK</option>
                        <option value="INFY">INFOSYS</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">
                          Spot Price (₹) 
                          {pricesLoading && <span className="text-xs text-muted-foreground ml-1">Loading...</span>}
                        </label>
                        <input 
                          type="number" 
                          value={currentPrice} 
                          onChange={(e) => setCurrentPrice(Number(e.target.value))} 
                          className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Strike Price (₹)</label>
                        <input type="number" value={strike} onChange={(e) => setStrike(Number(e.target.value))} className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Days to Expiry</label>
                        <input type="number" value={daysToExpiry} onChange={(e) => setDaysToExpiry(Number(e.target.value))} className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground" />
                      </div>
                      <div>
                        <label className="block text-sm text-muted-foreground mb-2">Volatility (%)</label>
                        <input type="number" value={volatility * 100} onChange={(e) => setVolatility(Number(e.target.value) / 100)} className="w-full bg-secondary border border-border rounded-lg px-4 py-2 text-foreground" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Option Type</label>
                      <div className="flex gap-2">
                        <button onClick={() => setOptionType("call")} className={`flex-1 py-2 rounded-lg font-medium ${optionType === "call" ? "bg-green-500 text-white" : "bg-secondary text-muted-foreground"}`}>Call</button>
                        <button onClick={() => setOptionType("put")} className={`flex-1 py-2 rounded-lg font-medium ${optionType === "put" ? "bg-red-500 text-white" : "bg-secondary text-muted-foreground"}`}>Put</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "chain" && (
                <div className="bg-card/50 border border-border rounded-xl p-6 overflow-x-auto">
                  <OptionsChain currentPrice={currentPrice} volatility={volatility} riskFreeRate={riskFreeRate} daysToExpiry={daysToExpiry} onSelectOption={handleSelectOption} />
                </div>
              )}

              {activeTab === "strategies" && (
                <div className="bg-card/50 border border-border rounded-xl p-6">
                  <h3 className="text-foreground font-medium mb-4">Pre-built Strategies</h3>
                  <div className="grid gap-3">
                    {(Object.keys(STRATEGY_DESCRIPTIONS) as StrategyTemplate[]).map((key) => {
                      const strat = STRATEGY_DESCRIPTIONS[key];
                      return (
                        <button key={key} onClick={() => handleSelectStrategy(key)} className={`p-4 rounded-lg text-left transition-colors ${selectedStrategy === key ? "bg-white/10 border border-white/20" : "bg-secondary hover:bg-secondary/80"}`}>
                          <div className="flex justify-between items-start">
                            <h4 className="text-foreground font-medium">{strat.name}</h4>
                            <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-muted-foreground">{strat.outlook}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{strat.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Results */}
            <div className="space-y-6">
              {activeTab === "calculator" && (
                <div className="bg-card/50 border border-border rounded-xl p-6">
                  <h3 className="text-foreground font-medium mb-4">Option Greeks</h3>
                  <GreeksDisplay greeks={pricing} price={pricing.price} />
                </div>
              )}

              {/* Payoff Diagram */}
              <div className="bg-card/50 border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-foreground font-medium">Payoff Diagram</h3>
                  {legs.length > 0 && (
                    <button onClick={() => setLegs([])} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                  )}
                </div>
                <PayoffDiagram legs={legs.length > 0 ? legs : [{ type: optionType, strike, premium: pricing.price, quantity: 1 }]} currentPrice={currentPrice} />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default FNOSimulator;
