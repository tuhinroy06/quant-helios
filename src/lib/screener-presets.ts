// Pre-built screener presets like screener.in

export interface ScreenerPreset {
  id: string;
  name: string;
  description: string;
  query: string;
  category: 'value' | 'growth' | 'dividend' | 'quality' | 'momentum' | 'custom';
  icon?: string;
}

export const SCREENER_PRESETS: ScreenerPreset[] = [
  // Value Investing
  {
    id: 'high-quality',
    name: 'High Quality',
    description: 'ROE > 20%, Low Debt, Consistent Growth',
    query: 'ROE > 20 AND Debt to Equity < 0.5 AND Profit Growth 3Y > 10',
    category: 'quality',
  },
  {
    id: 'undervalued',
    name: 'Undervalued Gems',
    description: 'Low P/E with good fundamentals',
    query: 'PE < 15 AND ROE > 12 AND Market Cap > 5000',
    category: 'value',
  },
  {
    id: 'graham-number',
    name: 'Benjamin Graham',
    description: 'Classic value investing criteria',
    query: 'PE < 15 AND PB < 1.5 AND Debt to Equity < 0.5',
    category: 'value',
  },
  {
    id: 'deep-value',
    name: 'Deep Value',
    description: 'Trading below book value',
    query: 'PB < 1 AND ROE > 8 AND Dividend Yield > 1',
    category: 'value',
  },
  
  // Growth Stocks
  {
    id: 'growth-monsters',
    name: 'Growth Monsters',
    description: 'Fast growing companies',
    query: 'Sales Growth 3Y > 20 AND Profit Growth 3Y > 25',
    category: 'growth',
  },
  {
    id: 'peg-bargains',
    name: 'PEG Bargains',
    description: 'Growth at reasonable price',
    query: 'PEG < 1 AND Sales Growth 3Y > 15 AND ROE > 15',
    category: 'growth',
  },
  {
    id: 'consistent-compounders',
    name: 'Consistent Compounders',
    description: 'Steady growth over time',
    query: 'Sales Growth 3Y > 12 AND Profit Growth 3Y > 12 AND ROE > 15',
    category: 'growth',
  },
  
  // Dividend Investing
  {
    id: 'dividend-champions',
    name: 'Dividend Champions',
    description: 'High yield with safe payout',
    query: 'Dividend Yield > 3 AND Payout Ratio < 60 AND ROE > 10',
    category: 'dividend',
  },
  {
    id: 'dividend-aristocrats',
    name: 'Dividend Aristocrats',
    description: 'Quality dividend payers',
    query: 'Dividend Yield > 2 AND ROE > 12 AND Debt to Equity < 1',
    category: 'dividend',
  },
  
  // Quality Stocks
  {
    id: 'low-debt-champions',
    name: 'Low Debt Champions',
    description: 'Nearly debt-free companies',
    query: 'Debt to Equity < 0.1 AND ROE > 12',
    category: 'quality',
  },
  {
    id: 'high-roce',
    name: 'High ROCE',
    description: 'Efficient capital allocation',
    query: 'ROCE > 25 AND ROE > 20 AND Debt to Equity < 1',
    category: 'quality',
  },
  {
    id: 'profit-machines',
    name: 'Profit Machines',
    description: 'High margins and efficiency',
    query: 'NPM > 15 AND OPM > 20 AND ROE > 18',
    category: 'quality',
  },
  
  // Momentum
  {
    id: 'near-52w-high',
    name: 'Near 52W High',
    description: 'Stocks showing strength',
    query: 'Price > 52W High * 0.95 AND ROE > 10',
    category: 'momentum',
  },
  {
    id: 'breakout-candidates',
    name: 'Breakout Candidates',
    description: 'Potential momentum plays',
    query: 'Price > 52W Low * 1.3 AND Price < 52W High * 0.85',
    category: 'momentum',
  },
  {
    id: 'turnaround-candidates',
    name: 'Turnaround Candidates',
    description: 'Recovering companies near lows',
    query: 'Price < 52W Low * 1.2 AND ROE > 5',
    category: 'momentum',
  },
  
  // Sector Specific
  {
    id: 'banking-value',
    name: 'Banking Value',
    description: 'Undervalued banking stocks',
    query: 'Sector = Banking AND PB < 1.5 AND ROE > 10',
    category: 'value',
  },
  {
    id: 'it-growth',
    name: 'IT Growth',
    description: 'Growing IT companies',
    query: 'Sector = IT AND Sales Growth 3Y > 15 AND ROE > 15',
    category: 'growth',
  },
];

// Column definitions for the screener
export interface ColumnDefinition {
  id: string;
  label: string;
  shortLabel: string;
  category: 'basic' | 'valuation' | 'profitability' | 'growth' | 'dividend' | 'debt' | 'returns' | 'technical';
  format: 'number' | 'percent' | 'currency' | 'ratio' | 'text';
  description: string;
  goodAbove?: number;
  badBelow?: number;
  sortable: boolean;
  defaultVisible: boolean;
  width?: number;
}

export const SCREENER_COLUMNS: ColumnDefinition[] = [
  // Basic
  { id: 'symbol', label: 'Symbol', shortLabel: 'Symbol', category: 'basic', format: 'text', description: 'Stock ticker symbol', sortable: true, defaultVisible: true, width: 100 },
  { id: 'name', label: 'Company Name', shortLabel: 'Name', category: 'basic', format: 'text', description: 'Full company name', sortable: true, defaultVisible: true, width: 180 },
  { id: 'sector', label: 'Sector', shortLabel: 'Sector', category: 'basic', format: 'text', description: 'Industry sector', sortable: true, defaultVisible: true, width: 100 },
  { id: 'marketCap', label: 'Market Cap (Cr)', shortLabel: 'M.Cap', category: 'basic', format: 'currency', description: 'Market capitalization in crores', sortable: true, defaultVisible: true, width: 100 },
  { id: 'price', label: 'Price', shortLabel: 'Price', category: 'basic', format: 'currency', description: 'Current stock price', sortable: true, defaultVisible: true, width: 90 },
  { id: 'change', label: 'Change %', shortLabel: 'Chg%', category: 'basic', format: 'percent', description: 'Daily price change percentage', sortable: true, defaultVisible: true, width: 80 },
  
  // Valuation
  { id: 'pe', label: 'P/E Ratio', shortLabel: 'P/E', category: 'valuation', format: 'ratio', description: 'Price to Earnings ratio', sortable: true, defaultVisible: true, goodAbove: 0, badBelow: 0, width: 70 },
  { id: 'pb', label: 'P/B Ratio', shortLabel: 'P/B', category: 'valuation', format: 'ratio', description: 'Price to Book ratio', sortable: true, defaultVisible: true, width: 70 },
  { id: 'evToEbitda', label: 'EV/EBITDA', shortLabel: 'EV/EB', category: 'valuation', format: 'ratio', description: 'Enterprise Value to EBITDA', sortable: true, defaultVisible: false, width: 80 },
  { id: 'peg', label: 'PEG Ratio', shortLabel: 'PEG', category: 'valuation', format: 'ratio', description: 'Price/Earnings to Growth ratio', sortable: true, defaultVisible: false, badBelow: 1, width: 70 },
  
  // Profitability
  { id: 'roe', label: 'ROE %', shortLabel: 'ROE', category: 'profitability', format: 'percent', description: 'Return on Equity', sortable: true, defaultVisible: true, goodAbove: 15, badBelow: 10, width: 70 },
  { id: 'roce', label: 'ROCE %', shortLabel: 'ROCE', category: 'profitability', format: 'percent', description: 'Return on Capital Employed', sortable: true, defaultVisible: true, goodAbove: 15, badBelow: 10, width: 75 },
  { id: 'npm', label: 'NPM %', shortLabel: 'NPM', category: 'profitability', format: 'percent', description: 'Net Profit Margin', sortable: true, defaultVisible: false, goodAbove: 10, width: 70 },
  { id: 'opm', label: 'OPM %', shortLabel: 'OPM', category: 'profitability', format: 'percent', description: 'Operating Profit Margin', sortable: true, defaultVisible: false, goodAbove: 15, width: 70 },
  
  // Growth
  { id: 'salesGrowth3Y', label: 'Sales Growth 3Y', shortLabel: 'SG 3Y', category: 'growth', format: 'percent', description: '3-year sales CAGR', sortable: true, defaultVisible: false, goodAbove: 15, width: 80 },
  { id: 'profitGrowth3Y', label: 'Profit Growth 3Y', shortLabel: 'PG 3Y', category: 'growth', format: 'percent', description: '3-year profit CAGR', sortable: true, defaultVisible: false, goodAbove: 15, width: 80 },
  { id: 'epsGrowth', label: 'EPS Growth', shortLabel: 'EPS G', category: 'growth', format: 'percent', description: 'Earnings per share growth', sortable: true, defaultVisible: false, goodAbove: 10, width: 80 },
  
  // Dividend
  { id: 'dividendYield', label: 'Dividend Yield', shortLabel: 'Div%', category: 'dividend', format: 'percent', description: 'Annual dividend yield', sortable: true, defaultVisible: true, goodAbove: 2, width: 70 },
  { id: 'payoutRatio', label: 'Payout Ratio', shortLabel: 'Payout', category: 'dividend', format: 'percent', description: 'Dividend payout ratio', sortable: true, defaultVisible: false, badBelow: 80, width: 80 },
  
  // Debt
  { id: 'debtToEquity', label: 'Debt/Equity', shortLabel: 'D/E', category: 'debt', format: 'ratio', description: 'Debt to Equity ratio', sortable: true, defaultVisible: true, badBelow: 1, width: 70 },
  { id: 'currentRatio', label: 'Current Ratio', shortLabel: 'CR', category: 'debt', format: 'ratio', description: 'Current assets / Current liabilities', sortable: true, defaultVisible: false, goodAbove: 1.5, width: 70 },
  { id: 'interestCoverage', label: 'Int. Coverage', shortLabel: 'IC', category: 'debt', format: 'ratio', description: 'Interest Coverage Ratio', sortable: true, defaultVisible: false, goodAbove: 3, width: 70 },
  
  // Returns
  { id: 'return1Y', label: '1Y Return', shortLabel: '1Y', category: 'returns', format: 'percent', description: '1-year price return', sortable: true, defaultVisible: false, width: 70 },
  { id: 'return3Y', label: '3Y Return', shortLabel: '3Y', category: 'returns', format: 'percent', description: '3-year price return', sortable: true, defaultVisible: false, width: 70 },
  
  // Technical
  { id: 'week52High', label: '52W High', shortLabel: '52H', category: 'technical', format: 'currency', description: '52-week high price', sortable: true, defaultVisible: false, width: 80 },
  { id: 'week52Low', label: '52W Low', shortLabel: '52L', category: 'technical', format: 'currency', description: '52-week low price', sortable: true, defaultVisible: false, width: 80 },
  { id: 'distFrom52High', label: '% from 52H', shortLabel: '%52H', category: 'technical', format: 'percent', description: 'Distance from 52-week high', sortable: true, defaultVisible: false, width: 80 },
];

// Column layout presets
export interface ColumnLayout {
  id: string;
  name: string;
  description: string;
  columns: string[];
}

export const COLUMN_LAYOUTS: ColumnLayout[] = [
  {
    id: 'default',
    name: 'Default View',
    description: 'Essential metrics for quick overview',
    columns: ['symbol', 'name', 'price', 'change', 'marketCap', 'pe', 'roe', 'dividendYield'],
  },
  {
    id: 'value-investing',
    name: 'Value Investing',
    description: 'Focus on valuation metrics',
    columns: ['symbol', 'name', 'price', 'marketCap', 'pe', 'pb', 'evToEbitda', 'dividendYield', 'roe', 'debtToEquity'],
  },
  {
    id: 'growth-focus',
    name: 'Growth Focus',
    description: 'Growth and momentum metrics',
    columns: ['symbol', 'name', 'price', 'change', 'marketCap', 'salesGrowth3Y', 'profitGrowth3Y', 'roe', 'roce', 'peg'],
  },
  {
    id: 'dividend-hunter',
    name: 'Dividend Hunter',
    description: 'Income-focused metrics',
    columns: ['symbol', 'name', 'price', 'dividendYield', 'payoutRatio', 'pe', 'roe', 'debtToEquity', 'marketCap'],
  },
  {
    id: 'quality-check',
    name: 'Quality Check',
    description: 'Profitability and efficiency',
    columns: ['symbol', 'name', 'price', 'roe', 'roce', 'npm', 'opm', 'debtToEquity', 'currentRatio', 'interestCoverage'],
  },
  {
    id: 'technical',
    name: 'Technical View',
    description: 'Price action and returns',
    columns: ['symbol', 'name', 'price', 'change', 'week52High', 'week52Low', 'distFrom52High', 'return1Y', 'return3Y'],
  },
];

// Get columns by category
export const getColumnsByCategory = (category: ColumnDefinition['category']): ColumnDefinition[] => {
  return SCREENER_COLUMNS.filter(col => col.category === category);
};

// Get default visible columns
export const getDefaultColumns = (): string[] => {
  return SCREENER_COLUMNS.filter(col => col.defaultVisible).map(col => col.id);
};

// Get column by id
export const getColumnById = (id: string): ColumnDefinition | undefined => {
  return SCREENER_COLUMNS.find(col => col.id === id);
};
