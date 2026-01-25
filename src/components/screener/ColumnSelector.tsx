import { useState } from 'react';
import { Settings2, Check, GripVertical, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SCREENER_COLUMNS, COLUMN_LAYOUTS, getDefaultColumns, ColumnDefinition } from '@/lib/screener-presets';
import { cn } from '@/lib/utils';

interface ColumnSelectorProps {
  selectedColumns: string[];
  onChange: (columns: string[]) => void;
}

const CATEGORY_LABELS: Record<ColumnDefinition['category'], string> = {
  basic: 'Basic',
  valuation: 'Valuation',
  profitability: 'Profitability',
  growth: 'Growth',
  dividend: 'Dividend',
  debt: 'Debt & Liquidity',
  returns: 'Returns',
  technical: 'Technical',
};

const CATEGORY_ORDER: ColumnDefinition['category'][] = [
  'basic', 'valuation', 'profitability', 'growth', 'dividend', 'debt', 'returns', 'technical'
];

export const ColumnSelector = ({ selectedColumns, onChange }: ColumnSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleColumn = (columnId: string) => {
    if (selectedColumns.includes(columnId)) {
      // Don't allow removing all columns
      if (selectedColumns.length > 1) {
        onChange(selectedColumns.filter(c => c !== columnId));
      }
    } else {
      onChange([...selectedColumns, columnId]);
    }
  };
  
  const applyLayout = (layoutId: string) => {
    const layout = COLUMN_LAYOUTS.find(l => l.id === layoutId);
    if (layout) {
      onChange(layout.columns);
    }
  };
  
  const resetToDefault = () => {
    onChange(getDefaultColumns());
  };
  
  const groupedColumns = CATEGORY_ORDER.map(category => ({
    category,
    label: CATEGORY_LABELS[category],
    columns: SCREENER_COLUMNS.filter(c => c.category === category),
  }));
  
  return (
    <div className="flex items-center gap-2">
      {/* Layout Presets Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">Columns</span>
            <Badge variant="secondary" className="text-xs">
              {selectedColumns.length}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Quick Layouts</DropdownMenuLabel>
          {COLUMN_LAYOUTS.map(layout => (
            <DropdownMenuItem
              key={layout.id}
              onClick={() => applyLayout(layout.id)}
              className="flex flex-col items-start gap-0.5"
            >
              <span className="font-medium">{layout.name}</span>
              <span className="text-xs text-muted-foreground">{layout.description}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={resetToDefault}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Full Column Selector Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            Customize
          </Button>
        </SheetTrigger>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Customize Columns</SheetTitle>
            <SheetDescription>
              Select which columns to display in the screener table
            </SheetDescription>
          </SheetHeader>
          
          <div className="mt-4">
            {/* Selected count */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">
                {selectedColumns.length} columns selected
              </span>
              <Button variant="ghost" size="sm" onClick={resetToDefault}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
            
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="space-y-6 pr-4">
                {groupedColumns.map(({ category, label, columns }) => (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-foreground mb-2 sticky top-0 bg-background py-1">
                      {label}
                    </h4>
                    <div className="space-y-1">
                      {columns.map(column => {
                        const isSelected = selectedColumns.includes(column.id);
                        return (
                          <button
                            key={column.id}
                            onClick={() => toggleColumn(column.id)}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
                              isSelected 
                                ? 'bg-primary/10 border border-primary/20' 
                                : 'hover:bg-muted border border-transparent'
                            )}
                          >
                            <Checkbox 
                              checked={isSelected}
                              className="pointer-events-none"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{column.label}</span>
                                <Badge variant="outline" className="text-[10px]">
                                  {column.shortLabel}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">
                                {column.description}
                              </p>
                            </div>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ColumnSelector;
