import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, X, TrendingUp, TrendingDown, ChevronDown, 
  ArrowUpDown, Star, Plus, SlidersHorizontal, BarChart3
} from "lucide-react";
import { 
  INDIAN_STOCKS, 
  IndianStock, 
  getAllSectors, 
  formatINRSimple, 
  formatMarketCap 
} from "@/lib/indian-stocks";
import { useWebSocketPrices } from "@/hooks/useWebSocketPrices";
import { ConnectionStatus } from "./ConnectionStatus";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StockScreenerProps {
  onSymbolSelect?: (symbol: string) => void;
  selectedSymbol?: string;
}

type SortField = "symbol" | "price" | "changePercent" | "marketCap" | "pe" | "dividendYield";
type SortDirection = "asc" | "desc";

interface TechnicalIndicator {
  rsi: number;
  maSignal: "bullish" | "bearish" | "neutral";
  nearHigh: boolean;
  nearLow: boolean;
}

// Simulated technical indicators
const generateTechnicalIndicators = (stock: IndianStock): TechnicalIndicator => {
  const seed = stock.symbol.charCodeAt(0) + stock.price;
  const rsi = 30 + (seed % 40); // RSI between 30-70
  
  const priceRange = (stock.week52High || stock.price) - (stock.week52Low || stock.price);
  const currentPosition = stock.price - (stock.week52Low || stock.price);
  const percentFromLow = priceRange > 0 ? (currentPosition / priceRange) * 100 : 50;
  
  return {
    rsi,
    maSignal: rsi > 60 ? "bullish" : rsi < 40 ? "bearish" : "neutral",
    nearHigh: percentFromLow > 85,
    nearLow: percentFromLow < 15,
  };
};

export const StockScreener = ({ onSymbolSelect, selectedSymbol }: StockScreenerProps) => {
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [marketCapFilter, setMarketCapFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [peRange, setPeRange] = useState<[number, number]>([0, 100]);
  const [dividendFilter, setDividendFilter] = useState<string>("all");
  const [technicalFilter, setTechnicalFilter] = useState<string>("all");
  
  // UI states
  const [showFilters, setShowFilters] = useState(true);
  const [sortField, setSortField] = useState<SortField>("marketCap");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [watchlist, setWatchlist] = useState<string[]>([]);

  const sectors = getAllSectors();
  
  // Get all stock symbols for WebSocket
  const allSymbols = useMemo(() => 
    INDIAN_STOCKS.filter(s => s.sector !== "Index").map(s => s.symbol).slice(0, 50),
    []
  );
  
  const { prices, connected, connecting, lastUpdated } = useWebSocketPrices({
    symbols: allSymbols,
    enabled: true,
  });

  // Filter and sort stocks
  const filteredStocks = useMemo(() => {
    let stocks = INDIAN_STOCKS.filter(s => s.sector !== "Index");
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      stocks = stocks.filter(s => 
        s.symbol.toLowerCase().includes(query) || 
        s.name.toLowerCase().includes(query)
      );
    }
    
    // Sector filter
    if (selectedSectors.length > 0) {
      stocks = stocks.filter(s => selectedSectors.includes(s.sector));
    }
    
    // Market cap filter
    if (marketCapFilter !== "all") {
      stocks = stocks.filter(s => s.marketCapCategory === marketCapFilter);
    }
    
    // Price range filter
    stocks = stocks.filter(s => s.price >= priceRange[0] && s.price <= priceRange[1]);
    
    // P/E ratio filter
    stocks = stocks.filter(s => {
      const pe = s.pe || 0;
      return pe >= peRange[0] && pe <= peRange[1];
    });
    
    // Dividend filter
    if (dividendFilter === "high") {
      stocks = stocks.filter(s => (s.dividendYield || 0) >= 2);
    } else if (dividendFilter === "medium") {
      stocks = stocks.filter(s => {
        const dy = s.dividendYield || 0;
        return dy >= 0.5 && dy < 2;
      });
    } else if (dividendFilter === "none") {
      stocks = stocks.filter(s => (s.dividendYield || 0) === 0);
    }
    
    // Technical filter
    if (technicalFilter !== "all") {
      stocks = stocks.filter(s => {
        const indicators = generateTechnicalIndicators(s);
        switch (technicalFilter) {
          case "oversold":
            return indicators.rsi < 35;
          case "overbought":
            return indicators.rsi > 65;
          case "bullish":
            return indicators.maSignal === "bullish";
          case "bearish":
            return indicators.maSignal === "bearish";
          case "near52high":
            return indicators.nearHigh;
          case "near52low":
            return indicators.nearLow;
          default:
            return true;
        }
      });
    }
    
    // Sort
    stocks.sort((a, b) => {
      let aVal: number, bVal: number;
      
      switch (sortField) {
        case "price":
          aVal = prices[a.symbol]?.price || a.price;
          bVal = prices[b.symbol]?.price || b.price;
          break;
        case "changePercent":
          aVal = prices[a.symbol]?.changePercent || 0;
          bVal = prices[b.symbol]?.changePercent || 0;
          break;
        case "marketCap":
          aVal = a.marketCap;
          bVal = b.marketCap;
          break;
        case "pe":
          aVal = a.pe || 0;
          bVal = b.pe || 0;
          break;
        case "dividendYield":
          aVal = a.dividendYield || 0;
          bVal = b.dividendYield || 0;
          break;
        default:
          aVal = a.symbol.localeCompare(b.symbol);
          bVal = 0;
      }
      
      return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
    });
    
    return stocks;
  }, [searchQuery, selectedSectors, marketCapFilter, priceRange, peRange, dividendFilter, technicalFilter, sortField, sortDirection, prices]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const toggleSector = (sector: string) => {
    setSelectedSectors(prev => 
      prev.includes(sector) 
        ? prev.filter(s => s !== sector)
        : [...prev, sector]
    );
  };

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedSectors([]);
    setMarketCapFilter("all");
    setPriceRange([0, 50000]);
    setPeRange([0, 100]);
    setDividendFilter("all");
    setTechnicalFilter("all");
  };

  const activeFiltersCount = [
    searchQuery,
    selectedSectors.length > 0,
    marketCapFilter !== "all",
    priceRange[0] > 0 || priceRange[1] < 50000,
    peRange[0] > 0 || peRange[1] < 100,
    dividendFilter !== "all",
    technicalFilter !== "all",
  ].filter(Boolean).length;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Stock Screener</h2>
            <Badge variant="secondary" className="text-xs">
              {filteredStocks.length} stocks
            </Badge>
          </div>
          <ConnectionStatus connected={connected} connecting={connecting} lastUpdated={lastUpdated} />
        </div>
        
        {/* Search & Filter Toggle */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 justify-center">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b border-border overflow-hidden"
          >
            <div className="p-4 space-y-4 bg-secondary/30">
              {/* Sector Filter */}
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block">Sectors</Label>
                <div className="flex flex-wrap gap-1.5">
                  {sectors.map(sector => (
                    <Badge
                      key={sector}
                      variant={selectedSectors.includes(sector) ? "default" : "outline"}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleSector(sector)}
                    >
                      {sector}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Market Cap */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Market Cap</Label>
                  <Select value={marketCapFilter} onValueChange={setMarketCapFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Caps</SelectItem>
                      <SelectItem value="large">Large Cap (&gt;₹20K Cr)</SelectItem>
                      <SelectItem value="mid">Mid Cap (₹5K-20K Cr)</SelectItem>
                      <SelectItem value="small">Small Cap (&lt;₹5K Cr)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Dividend */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Dividend Yield</Label>
                  <Select value={dividendFilter} onValueChange={setDividendFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="high">High (&gt;2%)</SelectItem>
                      <SelectItem value="medium">Medium (0.5-2%)</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Technical Indicators */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Technical Signal</Label>
                  <Select value={technicalFilter} onValueChange={setTechnicalFilter}>
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="bullish">Bullish (MA)</SelectItem>
                      <SelectItem value="bearish">Bearish (MA)</SelectItem>
                      <SelectItem value="oversold">Oversold (RSI&lt;35)</SelectItem>
                      <SelectItem value="overbought">Overbought (RSI&gt;65)</SelectItem>
                      <SelectItem value="near52high">Near 52W High</SelectItem>
                      <SelectItem value="near52low">Near 52W Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price & PE Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    Price Range: {formatINRSimple(priceRange[0])} - {formatINRSimple(priceRange[1])}
                  </Label>
                  <Slider
                    value={priceRange}
                    onValueChange={(v) => setPriceRange(v as [number, number])}
                    min={0}
                    max={50000}
                    step={100}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">
                    P/E Ratio: {peRange[0]} - {peRange[1]}
                  </Label>
                  <Slider
                    value={peRange}
                    onValueChange={(v) => setPeRange(v as [number, number])}
                    min={0}
                    max={100}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Table */}
      <ScrollArea className="h-[500px]">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead 
                className="cursor-pointer hover:text-foreground"
                onClick={() => handleSort("symbol")}
              >
                <div className="flex items-center gap-1">
                  Symbol
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:text-foreground"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center justify-end gap-1">
                  Price
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:text-foreground"
                onClick={() => handleSort("changePercent")}
              >
                <div className="flex items-center justify-end gap-1">
                  Change
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:text-foreground hidden md:table-cell"
                onClick={() => handleSort("marketCap")}
              >
                <div className="flex items-center justify-end gap-1">
                  Market Cap
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:text-foreground hidden lg:table-cell"
                onClick={() => handleSort("pe")}
              >
                <div className="flex items-center justify-end gap-1">
                  P/E
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead 
                className="text-right cursor-pointer hover:text-foreground hidden lg:table-cell"
                onClick={() => handleSort("dividendYield")}
              >
                <div className="flex items-center justify-end gap-1">
                  Div %
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </TableHead>
              <TableHead className="text-center hidden md:table-cell">Signal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStocks.map((stock) => {
              const priceData = prices[stock.symbol];
              const price = priceData?.price || stock.price;
              const changePercent = priceData?.changePercent || 0;
              const isPositive = changePercent >= 0;
              const isSelected = selectedSymbol === stock.symbol;
              const inWatchlist = watchlist.includes(stock.symbol);
              const indicators = generateTechnicalIndicators(stock);

              return (
                <TableRow
                  key={stock.symbol}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? "bg-primary/5" : "hover:bg-secondary/50"
                  }`}
                  onClick={() => onSymbolSelect?.(stock.symbol)}
                >
                  <TableCell className="w-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(stock.symbol);
                      }}
                      className="p-1 hover:bg-secondary rounded"
                    >
                      <Star 
                        className={`w-4 h-4 ${
                          inWatchlist ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"
                        }`} 
                      />
                    </button>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{stock.symbol}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                        {stock.name}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <motion.span
                      key={price}
                      initial={{ scale: 1.02 }}
                      animate={{ scale: 1 }}
                      className="font-medium text-foreground"
                    >
                      {formatINRSimple(price)}
                    </motion.span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`flex items-center justify-end gap-0.5 text-sm ${
                      isPositive ? "text-green-500" : "text-red-500"
                    }`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPositive ? "+" : ""}{changePercent.toFixed(2)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {formatMarketCap(stock.marketCap)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {stock.pe ? stock.pe.toFixed(1) : "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right hidden lg:table-cell">
                    <span className="text-sm text-muted-foreground">
                      {stock.dividendYield ? `${stock.dividendYield.toFixed(1)}%` : "-"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center hidden md:table-cell">
                    <Badge 
                      variant={
                        indicators.maSignal === "bullish" ? "default" : 
                        indicators.maSignal === "bearish" ? "destructive" : 
                        "secondary"
                      }
                      className="text-xs"
                    >
                      {indicators.maSignal === "bullish" ? "↑" : indicators.maSignal === "bearish" ? "↓" : "–"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredStocks.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No stocks match your filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
