// Comprehensive Indian stocks from NSE with Yahoo Finance symbols
export interface IndianStock {
  symbol: string;
  yahooSymbol: string;
  name: string;
  price: number;
  sector: string;
  marketCap: number; // in crores
  marketCapCategory: "large" | "mid" | "small";
  pe?: number; // Price to Earnings ratio
  pb?: number; // Price to Book ratio
  dividendYield?: number;
  week52High?: number;
  week52Low?: number;
}

// Market cap classifications (in crores):
// Large Cap: > 20,000 Cr
// Mid Cap: 5,000 - 20,000 Cr  
// Small Cap: < 5,000 Cr

export const INDIAN_STOCKS: IndianStock[] = [
  // INDICES
  { symbol: "NIFTY", yahooSymbol: "^NSEI", name: "NIFTY 50", price: 24500, sector: "Index", marketCap: 0, marketCapCategory: "large" },
  { symbol: "BANKNIFTY", yahooSymbol: "^NSEBANK", name: "Bank NIFTY", price: 51800, sector: "Index", marketCap: 0, marketCapCategory: "large" },
  { symbol: "NIFTYIT", yahooSymbol: "^CNXIT", name: "NIFTY IT", price: 41500, sector: "Index", marketCap: 0, marketCapCategory: "large" },
  { symbol: "NIFTYMIDCAP", yahooSymbol: "^NSEMDCP50", name: "NIFTY Midcap 50", price: 15800, sector: "Index", marketCap: 0, marketCapCategory: "large" },

  // BANKING (15 stocks)
  { symbol: "HDFCBANK", yahooSymbol: "HDFCBANK.NS", name: "HDFC Bank", price: 1680, sector: "Banking", marketCap: 1280000, marketCapCategory: "large", pe: 19.5, pb: 2.8, dividendYield: 1.2, week52High: 1795, week52Low: 1420 },
  { symbol: "ICICIBANK", yahooSymbol: "ICICIBANK.NS", name: "ICICI Bank", price: 1120, sector: "Banking", marketCap: 785000, marketCapCategory: "large", pe: 17.8, pb: 2.9, dividendYield: 0.8, week52High: 1265, week52Low: 875 },
  { symbol: "SBIN", yahooSymbol: "SBIN.NS", name: "State Bank of India", price: 780, sector: "Banking", marketCap: 696000, marketCapCategory: "large", pe: 11.2, pb: 1.8, dividendYield: 1.6, week52High: 912, week52Low: 555 },
  { symbol: "KOTAKBANK", yahooSymbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank", price: 1850, sector: "Banking", marketCap: 368000, marketCapCategory: "large", pe: 21.5, pb: 3.2, dividendYield: 0.1, week52High: 2065, week52Low: 1545 },
  { symbol: "AXISBANK", yahooSymbol: "AXISBANK.NS", name: "Axis Bank", price: 1080, sector: "Banking", marketCap: 334000, marketCapCategory: "large", pe: 14.2, pb: 2.1, dividendYield: 0.1, week52High: 1340, week52Low: 880 },
  { symbol: "INDUSINDBK", yahooSymbol: "INDUSINDBK.NS", name: "IndusInd Bank", price: 1420, sector: "Banking", marketCap: 110000, marketCapCategory: "large", pe: 12.5, pb: 1.8, dividendYield: 1.1, week52High: 1695, week52Low: 985 },
  { symbol: "BANDHANBNK", yahooSymbol: "BANDHANBNK.NS", name: "Bandhan Bank", price: 195, sector: "Banking", marketCap: 31500, marketCapCategory: "large", pe: 9.8, pb: 1.2, dividendYield: 0, week52High: 265, week52Low: 165 },
  { symbol: "FEDERALBNK", yahooSymbol: "FEDERALBNK.NS", name: "Federal Bank", price: 165, sector: "Banking", marketCap: 40200, marketCapCategory: "large", pe: 11.5, pb: 1.4, dividendYield: 1.5, week52High: 195, week52Low: 130 },
  { symbol: "IDFCFIRSTB", yahooSymbol: "IDFCFIRSTB.NS", name: "IDFC First Bank", price: 78, sector: "Banking", marketCap: 56800, marketCapCategory: "large", pe: 15.2, pb: 1.3, dividendYield: 0, week52High: 98, week52Low: 62 },
  { symbol: "PNB", yahooSymbol: "PNB.NS", name: "Punjab National Bank", price: 105, sector: "Banking", marketCap: 115000, marketCapCategory: "large", pe: 8.5, pb: 0.9, dividendYield: 2.1, week52High: 142, week52Low: 72 },
  { symbol: "BANKBARODA", yahooSymbol: "BANKBARODA.NS", name: "Bank of Baroda", price: 245, sector: "Banking", marketCap: 126500, marketCapCategory: "large", pe: 6.8, pb: 1.1, dividendYield: 2.8, week52High: 298, week52Low: 185 },
  { symbol: "CANBK", yahooSymbol: "CANBK.NS", name: "Canara Bank", price: 108, sector: "Banking", marketCap: 98000, marketCapCategory: "large", pe: 5.8, pb: 1.0, dividendYield: 2.5, week52High: 128, week52Low: 78 },
  { symbol: "AUBANK", yahooSymbol: "AUBANK.NS", name: "AU Small Finance Bank", price: 620, sector: "Banking", marketCap: 46200, marketCapCategory: "large", pe: 28.5, pb: 4.2, dividendYield: 0.2, week52High: 785, week52Low: 520 },
  { symbol: "RBLBANK", yahooSymbol: "RBLBANK.NS", name: "RBL Bank", price: 185, sector: "Banking", marketCap: 11200, marketCapCategory: "mid", pe: 12.8, pb: 0.8, dividendYield: 0, week52High: 295, week52Low: 145 },
  { symbol: "YESBANK", yahooSymbol: "YESBANK.NS", name: "Yes Bank", price: 22, sector: "Banking", marketCap: 68900, marketCapCategory: "large", pe: 35.2, pb: 1.5, dividendYield: 0, week52High: 32, week52Low: 14 },

  // IT (12 stocks)
  { symbol: "TCS", yahooSymbol: "TCS.NS", name: "Tata Consultancy Services", price: 3950, sector: "IT", marketCap: 1428000, marketCapCategory: "large", pe: 28.5, pb: 13.2, dividendYield: 1.3, week52High: 4255, week52Low: 3065 },
  { symbol: "INFY", yahooSymbol: "INFY.NS", name: "Infosys", price: 1520, sector: "IT", marketCap: 631000, marketCapCategory: "large", pe: 23.8, pb: 8.5, dividendYield: 2.5, week52High: 1795, week52Low: 1215 },
  { symbol: "WIPRO", yahooSymbol: "WIPRO.NS", name: "Wipro", price: 445, sector: "IT", marketCap: 232500, marketCapCategory: "large", pe: 19.2, pb: 3.8, dividendYield: 0.2, week52High: 585, week52Low: 375 },
  { symbol: "HCLTECH", yahooSymbol: "HCLTECH.NS", name: "HCL Technologies", price: 1780, sector: "IT", marketCap: 483000, marketCapCategory: "large", pe: 25.6, pb: 6.8, dividendYield: 3.2, week52High: 1945, week52Low: 1135 },
  { symbol: "TECHM", yahooSymbol: "TECHM.NS", name: "Tech Mahindra", price: 1650, sector: "IT", marketCap: 161200, marketCapCategory: "large", pe: 35.2, pb: 4.5, dividendYield: 2.1, week52High: 1785, week52Low: 1045 },
  { symbol: "LTIM", yahooSymbol: "LTIM.NS", name: "LTIMindtree", price: 5850, sector: "IT", marketCap: 173000, marketCapCategory: "large", pe: 32.8, pb: 9.2, dividendYield: 1.1, week52High: 6825, week52Low: 4585 },
  { symbol: "MPHASIS", yahooSymbol: "MPHASIS.NS", name: "Mphasis", price: 2680, sector: "IT", marketCap: 50500, marketCapCategory: "large", pe: 27.5, pb: 6.2, dividendYield: 2.2, week52High: 3185, week52Low: 2085 },
  { symbol: "COFORGE", yahooSymbol: "COFORGE.NS", name: "Coforge", price: 5450, sector: "IT", marketCap: 35800, marketCapCategory: "large", pe: 38.5, pb: 8.5, dividendYield: 1.0, week52High: 6985, week52Low: 4250 },
  { symbol: "PERSISTENT", yahooSymbol: "PERSISTENT.NS", name: "Persistent Systems", price: 5200, sector: "IT", marketCap: 40200, marketCapCategory: "large", pe: 42.5, pb: 12.8, dividendYield: 0.6, week52High: 6450, week52Low: 3685 },
  { symbol: "LTTS", yahooSymbol: "LTTS.NS", name: "L&T Technology Services", price: 4850, sector: "IT", marketCap: 51200, marketCapCategory: "large", pe: 35.8, pb: 10.2, dividendYield: 1.2, week52High: 5685, week52Low: 3875 },
  { symbol: "OFSS", yahooSymbol: "OFSS.NS", name: "Oracle Financial Services", price: 9800, sector: "IT", marketCap: 84800, marketCapCategory: "large", pe: 28.2, pb: 8.5, dividendYield: 1.8, week52High: 11250, week52Low: 6850 },
  { symbol: "CYIENT", yahooSymbol: "CYIENT.NS", name: "Cyient", price: 1920, sector: "IT", marketCap: 21200, marketCapCategory: "large", pe: 24.8, pb: 4.2, dividendYield: 1.5, week52High: 2285, week52Low: 1485 },

  // OIL & GAS (8 stocks)
  { symbol: "RELIANCE", yahooSymbol: "RELIANCE.NS", name: "Reliance Industries", price: 2850, sector: "Oil & Gas", marketCap: 1928000, marketCapCategory: "large", pe: 25.8, pb: 2.5, dividendYield: 0.3, week52High: 3025, week52Low: 2220 },
  { symbol: "ONGC", yahooSymbol: "ONGC.NS", name: "ONGC", price: 265, sector: "Oil & Gas", marketCap: 333500, marketCapCategory: "large", pe: 7.2, pb: 1.1, dividendYield: 4.5, week52High: 345, week52Low: 175 },
  { symbol: "BPCL", yahooSymbol: "BPCL.NS", name: "Bharat Petroleum", price: 585, sector: "Oil & Gas", marketCap: 127000, marketCapCategory: "large", pe: 4.5, pb: 1.8, dividendYield: 5.2, week52High: 685, week52Low: 365 },
  { symbol: "IOC", yahooSymbol: "IOC.NS", name: "Indian Oil Corporation", price: 168, sector: "Oil & Gas", marketCap: 237000, marketCapCategory: "large", pe: 5.8, pb: 1.2, dividendYield: 6.8, week52High: 196, week52Low: 95 },
  { symbol: "HINDPETRO", yahooSymbol: "HINDPETRO.NS", name: "Hindustan Petroleum", price: 385, sector: "Oil & Gas", marketCap: 54500, marketCapCategory: "large", pe: 4.2, pb: 1.5, dividendYield: 5.5, week52High: 455, week52Low: 245 },
  { symbol: "GAIL", yahooSymbol: "GAIL.NS", name: "GAIL India", price: 195, sector: "Oil & Gas", marketCap: 128500, marketCapCategory: "large", pe: 10.8, pb: 1.4, dividendYield: 3.2, week52High: 235, week52Low: 125 },
  { symbol: "PETRONET", yahooSymbol: "PETRONET.NS", name: "Petronet LNG", price: 345, sector: "Oil & Gas", marketCap: 51700, marketCapCategory: "large", pe: 12.5, pb: 2.8, dividendYield: 3.5, week52High: 385, week52Low: 225 },
  { symbol: "OIL", yahooSymbol: "OIL.NS", name: "Oil India", price: 520, sector: "Oil & Gas", marketCap: 56400, marketCapCategory: "large", pe: 6.8, pb: 1.2, dividendYield: 4.8, week52High: 685, week52Low: 285 },

  // FMCG (10 stocks)
  { symbol: "HINDUNILVR", yahooSymbol: "HINDUNILVR.NS", name: "Hindustan Unilever", price: 2450, sector: "FMCG", marketCap: 575500, marketCapCategory: "large", pe: 55.2, pb: 11.5, dividendYield: 1.5, week52High: 2855, week52Low: 2175 },
  { symbol: "ITC", yahooSymbol: "ITC.NS", name: "ITC", price: 460, sector: "FMCG", marketCap: 574000, marketCapCategory: "large", pe: 28.5, pb: 7.8, dividendYield: 3.2, week52High: 528, week52Low: 395 },
  { symbol: "NESTLEIND", yahooSymbol: "NESTLEIND.NS", name: "Nestle India", price: 2480, sector: "FMCG", marketCap: 239000, marketCapCategory: "large", pe: 72.5, pb: 82.5, dividendYield: 1.2, week52High: 2785, week52Low: 2145 },
  { symbol: "BRITANNIA", yahooSymbol: "BRITANNIA.NS", name: "Britannia Industries", price: 5200, sector: "FMCG", marketCap: 125200, marketCapCategory: "large", pe: 58.2, pb: 35.8, dividendYield: 1.5, week52High: 6105, week52Low: 4565 },
  { symbol: "DABUR", yahooSymbol: "DABUR.NS", name: "Dabur India", price: 585, sector: "FMCG", marketCap: 103600, marketCapCategory: "large", pe: 52.8, pb: 12.2, dividendYield: 0.9, week52High: 665, week52Low: 495 },
  { symbol: "MARICO", yahooSymbol: "MARICO.NS", name: "Marico", price: 635, sector: "FMCG", marketCap: 82100, marketCapCategory: "large", pe: 55.5, pb: 16.8, dividendYield: 1.4, week52High: 725, week52Low: 485 },
  { symbol: "GODREJCP", yahooSymbol: "GODREJCP.NS", name: "Godrej Consumer Products", price: 1280, sector: "FMCG", marketCap: 131000, marketCapCategory: "large", pe: 62.5, pb: 8.2, dividendYield: 1.0, week52High: 1515, week52Low: 985 },
  { symbol: "COLPAL", yahooSymbol: "COLPAL.NS", name: "Colgate-Palmolive", price: 2850, sector: "FMCG", marketCap: 77500, marketCapCategory: "large", pe: 48.5, pb: 45.2, dividendYield: 2.1, week52High: 3285, week52Low: 2385 },
  { symbol: "TATACONSUM", yahooSymbol: "TATACONSUM.NS", name: "Tata Consumer Products", price: 1120, sector: "FMCG", marketCap: 110500, marketCapCategory: "large", pe: 78.5, pb: 8.5, dividendYield: 0.8, week52High: 1285, week52Low: 885 },
  { symbol: "VBL", yahooSymbol: "VBL.NS", name: "Varun Beverages", price: 1580, sector: "FMCG", marketCap: 205000, marketCapCategory: "large", pe: 85.2, pb: 22.5, dividendYield: 0.2, week52High: 1825, week52Low: 1285 },

  // PHARMA (10 stocks)
  { symbol: "SUNPHARMA", yahooSymbol: "SUNPHARMA.NS", name: "Sun Pharma", price: 1620, sector: "Pharma", marketCap: 388500, marketCapCategory: "large", pe: 32.5, pb: 4.8, dividendYield: 0.6, week52High: 1955, week52Low: 1175 },
  { symbol: "DRREDDY", yahooSymbol: "DRREDDY.NS", name: "Dr. Reddy's Laboratories", price: 6200, sector: "Pharma", marketCap: 103200, marketCapCategory: "large", pe: 18.5, pb: 3.5, dividendYield: 0.5, week52High: 6850, week52Low: 5125 },
  { symbol: "CIPLA", yahooSymbol: "CIPLA.NS", name: "Cipla", price: 1480, sector: "Pharma", marketCap: 119500, marketCapCategory: "large", pe: 28.2, pb: 4.2, dividendYield: 0.7, week52High: 1685, week52Low: 1085 },
  { symbol: "DIVISLAB", yahooSymbol: "DIVISLAB.NS", name: "Divi's Laboratories", price: 4950, sector: "Pharma", marketCap: 131500, marketCapCategory: "large", pe: 52.8, pb: 8.5, dividendYield: 0.6, week52High: 5485, week52Low: 3185 },
  { symbol: "APOLLOHOSP", yahooSymbol: "APOLLOHOSP.NS", name: "Apollo Hospitals", price: 6800, sector: "Pharma", marketCap: 97800, marketCapCategory: "large", pe: 88.5, pb: 12.5, dividendYield: 0.2, week52High: 7250, week52Low: 5185 },
  { symbol: "LUPIN", yahooSymbol: "LUPIN.NS", name: "Lupin", price: 1680, sector: "Pharma", marketCap: 76500, marketCapCategory: "large", pe: 32.8, pb: 4.2, dividendYield: 0.5, week52High: 2185, week52Low: 1285 },
  { symbol: "BIOCON", yahooSymbol: "BIOCON.NS", name: "Biocon", price: 285, sector: "Pharma", marketCap: 34200, marketCapCategory: "large", pe: 42.5, pb: 2.8, dividendYield: 0.4, week52High: 385, week52Low: 225 },
  { symbol: "TORNTPHARM", yahooSymbol: "TORNTPHARM.NS", name: "Torrent Pharmaceuticals", price: 2850, sector: "Pharma", marketCap: 96200, marketCapCategory: "large", pe: 58.2, pb: 12.5, dividendYield: 0.8, week52High: 3285, week52Low: 2185 },
  { symbol: "ALKEM", yahooSymbol: "ALKEM.NS", name: "Alkem Laboratories", price: 5450, sector: "Pharma", marketCap: 65200, marketCapCategory: "large", pe: 28.5, pb: 5.2, dividendYield: 0.9, week52High: 6285, week52Low: 4285 },
  { symbol: "AUROPHARMA", yahooSymbol: "AUROPHARMA.NS", name: "Aurobindo Pharma", price: 1280, sector: "Pharma", marketCap: 75000, marketCapCategory: "large", pe: 18.2, pb: 2.5, dividendYield: 0.6, week52High: 1485, week52Low: 885 },

  // AUTO (10 stocks)
  { symbol: "TATAMOTORS", yahooSymbol: "TATAMOTORS.NS", name: "Tata Motors", price: 920, sector: "Auto", marketCap: 339000, marketCapCategory: "large", pe: 8.5, pb: 3.2, dividendYield: 0.3, week52High: 1085, week52Low: 615 },
  { symbol: "MARUTI", yahooSymbol: "MARUTI.NS", name: "Maruti Suzuki", price: 10800, sector: "Auto", marketCap: 340000, marketCapCategory: "large", pe: 28.5, pb: 4.8, dividendYield: 0.8, week52High: 13285, week52Low: 9585 },
  { symbol: "M&M", yahooSymbol: "M&M.NS", name: "Mahindra & Mahindra", price: 2850, sector: "Auto", marketCap: 354000, marketCapCategory: "large", pe: 18.5, pb: 4.2, dividendYield: 0.7, week52High: 3285, week52Low: 2185 },
  { symbol: "BAJAJ-AUTO", yahooSymbol: "BAJAJ-AUTO.NS", name: "Bajaj Auto", price: 9200, sector: "Auto", marketCap: 257000, marketCapCategory: "large", pe: 32.5, pb: 8.5, dividendYield: 0.8, week52High: 12085, week52Low: 6285 },
  { symbol: "EICHERMOT", yahooSymbol: "EICHERMOT.NS", name: "Eicher Motors", price: 4850, sector: "Auto", marketCap: 133000, marketCapCategory: "large", pe: 35.2, pb: 7.8, dividendYield: 0.6, week52High: 5285, week52Low: 3485 },
  { symbol: "HEROMOTOCO", yahooSymbol: "HEROMOTOCO.NS", name: "Hero MotoCorp", price: 4200, sector: "Auto", marketCap: 84000, marketCapCategory: "large", pe: 22.5, pb: 4.5, dividendYield: 2.5, week52High: 5085, week52Low: 2785 },
  { symbol: "TVSMOTOR", yahooSymbol: "TVSMOTOR.NS", name: "TVS Motor", price: 2450, sector: "Auto", marketCap: 116500, marketCapCategory: "large", pe: 58.5, pb: 14.5, dividendYield: 0.5, week52High: 2885, week52Low: 1585 },
  { symbol: "ASHOKLEY", yahooSymbol: "ASHOKLEY.NS", name: "Ashok Leyland", price: 185, sector: "Auto", marketCap: 54300, marketCapCategory: "large", pe: 22.8, pb: 4.2, dividendYield: 1.8, week52High: 225, week52Low: 145 },
  { symbol: "MOTHERSON", yahooSymbol: "MOTHERSON.NS", name: "Samvardhana Motherson", price: 145, sector: "Auto", marketCap: 98500, marketCapCategory: "large", pe: 38.5, pb: 5.8, dividendYield: 0.5, week52High: 185, week52Low: 95 },
  { symbol: "BHARATFORG", yahooSymbol: "BHARATFORG.NS", name: "Bharat Forge", price: 1350, sector: "Auto", marketCap: 62900, marketCapCategory: "large", pe: 52.5, pb: 8.2, dividendYield: 0.5, week52High: 1685, week52Low: 985 },

  // METALS (8 stocks)
  { symbol: "TATASTEEL", yahooSymbol: "TATASTEEL.NS", name: "Tata Steel", price: 145, sector: "Metals", marketCap: 181000, marketCapCategory: "large", pe: 52.5, pb: 1.5, dividendYield: 2.2, week52High: 175, week52Low: 105 },
  { symbol: "JSWSTEEL", yahooSymbol: "JSWSTEEL.NS", name: "JSW Steel", price: 890, sector: "Metals", marketCap: 215000, marketCapCategory: "large", pe: 28.5, pb: 2.8, dividendYield: 0.8, week52High: 1015, week52Low: 685 },
  { symbol: "HINDALCO", yahooSymbol: "HINDALCO.NS", name: "Hindalco", price: 620, sector: "Metals", marketCap: 139500, marketCapCategory: "large", pe: 12.5, pb: 1.4, dividendYield: 0.5, week52High: 715, week52Low: 425 },
  { symbol: "VEDL", yahooSymbol: "VEDL.NS", name: "Vedanta", price: 445, sector: "Metals", marketCap: 165500, marketCapCategory: "large", pe: 8.2, pb: 2.5, dividendYield: 6.8, week52High: 505, week52Low: 285 },
  { symbol: "COALINDIA", yahooSymbol: "COALINDIA.NS", name: "Coal India", price: 420, sector: "Metals", marketCap: 258500, marketCapCategory: "large", pe: 7.8, pb: 2.8, dividendYield: 5.5, week52High: 535, week52Low: 295 },
  { symbol: "NMDC", yahooSymbol: "NMDC.NS", name: "NMDC", price: 225, sector: "Metals", marketCap: 65900, marketCapCategory: "large", pe: 8.5, pb: 1.8, dividendYield: 3.5, week52High: 285, week52Low: 145 },
  { symbol: "SAIL", yahooSymbol: "SAIL.NS", name: "Steel Authority of India", price: 125, sector: "Metals", marketCap: 51600, marketCapCategory: "large", pe: 15.8, pb: 0.8, dividendYield: 2.8, week52High: 155, week52Low: 85 },
  { symbol: "JINDALSTEL", yahooSymbol: "JINDALSTEL.NS", name: "Jindal Steel & Power", price: 920, sector: "Metals", marketCap: 93800, marketCapCategory: "large", pe: 12.5, pb: 1.8, dividendYield: 0.4, week52High: 1085, week52Low: 585 },

  // POWER & UTILITIES (8 stocks)
  { symbol: "NTPC", yahooSymbol: "NTPC.NS", name: "NTPC", price: 385, sector: "Power", marketCap: 373000, marketCapCategory: "large", pe: 15.8, pb: 2.2, dividendYield: 2.5, week52High: 448, week52Low: 245 },
  { symbol: "POWERGRID", yahooSymbol: "POWERGRID.NS", name: "Power Grid Corporation", price: 295, sector: "Power", marketCap: 274500, marketCapCategory: "large", pe: 14.5, pb: 2.5, dividendYield: 4.2, week52High: 345, week52Low: 225 },
  { symbol: "ADANIGREEN", yahooSymbol: "ADANIGREEN.NS", name: "Adani Green Energy", price: 1850, sector: "Power", marketCap: 292500, marketCapCategory: "large", pe: 285, pb: 42.5, dividendYield: 0, week52High: 2285, week52Low: 885 },
  { symbol: "TATAPOWER", yahooSymbol: "TATAPOWER.NS", name: "Tata Power", price: 435, sector: "Power", marketCap: 139000, marketCapCategory: "large", pe: 38.5, pb: 4.8, dividendYield: 0.5, week52High: 485, week52Low: 285 },
  { symbol: "NHPC", yahooSymbol: "NHPC.NS", name: "NHPC", price: 95, sector: "Power", marketCap: 95200, marketCapCategory: "large", pe: 18.5, pb: 2.2, dividendYield: 3.8, week52High: 118, week52Low: 52 },
  { symbol: "TORNTPOWER", yahooSymbol: "TORNTPOWER.NS", name: "Torrent Power", price: 1580, sector: "Power", marketCap: 75900, marketCapCategory: "large", pe: 28.5, pb: 4.5, dividendYield: 1.5, week52High: 1885, week52Low: 1185 },
  { symbol: "SJVN", yahooSymbol: "SJVN.NS", name: "SJVN", price: 118, sector: "Power", marketCap: 46300, marketCapCategory: "large", pe: 32.5, pb: 3.2, dividendYield: 2.8, week52High: 168, week52Low: 68 },
  { symbol: "JSWENERGY", yahooSymbol: "JSWENERGY.NS", name: "JSW Energy", price: 645, sector: "Power", marketCap: 112500, marketCapCategory: "large", pe: 52.5, pb: 5.8, dividendYield: 0.4, week52High: 745, week52Low: 385 },

  // INFRASTRUCTURE (8 stocks)
  { symbol: "LT", yahooSymbol: "LT.NS", name: "Larsen & Toubro", price: 3400, sector: "Infrastructure", marketCap: 466500, marketCapCategory: "large", pe: 32.5, pb: 5.2, dividendYield: 0.8, week52High: 3885, week52Low: 2685 },
  { symbol: "ADANIENT", yahooSymbol: "ADANIENT.NS", name: "Adani Enterprises", price: 2850, sector: "Infrastructure", marketCap: 325000, marketCapCategory: "large", pe: 78.5, pb: 8.5, dividendYield: 0.1, week52High: 3485, week52Low: 2085 },
  { symbol: "ADANIPORTS", yahooSymbol: "ADANIPORTS.NS", name: "Adani Ports", price: 1280, sector: "Infrastructure", marketCap: 276500, marketCapCategory: "large", pe: 28.5, pb: 4.8, dividendYield: 0.4, week52High: 1605, week52Low: 885 },
  { symbol: "ULTRACEMCO", yahooSymbol: "ULTRACEMCO.NS", name: "UltraTech Cement", price: 11200, sector: "Infrastructure", marketCap: 323500, marketCapCategory: "large", pe: 42.5, pb: 5.8, dividendYield: 0.4, week52High: 12485, week52Low: 8285 },
  { symbol: "GRASIM", yahooSymbol: "GRASIM.NS", name: "Grasim Industries", price: 2450, sector: "Infrastructure", marketCap: 161500, marketCapCategory: "large", pe: 18.5, pb: 2.2, dividendYield: 0.4, week52High: 2885, week52Low: 1885 },
  { symbol: "SHREECEM", yahooSymbol: "SHREECEM.NS", name: "Shree Cement", price: 26500, sector: "Infrastructure", marketCap: 95500, marketCapCategory: "large", pe: 42.5, pb: 5.5, dividendYield: 0.4, week52High: 28585, week52Low: 22885 },
  { symbol: "AMBUJACEM", yahooSymbol: "AMBUJACEM.NS", name: "Ambuja Cements", price: 620, sector: "Infrastructure", marketCap: 123000, marketCapCategory: "large", pe: 32.5, pb: 3.5, dividendYield: 0.5, week52High: 685, week52Low: 385 },
  { symbol: "ACC", yahooSymbol: "ACC.NS", name: "ACC", price: 2350, sector: "Infrastructure", marketCap: 44100, marketCapCategory: "large", pe: 18.5, pb: 2.8, dividendYield: 0.8, week52High: 2685, week52Low: 1685 },

  // FINANCE (8 stocks)
  { symbol: "BAJFINANCE", yahooSymbol: "BAJFINANCE.NS", name: "Bajaj Finance", price: 6800, sector: "Finance", marketCap: 421000, marketCapCategory: "large", pe: 28.5, pb: 6.2, dividendYield: 0.4, week52High: 8285, week52Low: 5985 },
  { symbol: "BAJAJFINSV", yahooSymbol: "BAJAJFINSV.NS", name: "Bajaj Finserv", price: 1650, sector: "Finance", marketCap: 263000, marketCapCategory: "large", pe: 22.5, pb: 3.8, dividendYield: 0.1, week52High: 1985, week52Low: 1385 },
  { symbol: "HDFCLIFE", yahooSymbol: "HDFCLIFE.NS", name: "HDFC Life Insurance", price: 685, sector: "Finance", marketCap: 147200, marketCapCategory: "large", pe: 85.5, pb: 12.5, dividendYield: 0.3, week52High: 785, week52Low: 525 },
  { symbol: "SBILIFE", yahooSymbol: "SBILIFE.NS", name: "SBI Life Insurance", price: 1580, sector: "Finance", marketCap: 158200, marketCapCategory: "large", pe: 72.5, pb: 11.8, dividendYield: 0.2, week52High: 1885, week52Low: 1185 },
  { symbol: "ICICIPRULI", yahooSymbol: "ICICIPRULI.NS", name: "ICICI Prudential Life", price: 620, sector: "Finance", marketCap: 89200, marketCapCategory: "large", pe: 68.5, pb: 8.5, dividendYield: 0.3, week52High: 745, week52Low: 485 },
  { symbol: "ICICIGI", yahooSymbol: "ICICIGI.NS", name: "ICICI Lombard GIC", price: 1780, sector: "Finance", marketCap: 87600, marketCapCategory: "large", pe: 42.5, pb: 8.2, dividendYield: 0.5, week52High: 1985, week52Low: 1285 },
  { symbol: "MUTHOOTFIN", yahooSymbol: "MUTHOOTFIN.NS", name: "Muthoot Finance", price: 1650, sector: "Finance", marketCap: 66200, marketCapCategory: "large", pe: 14.5, pb: 2.5, dividendYield: 1.2, week52High: 1985, week52Low: 1185 },
  { symbol: "CHOLAFIN", yahooSymbol: "CHOLAFIN.NS", name: "Cholamandalam Investment", price: 1280, sector: "Finance", marketCap: 107500, marketCapCategory: "large", pe: 25.5, pb: 5.2, dividendYield: 0.2, week52High: 1585, week52Low: 985 },

  // TELECOM (4 stocks)
  { symbol: "BHARTIARTL", yahooSymbol: "BHARTIARTL.NS", name: "Bharti Airtel", price: 1620, sector: "Telecom", marketCap: 915000, marketCapCategory: "large", pe: 78.5, pb: 8.5, dividendYield: 0.3, week52High: 1785, week52Low: 1085 },
  { symbol: "IDEA", yahooSymbol: "IDEA.NS", name: "Vodafone Idea", price: 14, sector: "Telecom", marketCap: 97500, marketCapCategory: "large", pe: -5.2, pb: 0.5, dividendYield: 0, week52High: 19, week52Low: 8 },
  { symbol: "TATACOMM", yahooSymbol: "TATACOMM.NS", name: "Tata Communications", price: 1820, sector: "Telecom", marketCap: 51800, marketCapCategory: "large", pe: 42.5, pb: 12.5, dividendYield: 0.8, week52High: 2285, week52Low: 1485 },
  { symbol: "INDUSTOWER", yahooSymbol: "INDUSTOWER.NS", name: "Indus Towers", price: 345, sector: "Telecom", marketCap: 92800, marketCapCategory: "large", pe: 18.5, pb: 2.8, dividendYield: 2.5, week52High: 445, week52Low: 185 },

  // CONSUMER (6 stocks)
  { symbol: "TITAN", yahooSymbol: "TITAN.NS", name: "Titan Company", price: 3200, sector: "Consumer", marketCap: 284000, marketCapCategory: "large", pe: 85.5, pb: 22.5, dividendYield: 0.3, week52High: 3885, week52Low: 2685 },
  { symbol: "ASIANPAINT", yahooSymbol: "ASIANPAINT.NS", name: "Asian Paints", price: 2950, sector: "Consumer", marketCap: 283000, marketCapCategory: "large", pe: 55.2, pb: 18.5, dividendYield: 0.7, week52High: 3485, week52Low: 2485 },
  { symbol: "PAGEIND", yahooSymbol: "PAGEIND.NS", name: "Page Industries", price: 42000, sector: "Consumer", marketCap: 46800, marketCapCategory: "large", pe: 72.5, pb: 28.5, dividendYield: 0.6, week52High: 48585, week52Low: 34585 },
  { symbol: "PIDILITIND", yahooSymbol: "PIDILITIND.NS", name: "Pidilite Industries", price: 2950, sector: "Consumer", marketCap: 150000, marketCapCategory: "large", pe: 82.5, pb: 22.5, dividendYield: 0.4, week52High: 3385, week52Low: 2385 },
  { symbol: "HAVELLS", yahooSymbol: "HAVELLS.NS", name: "Havells India", price: 1620, sector: "Consumer", marketCap: 101500, marketCapCategory: "large", pe: 68.5, pb: 12.5, dividendYield: 0.6, week52High: 1885, week52Low: 1285 },
  { symbol: "VOLTAS", yahooSymbol: "VOLTAS.NS", name: "Voltas", price: 1280, sector: "Consumer", marketCap: 42400, marketCapCategory: "large", pe: 52.5, pb: 8.5, dividendYield: 0.4, week52High: 1685, week52Low: 885 },

  // REAL ESTATE (4 stocks)
  { symbol: "DLF", yahooSymbol: "DLF.NS", name: "DLF", price: 850, sector: "Real Estate", marketCap: 210500, marketCapCategory: "large", pe: 48.5, pb: 3.8, dividendYield: 0.5, week52High: 985, week52Low: 545 },
  { symbol: "GODREJPROP", yahooSymbol: "GODREJPROP.NS", name: "Godrej Properties", price: 2650, sector: "Real Estate", marketCap: 73500, marketCapCategory: "large", pe: 68.5, pb: 5.8, dividendYield: 0, week52High: 3185, week52Low: 1985 },
  { symbol: "OBEROIRLTY", yahooSymbol: "OBEROIRLTY.NS", name: "Oberoi Realty", price: 1620, sector: "Real Estate", marketCap: 58900, marketCapCategory: "large", pe: 28.5, pb: 4.2, dividendYield: 0.3, week52High: 1985, week52Low: 1085 },
  { symbol: "PRESTIGE", yahooSymbol: "PRESTIGE.NS", name: "Prestige Estates", price: 1180, sector: "Real Estate", marketCap: 47300, marketCapCategory: "large", pe: 42.5, pb: 4.8, dividendYield: 0.2, week52High: 1585, week52Low: 785 },

  // AVIATION & LOGISTICS (4 stocks)
  { symbol: "INDIGO", yahooSymbol: "INDIGO.NS", name: "InterGlobe Aviation", price: 4250, sector: "Aviation", marketCap: 163800, marketCapCategory: "large", pe: 18.5, pb: 22.5, dividendYield: 0, week52High: 4985, week52Low: 2685 },
  { symbol: "DELHIVERY", yahooSymbol: "DELHIVERY.NS", name: "Delhivery", price: 385, sector: "Logistics", marketCap: 28400, marketCapCategory: "large", pe: -85.5, pb: 2.8, dividendYield: 0, week52High: 485, week52Low: 285 },
  { symbol: "BLUEDART", yahooSymbol: "BLUEDART.NS", name: "Blue Dart Express", price: 7850, sector: "Logistics", marketCap: 18700, marketCapCategory: "mid", pe: 52.5, pb: 18.5, dividendYield: 0.8, week52High: 9285, week52Low: 5585 },
  { symbol: "CONCOR", yahooSymbol: "CONCOR.NS", name: "Container Corporation", price: 785, sector: "Logistics", marketCap: 47800, marketCapCategory: "large", pe: 32.5, pb: 3.2, dividendYield: 1.5, week52High: 1085, week52Low: 585 },

  // MID CAP STOCKS (additional)
  { symbol: "ZOMATO", yahooSymbol: "ZOMATO.NS", name: "Zomato", price: 185, sector: "Consumer", marketCap: 163500, marketCapCategory: "large", pe: 285, pb: 8.5, dividendYield: 0, week52High: 265, week52Low: 85 },
  { symbol: "PAYTM", yahooSymbol: "PAYTM.NS", name: "One97 Communications", price: 385, sector: "Finance", marketCap: 24500, marketCapCategory: "large", pe: -25.5, pb: 2.5, dividendYield: 0, week52High: 985, week52Low: 315 },
  { symbol: "NYKAA", yahooSymbol: "NYKAA.NS", name: "FSN E-Commerce Ventures", price: 165, sector: "Consumer", marketCap: 46800, marketCapCategory: "large", pe: 885, pb: 18.5, dividendYield: 0, week52High: 235, week52Low: 125 },
  { symbol: "POLICYBZR", yahooSymbol: "POLICYBZR.NS", name: "PB Fintech", price: 1450, sector: "Finance", marketCap: 65200, marketCapCategory: "large", pe: -125, pb: 12.5, dividendYield: 0, week52High: 1685, week52Low: 485 },
  { symbol: "IRCTC", yahooSymbol: "IRCTC.NS", name: "IRCTC", price: 885, sector: "Consumer", marketCap: 70800, marketCapCategory: "large", pe: 52.5, pb: 18.5, dividendYield: 0.5, week52High: 1085, week52Low: 585 },
  { symbol: "TRENT", yahooSymbol: "TRENT.NS", name: "Trent", price: 5850, sector: "Consumer", marketCap: 207500, marketCapCategory: "large", pe: 185, pb: 42.5, dividendYield: 0.1, week52High: 7485, week52Low: 2685 },
  { symbol: "DIXON", yahooSymbol: "DIXON.NS", name: "Dixon Technologies", price: 12500, sector: "Consumer", marketCap: 74600, marketCapCategory: "large", pe: 125, pb: 32.5, dividendYield: 0.1, week52High: 15485, week52Low: 5585 },
  { symbol: "POLYCAB", yahooSymbol: "POLYCAB.NS", name: "Polycab India", price: 6250, sector: "Consumer", marketCap: 94000, marketCapCategory: "large", pe: 48.5, pb: 12.5, dividendYield: 0.4, week52High: 7485, week52Low: 4285 },
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

// Get all sectors (excluding Index)
export const getAllSectors = (): string[] => {
  return [...new Set(INDIAN_STOCKS.filter(s => s.sector !== "Index").map(s => s.sector))];
};

// Search stocks by symbol or name
export const searchStocks = (query: string): IndianStock[] => {
  const lowerQuery = query.toLowerCase();
  return INDIAN_STOCKS.filter(
    s => s.symbol.toLowerCase().includes(lowerQuery) || 
         s.name.toLowerCase().includes(lowerQuery)
  );
};

// Get stocks by market cap category
export const getStocksByMarketCap = (category: "large" | "mid" | "small"): IndianStock[] => {
  return INDIAN_STOCKS.filter(s => s.marketCapCategory === category && s.sector !== "Index");
};

// Filter stocks by price range
export const getStocksByPriceRange = (minPrice: number, maxPrice: number): IndianStock[] => {
  return INDIAN_STOCKS.filter(s => s.price >= minPrice && s.price <= maxPrice && s.sector !== "Index");
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

// Format market cap in Cr
export const formatMarketCap = (marketCap: number): string => {
  if (marketCap >= 100000) {
    return `₹${(marketCap / 100000).toFixed(2)} L Cr`;
  }
  return `₹${marketCap.toLocaleString('en-IN')} Cr`;
};
