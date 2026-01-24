// Comprehensive Indian stocks from NSE with Yahoo Finance symbols
export interface IndianStock {
  symbol: string;
  yahooSymbol: string;
  name: string;
  price: number;
  sector: string;
}

export const INDIAN_STOCKS: IndianStock[] = [
  // INDICES
  { symbol: "NIFTY", yahooSymbol: "^NSEI", name: "NIFTY 50", price: 24500, sector: "Index" },
  { symbol: "BANKNIFTY", yahooSymbol: "^NSEBANK", name: "Bank NIFTY", price: 51800, sector: "Index" },
  { symbol: "NIFTYIT", yahooSymbol: "^CNXIT", name: "NIFTY IT", price: 41500, sector: "Index" },
  { symbol: "NIFTYMIDCAP", yahooSymbol: "^NSEMDCP50", name: "NIFTY Midcap 50", price: 15800, sector: "Index" },

  // BANKING (15 stocks)
  { symbol: "HDFCBANK", yahooSymbol: "HDFCBANK.NS", name: "HDFC Bank", price: 1680, sector: "Banking" },
  { symbol: "ICICIBANK", yahooSymbol: "ICICIBANK.NS", name: "ICICI Bank", price: 1120, sector: "Banking" },
  { symbol: "SBIN", yahooSymbol: "SBIN.NS", name: "State Bank of India", price: 780, sector: "Banking" },
  { symbol: "KOTAKBANK", yahooSymbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", price: 1850, sector: "Banking" },
  { symbol: "AXISBANK", yahooSymbol: "AXISBANK.NS", name: "Axis Bank", price: 1080, sector: "Banking" },
  { symbol: "INDUSINDBK", yahooSymbol: "INDUSINDBK.NS", name: "IndusInd Bank", price: 1420, sector: "Banking" },
  { symbol: "BANDHANBNK", yahooSymbol: "BANDHANBNK.NS", name: "Bandhan Bank", price: 195, sector: "Banking" },
  { symbol: "FEDERALBNK", yahooSymbol: "FEDERALBNK.NS", name: "Federal Bank", price: 165, sector: "Banking" },
  { symbol: "IDFCFIRSTB", yahooSymbol: "IDFCFIRSTB.NS", name: "IDFC First Bank", price: 78, sector: "Banking" },
  { symbol: "PNB", yahooSymbol: "PNB.NS", name: "Punjab National Bank", price: 105, sector: "Banking" },
  { symbol: "BANKBARODA", yahooSymbol: "BANKBARODA.NS", name: "Bank of Baroda", price: 245, sector: "Banking" },
  { symbol: "CANBK", yahooSymbol: "CANBK.NS", name: "Canara Bank", price: 108, sector: "Banking" },
  { symbol: "AUBANK", yahooSymbol: "AUBANK.NS", name: "AU Small Finance Bank", price: 620, sector: "Banking" },
  { symbol: "RBLBANK", yahooSymbol: "RBLBANK.NS", name: "RBL Bank", price: 185, sector: "Banking" },
  { symbol: "YESBANK", yahooSymbol: "YESBANK.NS", name: "Yes Bank", price: 22, sector: "Banking" },

  // IT (12 stocks)
  { symbol: "TCS", yahooSymbol: "TCS.NS", name: "Tata Consultancy Services", price: 3950, sector: "IT" },
  { symbol: "INFY", yahooSymbol: "INFY.NS", name: "Infosys", price: 1520, sector: "IT" },
  { symbol: "WIPRO", yahooSymbol: "WIPRO.NS", name: "Wipro", price: 445, sector: "IT" },
  { symbol: "HCLTECH", yahooSymbol: "HCLTECH.NS", name: "HCL Technologies", price: 1780, sector: "IT" },
  { symbol: "TECHM", yahooSymbol: "TECHM.NS", name: "Tech Mahindra", price: 1650, sector: "IT" },
  { symbol: "LTIM", yahooSymbol: "LTIM.NS", name: "LTIMindtree", price: 5850, sector: "IT" },
  { symbol: "MPHASIS", yahooSymbol: "MPHASIS.NS", name: "Mphasis", price: 2680, sector: "IT" },
  { symbol: "COFORGE", yahooSymbol: "COFORGE.NS", name: "Coforge", price: 5450, sector: "IT" },
  { symbol: "PERSISTENT", yahooSymbol: "PERSISTENT.NS", name: "Persistent Systems", price: 5200, sector: "IT" },
  { symbol: "LTTS", yahooSymbol: "LTTS.NS", name: "L&T Technology Services", price: 4850, sector: "IT" },
  { symbol: "OFSS", yahooSymbol: "OFSS.NS", name: "Oracle Financial Services", price: 9800, sector: "IT" },
  { symbol: "CYIENT", yahooSymbol: "CYIENT.NS", name: "Cyient", price: 1920, sector: "IT" },

  // OIL & GAS (8 stocks)
  { symbol: "RELIANCE", yahooSymbol: "RELIANCE.NS", name: "Reliance Industries", price: 2850, sector: "Oil & Gas" },
  { symbol: "ONGC", yahooSymbol: "ONGC.NS", name: "ONGC", price: 265, sector: "Oil & Gas" },
  { symbol: "BPCL", yahooSymbol: "BPCL.NS", name: "Bharat Petroleum", price: 585, sector: "Oil & Gas" },
  { symbol: "IOC", yahooSymbol: "IOC.NS", name: "Indian Oil Corporation", price: 168, sector: "Oil & Gas" },
  { symbol: "HINDPETRO", yahooSymbol: "HINDPETRO.NS", name: "Hindustan Petroleum", price: 385, sector: "Oil & Gas" },
  { symbol: "GAIL", yahooSymbol: "GAIL.NS", name: "GAIL India", price: 195, sector: "Oil & Gas" },
  { symbol: "PETRONET", yahooSymbol: "PETRONET.NS", name: "Petronet LNG", price: 345, sector: "Oil & Gas" },
  { symbol: "OIL", yahooSymbol: "OIL.NS", name: "Oil India", price: 520, sector: "Oil & Gas" },

  // FMCG (10 stocks)
  { symbol: "HINDUNILVR", yahooSymbol: "HINDUNILVR.NS", name: "Hindustan Unilever", price: 2450, sector: "FMCG" },
  { symbol: "ITC", yahooSymbol: "ITC.NS", name: "ITC", price: 460, sector: "FMCG" },
  { symbol: "NESTLEIND", yahooSymbol: "NESTLEIND.NS", name: "Nestle India", price: 2480, sector: "FMCG" },
  { symbol: "BRITANNIA", yahooSymbol: "BRITANNIA.NS", name: "Britannia Industries", price: 5200, sector: "FMCG" },
  { symbol: "DABUR", yahooSymbol: "DABUR.NS", name: "Dabur India", price: 585, sector: "FMCG" },
  { symbol: "MARICO", yahooSymbol: "MARICO.NS", name: "Marico", price: 635, sector: "FMCG" },
  { symbol: "GODREJCP", yahooSymbol: "GODREJCP.NS", name: "Godrej Consumer Products", price: 1280, sector: "FMCG" },
  { symbol: "COLPAL", yahooSymbol: "COLPAL.NS", name: "Colgate-Palmolive", price: 2850, sector: "FMCG" },
  { symbol: "TATACONSUM", yahooSymbol: "TATACONSUM.NS", name: "Tata Consumer Products", price: 1120, sector: "FMCG" },
  { symbol: "VBL", yahooSymbol: "VBL.NS", name: "Varun Beverages", price: 1580, sector: "FMCG" },

  // PHARMA (10 stocks)
  { symbol: "SUNPHARMA", yahooSymbol: "SUNPHARMA.NS", name: "Sun Pharma", price: 1620, sector: "Pharma" },
  { symbol: "DRREDDY", yahooSymbol: "DRREDDY.NS", name: "Dr. Reddy's Laboratories", price: 6200, sector: "Pharma" },
  { symbol: "CIPLA", yahooSymbol: "CIPLA.NS", name: "Cipla", price: 1480, sector: "Pharma" },
  { symbol: "DIVISLAB", yahooSymbol: "DIVISLAB.NS", name: "Divi's Laboratories", price: 4950, sector: "Pharma" },
  { symbol: "APOLLOHOSP", yahooSymbol: "APOLLOHOSP.NS", name: "Apollo Hospitals", price: 6800, sector: "Pharma" },
  { symbol: "LUPIN", yahooSymbol: "LUPIN.NS", name: "Lupin", price: 1680, sector: "Pharma" },
  { symbol: "BIOCON", yahooSymbol: "BIOCON.NS", name: "Biocon", price: 285, sector: "Pharma" },
  { symbol: "TORNTPHARM", yahooSymbol: "TORNTPHARM.NS", name: "Torrent Pharmaceuticals", price: 2850, sector: "Pharma" },
  { symbol: "ALKEM", yahooSymbol: "ALKEM.NS", name: "Alkem Laboratories", price: 5450, sector: "Pharma" },
  { symbol: "AUROPHARMA", yahooSymbol: "AUROPHARMA.NS", name: "Aurobindo Pharma", price: 1280, sector: "Pharma" },

  // AUTO (10 stocks)
  { symbol: "TATAMOTORS", yahooSymbol: "TATAMOTORS.NS", name: "Tata Motors", price: 920, sector: "Auto" },
  { symbol: "MARUTI", yahooSymbol: "MARUTI.NS", name: "Maruti Suzuki", price: 10800, sector: "Auto" },
  { symbol: "M&M", yahooSymbol: "M&M.NS", name: "Mahindra & Mahindra", price: 2850, sector: "Auto" },
  { symbol: "BAJAJ-AUTO", yahooSymbol: "BAJAJ-AUTO.NS", name: "Bajaj Auto", price: 9200, sector: "Auto" },
  { symbol: "EICHERMOT", yahooSymbol: "EICHERMOT.NS", name: "Eicher Motors", price: 4850, sector: "Auto" },
  { symbol: "HEROMOTOCO", yahooSymbol: "HEROMOTOCO.NS", name: "Hero MotoCorp", price: 4200, sector: "Auto" },
  { symbol: "TVSMOTOR", yahooSymbol: "TVSMOTOR.NS", name: "TVS Motor", price: 2450, sector: "Auto" },
  { symbol: "ASHOKLEY", yahooSymbol: "ASHOKLEY.NS", name: "Ashok Leyland", price: 185, sector: "Auto" },
  { symbol: "MOTHERSON", yahooSymbol: "MOTHERSON.NS", name: "Samvardhana Motherson", price: 145, sector: "Auto" },
  { symbol: "BHARATFORG", yahooSymbol: "BHARATFORG.NS", name: "Bharat Forge", price: 1350, sector: "Auto" },

  // METALS (8 stocks)
  { symbol: "TATASTEEL", yahooSymbol: "TATASTEEL.NS", name: "Tata Steel", price: 145, sector: "Metals" },
  { symbol: "JSWSTEEL", yahooSymbol: "JSWSTEEL.NS", name: "JSW Steel", price: 890, sector: "Metals" },
  { symbol: "HINDALCO", yahooSymbol: "HINDALCO.NS", name: "Hindalco", price: 620, sector: "Metals" },
  { symbol: "VEDL", yahooSymbol: "VEDL.NS", name: "Vedanta", price: 445, sector: "Metals" },
  { symbol: "COALINDIA", yahooSymbol: "COALINDIA.NS", name: "Coal India", price: 420, sector: "Metals" },
  { symbol: "NMDC", yahooSymbol: "NMDC.NS", name: "NMDC", price: 225, sector: "Metals" },
  { symbol: "SAIL", yahooSymbol: "SAIL.NS", name: "Steel Authority of India", price: 125, sector: "Metals" },
  { symbol: "JINDALSTEL", yahooSymbol: "JINDALSTEL.NS", name: "Jindal Steel & Power", price: 920, sector: "Metals" },

  // POWER & UTILITIES (8 stocks)
  { symbol: "NTPC", yahooSymbol: "NTPC.NS", name: "NTPC", price: 385, sector: "Power" },
  { symbol: "POWERGRID", yahooSymbol: "POWERGRID.NS", name: "Power Grid Corporation", price: 295, sector: "Power" },
  { symbol: "ADANIGREEN", yahooSymbol: "ADANIGREEN.NS", name: "Adani Green Energy", price: 1850, sector: "Power" },
  { symbol: "TATAPOWER", yahooSymbol: "TATAPOWER.NS", name: "Tata Power", price: 435, sector: "Power" },
  { symbol: "NHPC", yahooSymbol: "NHPC.NS", name: "NHPC", price: 95, sector: "Power" },
  { symbol: "TORNTPOWER", yahooSymbol: "TORNTPOWER.NS", name: "Torrent Power", price: 1580, sector: "Power" },
  { symbol: "SJVN", yahooSymbol: "SJVN.NS", name: "SJVN", price: 118, sector: "Power" },
  { symbol: "JSWENERGY", yahooSymbol: "JSWENERGY.NS", name: "JSW Energy", price: 645, sector: "Power" },

  // INFRASTRUCTURE (8 stocks)
  { symbol: "LT", yahooSymbol: "LT.NS", name: "Larsen & Toubro", price: 3400, sector: "Infrastructure" },
  { symbol: "ADANIENT", yahooSymbol: "ADANIENT.NS", name: "Adani Enterprises", price: 2850, sector: "Infrastructure" },
  { symbol: "ADANIPORTS", yahooSymbol: "ADANIPORTS.NS", name: "Adani Ports", price: 1280, sector: "Infrastructure" },
  { symbol: "ULTRACEMCO", yahooSymbol: "ULTRACEMCO.NS", name: "UltraTech Cement", price: 11200, sector: "Infrastructure" },
  { symbol: "GRASIM", yahooSymbol: "GRASIM.NS", name: "Grasim Industries", price: 2450, sector: "Infrastructure" },
  { symbol: "SHREECEM", yahooSymbol: "SHREECEM.NS", name: "Shree Cement", price: 26500, sector: "Infrastructure" },
  { symbol: "AMBUJACEM", yahooSymbol: "AMBUJACEM.NS", name: "Ambuja Cements", price: 620, sector: "Infrastructure" },
  { symbol: "ACC", yahooSymbol: "ACC.NS", name: "ACC", price: 2350, sector: "Infrastructure" },

  // FINANCE (8 stocks)
  { symbol: "BAJFINANCE", yahooSymbol: "BAJFINANCE.NS", name: "Bajaj Finance", price: 6800, sector: "Finance" },
  { symbol: "BAJAJFINSV", yahooSymbol: "BAJAJFINSV.NS", name: "Bajaj Finserv", price: 1650, sector: "Finance" },
  { symbol: "HDFCLIFE", yahooSymbol: "HDFCLIFE.NS", name: "HDFC Life Insurance", price: 685, sector: "Finance" },
  { symbol: "SBILIFE", yahooSymbol: "SBILIFE.NS", name: "SBI Life Insurance", price: 1580, sector: "Finance" },
  { symbol: "ICICIPRULI", yahooSymbol: "ICICIPRULI.NS", name: "ICICI Prudential Life", price: 620, sector: "Finance" },
  { symbol: "ICICIGI", yahooSymbol: "ICICIGI.NS", name: "ICICI Lombard GIC", price: 1780, sector: "Finance" },
  { symbol: "MUTHOOTFIN", yahooSymbol: "MUTHOOTFIN.NS", name: "Muthoot Finance", price: 1650, sector: "Finance" },
  { symbol: "CHOLAFIN", yahooSymbol: "CHOLAFIN.NS", name: "Cholamandalam Investment", price: 1280, sector: "Finance" },

  // TELECOM (4 stocks)
  { symbol: "BHARTIARTL", yahooSymbol: "BHARTIARTL.NS", name: "Bharti Airtel", price: 1620, sector: "Telecom" },
  { symbol: "IDEA", yahooSymbol: "IDEA.NS", name: "Vodafone Idea", price: 14, sector: "Telecom" },
  { symbol: "TATACOMM", yahooSymbol: "TATACOMM.NS", name: "Tata Communications", price: 1820, sector: "Telecom" },
  { symbol: "INDUSTOWER", yahooSymbol: "INDUSTOWER.NS", name: "Indus Towers", price: 345, sector: "Telecom" },

  // CONSUMER (6 stocks)
  { symbol: "TITAN", yahooSymbol: "TITAN.NS", name: "Titan Company", price: 3200, sector: "Consumer" },
  { symbol: "ASIANPAINT", yahooSymbol: "ASIANPAINT.NS", name: "Asian Paints", price: 2950, sector: "Consumer" },
  { symbol: "PAGEIND", yahooSymbol: "PAGEIND.NS", name: "Page Industries", price: 42000, sector: "Consumer" },
  { symbol: "PIDILITIND", yahooSymbol: "PIDILITIND.NS", name: "Pidilite Industries", price: 2950, sector: "Consumer" },
  { symbol: "HAVELLS", yahooSymbol: "HAVELLS.NS", name: "Havells India", price: 1620, sector: "Consumer" },
  { symbol: "VOLTAS", yahooSymbol: "VOLTAS.NS", name: "Voltas", price: 1280, sector: "Consumer" },

  // REAL ESTATE (4 stocks)
  { symbol: "DLF", yahooSymbol: "DLF.NS", name: "DLF", price: 850, sector: "Real Estate" },
  { symbol: "GODREJPROP", yahooSymbol: "GODREJPROP.NS", name: "Godrej Properties", price: 2650, sector: "Real Estate" },
  { symbol: "OBEROIRLTY", yahooSymbol: "OBEROIRLTY.NS", name: "Oberoi Realty", price: 1620, sector: "Real Estate" },
  { symbol: "PRESTIGE", yahooSymbol: "PRESTIGE.NS", name: "Prestige Estates", price: 1180, sector: "Real Estate" },

  // AVIATION & LOGISTICS (4 stocks)
  { symbol: "INDIGO", yahooSymbol: "INDIGO.NS", name: "InterGlobe Aviation", price: 4250, sector: "Aviation" },
  { symbol: "DELHIVERY", yahooSymbol: "DELHIVERY.NS", name: "Delhivery", price: 385, sector: "Logistics" },
  { symbol: "BLUEDART", yahooSymbol: "BLUEDART.NS", name: "Blue Dart Express", price: 7850, sector: "Logistics" },
  { symbol: "CONCOR", yahooSymbol: "CONCOR.NS", name: "Container Corporation", price: 785, sector: "Logistics" },
];

// Get Yahoo Finance symbol for NSE symbol
export const getYahooSymbol = (nseSymbol: string): string => {
  const stock = INDIAN_STOCKS.find(s => s.symbol === nseSymbol);
  return stock?.yahooSymbol || `${nseSymbol}.NS`;
};

// Get stock by symbol
export const getStockBySymbol = (symbol: string): IndianStock | undefined => {
  return INDIAN_STOCKS.find(s => s.symbol === symbol);
};

// Get stocks by sector
export const getStocksBySector = (sector: string): IndianStock[] => {
  return INDIAN_STOCKS.filter(s => s.sector === sector);
};

// Get all sectors
export const getAllSectors = (): string[] => {
  return [...new Set(INDIAN_STOCKS.map(s => s.sector))];
};

// Search stocks by symbol or name
export const searchStocks = (query: string): IndianStock[] => {
  const lowerQuery = query.toLowerCase();
  return INDIAN_STOCKS.filter(
    s => s.symbol.toLowerCase().includes(lowerQuery) || 
         s.name.toLowerCase().includes(lowerQuery)
  );
};

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
