// Popular Indian stocks from NSE/BSE with approximate prices
export interface IndianStock {
  symbol: string;
  name: string;
  price: number;
  sector: string;
}

export const INDIAN_STOCKS: IndianStock[] = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2850, sector: "Oil & Gas" },
  { symbol: "TCS", name: "Tata Consultancy Services", price: 3950, sector: "IT" },
  { symbol: "INFY", name: "Infosys", price: 1520, sector: "IT" },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1680, sector: "Banking" },
  { symbol: "ICICIBANK", name: "ICICI Bank", price: 1120, sector: "Banking" },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever", price: 2450, sector: "FMCG" },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", price: 1420, sector: "Telecom" },
  { symbol: "SBIN", name: "State Bank of India", price: 780, sector: "Banking" },
  { symbol: "TATAMOTORS", name: "Tata Motors", price: 920, sector: "Automobile" },
  { symbol: "WIPRO", name: "Wipro", price: 445, sector: "IT" },
  { symbol: "KOTAKBANK", name: "Kotak Mahindra Bank", price: 1850, sector: "Banking" },
  { symbol: "LT", name: "Larsen & Toubro", price: 3400, sector: "Infrastructure" },
  { symbol: "AXISBANK", name: "Axis Bank", price: 1080, sector: "Banking" },
  { symbol: "MARUTI", name: "Maruti Suzuki", price: 10800, sector: "Automobile" },
  { symbol: "SUNPHARMA", name: "Sun Pharma", price: 1620, sector: "Pharma" },
  { symbol: "TITAN", name: "Titan Company", price: 3200, sector: "Consumer" },
  { symbol: "BAJFINANCE", name: "Bajaj Finance", price: 6800, sector: "Finance" },
  { symbol: "ASIANPAINT", name: "Asian Paints", price: 2950, sector: "Consumer" },
  { symbol: "NESTLEIND", name: "Nestle India", price: 2480, sector: "FMCG" },
  { symbol: "TATASTEEL", name: "Tata Steel", price: 145, sector: "Metals" },
];

// Get a random price variation for simulation
export const getSimulatedPrice = (basePrice: number, variance: number = 0.02): number => {
  const change = basePrice * variance * (Math.random() * 2 - 1);
  return Math.round((basePrice + change) * 100) / 100;
};

// Format Indian currency with proper formatting (lakh/crore system)
export const formatINR = (amount: number): string => {
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";
  
  if (absAmount >= 10000000) {
    // Crore
    return `${sign}₹${(absAmount / 10000000).toFixed(2)} Cr`;
  } else if (absAmount >= 100000) {
    // Lakh
    return `${sign}₹${(absAmount / 100000).toFixed(2)} L`;
  } else {
    // Regular formatting
    return `${sign}₹${absAmount.toLocaleString('en-IN')}`;
  }
};

// Simple INR format without abbreviations
export const formatINRSimple = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};
