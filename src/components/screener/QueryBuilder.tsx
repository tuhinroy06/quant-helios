import { useState, useRef, useEffect } from 'react';
import { Search, X, HelpCircle, History, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface QueryBuilderProps {
  value: string;
  onChange: (query: string) => void;
  onSearch?: () => void;
  className?: string;
}

const QUERY_SUGGESTIONS = [
  { query: 'PE < 15 AND ROE > 15', label: 'Value with good returns' },
  { query: 'Market Cap > 50000 AND Debt to Equity < 0.5', label: 'Large cap, low debt' },
  { query: 'ROE > 20 AND ROCE > 20', label: 'High quality' },
  { query: 'Dividend Yield > 3', label: 'High dividend' },
  { query: 'Sales Growth 3Y > 20', label: 'Fast growing' },
  { query: 'Sector = Banking AND PB < 1.5', label: 'Undervalued banks' },
  { query: 'PE < 20 AND Profit Growth 3Y > 15', label: 'Growth at value' },
];

const FIELD_SUGGESTIONS = [
  'PE', 'PB', 'ROE', 'ROCE', 'NPM', 'OPM', 
  'Market Cap', 'Price', 'Debt to Equity', 'Dividend Yield',
  'Sales Growth 3Y', 'Profit Growth 3Y', 'PEG', 'Sector'
];

const OPERATOR_SUGGESTIONS = ['>', '<', '>=', '<=', '=', '!='];

export const QueryBuilder = ({ value, onChange, onSearch, className }: QueryBuilderProps) => {
  const [showHelp, setShowHelp] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Load recent queries from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('screener_recent_queries');
    if (saved) {
      try {
        setRecentQueries(JSON.parse(saved));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);
  
  const saveQuery = (query: string) => {
    if (!query.trim()) return;
    
    const updated = [query, ...recentQueries.filter(q => q !== query)].slice(0, 10);
    setRecentQueries(updated);
    localStorage.setItem('screener_recent_queries', JSON.stringify(updated));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      saveQuery(value);
      onSearch?.();
      setShowSuggestions(false);
    }
  };
  
  const handleSuggestionClick = (query: string) => {
    onChange(query);
    saveQuery(query);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };
  
  const clearQuery = () => {
    onChange('');
    inputRef.current?.focus();
  };
  
  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search or query: PE < 20 AND ROE > 15..."
            className="pl-9 pr-20 font-mono text-sm"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {value && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={clearQuery}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
            <Popover open={showHelp} onOpenChange={setShowHelp}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Query Syntax</h4>
                  <p className="text-xs text-muted-foreground">
                    Use simple conditions with AND to filter stocks:
                  </p>
                  <div className="space-y-2">
                    <code className="block text-xs bg-muted p-2 rounded">
                      PE &lt; 20 AND ROE &gt; 15
                    </code>
                    <code className="block text-xs bg-muted p-2 rounded">
                      Sector = Banking AND PB &lt; 1.5
                    </code>
                    <code className="block text-xs bg-muted p-2 rounded">
                      Market Cap &gt; 50000 AND Debt to Equity &lt; 0.5
                    </code>
                  </div>
                  <div className="pt-2">
                    <p className="text-xs font-medium mb-1">Available Fields:</p>
                    <div className="flex flex-wrap gap-1">
                      {FIELD_SUGGESTIONS.slice(0, 8).map(field => (
                        <Badge key={field} variant="secondary" className="text-[10px]">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium mb-1">Operators:</p>
                    <div className="flex gap-1">
                      {OPERATOR_SUGGESTIONS.map(op => (
                        <Badge key={op} variant="outline" className="text-[10px] font-mono">
                          {op}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <Button onClick={() => { saveQuery(value); onSearch?.(); }} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Run
        </Button>
      </div>
      
      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-auto"
          onMouseDown={(e) => e.preventDefault()} // Prevent blur
        >
          {/* Recent Queries */}
          {recentQueries.length > 0 && (
            <div className="p-2 border-b border-border">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                <History className="h-3 w-3" />
                Recent
              </div>
              {recentQueries.slice(0, 3).map((query, i) => (
                <button
                  key={i}
                  className="w-full text-left px-2 py-1.5 text-sm hover:bg-muted rounded-md font-mono"
                  onClick={() => handleSuggestionClick(query)}
                >
                  {query}
                </button>
              ))}
            </div>
          )}
          
          {/* Suggested Queries */}
          <div className="p-2">
            <div className="text-xs text-muted-foreground mb-2">Suggested Screens</div>
            {QUERY_SUGGESTIONS.map((suggestion, i) => (
              <button
                key={i}
                className="w-full text-left px-2 py-1.5 hover:bg-muted rounded-md flex items-center justify-between"
                onClick={() => handleSuggestionClick(suggestion.query)}
              >
                <code className="text-sm font-mono text-primary">{suggestion.query}</code>
                <span className="text-xs text-muted-foreground">{suggestion.label}</span>
              </button>
            ))}
          </div>
          
          {/* Close button */}
          <div className="p-2 border-t border-border">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => setShowSuggestions(false)}
            >
              Close suggestions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryBuilder;
