import { useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Star, TrendingUp, TrendingDown } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { SCREENER_COLUMNS, getColumnById, ColumnDefinition } from '@/lib/screener-presets';
import { ScreenerStock, SortConfig, SortDirection } from '@/hooks/useScreenerData';
import { formatINRSimple, formatMarketCap } from '@/lib/indian-stocks';
import { cn } from '@/lib/utils';

interface ScreenerTableProps {
  stocks: ScreenerStock[];
  loading: boolean;
  visibleColumns: string[];
  sort: SortConfig;
  onSort: (field: keyof ScreenerStock) => void;
  onRowClick?: (stock: ScreenerStock) => void;
  selectedSymbol?: string;
  watchlist?: string[];
  onToggleWatchlist?: (symbol: string) => void;
}

// Format cell value based on column type
const formatCellValue = (value: any, column: ColumnDefinition, stock: ScreenerStock): React.ReactNode => {
  if (value === undefined || value === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  
  switch (column.format) {
    case 'currency':
      if (column.id === 'marketCap') {
        return formatMarketCap(value);
      }
      return formatINRSimple(value);
    
    case 'percent':
      const percentValue = Number(value);
      const isPositive = percentValue > 0;
      const isNegative = percentValue < 0;
      
      if (column.id === 'change') {
        return (
          <span className={cn(
            'font-medium',
            isPositive && 'text-emerald-500',
            isNegative && 'text-red-500'
          )}>
            {isPositive ? '+' : ''}{percentValue.toFixed(2)}%
          </span>
        );
      }
      
      // Apply good/bad coloring
      let colorClass = '';
      if (column.goodAbove !== undefined && percentValue >= column.goodAbove) {
        colorClass = 'text-emerald-500';
      } else if (column.badBelow !== undefined && percentValue <= column.badBelow) {
        colorClass = 'text-red-500';
      }
      
      return <span className={colorClass}>{percentValue.toFixed(1)}%</span>;
    
    case 'ratio':
      const ratioValue = Number(value);
      
      // Apply good/bad coloring for ratios
      let ratioColorClass = '';
      if (column.id === 'debtToEquity') {
        if (ratioValue > 1) ratioColorClass = 'text-red-500';
        else if (ratioValue < 0.5) ratioColorClass = 'text-emerald-500';
      } else if (column.id === 'peg') {
        if (ratioValue < 1) ratioColorClass = 'text-emerald-500';
        else if (ratioValue > 2) ratioColorClass = 'text-red-500';
      }
      
      return <span className={ratioColorClass}>{ratioValue.toFixed(2)}</span>;
    
    case 'number':
      return Number(value).toLocaleString('en-IN');
    
    case 'text':
    default:
      return value;
  }
};

// Get stock field value
const getStockValue = (stock: ScreenerStock, columnId: string): any => {
  // Map column IDs to stock properties
  const fieldMap: Record<string, keyof ScreenerStock> = {
    symbol: 'symbol',
    name: 'name',
    sector: 'sector',
    marketCap: 'marketCap',
    price: 'livePrice',
    change: 'changePercent',
    pe: 'pe',
    pb: 'pb',
    roe: 'roe',
    roce: 'roce',
    npm: 'npm',
    opm: 'opm',
    debtToEquity: 'debtToEquity',
    currentRatio: 'currentRatio',
    interestCoverage: 'interestCoverage',
    evToEbitda: 'evToEbitda',
    peg: 'peg',
    salesGrowth3Y: 'salesGrowth3Y',
    profitGrowth3Y: 'profitGrowth3Y',
    epsGrowth: 'epsGrowth',
    dividendYield: 'dividendYield',
    payoutRatio: 'payoutRatio',
    return1Y: 'return1Y',
    return3Y: 'return3Y',
    week52High: 'week52High',
    week52Low: 'week52Low',
    distFrom52High: 'distFrom52High',
  };
  
  const field = fieldMap[columnId];
  if (!field) return null;
  
  // Special handling for price
  if (columnId === 'price') {
    return stock.livePrice || stock.price;
  }
  
  return stock[field];
};

export const ScreenerTable = ({
  stocks,
  loading,
  visibleColumns,
  sort,
  onSort,
  onRowClick,
  selectedSymbol,
  watchlist = [],
  onToggleWatchlist,
}: ScreenerTableProps) => {
  
  const columns = useMemo(() => {
    return visibleColumns
      .map(id => getColumnById(id))
      .filter((col): col is ColumnDefinition => col !== undefined);
  }, [visibleColumns]);
  
  const renderSortIcon = (columnId: string) => {
    if (sort.field !== columnId) {
      return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    }
    return sort.direction === 'asc' 
      ? <ArrowUp className="h-3 w-3" />
      : <ArrowDown className="h-3 w-3" />;
  };
  
  if (loading && stocks.length === 0) {
    return (
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <ScrollArea className="h-[calc(100vh-320px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
            <TableRow>
              {/* Watchlist column */}
              {onToggleWatchlist && (
                <TableHead className="w-10 px-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                </TableHead>
              )}
              
              {columns.map(column => (
                <TableHead 
                  key={column.id}
                  className={cn(
                    'whitespace-nowrap',
                    column.sortable && 'cursor-pointer hover:bg-muted/50 select-none'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && onSort(column.id as keyof ScreenerStock)}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium">{column.shortLabel}</span>
                    {column.sortable && renderSortIcon(column.id)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {stocks.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (onToggleWatchlist ? 1 : 0)} 
                  className="h-32 text-center text-muted-foreground"
                >
                  No stocks match your criteria
                </TableCell>
              </TableRow>
            ) : (
              stocks.map(stock => {
                const isSelected = selectedSymbol === stock.symbol;
                const isWatchlisted = watchlist.includes(stock.symbol);
                
                return (
                  <TableRow
                    key={stock.symbol}
                    className={cn(
                      'cursor-pointer transition-colors',
                      isSelected && 'bg-primary/5 border-l-2 border-l-primary',
                      !isSelected && 'hover:bg-muted/50'
                    )}
                    onClick={() => onRowClick?.(stock)}
                  >
                    {/* Watchlist toggle */}
                    {onToggleWatchlist && (
                      <TableCell className="px-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWatchlist(stock.symbol);
                          }}
                        >
                          <Star 
                            className={cn(
                              'h-4 w-4',
                              isWatchlisted 
                                ? 'fill-yellow-400 text-yellow-400' 
                                : 'text-muted-foreground'
                            )} 
                          />
                        </Button>
                      </TableCell>
                    )}
                    
                    {columns.map(column => {
                      const value = getStockValue(stock, column.id);
                      
                      return (
                        <TableCell 
                          key={column.id}
                          className={cn(
                            'py-2',
                            column.id === 'symbol' && 'font-semibold text-primary',
                            column.id === 'name' && 'max-w-[180px] truncate'
                          )}
                        >
                          {formatCellValue(value, column, stock)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};

export default ScreenerTable;
