import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, RefreshCw, Filter, ChevronLeft, ChevronRight,
  Loader2, BarChart3, Wifi, WifiOff, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { QueryBuilder } from './QueryBuilder';
import { ColumnSelector } from './ColumnSelector';
import { ScreenerTable } from './ScreenerTable';
import { StockDetailPanel } from './StockDetailPanel';
import { useScreenerData, ScreenerFilters, SortConfig, ScreenerStock } from '@/hooks/useScreenerData';
import { SCREENER_PRESETS, getDefaultColumns } from '@/lib/screener-presets';
import { getAllSectors } from '@/lib/indian-stocks';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface AdvancedScreenerProps {
  onSymbolSelect?: (symbol: string) => void;
}

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export const AdvancedScreener = ({ onSymbolSelect }: AdvancedScreenerProps) => {
  // Query state
  const [query, setQuery] = useState('');
  
  // Filter state
  const [filters, setFilters] = useState<ScreenerFilters>({
    query: '',
    sectors: [],
    marketCaps: [],
  });
  
  // Column state
  const [visibleColumns, setVisibleColumns] = useState<string[]>(getDefaultColumns());
  
  // Sort state
  const [sort, setSort] = useState<SortConfig>({
    field: 'marketCap',
    direction: 'desc',
  });
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  // UI state
  const [selectedStock, setSelectedStock] = useState<ScreenerStock | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Get sectors
  const sectors = useMemo(() => getAllSectors(), []);
  
  // Fetch data
  const { 
    stocks, 
    totalCount, 
    totalPages, 
    loading, 
    isDataFresh, 
    lastUpdated,
    refresh,
    allStocks 
  } = useScreenerData({
    filters,
    sort,
    page,
    pageSize,
    visibleColumns,
  });
  
  // Handle query search
  const handleSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, query }));
    setPage(1);
  }, [query]);
  
  // Handle sort
  const handleSort = useCallback((field: keyof ScreenerStock) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  }, []);
  
  // Handle preset selection
  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = SCREENER_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setQuery(preset.query);
      setFilters(prev => ({ ...prev, query: preset.query }));
      setPage(1);
      toast.success(`Applied preset: ${preset.name}`);
    }
  }, []);
  
  // Handle sector filter
  const toggleSector = useCallback((sector: string) => {
    setFilters(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector],
    }));
    setPage(1);
  }, []);
  
  // Handle market cap filter
  const toggleMarketCap = useCallback((cap: 'large' | 'mid' | 'small') => {
    setFilters(prev => ({
      ...prev,
      marketCaps: prev.marketCaps.includes(cap)
        ? prev.marketCaps.filter(c => c !== cap)
        : [...prev.marketCaps, cap],
    }));
    setPage(1);
  }, []);
  
  // Handle row click
  const handleRowClick = useCallback((stock: ScreenerStock) => {
    setSelectedStock(stock);
    onSymbolSelect?.(stock.symbol);
  }, [onSymbolSelect]);
  
  // Handle watchlist toggle
  const toggleWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  }, []);
  
  // Export to CSV
  const handleExport = useCallback(() => {
    if (allStocks.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = visibleColumns.join(',');
    const rows = allStocks.map(stock => 
      visibleColumns.map(col => {
        const value = stock[col as keyof ScreenerStock];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value ?? '';
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screener-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${allStocks.length} stocks`);
  }, [allStocks, visibleColumns]);
  
  // Clear all filters
  const clearFilters = useCallback(() => {
    setQuery('');
    setFilters({ query: '', sectors: [], marketCaps: [] });
    setPage(1);
  }, []);
  
  const hasActiveFilters = filters.query || filters.sectors.length > 0 || filters.marketCaps.length > 0;
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Stock Screener</h1>
          </div>
          <Badge variant="secondary" className="text-sm">
            {totalCount} stocks
          </Badge>
        </div>
        
        {/* Status and actions */}
        <div className="flex items-center gap-2">
          {/* Connection status */}
          <div className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs',
            isDataFresh ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
          )}>
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : isDataFresh ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span>{isDataFresh ? 'Live' : 'Stale'}</span>
            {lastUpdated && (
              <span className="text-muted-foreground">
                • {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
          
          <Button variant="outline" size="sm" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </div>
      
      {/* Query Builder */}
      <QueryBuilder
        value={query}
        onChange={setQuery}
        onSearch={handleSearch}
        className="mb-4"
      />
      
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Presets Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Presets
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 max-h-80 overflow-auto">
              <DropdownMenuLabel>Popular Screens</DropdownMenuLabel>
              {['value', 'growth', 'dividend', 'quality', 'momentum'].map(category => (
                <div key={category}>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-xs uppercase text-muted-foreground">
                    {category}
                  </DropdownMenuLabel>
                  {SCREENER_PRESETS
                    .filter(p => p.category === category)
                    .map(preset => (
                      <DropdownMenuItem
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset.id)}
                        className="flex flex-col items-start"
                      >
                        <span className="font-medium">{preset.name}</span>
                        <span className="text-xs text-muted-foreground">{preset.description}</span>
                      </DropdownMenuItem>
                    ))
                  }
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Sector Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Sector
                {filters.sectors.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.sectors.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48 max-h-64 overflow-auto">
              <DropdownMenuLabel>Filter by Sector</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sectors.map(sector => (
                <DropdownMenuCheckboxItem
                  key={sector}
                  checked={filters.sectors.includes(sector)}
                  onCheckedChange={() => toggleSector(sector)}
                >
                  {sector}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Market Cap Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Market Cap
                {filters.marketCaps.length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {filters.marketCaps.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuCheckboxItem
                checked={filters.marketCaps.includes('large')}
                onCheckedChange={() => toggleMarketCap('large')}
              >
                Large Cap (&gt;₹20,000 Cr)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.marketCaps.includes('mid')}
                onCheckedChange={() => toggleMarketCap('mid')}
              >
                Mid Cap (₹5,000-20,000 Cr)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filters.marketCaps.includes('small')}
                onCheckedChange={() => toggleMarketCap('small')}
              >
                Small Cap (&lt;₹5,000 Cr)
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              Clear all
            </Button>
          )}
        </div>
        
        {/* Column Selector */}
        <ColumnSelector
          selectedColumns={visibleColumns}
          onChange={setVisibleColumns}
        />
      </div>
      
      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {filters.query && (
            <Badge variant="secondary" className="gap-1">
              Query: {filters.query.length > 30 ? `${filters.query.slice(0, 30)}...` : filters.query}
            </Badge>
          )}
          {filters.sectors.map(sector => (
            <Badge 
              key={sector} 
              variant="secondary" 
              className="gap-1 cursor-pointer"
              onClick={() => toggleSector(sector)}
            >
              {sector} ×
            </Badge>
          ))}
          {filters.marketCaps.map(cap => (
            <Badge 
              key={cap} 
              variant="secondary" 
              className="gap-1 cursor-pointer capitalize"
              onClick={() => toggleMarketCap(cap)}
            >
              {cap} Cap ×
            </Badge>
          ))}
        </div>
      )}
      
      {/* Table */}
      <div className="flex-1 min-h-0">
        <ScreenerTable
          stocks={stocks}
          loading={loading}
          visibleColumns={visibleColumns}
          sort={sort}
          onSort={handleSort}
          onRowClick={handleRowClick}
          selectedSymbol={selectedStock?.symbol}
          watchlist={watchlist}
          onToggleWatchlist={toggleWatchlist}
        />
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount}
          </span>
          <Select
            value={pageSize.toString()}
            onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map(size => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">per page</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(1)}
            disabled={page === 1}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1 px-2">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={page === pageNum ? 'default' : 'ghost'}
                  size="sm"
                  className="w-8 h-8 p-0"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
          >
            Last
          </Button>
        </div>
      </div>
      
      {/* Stock Detail Panel */}
      {selectedStock && (
        <StockDetailPanel
          stock={selectedStock}
          onClose={() => setSelectedStock(null)}
          onAddToWatchlist={toggleWatchlist}
          isWatchlisted={watchlist.includes(selectedStock.symbol)}
        />
      )}
      
      {/* Overlay for panel */}
      {selectedStock && (
        <div 
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-40"
          onClick={() => setSelectedStock(null)}
        />
      )}
    </div>
  );
};

export default AdvancedScreener;
