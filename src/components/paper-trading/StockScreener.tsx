import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, X, TrendingUp, TrendingDown, 
  ArrowUpDown, Star, SlidersHorizontal, BarChart3,
  Save, FolderOpen, Trash2, Check, Loader2
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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

interface ScreenerFilters {
  searchQuery: string;
  selectedSectors: string[];
  marketCapFilter: string;
  priceRange: [number, number];
  peRange: [number, number];
  dividendFilter: string;
  technicalFilter: string;
}

interface ScreenerPreset {
  id: string;
  name: string;
  description: string | null;
  filters: ScreenerFilters;
  is_default: boolean;
  created_at: string;
}

const DEFAULT_FILTERS: ScreenerFilters = {
  searchQuery: "",
  selectedSectors: [],
  marketCapFilter: "all",
  priceRange: [0, 50000],
  peRange: [0, 100],
  dividendFilter: "all",
  technicalFilter: "all",
};

// Built-in presets
const BUILTIN_PRESETS: { name: string; description: string; filters: Partial<ScreenerFilters> }[] = [
  {
    name: "High Dividend Yield",
    description: "Stocks with dividend yield > 2%",
    filters: { dividendFilter: "high" },
  },
  {
    name: "Value Stocks",
    description: "Low P/E ratio stocks (< 20)",
    filters: { peRange: [0, 20] },
  },
  {
    name: "Banking Sector",
    description: "All banking stocks",
    filters: { selectedSectors: ["Banking"] },
  },
  {
    name: "IT Giants",
    description: "Large cap IT companies",
    filters: { selectedSectors: ["IT"], marketCapFilter: "large" },
  },
  {
    name: "Oversold Opportunities",
    description: "Stocks with RSI < 35",
    filters: { technicalFilter: "oversold" },
  },
  {
    name: "Near 52-Week Low",
    description: "Potential value opportunities",
    filters: { technicalFilter: "near52low" },
  },
];

// Simulated technical indicators
const generateTechnicalIndicators = (stock: IndianStock): TechnicalIndicator => {
  const seed = stock.symbol.charCodeAt(0) + stock.price;
  const rsi = 30 + (seed % 40);
  
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
  const { user } = useAuth();
  
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
  
  // Preset states
  const [presets, setPresets] = useState<ScreenerPreset[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [savingPreset, setSavingPreset] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetDescription, setNewPresetDescription] = useState("");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

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

  // Load user presets on mount
  useEffect(() => {
    if (user) {
      loadPresets();
    }
  }, [user]);

  const loadPresets = async () => {
    if (!user) return;
    
    setLoadingPresets(true);
    try {
      const { data, error } = await supabase
        .from("screener_presets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Type the data properly
      const typedPresets: ScreenerPreset[] = (data || []).map(preset => ({
        id: preset.id,
        name: preset.name,
        description: preset.description,
        filters: preset.filters as unknown as ScreenerFilters,
        is_default: preset.is_default,
        created_at: preset.created_at,
      }));
      
      setPresets(typedPresets);
    } catch (error) {
      console.error("Failed to load presets:", error);
    } finally {
      setLoadingPresets(false);
    }
  };

  const getCurrentFilters = (): ScreenerFilters => ({
    searchQuery,
    selectedSectors,
    marketCapFilter,
    priceRange,
    peRange,
    dividendFilter,
    technicalFilter,
  });

  const applyFilters = (filters: Partial<ScreenerFilters>) => {
    const merged = { ...DEFAULT_FILTERS, ...filters };
    setSearchQuery(merged.searchQuery);
    setSelectedSectors(merged.selectedSectors);
    setMarketCapFilter(merged.marketCapFilter);
    setPriceRange(merged.priceRange);
    setPeRange(merged.peRange);
    setDividendFilter(merged.dividendFilter);
    setTechnicalFilter(merged.technicalFilter);
  };

  const savePreset = async () => {
    if (!user || !newPresetName.trim()) return;
    
    setSavingPreset(true);
    try {
      const filtersToSave = getCurrentFilters();
      const { data, error } = await supabase
        .from("screener_presets")
        .insert([{
          user_id: user.id,
          name: newPresetName.trim(),
          description: newPresetDescription.trim() || null,
          filters: JSON.parse(JSON.stringify(filtersToSave)),
        }])
        .select()
        .single();

      if (error) throw error;
      
      const newPreset: ScreenerPreset = {
        id: data.id,
        name: data.name,
        description: data.description,
        filters: data.filters as unknown as ScreenerFilters,
        is_default: data.is_default,
        created_at: data.created_at,
      };
      
      setPresets(prev => [newPreset, ...prev]);
      setActivePresetId(data.id);
      setSaveDialogOpen(false);
      setNewPresetName("");
      setNewPresetDescription("");
      toast.success("Preset saved successfully!");
    } catch (error) {
      console.error("Failed to save preset:", error);
      toast.error("Failed to save preset");
    } finally {
      setSavingPreset(false);
    }
  };

  const loadPreset = (preset: ScreenerPreset | { filters: Partial<ScreenerFilters>; id?: string }) => {
    applyFilters(preset.filters);
    setActivePresetId('id' in preset && preset.id ? preset.id : null);
    toast.success(`Preset applied`);
  };

  const deletePreset = async (presetId: string) => {
    try {
      const { error } = await supabase
        .from("screener_presets")
        .delete()
        .eq("id", presetId);

      if (error) throw error;
      
      setPresets(prev => prev.filter(p => p.id !== presetId));
      if (activePresetId === presetId) {
        setActivePresetId(null);
      }
      toast.success("Preset deleted");
    } catch (error) {
      console.error("Failed to delete preset:", error);
      toast.error("Failed to delete preset");
    }
  };

  // Filter and sort stocks
  const filteredStocks = useMemo(() => {
    let stocks = INDIAN_STOCKS.filter(s => s.sector !== "Index");
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      stocks = stocks.filter(s => 
        s.symbol.toLowerCase().includes(query) || 
        s.name.toLowerCase().includes(query)
      );
    }
    
    if (selectedSectors.length > 0) {
      stocks = stocks.filter(s => selectedSectors.includes(s.sector));
    }
    
    if (marketCapFilter !== "all") {
      stocks = stocks.filter(s => s.marketCapCategory === marketCapFilter);
    }
    
    stocks = stocks.filter(s => s.price >= priceRange[0] && s.price <= priceRange[1]);
    
    stocks = stocks.filter(s => {
      const pe = s.pe || 0;
      return pe >= peRange[0] && pe <= peRange[1];
    });
    
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
    
    if (technicalFilter !== "all") {
      stocks = stocks.filter(s => {
        const indicators = generateTechnicalIndicators(s);
        switch (technicalFilter) {
          case "oversold": return indicators.rsi < 35;
          case "overbought": return indicators.rsi > 65;
          case "bullish": return indicators.maSignal === "bullish";
          case "bearish": return indicators.maSignal === "bearish";
          case "near52high": return indicators.nearHigh;
          case "near52low": return indicators.nearLow;
          default: return true;
        }
      });
    }
    
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
    setActivePresetId(null);
  };

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const clearFilters = () => {
    applyFilters(DEFAULT_FILTERS);
    setActivePresetId(null);
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

  const hasActiveFilters = activeFiltersCount > 0;

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
        
        {/* Search, Filters & Presets */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by symbol or name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActivePresetId(null);
              }}
              className="pl-9"
            />
          </div>
          
          {/* Presets Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <FolderOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Presets</span>
                {activePresetId && <Check className="w-3 h-3 text-primary" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Quick Presets</DropdownMenuLabel>
              {BUILTIN_PRESETS.map((preset, index) => (
                <DropdownMenuItem
                  key={`builtin-${index}`}
                  onClick={() => loadPreset({ filters: { ...DEFAULT_FILTERS, ...preset.filters } })}
                  className="flex flex-col items-start gap-0.5"
                >
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-xs text-muted-foreground">{preset.description}</span>
                </DropdownMenuItem>
              ))}
              
              {user && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>My Presets</span>
                    {loadingPresets && <Loader2 className="w-3 h-3 animate-spin" />}
                  </DropdownMenuLabel>
                  {presets.length === 0 ? (
                    <div className="px-2 py-3 text-xs text-muted-foreground text-center">
                      No saved presets yet
                    </div>
                  ) : (
                    presets.map(preset => (
                      <DropdownMenuItem
                        key={preset.id}
                        className="flex items-center justify-between group"
                      >
                        <div 
                          className="flex-1 flex flex-col items-start gap-0.5"
                          onClick={() => loadPreset(preset)}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">{preset.name}</span>
                            {activePresetId === preset.id && (
                              <Check className="w-3 h-3 text-primary" />
                            )}
                          </div>
                          {preset.description && (
                            <span className="text-xs text-muted-foreground">{preset.description}</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePreset(preset.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      </DropdownMenuItem>
                    ))
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Save Preset Button */}
          {user && hasActiveFilters && (
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Screener Preset</DialogTitle>
                  <DialogDescription>
                    Save your current filter settings as a preset to quickly apply them later.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="preset-name">Preset Name</Label>
                    <Input
                      id="preset-name"
                      placeholder="e.g., My Value Stocks"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preset-desc">Description (optional)</Label>
                    <Input
                      id="preset-desc"
                      placeholder="e.g., Low P/E banking stocks"
                      value={newPresetDescription}
                      onChange={(e) => setNewPresetDescription(e.target.value)}
                    />
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-2">Active filters:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSectors.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {selectedSectors.length} sector(s)
                        </Badge>
                      )}
                      {marketCapFilter !== "all" && (
                        <Badge variant="outline" className="text-xs">
                          {marketCapFilter} cap
                        </Badge>
                      )}
                      {(priceRange[0] > 0 || priceRange[1] < 50000) && (
                        <Badge variant="outline" className="text-xs">
                          Price: ₹{priceRange[0]}-₹{priceRange[1]}
                        </Badge>
                      )}
                      {(peRange[0] > 0 || peRange[1] < 100) && (
                        <Badge variant="outline" className="text-xs">
                          P/E: {peRange[0]}-{peRange[1]}
                        </Badge>
                      )}
                      {dividendFilter !== "all" && (
                        <Badge variant="outline" className="text-xs">
                          Div: {dividendFilter}
                        </Badge>
                      )}
                      {technicalFilter !== "all" && (
                        <Badge variant="outline" className="text-xs">
                          {technicalFilter}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={savePreset} 
                    disabled={!newPresetName.trim() || savingPreset}
                  >
                    {savingPreset ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Preset
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
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
                  <Select 
                    value={marketCapFilter} 
                    onValueChange={(v) => {
                      setMarketCapFilter(v);
                      setActivePresetId(null);
                    }}
                  >
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
                  <Select 
                    value={dividendFilter} 
                    onValueChange={(v) => {
                      setDividendFilter(v);
                      setActivePresetId(null);
                    }}
                  >
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
                  <Select 
                    value={technicalFilter} 
                    onValueChange={(v) => {
                      setTechnicalFilter(v);
                      setActivePresetId(null);
                    }}
                  >
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
                    onValueChange={(v) => {
                      setPriceRange(v as [number, number]);
                      setActivePresetId(null);
                    }}
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
                    onValueChange={(v) => {
                      setPeRange(v as [number, number]);
                      setActivePresetId(null);
                    }}
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
