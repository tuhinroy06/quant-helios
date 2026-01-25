import { useMemo, useState, useCallback } from 'react';
import { INDIAN_STOCKS, IndianStock } from '@/lib/indian-stocks';
import { useAlphaVantagePrices, LivePrice } from '@/hooks/useAlphaVantagePrices';

// Extended stock with all calculated fields
export interface ScreenerStock extends IndianStock {
  // Live data
  livePrice?: number;
  change?: number;
  changePercent?: number;
  
  // Extended ratios (calculated/simulated for demo)
  roe: number;
  roce: number;
  npm: number;
  opm: number;
  debtToEquity: number;
  currentRatio: number;
  interestCoverage: number;
  evToEbitda: number;
  peg: number;
  salesGrowth3Y: number;
  profitGrowth3Y: number;
  epsGrowth: number;
  payoutRatio: number;
  return1Y: number;
  return3Y: number;
  distFrom52High: number;
  promoterHolding: number;
}

export interface ScreenerFilters {
  query: string;
  sectors: string[];
  marketCaps: ('large' | 'mid' | 'small')[];
  priceMin?: number;
  priceMax?: number;
  peMin?: number;
  peMax?: number;
  pbMin?: number;
  pbMax?: number;
  roeMin?: number;
  roeMax?: number;
  roceMin?: number;
  roceMax?: number;
  debtToEquityMax?: number;
  dividendYieldMin?: number;
  salesGrowth3YMin?: number;
  profitGrowth3YMin?: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortConfig {
  field: keyof ScreenerStock;
  direction: SortDirection;
}

export interface UseScreenerDataOptions {
  filters: ScreenerFilters;
  sort: SortConfig;
  page: number;
  pageSize: number;
  visibleColumns: string[];
}

// Generate realistic financial ratios based on stock characteristics
const generateFinancialRatios = (stock: IndianStock): Partial<ScreenerStock> => {
  // Use deterministic seed based on symbol for consistency
  const seed = stock.symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rand = (min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };
  
  // Sector-based baseline adjustments
  const sectorMultipliers: Record<string, { roe: number; margin: number; growth: number }> = {
    'Banking': { roe: 1.0, margin: 0.8, growth: 0.9 },
    'IT': { roe: 1.3, margin: 1.2, growth: 1.2 },
    'FMCG': { roe: 1.2, margin: 1.1, growth: 0.8 },
    'Pharma': { roe: 1.1, margin: 1.0, growth: 1.0 },
    'Oil & Gas': { roe: 0.8, margin: 0.7, growth: 0.7 },
    'Metals': { roe: 0.9, margin: 0.8, growth: 1.1 },
    'Auto': { roe: 1.0, margin: 0.9, growth: 1.0 },
    'Cement': { roe: 0.9, margin: 0.9, growth: 0.9 },
    'Infra': { roe: 0.8, margin: 0.7, growth: 1.0 },
    'Realty': { roe: 0.7, margin: 0.6, growth: 1.2 },
    'Power': { roe: 0.8, margin: 0.8, growth: 0.8 },
    'Telecom': { roe: 0.6, margin: 0.6, growth: 0.9 },
  };
  
  const multiplier = sectorMultipliers[stock.sector] || { roe: 1.0, margin: 1.0, growth: 1.0 };
  
  // Market cap affects quality metrics
  const capMultiplier = stock.marketCapCategory === 'large' ? 1.1 : stock.marketCapCategory === 'mid' ? 1.0 : 0.9;
  
  const baseRoe = rand(8, 25) * multiplier.roe * capMultiplier;
  const baseMargin = rand(5, 20) * multiplier.margin;
  const baseGrowth = rand(-5, 30) * multiplier.growth;
  
  // Calculate distance from 52-week high
  const distFrom52High = stock.week52High 
    ? ((stock.price - stock.week52High) / stock.week52High) * 100 
    : 0;
  
  return {
    roe: Math.round(baseRoe * 10) / 10,
    roce: Math.round((baseRoe * rand(0.8, 1.2)) * 10) / 10,
    npm: Math.round(baseMargin * 10) / 10,
    opm: Math.round((baseMargin * rand(1.1, 1.5)) * 10) / 10,
    debtToEquity: Math.round(rand(0, 2) * (stock.sector === 'Banking' ? 0.1 : 1) * 100) / 100,
    currentRatio: Math.round(rand(1, 3) * 100) / 100,
    interestCoverage: Math.round(rand(2, 15) * 10) / 10,
    evToEbitda: Math.round(rand(5, 25) * 10) / 10,
    peg: (stock.pe || 20) / Math.max(baseGrowth, 1),
    salesGrowth3Y: Math.round(baseGrowth * 10) / 10,
    profitGrowth3Y: Math.round((baseGrowth * rand(0.8, 1.3)) * 10) / 10,
    epsGrowth: Math.round((baseGrowth * rand(0.9, 1.1)) * 10) / 10,
    payoutRatio: Math.round(rand(10, 60) * 10) / 10,
    return1Y: Math.round(rand(-20, 50) * 10) / 10,
    return3Y: Math.round(rand(-10, 150) * 10) / 10,
    distFrom52High: Math.round(distFrom52High * 10) / 10,
    promoterHolding: Math.round(rand(30, 75) * 10) / 10,
  };
};

// Parse simple query syntax like "PE < 20 AND ROE > 15"
export const parseQuery = (query: string): ((stock: ScreenerStock) => boolean) => {
  if (!query.trim()) return () => true;
  
  const conditions = query.split(/\s+AND\s+/i);
  
  return (stock: ScreenerStock) => {
    return conditions.every(condition => {
      const match = condition.match(/^(\w+(?:\s+\w+)*)\s*(>|<|>=|<=|=|!=)\s*(.+)$/i);
      if (!match) return true;
      
      const [, fieldName, operator, valueStr] = match;
      const normalizedField = fieldName.toLowerCase().replace(/\s+/g, '');
      
      // Map query fields to stock properties
      const fieldMap: Record<string, keyof ScreenerStock> = {
        'pe': 'pe',
        'p/e': 'pe',
        'pb': 'pb',
        'p/b': 'pb',
        'roe': 'roe',
        'roce': 'roce',
        'npm': 'npm',
        'opm': 'opm',
        'marketcap': 'marketCap',
        'price': 'livePrice',
        'debttoequity': 'debtToEquity',
        'd/e': 'debtToEquity',
        'dividendyield': 'dividendYield',
        'div%': 'dividendYield',
        'salesgrowth3y': 'salesGrowth3Y',
        'profitgrowth3y': 'profitGrowth3Y',
        'peg': 'peg',
        'sector': 'sector',
      };
      
      const field = fieldMap[normalizedField];
      if (!field) return true;
      
      const stockValue = stock[field];
      
      // Handle sector comparison
      if (field === 'sector') {
        const targetSector = valueStr.trim().toLowerCase();
        return operator === '=' 
          ? String(stockValue).toLowerCase() === targetSector
          : String(stockValue).toLowerCase() !== targetSector;
      }
      
      const value = parseFloat(valueStr);
      if (isNaN(value) || stockValue === undefined || stockValue === null) return true;
      
      const numValue = Number(stockValue);
      
      switch (operator) {
        case '>': return numValue > value;
        case '<': return numValue < value;
        case '>=': return numValue >= value;
        case '<=': return numValue <= value;
        case '=': return numValue === value;
        case '!=': return numValue !== value;
        default: return true;
      }
    });
  };
};

export const useScreenerData = (options: UseScreenerDataOptions) => {
  const { filters, sort, page, pageSize, visibleColumns } = options;
  
  // Get symbols for visible stocks (limit to reasonable number for API)
  const allStocksWithRatios = useMemo(() => {
    return INDIAN_STOCKS
      .filter(s => s.sector !== 'Index')
      .map(stock => ({
        ...stock,
        ...generateFinancialRatios(stock),
      } as ScreenerStock));
  }, []);
  
  const symbolsToFetch = useMemo(() => 
    allStocksWithRatios.slice(0, 100).map(s => s.symbol),
    [allStocksWithRatios]
  );
  
  const { prices, loading: pricesLoading, isDataFresh, lastUpdated, refresh } = useAlphaVantagePrices({
    symbols: symbolsToFetch,
    enabled: true,
    refreshInterval: 60000,
  });
  
  // Apply filters
  const filteredStocks = useMemo(() => {
    let stocks = allStocksWithRatios.map(stock => ({
      ...stock,
      livePrice: prices[stock.symbol]?.price || stock.price,
      change: prices[stock.symbol]?.change || 0,
      changePercent: prices[stock.symbol]?.changePercent || 0,
    }));
    
    // Text search
    if (filters.query) {
      const queryFilter = parseQuery(filters.query);
      
      // If query doesn't look like a condition, also search by name/symbol
      if (!filters.query.includes('>') && !filters.query.includes('<') && !filters.query.includes('=')) {
        const searchTerm = filters.query.toLowerCase();
        stocks = stocks.filter(s => 
          s.symbol.toLowerCase().includes(searchTerm) ||
          s.name.toLowerCase().includes(searchTerm)
        );
      } else {
        stocks = stocks.filter(queryFilter);
      }
    }
    
    // Sector filter
    if (filters.sectors.length > 0) {
      stocks = stocks.filter(s => filters.sectors.includes(s.sector));
    }
    
    // Market cap filter
    if (filters.marketCaps.length > 0) {
      stocks = stocks.filter(s => filters.marketCaps.includes(s.marketCapCategory));
    }
    
    // Numeric range filters
    if (filters.priceMin !== undefined) stocks = stocks.filter(s => (s.livePrice || s.price) >= filters.priceMin!);
    if (filters.priceMax !== undefined) stocks = stocks.filter(s => (s.livePrice || s.price) <= filters.priceMax!);
    if (filters.peMin !== undefined) stocks = stocks.filter(s => (s.pe || 0) >= filters.peMin!);
    if (filters.peMax !== undefined) stocks = stocks.filter(s => (s.pe || 0) <= filters.peMax!);
    if (filters.roeMin !== undefined) stocks = stocks.filter(s => s.roe >= filters.roeMin!);
    if (filters.roceMin !== undefined) stocks = stocks.filter(s => s.roce >= filters.roceMin!);
    if (filters.debtToEquityMax !== undefined) stocks = stocks.filter(s => s.debtToEquity <= filters.debtToEquityMax!);
    if (filters.dividendYieldMin !== undefined) stocks = stocks.filter(s => (s.dividendYield || 0) >= filters.dividendYieldMin!);
    if (filters.salesGrowth3YMin !== undefined) stocks = stocks.filter(s => s.salesGrowth3Y >= filters.salesGrowth3YMin!);
    if (filters.profitGrowth3YMin !== undefined) stocks = stocks.filter(s => s.profitGrowth3Y >= filters.profitGrowth3YMin!);
    
    return stocks;
  }, [allStocksWithRatios, prices, filters]);
  
  // Sort
  const sortedStocks = useMemo(() => {
    const sorted = [...filteredStocks];
    sorted.sort((a, b) => {
      const aVal = a[sort.field];
      const bVal = b[sort.field];
      
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sort.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      
      return sort.direction === 'asc' ? aNum - bNum : bNum - aNum;
    });
    return sorted;
  }, [filteredStocks, sort]);
  
  // Paginate
  const paginatedStocks = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedStocks.slice(start, start + pageSize);
  }, [sortedStocks, page, pageSize]);
  
  const totalPages = Math.ceil(sortedStocks.length / pageSize);
  
  return {
    stocks: paginatedStocks,
    totalCount: sortedStocks.length,
    totalPages,
    loading: pricesLoading,
    isDataFresh,
    lastUpdated,
    refresh,
    allStocks: sortedStocks, // For export
  };
};

export default useScreenerData;
