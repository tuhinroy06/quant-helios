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
  // ============ INDICES ============
  { symbol: "NIFTY", yahooSymbol: "^NSEI", name: "NIFTY 50", price: 24500, sector: "Index", marketCap: 0, marketCapCategory: "large" },
  { symbol: "BANKNIFTY", yahooSymbol: "^NSEBANK", name: "Bank NIFTY", price: 51800, sector: "Index", marketCap: 0, marketCapCategory: "large" },
  { symbol: "NIFTYIT", yahooSymbol: "^CNXIT", name: "NIFTY IT", price: 41500, sector: "Index", marketCap: 0, marketCapCategory: "large" },
  { symbol: "NIFTYMIDCAP", yahooSymbol: "^NSEMDCP50", name: "NIFTY Midcap 50", price: 15800, sector: "Index", marketCap: 0, marketCapCategory: "large" },
  { symbol: "NIFTYSMLCAP", yahooSymbol: "^CNXSC", name: "NIFTY Smallcap 100", price: 18200, sector: "Index", marketCap: 0, marketCapCategory: "large" },
  { symbol: "NIFTYPHARMA", yahooSymbol: "^CNXPHARMA", name: "NIFTY Pharma", price: 21500, sector: "Index", marketCap: 0, marketCapCategory: "large" },
  { symbol: "NIFTYMETAL", yahooSymbol: "^CNXMETAL", name: "NIFTY Metal", price: 9200, sector: "Index", marketCap: 0, marketCapCategory: "large" },
  { symbol: "NIFTYAUTO", yahooSymbol: "^CNXAUTO", name: "NIFTY Auto", price: 23500, sector: "Index", marketCap: 0, marketCapCategory: "large" },
  { symbol: "NIFTYREALTY", yahooSymbol: "^CNXREALTY", name: "NIFTY Realty", price: 1050, sector: "Index", marketCap: 0, marketCapCategory: "large" },
  { symbol: "NIFTYFMCG", yahooSymbol: "^CNXFMCG", name: "NIFTY FMCG", price: 58500, sector: "Index", marketCap: 0, marketCapCategory: "large" },

  // ============ BANKING - LARGE CAP ============
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
  { symbol: "YESBANK", yahooSymbol: "YESBANK.NS", name: "Yes Bank", price: 22, sector: "Banking", marketCap: 68900, marketCapCategory: "large", pe: 35.2, pb: 1.5, dividendYield: 0, week52High: 32, week52Low: 14 },
  { symbol: "UNIONBANK", yahooSymbol: "UNIONBANK.NS", name: "Union Bank of India", price: 125, sector: "Banking", marketCap: 95500, marketCapCategory: "large", pe: 6.2, pb: 0.9, dividendYield: 3.2, week52High: 175, week52Low: 85 },
  { symbol: "INDIANB", yahooSymbol: "INDIANB.NS", name: "Indian Bank", price: 485, sector: "Banking", marketCap: 58500, marketCapCategory: "large", pe: 7.5, pb: 1.1, dividendYield: 2.8, week52High: 585, week52Low: 345 },
  { symbol: "CENTRALBK", yahooSymbol: "CENTRALBK.NS", name: "Central Bank of India", price: 52, sector: "Banking", marketCap: 45200, marketCapCategory: "large", pe: 12.5, pb: 0.8, dividendYield: 0, week52High: 78, week52Low: 35 },
  { symbol: "MAHABANK", yahooSymbol: "MAHABANK.NS", name: "Bank of Maharashtra", price: 58, sector: "Banking", marketCap: 43500, marketCapCategory: "large", pe: 8.2, pb: 1.2, dividendYield: 2.5, week52High: 78, week52Low: 42 },
  { symbol: "IOB", yahooSymbol: "IOB.NS", name: "Indian Overseas Bank", price: 52, sector: "Banking", marketCap: 98500, marketCapCategory: "large", pe: 18.5, pb: 1.5, dividendYield: 0, week52High: 72, week52Low: 35 },
  { symbol: "UCOBANK", yahooSymbol: "UCOBANK.NS", name: "UCO Bank", price: 48, sector: "Banking", marketCap: 57500, marketCapCategory: "large", pe: 12.8, pb: 1.2, dividendYield: 1.5, week52High: 68, week52Low: 32 },
  { symbol: "PSB", yahooSymbol: "PSB.NS", name: "Punjab & Sind Bank", price: 58, sector: "Banking", marketCap: 35800, marketCapCategory: "large", pe: 14.5, pb: 1.1, dividendYield: 0, week52High: 85, week52Low: 38 },
  { symbol: "KARURVYSYA", yahooSymbol: "KARURVYSYA.NS", name: "Karur Vysya Bank", price: 185, sector: "Banking", marketCap: 14800, marketCapCategory: "mid", pe: 8.5, pb: 1.2, dividendYield: 1.8, week52High: 225, week52Low: 125 },
  { symbol: "DCBBANK", yahooSymbol: "DCBBANK.NS", name: "DCB Bank", price: 118, sector: "Banking", marketCap: 3680, marketCapCategory: "small", pe: 8.8, pb: 0.8, dividendYield: 1.2, week52High: 165, week52Low: 95 },
  { symbol: "SOUTHBANK", yahooSymbol: "SOUTHBANK.NS", name: "South Indian Bank", price: 28, sector: "Banking", marketCap: 5850, marketCapCategory: "mid", pe: 6.5, pb: 0.7, dividendYield: 2.5, week52High: 38, week52Low: 18 },
  { symbol: "CSBBANK", yahooSymbol: "CSBBANK.NS", name: "CSB Bank", price: 325, sector: "Banking", marketCap: 5650, marketCapCategory: "mid", pe: 12.5, pb: 1.8, dividendYield: 0.8, week52High: 425, week52Low: 245 },
  { symbol: "RBLBANK", yahooSymbol: "RBLBANK.NS", name: "RBL Bank", price: 185, sector: "Banking", marketCap: 11200, marketCapCategory: "mid", pe: 12.8, pb: 0.8, dividendYield: 0, week52High: 295, week52Low: 145 },
  { symbol: "EQUITASBNK", yahooSymbol: "EQUITASBNK.NS", name: "Equitas Small Finance Bank", price: 85, sector: "Banking", marketCap: 9850, marketCapCategory: "mid", pe: 14.5, pb: 1.5, dividendYield: 0, week52High: 125, week52Low: 62 },
  { symbol: "UJJIVANSFB", yahooSymbol: "UJJIVANSFB.NS", name: "Ujjivan Small Finance Bank", price: 42, sector: "Banking", marketCap: 8120, marketCapCategory: "mid", pe: 8.5, pb: 1.2, dividendYield: 2.5, week52High: 58, week52Low: 32 },
  { symbol: "SURYODAY", yahooSymbol: "SURYODAY.NS", name: "Suryoday Small Finance Bank", price: 145, sector: "Banking", marketCap: 1580, marketCapCategory: "small", pe: 12.5, pb: 1.1, dividendYield: 0, week52High: 185, week52Low: 95 },
  { symbol: "ESAFSFB", yahooSymbol: "ESAFSFB.NS", name: "ESAF Small Finance Bank", price: 58, sector: "Banking", marketCap: 2850, marketCapCategory: "small", pe: 15.2, pb: 1.5, dividendYield: 0, week52High: 85, week52Low: 42 },

  // ============ IT - LARGE CAP ============
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
  { symbol: "ECLERX", yahooSymbol: "ECLERX.NS", name: "eClerx Services", price: 2850, sector: "IT", marketCap: 14200, marketCapCategory: "mid", pe: 22.5, pb: 6.8, dividendYield: 2.8, week52High: 3285, week52Low: 1985 },
  { symbol: "TATAELXSI", yahooSymbol: "TATAELXSI.NS", name: "Tata Elxsi", price: 6850, sector: "IT", marketCap: 42700, marketCapCategory: "large", pe: 52.5, pb: 18.5, dividendYield: 0.8, week52High: 9585, week52Low: 5185 },
  { symbol: "SONATSOFTW", yahooSymbol: "SONATSOFTW.NS", name: "Sonata Software", price: 585, sector: "IT", marketCap: 8500, marketCapCategory: "mid", pe: 32.5, pb: 8.5, dividendYield: 1.5, week52High: 825, week52Low: 425 },
  { symbol: "NEWGEN", yahooSymbol: "NEWGEN.NS", name: "Newgen Software", price: 1285, sector: "IT", marketCap: 9200, marketCapCategory: "mid", pe: 42.5, pb: 12.5, dividendYield: 0.5, week52High: 1585, week52Low: 785 },
  { symbol: "HAPPSTMNDS", yahooSymbol: "HAPPSTMNDS.NS", name: "Happiest Minds", price: 785, sector: "IT", marketCap: 11800, marketCapCategory: "mid", pe: 45.2, pb: 12.8, dividendYield: 0.8, week52High: 985, week52Low: 585 },
  { symbol: "ROUTE", yahooSymbol: "ROUTE.NS", name: "Route Mobile", price: 1650, sector: "IT", marketCap: 10200, marketCapCategory: "mid", pe: 38.5, pb: 8.2, dividendYield: 0.3, week52High: 2185, week52Low: 1085 },
  { symbol: "INTELLECT", yahooSymbol: "INTELLECT.NS", name: "Intellect Design Arena", price: 785, sector: "IT", marketCap: 10800, marketCapCategory: "mid", pe: 32.5, pb: 5.8, dividendYield: 0.4, week52High: 985, week52Low: 545 },
  { symbol: "KPITTECH", yahooSymbol: "KPITTECH.NS", name: "KPIT Technologies", price: 1485, sector: "IT", marketCap: 40500, marketCapCategory: "large", pe: 72.5, pb: 18.5, dividendYield: 0.3, week52High: 1885, week52Low: 885 },
  { symbol: "MASTEK", yahooSymbol: "MASTEK.NS", name: "Mastek", price: 2850, sector: "IT", marketCap: 8650, marketCapCategory: "mid", pe: 28.5, pb: 6.5, dividendYield: 0.8, week52High: 3585, week52Low: 1985 },
  { symbol: "RATEGAIN", yahooSymbol: "RATEGAIN.NS", name: "RateGain Travel Tech", price: 685, sector: "IT", marketCap: 7850, marketCapCategory: "mid", pe: 85.5, pb: 8.5, dividendYield: 0, week52High: 885, week52Low: 385 },
  { symbol: "TANLA", yahooSymbol: "TANLA.NS", name: "Tanla Platforms", price: 985, sector: "IT", marketCap: 13200, marketCapCategory: "mid", pe: 18.5, pb: 4.2, dividendYield: 0.5, week52High: 1285, week52Low: 685 },

  // ============ OIL & GAS ============
  { symbol: "RELIANCE", yahooSymbol: "RELIANCE.NS", name: "Reliance Industries", price: 2850, sector: "Oil & Gas", marketCap: 1928000, marketCapCategory: "large", pe: 25.8, pb: 2.5, dividendYield: 0.3, week52High: 3025, week52Low: 2220 },
  { symbol: "ONGC", yahooSymbol: "ONGC.NS", name: "ONGC", price: 265, sector: "Oil & Gas", marketCap: 333500, marketCapCategory: "large", pe: 7.2, pb: 1.1, dividendYield: 4.5, week52High: 345, week52Low: 175 },
  { symbol: "BPCL", yahooSymbol: "BPCL.NS", name: "Bharat Petroleum", price: 585, sector: "Oil & Gas", marketCap: 127000, marketCapCategory: "large", pe: 4.5, pb: 1.8, dividendYield: 5.2, week52High: 685, week52Low: 365 },
  { symbol: "IOC", yahooSymbol: "IOC.NS", name: "Indian Oil Corporation", price: 168, sector: "Oil & Gas", marketCap: 237000, marketCapCategory: "large", pe: 5.8, pb: 1.2, dividendYield: 6.8, week52High: 196, week52Low: 95 },
  { symbol: "HINDPETRO", yahooSymbol: "HINDPETRO.NS", name: "Hindustan Petroleum", price: 385, sector: "Oil & Gas", marketCap: 54500, marketCapCategory: "large", pe: 4.2, pb: 1.5, dividendYield: 5.5, week52High: 455, week52Low: 245 },
  { symbol: "GAIL", yahooSymbol: "GAIL.NS", name: "GAIL India", price: 195, sector: "Oil & Gas", marketCap: 128500, marketCapCategory: "large", pe: 10.8, pb: 1.4, dividendYield: 3.2, week52High: 235, week52Low: 125 },
  { symbol: "PETRONET", yahooSymbol: "PETRONET.NS", name: "Petronet LNG", price: 345, sector: "Oil & Gas", marketCap: 51700, marketCapCategory: "large", pe: 12.5, pb: 2.8, dividendYield: 3.5, week52High: 385, week52Low: 225 },
  { symbol: "OIL", yahooSymbol: "OIL.NS", name: "Oil India", price: 520, sector: "Oil & Gas", marketCap: 56400, marketCapCategory: "large", pe: 6.8, pb: 1.2, dividendYield: 4.8, week52High: 685, week52Low: 285 },
  { symbol: "MGL", yahooSymbol: "MGL.NS", name: "Mahanagar Gas", price: 1450, sector: "Oil & Gas", marketCap: 14350, marketCapCategory: "mid", pe: 12.5, pb: 2.8, dividendYield: 2.2, week52High: 1785, week52Low: 1085 },
  { symbol: "IGL", yahooSymbol: "IGL.NS", name: "Indraprastha Gas", price: 485, sector: "Oil & Gas", marketCap: 33900, marketCapCategory: "large", pe: 18.5, pb: 3.5, dividendYield: 1.2, week52High: 585, week52Low: 385 },
  { symbol: "GUJGAS", yahooSymbol: "GUJGAS.NS", name: "Gujarat Gas", price: 545, sector: "Oil & Gas", marketCap: 37500, marketCapCategory: "large", pe: 28.5, pb: 5.2, dividendYield: 0.8, week52High: 685, week52Low: 385 },
  { symbol: "MRPL", yahooSymbol: "MRPL.NS", name: "Mangalore Refinery", price: 185, sector: "Oil & Gas", marketCap: 32400, marketCapCategory: "large", pe: 8.5, pb: 1.5, dividendYield: 2.5, week52High: 265, week52Low: 125 },
  { symbol: "CHENNPETRO", yahooSymbol: "CHENNPETRO.NS", name: "Chennai Petroleum", price: 685, sector: "Oil & Gas", marketCap: 10200, marketCapCategory: "mid", pe: 4.5, pb: 1.2, dividendYield: 4.5, week52High: 985, week52Low: 385 },
  { symbol: "CASTROLIND", yahooSymbol: "CASTROLIND.NS", name: "Castrol India", price: 185, sector: "Oil & Gas", marketCap: 18300, marketCapCategory: "mid", pe: 22.5, pb: 12.5, dividendYield: 4.2, week52High: 225, week52Low: 125 },
  { symbol: "GSPL", yahooSymbol: "GSPL.NS", name: "Gujarat State Petronet", price: 385, sector: "Oil & Gas", marketCap: 21700, marketCapCategory: "large", pe: 12.5, pb: 1.8, dividendYield: 2.5, week52High: 485, week52Low: 285 },

  // ============ FMCG ============
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
  { symbol: "PGHH", yahooSymbol: "PGHH.NS", name: "Procter & Gamble Hygiene", price: 15800, sector: "FMCG", marketCap: 51300, marketCapCategory: "large", pe: 85.5, pb: 52.5, dividendYield: 1.5, week52High: 18585, week52Low: 13585 },
  { symbol: "GILLETTE", yahooSymbol: "GILLETTE.NS", name: "Gillette India", price: 6850, sector: "FMCG", marketCap: 22300, marketCapCategory: "large", pe: 62.5, pb: 22.5, dividendYield: 1.2, week52High: 7885, week52Low: 5585 },
  { symbol: "EMAMILTD", yahooSymbol: "EMAMILTD.NS", name: "Emami", price: 585, sector: "FMCG", marketCap: 25800, marketCapCategory: "large", pe: 32.5, pb: 8.5, dividendYield: 1.5, week52High: 725, week52Low: 425 },
  { symbol: "JYOTHYLAB", yahooSymbol: "JYOTHYLAB.NS", name: "Jyothy Labs", price: 485, sector: "FMCG", marketCap: 17800, marketCapCategory: "mid", pe: 42.5, pb: 12.5, dividendYield: 1.8, week52High: 585, week52Low: 325 },
  { symbol: "RADICO", yahooSymbol: "RADICO.NS", name: "Radico Khaitan", price: 1850, sector: "FMCG", marketCap: 24700, marketCapCategory: "large", pe: 68.5, pb: 12.5, dividendYield: 0.4, week52High: 2285, week52Low: 1285 },
  { symbol: "UNITDSPR", yahooSymbol: "UNITDSPR.NS", name: "United Spirits", price: 1185, sector: "FMCG", marketCap: 86200, marketCapCategory: "large", pe: 72.5, pb: 15.8, dividendYield: 0.3, week52High: 1485, week52Low: 885 },
  { symbol: "MCDOWELL-N", yahooSymbol: "MCDOWELL-N.NS", name: "United Breweries", price: 1850, sector: "FMCG", marketCap: 48900, marketCapCategory: "large", pe: 125, pb: 12.5, dividendYield: 0.3, week52High: 2285, week52Low: 1385 },
  { symbol: "ZYDUSWELL", yahooSymbol: "ZYDUSWELL.NS", name: "Zydus Wellness", price: 1850, sector: "FMCG", marketCap: 11800, marketCapCategory: "mid", pe: 42.5, pb: 5.8, dividendYield: 0.8, week52High: 2285, week52Low: 1385 },
  { symbol: "BIKAJI", yahooSymbol: "BIKAJI.NS", name: "Bikaji Foods", price: 685, sector: "FMCG", marketCap: 17100, marketCapCategory: "mid", pe: 65.5, pb: 12.5, dividendYield: 0.2, week52High: 885, week52Low: 485 },
  { symbol: "CCL", yahooSymbol: "CCL.NS", name: "CCL Products", price: 685, sector: "FMCG", marketCap: 9150, marketCapCategory: "mid", pe: 28.5, pb: 5.8, dividendYield: 0.8, week52High: 825, week52Low: 485 },
  { symbol: "GODFRYPHLP", yahooSymbol: "GODFRYPHLP.NS", name: "Godfrey Phillips", price: 4850, sector: "FMCG", marketCap: 25200, marketCapCategory: "large", pe: 18.5, pb: 4.5, dividendYield: 2.5, week52High: 6285, week52Low: 3285 },

  // ============ PHARMA ============
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
  { symbol: "ZYDUSLIFE", yahooSymbol: "ZYDUSLIFE.NS", name: "Zydus Lifesciences", price: 985, sector: "Pharma", marketCap: 99200, marketCapCategory: "large", pe: 22.5, pb: 4.5, dividendYield: 0.5, week52High: 1285, week52Low: 685 },
  { symbol: "GLENMARK", yahooSymbol: "GLENMARK.NS", name: "Glenmark Pharma", price: 1185, sector: "Pharma", marketCap: 33400, marketCapCategory: "large", pe: 18.5, pb: 2.8, dividendYield: 0.8, week52High: 1485, week52Low: 785 },
  { symbol: "IPCALAB", yahooSymbol: "IPCALAB.NS", name: "IPCA Laboratories", price: 1450, sector: "Pharma", marketCap: 36800, marketCapCategory: "large", pe: 32.5, pb: 4.5, dividendYield: 0.5, week52High: 1785, week52Low: 985 },
  { symbol: "ABBOTINDIA", yahooSymbol: "ABBOTINDIA.NS", name: "Abbott India", price: 26500, sector: "Pharma", marketCap: 56300, marketCapCategory: "large", pe: 52.5, pb: 12.5, dividendYield: 1.2, week52High: 28585, week52Low: 22585 },
  { symbol: "SANOFI", yahooSymbol: "SANOFI.NS", name: "Sanofi India", price: 6850, sector: "Pharma", marketCap: 15800, marketCapCategory: "mid", pe: 28.5, pb: 6.5, dividendYield: 2.5, week52High: 7885, week52Low: 5585 },
  { symbol: "GLAND", yahooSymbol: "GLAND.NS", name: "Gland Pharma", price: 1850, sector: "Pharma", marketCap: 30500, marketCapCategory: "large", pe: 28.5, pb: 4.2, dividendYield: 0.4, week52High: 2285, week52Low: 1285 },
  { symbol: "LALPATHLAB", yahooSymbol: "LALPATHLAB.NS", name: "Dr Lal PathLabs", price: 2850, sector: "Pharma", marketCap: 23800, marketCapCategory: "large", pe: 58.5, pb: 12.5, dividendYield: 0.8, week52High: 3485, week52Low: 1985 },
  { symbol: "METROPOLIS", yahooSymbol: "METROPOLIS.NS", name: "Metropolis Healthcare", price: 1850, sector: "Pharma", marketCap: 9500, marketCapCategory: "mid", pe: 48.5, pb: 8.5, dividendYield: 0.6, week52High: 2485, week52Low: 1285 },
  { symbol: "NATCOPHARM", yahooSymbol: "NATCOPHARM.NS", name: "Natco Pharma", price: 1185, sector: "Pharma", marketCap: 21200, marketCapCategory: "large", pe: 22.5, pb: 3.8, dividendYield: 0.5, week52High: 1485, week52Low: 785 },
  { symbol: "GRANULES", yahooSymbol: "GRANULES.NS", name: "Granules India", price: 485, sector: "Pharma", marketCap: 11700, marketCapCategory: "mid", pe: 18.5, pb: 3.2, dividendYield: 0.5, week52High: 625, week52Low: 325 },
  { symbol: "LAURUSLABS", yahooSymbol: "LAURUSLABS.NS", name: "Laurus Labs", price: 485, sector: "Pharma", marketCap: 26200, marketCapCategory: "large", pe: 32.5, pb: 5.8, dividendYield: 0.4, week52High: 625, week52Low: 285 },
  { symbol: "SYNGENE", yahooSymbol: "SYNGENE.NS", name: "Syngene International", price: 785, sector: "Pharma", marketCap: 31500, marketCapCategory: "large", pe: 42.5, pb: 6.8, dividendYield: 0.3, week52High: 985, week52Low: 585 },
  { symbol: "ASTRAZEN", yahooSymbol: "ASTRAZEN.NS", name: "AstraZeneca Pharma", price: 6850, sector: "Pharma", marketCap: 17200, marketCapCategory: "mid", pe: 85.5, pb: 18.5, dividendYield: 0.8, week52High: 8585, week52Low: 4885 },
  { symbol: "PFIZER", yahooSymbol: "PFIZER.NS", name: "Pfizer", price: 4850, sector: "Pharma", marketCap: 22200, marketCapCategory: "large", pe: 32.5, pb: 8.5, dividendYield: 2.2, week52High: 5885, week52Low: 3585 },
  { symbol: "GLAXO", yahooSymbol: "GLAXO.NS", name: "GlaxoSmithKline Pharma", price: 2450, sector: "Pharma", marketCap: 41500, marketCapCategory: "large", pe: 42.5, pb: 12.5, dividendYield: 1.8, week52High: 2885, week52Low: 1785 },
  { symbol: "MANKIND", yahooSymbol: "MANKIND.NS", name: "Mankind Pharma", price: 2185, sector: "Pharma", marketCap: 87500, marketCapCategory: "large", pe: 48.5, pb: 8.5, dividendYield: 0.3, week52High: 2685, week52Low: 1485 },
  { symbol: "JBCHEPHARM", yahooSymbol: "JBCHEPHARM.NS", name: "JB Chemicals & Pharma", price: 1850, sector: "Pharma", marketCap: 28500, marketCapCategory: "large", pe: 32.5, pb: 6.8, dividendYield: 0.8, week52High: 2285, week52Low: 1285 },
  { symbol: "ERIS", yahooSymbol: "ERIS.NS", name: "Eris Lifesciences", price: 985, sector: "Pharma", marketCap: 13400, marketCapCategory: "mid", pe: 28.5, pb: 5.2, dividendYield: 0.8, week52High: 1285, week52Low: 685 },

  // ============ AUTO ============
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
  { symbol: "MRF", yahooSymbol: "MRF.NS", name: "MRF", price: 128500, sector: "Auto", marketCap: 54500, marketCapCategory: "large", pe: 28.5, pb: 3.8, dividendYield: 0.1, week52High: 148585, week52Low: 98585 },
  { symbol: "APOLLOTYRE", yahooSymbol: "APOLLOTYRE.NS", name: "Apollo Tyres", price: 485, sector: "Auto", marketCap: 30800, marketCapCategory: "large", pe: 18.5, pb: 2.5, dividendYield: 0.8, week52High: 585, week52Low: 345 },
  { symbol: "BALKRISIND", yahooSymbol: "BALKRISIND.NS", name: "Balkrishna Industries", price: 2850, sector: "Auto", marketCap: 55100, marketCapCategory: "large", pe: 32.5, pb: 5.8, dividendYield: 0.8, week52High: 3285, week52Low: 1985 },
  { symbol: "BOSCHLTD", yahooSymbol: "BOSCHLTD.NS", name: "Bosch", price: 32500, sector: "Auto", marketCap: 95800, marketCapCategory: "large", pe: 42.5, pb: 6.8, dividendYield: 0.8, week52High: 38585, week52Low: 25585 },
  { symbol: "EXIDEIND", yahooSymbol: "EXIDEIND.NS", name: "Exide Industries", price: 485, sector: "Auto", marketCap: 41200, marketCapCategory: "large", pe: 42.5, pb: 5.2, dividendYield: 1.2, week52High: 585, week52Low: 285 },
  { symbol: "AMARAJABAT", yahooSymbol: "AMARAJABAT.NS", name: "Amara Raja Energy", price: 1185, sector: "Auto", marketCap: 20300, marketCapCategory: "large", pe: 18.5, pb: 2.8, dividendYield: 1.5, week52High: 1485, week52Low: 785 },
  { symbol: "CEATLTD", yahooSymbol: "CEATLTD.NS", name: "CEAT", price: 2850, sector: "Auto", marketCap: 11500, marketCapCategory: "mid", pe: 28.5, pb: 3.5, dividendYield: 0.8, week52High: 3485, week52Low: 1985 },
  { symbol: "SUNDRMFAST", yahooSymbol: "SUNDRMFAST.NS", name: "Sundram Fasteners", price: 1085, sector: "Auto", marketCap: 22800, marketCapCategory: "large", pe: 32.5, pb: 6.8, dividendYield: 0.8, week52High: 1385, week52Low: 785 },
  { symbol: "ENDURANCE", yahooSymbol: "ENDURANCE.NS", name: "Endurance Technologies", price: 2185, sector: "Auto", marketCap: 30700, marketCapCategory: "large", pe: 42.5, pb: 8.5, dividendYield: 0.5, week52High: 2685, week52Low: 1485 },
  { symbol: "SWARAJENG", yahooSymbol: "SWARAJENG.NS", name: "Swaraj Engines", price: 2850, sector: "Auto", marketCap: 3520, marketCapCategory: "small", pe: 22.5, pb: 5.2, dividendYield: 2.5, week52High: 3285, week52Low: 1985 },
  { symbol: "FORCEMOT", yahooSymbol: "FORCEMOT.NS", name: "Force Motors", price: 6850, sector: "Auto", marketCap: 9020, marketCapCategory: "mid", pe: 28.5, pb: 2.8, dividendYield: 0.4, week52High: 8585, week52Low: 4585 },
  { symbol: "OLECTRA", yahooSymbol: "OLECTRA.NS", name: "Olectra Greentech", price: 1450, sector: "Auto", marketCap: 12100, marketCapCategory: "mid", pe: 125, pb: 18.5, dividendYield: 0, week52High: 1985, week52Low: 985 },

  // ============ METALS ============
  { symbol: "TATASTEEL", yahooSymbol: "TATASTEEL.NS", name: "Tata Steel", price: 145, sector: "Metals", marketCap: 181000, marketCapCategory: "large", pe: 52.5, pb: 1.5, dividendYield: 2.2, week52High: 175, week52Low: 105 },
  { symbol: "JSWSTEEL", yahooSymbol: "JSWSTEEL.NS", name: "JSW Steel", price: 890, sector: "Metals", marketCap: 215000, marketCapCategory: "large", pe: 28.5, pb: 2.8, dividendYield: 0.8, week52High: 1015, week52Low: 685 },
  { symbol: "HINDALCO", yahooSymbol: "HINDALCO.NS", name: "Hindalco", price: 620, sector: "Metals", marketCap: 139500, marketCapCategory: "large", pe: 12.5, pb: 1.4, dividendYield: 0.5, week52High: 715, week52Low: 425 },
  { symbol: "VEDL", yahooSymbol: "VEDL.NS", name: "Vedanta", price: 445, sector: "Metals", marketCap: 165500, marketCapCategory: "large", pe: 8.2, pb: 2.5, dividendYield: 6.8, week52High: 505, week52Low: 285 },
  { symbol: "COALINDIA", yahooSymbol: "COALINDIA.NS", name: "Coal India", price: 420, sector: "Metals", marketCap: 258500, marketCapCategory: "large", pe: 7.8, pb: 2.8, dividendYield: 5.5, week52High: 535, week52Low: 295 },
  { symbol: "NMDC", yahooSymbol: "NMDC.NS", name: "NMDC", price: 225, sector: "Metals", marketCap: 65900, marketCapCategory: "large", pe: 8.5, pb: 1.8, dividendYield: 3.5, week52High: 285, week52Low: 145 },
  { symbol: "SAIL", yahooSymbol: "SAIL.NS", name: "Steel Authority of India", price: 125, sector: "Metals", marketCap: 51600, marketCapCategory: "large", pe: 15.8, pb: 0.8, dividendYield: 2.8, week52High: 155, week52Low: 85 },
  { symbol: "JINDALSTEL", yahooSymbol: "JINDALSTEL.NS", name: "Jindal Steel & Power", price: 920, sector: "Metals", marketCap: 93800, marketCapCategory: "large", pe: 12.5, pb: 1.8, dividendYield: 0.4, week52High: 1085, week52Low: 585 },
  { symbol: "NATIONALUM", yahooSymbol: "NATIONALUM.NS", name: "National Aluminium", price: 185, sector: "Metals", marketCap: 34000, marketCapCategory: "large", pe: 12.5, pb: 2.2, dividendYield: 2.8, week52High: 225, week52Low: 105 },
  { symbol: "HINDCOPPER", yahooSymbol: "HINDCOPPER.NS", name: "Hindustan Copper", price: 285, sector: "Metals", marketCap: 27500, marketCapCategory: "large", pe: 42.5, pb: 5.8, dividendYield: 0.8, week52High: 385, week52Low: 165 },
  { symbol: "MOIL", yahooSymbol: "MOIL.NS", name: "MOIL", price: 385, sector: "Metals", marketCap: 8150, marketCapCategory: "mid", pe: 12.5, pb: 1.5, dividendYield: 3.5, week52High: 485, week52Low: 265 },
  { symbol: "WELCORP", yahooSymbol: "WELCORP.NS", name: "Welspun Corp", price: 585, sector: "Metals", marketCap: 15300, marketCapCategory: "mid", pe: 18.5, pb: 2.2, dividendYield: 1.2, week52High: 725, week52Low: 385 },
  { symbol: "APLAPOLLO", yahooSymbol: "APLAPOLLO.NS", name: "APL Apollo Tubes", price: 1585, sector: "Metals", marketCap: 43900, marketCapCategory: "large", pe: 52.5, pb: 12.5, dividendYield: 0.4, week52High: 1885, week52Low: 1085 },
  { symbol: "RATNAMANI", yahooSymbol: "RATNAMANI.NS", name: "Ratnamani Metals", price: 3250, sector: "Metals", marketCap: 22700, marketCapCategory: "large", pe: 32.5, pb: 6.8, dividendYield: 0.5, week52High: 3885, week52Low: 2285 },
  { symbol: "JSLHISAR", yahooSymbol: "JSLHISAR.NS", name: "Jindal Stainless", price: 685, sector: "Metals", marketCap: 56500, marketCapCategory: "large", pe: 18.5, pb: 3.5, dividendYield: 0.4, week52High: 825, week52Low: 445 },
  { symbol: "GMRINFRA", yahooSymbol: "GMRINFRA.NS", name: "GMR Airports", price: 85, sector: "Metals", marketCap: 51200, marketCapCategory: "large", pe: 185, pb: 5.8, dividendYield: 0, week52High: 108, week52Low: 52 },

  // ============ POWER & UTILITIES ============
  { symbol: "NTPC", yahooSymbol: "NTPC.NS", name: "NTPC", price: 385, sector: "Power", marketCap: 373000, marketCapCategory: "large", pe: 15.8, pb: 2.2, dividendYield: 2.5, week52High: 448, week52Low: 245 },
  { symbol: "POWERGRID", yahooSymbol: "POWERGRID.NS", name: "Power Grid Corporation", price: 295, sector: "Power", marketCap: 274500, marketCapCategory: "large", pe: 14.5, pb: 2.5, dividendYield: 4.2, week52High: 345, week52Low: 225 },
  { symbol: "ADANIGREEN", yahooSymbol: "ADANIGREEN.NS", name: "Adani Green Energy", price: 1850, sector: "Power", marketCap: 292500, marketCapCategory: "large", pe: 285, pb: 42.5, dividendYield: 0, week52High: 2285, week52Low: 885 },
  { symbol: "TATAPOWER", yahooSymbol: "TATAPOWER.NS", name: "Tata Power", price: 435, sector: "Power", marketCap: 139000, marketCapCategory: "large", pe: 38.5, pb: 4.8, dividendYield: 0.5, week52High: 485, week52Low: 285 },
  { symbol: "NHPC", yahooSymbol: "NHPC.NS", name: "NHPC", price: 95, sector: "Power", marketCap: 95200, marketCapCategory: "large", pe: 18.5, pb: 2.2, dividendYield: 3.8, week52High: 118, week52Low: 52 },
  { symbol: "TORNTPOWER", yahooSymbol: "TORNTPOWER.NS", name: "Torrent Power", price: 1580, sector: "Power", marketCap: 75900, marketCapCategory: "large", pe: 28.5, pb: 4.5, dividendYield: 1.5, week52High: 1885, week52Low: 1185 },
  { symbol: "SJVN", yahooSymbol: "SJVN.NS", name: "SJVN", price: 118, sector: "Power", marketCap: 46300, marketCapCategory: "large", pe: 32.5, pb: 3.2, dividendYield: 2.8, week52High: 168, week52Low: 68 },
  { symbol: "JSWENERGY", yahooSymbol: "JSWENERGY.NS", name: "JSW Energy", price: 645, sector: "Power", marketCap: 112500, marketCapCategory: "large", pe: 52.5, pb: 5.8, dividendYield: 0.4, week52High: 745, week52Low: 385 },
  { symbol: "CESC", yahooSymbol: "CESC.NS", name: "CESC", price: 165, sector: "Power", marketCap: 21800, marketCapCategory: "large", pe: 12.5, pb: 1.5, dividendYield: 2.5, week52High: 205, week52Low: 105 },
  { symbol: "PGIL", yahooSymbol: "PGIL.NS", name: "Power Grid InvIT", price: 145, sector: "Power", marketCap: 18500, marketCapCategory: "mid", pe: 15.5, pb: 1.8, dividendYield: 8.5, week52High: 175, week52Low: 115 },
  { symbol: "TATAELXSI", yahooSymbol: "TATAELXSI.NS", name: "Tata Elxsi", price: 6850, sector: "IT", marketCap: 42700, marketCapCategory: "large", pe: 52.5, pb: 18.5, dividendYield: 0.8, week52High: 9585, week52Low: 5185 },
  { symbol: "ADANITRANS", yahooSymbol: "ADANITRANS.NS", name: "Adani Transmission", price: 1150, sector: "Power", marketCap: 138000, marketCapCategory: "large", pe: 185, pb: 8.5, dividendYield: 0, week52High: 1485, week52Low: 685 },
  { symbol: "JPPOWER", yahooSymbol: "JPPOWER.NS", name: "Jaiprakash Power", price: 18, sector: "Power", marketCap: 12300, marketCapCategory: "mid", pe: 28.5, pb: 0.8, dividendYield: 0, week52High: 28, week52Low: 10 },
  { symbol: "RPOWER", yahooSymbol: "RPOWER.NS", name: "Reliance Power", price: 32, sector: "Power", marketCap: 12800, marketCapCategory: "mid", pe: -15.5, pb: 0.5, dividendYield: 0, week52High: 48, week52Low: 15 },
  { symbol: "INDIAGLYCO", yahooSymbol: "INDIAGLYCO.NS", name: "India Glycols", price: 1085, sector: "Power", marketCap: 3350, marketCapCategory: "small", pe: 18.5, pb: 2.2, dividendYield: 1.5, week52High: 1385, week52Low: 785 },

  // ============ INFRASTRUCTURE & CEMENT ============
  { symbol: "LT", yahooSymbol: "LT.NS", name: "Larsen & Toubro", price: 3400, sector: "Infrastructure", marketCap: 466500, marketCapCategory: "large", pe: 32.5, pb: 5.2, dividendYield: 0.8, week52High: 3885, week52Low: 2685 },
  { symbol: "ADANIENT", yahooSymbol: "ADANIENT.NS", name: "Adani Enterprises", price: 2850, sector: "Infrastructure", marketCap: 325000, marketCapCategory: "large", pe: 78.5, pb: 8.5, dividendYield: 0.1, week52High: 3485, week52Low: 2085 },
  { symbol: "ADANIPORTS", yahooSymbol: "ADANIPORTS.NS", name: "Adani Ports", price: 1280, sector: "Infrastructure", marketCap: 276500, marketCapCategory: "large", pe: 28.5, pb: 4.8, dividendYield: 0.4, week52High: 1605, week52Low: 885 },
  { symbol: "ULTRACEMCO", yahooSymbol: "ULTRACEMCO.NS", name: "UltraTech Cement", price: 11200, sector: "Infrastructure", marketCap: 323500, marketCapCategory: "large", pe: 42.5, pb: 5.8, dividendYield: 0.4, week52High: 12485, week52Low: 8285 },
  { symbol: "GRASIM", yahooSymbol: "GRASIM.NS", name: "Grasim Industries", price: 2450, sector: "Infrastructure", marketCap: 161500, marketCapCategory: "large", pe: 18.5, pb: 2.2, dividendYield: 0.4, week52High: 2885, week52Low: 1885 },
  { symbol: "SHREECEM", yahooSymbol: "SHREECEM.NS", name: "Shree Cement", price: 26500, sector: "Infrastructure", marketCap: 95500, marketCapCategory: "large", pe: 42.5, pb: 5.5, dividendYield: 0.4, week52High: 28585, week52Low: 22885 },
  { symbol: "AMBUJACEM", yahooSymbol: "AMBUJACEM.NS", name: "Ambuja Cements", price: 620, sector: "Infrastructure", marketCap: 123000, marketCapCategory: "large", pe: 32.5, pb: 3.5, dividendYield: 0.5, week52High: 685, week52Low: 385 },
  { symbol: "ACC", yahooSymbol: "ACC.NS", name: "ACC", price: 2350, sector: "Infrastructure", marketCap: 44100, marketCapCategory: "large", pe: 18.5, pb: 2.8, dividendYield: 0.8, week52High: 2685, week52Low: 1685 },
  { symbol: "DALMIACMT", yahooSymbol: "DALMIACMT.NS", name: "Dalmia Bharat", price: 1850, sector: "Infrastructure", marketCap: 34700, marketCapCategory: "large", pe: 32.5, pb: 2.8, dividendYield: 0.3, week52High: 2285, week52Low: 1385 },
  { symbol: "RAMCOCEM", yahooSymbol: "RAMCOCEM.NS", name: "Ramco Cements", price: 985, sector: "Infrastructure", marketCap: 23200, marketCapCategory: "large", pe: 28.5, pb: 2.5, dividendYield: 0.5, week52High: 1285, week52Low: 685 },
  { symbol: "JKCEMENT", yahooSymbol: "JKCEMENT.NS", name: "JK Cement", price: 4250, sector: "Infrastructure", marketCap: 32800, marketCapCategory: "large", pe: 42.5, pb: 5.8, dividendYield: 0.4, week52High: 4885, week52Low: 2985 },
  { symbol: "BIRLACORPN", yahooSymbol: "BIRLACORPN.NS", name: "Birla Corporation", price: 1450, sector: "Infrastructure", marketCap: 11200, marketCapCategory: "mid", pe: 18.5, pb: 1.5, dividendYield: 0.8, week52High: 1785, week52Low: 985 },
  { symbol: "INDIACEM", yahooSymbol: "INDIACEM.NS", name: "India Cements", price: 285, sector: "Infrastructure", marketCap: 8850, marketCapCategory: "mid", pe: -22.5, pb: 0.8, dividendYield: 0, week52High: 385, week52Low: 185 },
  { symbol: "HEIDELBERG", yahooSymbol: "HEIDELBERG.NS", name: "HeidelbergCement India", price: 225, sector: "Infrastructure", marketCap: 5100, marketCapCategory: "mid", pe: 22.5, pb: 2.2, dividendYield: 1.5, week52High: 285, week52Low: 165 },
  { symbol: "STARCEMENT", yahooSymbol: "STARCEMENT.NS", name: "Star Cement", price: 185, sector: "Infrastructure", marketCap: 7550, marketCapCategory: "mid", pe: 28.5, pb: 2.8, dividendYield: 0.8, week52High: 225, week52Low: 125 },
  { symbol: "PRSMJOHNSN", yahooSymbol: "PRSMJOHNSN.NS", name: "Prism Johnson", price: 165, sector: "Infrastructure", marketCap: 8250, marketCapCategory: "mid", pe: 42.5, pb: 1.5, dividendYield: 0, week52High: 225, week52Low: 105 },
  { symbol: "ORIENTCEM", yahooSymbol: "ORIENTCEM.NS", name: "Orient Cement", price: 285, sector: "Infrastructure", marketCap: 5850, marketCapCategory: "mid", pe: 18.5, pb: 1.8, dividendYield: 0.5, week52High: 365, week52Low: 185 },
  { symbol: "SAGCEM", yahooSymbol: "SAGCEM.NS", name: "Sagar Cements", price: 285, sector: "Infrastructure", marketCap: 1050, marketCapCategory: "small", pe: 28.5, pb: 1.2, dividendYield: 0.4, week52High: 385, week52Low: 185 },
  { symbol: "IRB", yahooSymbol: "IRB.NS", name: "IRB Infrastructure", price: 58, sector: "Infrastructure", marketCap: 35100, marketCapCategory: "large", pe: 18.5, pb: 1.8, dividendYield: 0.8, week52High: 78, week52Low: 38 },
  { symbol: "NBCC", yahooSymbol: "NBCC.NS", name: "NBCC India", price: 145, sector: "Infrastructure", marketCap: 26100, marketCapCategory: "large", pe: 58.5, pb: 6.8, dividendYield: 0.8, week52High: 185, week52Low: 85 },
  { symbol: "NCC", yahooSymbol: "NCC.NS", name: "NCC", price: 285, sector: "Infrastructure", marketCap: 17900, marketCapCategory: "mid", pe: 18.5, pb: 2.2, dividendYield: 1.2, week52High: 385, week52Low: 185 },
  { symbol: "HCC", yahooSymbol: "HCC.NS", name: "Hindustan Construction", price: 38, sector: "Infrastructure", marketCap: 6450, marketCapCategory: "mid", pe: -15.5, pb: 0.5, dividendYield: 0, week52High: 52, week52Low: 22 },
  { symbol: "PNC", yahooSymbol: "PNC.NS", name: "PNC Infratech", price: 385, sector: "Infrastructure", marketCap: 9850, marketCapCategory: "mid", pe: 12.5, pb: 1.8, dividendYield: 0.5, week52High: 485, week52Low: 285 },
  { symbol: "KNR", yahooSymbol: "KNR.NS", name: "KNR Constructions", price: 285, sector: "Infrastructure", marketCap: 8020, marketCapCategory: "mid", pe: 15.5, pb: 2.2, dividendYield: 0.4, week52High: 385, week52Low: 185 },
  { symbol: "AHLUCONT", yahooSymbol: "AHLUCONT.NS", name: "Ahluwalia Contracts", price: 985, sector: "Infrastructure", marketCap: 6550, marketCapCategory: "mid", pe: 22.5, pb: 3.8, dividendYield: 0.5, week52High: 1285, week52Low: 685 },

  // ============ FINANCE - NBFC & INSURANCE ============
  { symbol: "BAJFINANCE", yahooSymbol: "BAJFINANCE.NS", name: "Bajaj Finance", price: 6800, sector: "Finance", marketCap: 421000, marketCapCategory: "large", pe: 28.5, pb: 6.2, dividendYield: 0.4, week52High: 8285, week52Low: 5985 },
  { symbol: "BAJAJFINSV", yahooSymbol: "BAJAJFINSV.NS", name: "Bajaj Finserv", price: 1650, sector: "Finance", marketCap: 263000, marketCapCategory: "large", pe: 22.5, pb: 3.8, dividendYield: 0.1, week52High: 1985, week52Low: 1385 },
  { symbol: "HDFCLIFE", yahooSymbol: "HDFCLIFE.NS", name: "HDFC Life Insurance", price: 685, sector: "Finance", marketCap: 147200, marketCapCategory: "large", pe: 85.5, pb: 12.5, dividendYield: 0.3, week52High: 785, week52Low: 525 },
  { symbol: "SBILIFE", yahooSymbol: "SBILIFE.NS", name: "SBI Life Insurance", price: 1580, sector: "Finance", marketCap: 158200, marketCapCategory: "large", pe: 72.5, pb: 11.8, dividendYield: 0.2, week52High: 1885, week52Low: 1185 },
  { symbol: "ICICIPRULI", yahooSymbol: "ICICIPRULI.NS", name: "ICICI Prudential Life", price: 620, sector: "Finance", marketCap: 89200, marketCapCategory: "large", pe: 68.5, pb: 8.5, dividendYield: 0.3, week52High: 745, week52Low: 485 },
  { symbol: "ICICIGI", yahooSymbol: "ICICIGI.NS", name: "ICICI Lombard GIC", price: 1780, sector: "Finance", marketCap: 87600, marketCapCategory: "large", pe: 42.5, pb: 8.2, dividendYield: 0.5, week52High: 1985, week52Low: 1285 },
  { symbol: "MUTHOOTFIN", yahooSymbol: "MUTHOOTFIN.NS", name: "Muthoot Finance", price: 1650, sector: "Finance", marketCap: 66200, marketCapCategory: "large", pe: 14.5, pb: 2.5, dividendYield: 1.2, week52High: 1985, week52Low: 1185 },
  { symbol: "CHOLAFIN", yahooSymbol: "CHOLAFIN.NS", name: "Cholamandalam Investment", price: 1280, sector: "Finance", marketCap: 107500, marketCapCategory: "large", pe: 25.5, pb: 5.2, dividendYield: 0.2, week52High: 1585, week52Low: 985 },
  { symbol: "SHRIRAMFIN", yahooSymbol: "SHRIRAMFIN.NS", name: "Shriram Finance", price: 2650, sector: "Finance", marketCap: 99500, marketCapCategory: "large", pe: 12.5, pb: 2.2, dividendYield: 1.5, week52High: 3085, week52Low: 1885 },
  { symbol: "M&MFIN", yahooSymbol: "M&MFIN.NS", name: "Mahindra & Mahindra Financial", price: 285, sector: "Finance", marketCap: 35200, marketCapCategory: "large", pe: 12.5, pb: 1.5, dividendYield: 1.8, week52High: 355, week52Low: 225 },
  { symbol: "LICHSGFIN", yahooSymbol: "LICHSGFIN.NS", name: "LIC Housing Finance", price: 625, sector: "Finance", marketCap: 34400, marketCapCategory: "large", pe: 8.5, pb: 1.2, dividendYield: 2.8, week52High: 785, week52Low: 425 },
  { symbol: "PNBHOUSING", yahooSymbol: "PNBHOUSING.NS", name: "PNB Housing Finance", price: 885, sector: "Finance", marketCap: 23600, marketCapCategory: "large", pe: 12.5, pb: 1.5, dividendYield: 1.2, week52High: 1085, week52Low: 585 },
  { symbol: "CANFINHOME", yahooSymbol: "CANFINHOME.NS", name: "Can Fin Homes", price: 785, sector: "Finance", marketCap: 10500, marketCapCategory: "mid", pe: 15.5, pb: 2.5, dividendYield: 0.8, week52High: 985, week52Low: 585 },
  { symbol: "AAVAS", yahooSymbol: "AAVAS.NS", name: "Aavas Financiers", price: 1650, sector: "Finance", marketCap: 13100, marketCapCategory: "mid", pe: 28.5, pb: 3.8, dividendYield: 0, week52High: 2085, week52Low: 1185 },
  { symbol: "HOMEFIRST", yahooSymbol: "HOMEFIRST.NS", name: "Home First Finance", price: 985, sector: "Finance", marketCap: 8720, marketCapCategory: "mid", pe: 32.5, pb: 4.2, dividendYield: 0, week52High: 1285, week52Low: 685 },
  { symbol: "APTUS", yahooSymbol: "APTUS.NS", name: "Aptus Value Housing", price: 345, sector: "Finance", marketCap: 17200, marketCapCategory: "mid", pe: 22.5, pb: 3.5, dividendYield: 0.5, week52High: 425, week52Low: 245 },
  { symbol: "LTFH", yahooSymbol: "LTFH.NS", name: "L&T Finance", price: 145, sector: "Finance", marketCap: 36100, marketCapCategory: "large", pe: 12.5, pb: 1.5, dividendYield: 1.2, week52High: 185, week52Low: 105 },
  { symbol: "MANAPPURAM", yahooSymbol: "MANAPPURAM.NS", name: "Manappuram Finance", price: 185, sector: "Finance", marketCap: 15700, marketCapCategory: "mid", pe: 8.5, pb: 1.5, dividendYield: 2.5, week52High: 225, week52Low: 125 },
  { symbol: "CREDITACC", yahooSymbol: "CREDITACC.NS", name: "CreditAccess Grameen", price: 1185, sector: "Finance", marketCap: 18900, marketCapCategory: "mid", pe: 15.5, pb: 3.2, dividendYield: 0, week52High: 1585, week52Low: 885 },
  { symbol: "SBICARD", yahooSymbol: "SBICARD.NS", name: "SBI Cards", price: 785, sector: "Finance", marketCap: 74500, marketCapCategory: "large", pe: 32.5, pb: 8.5, dividendYield: 0.3, week52High: 985, week52Low: 585 },
  { symbol: "POONAWALLA", yahooSymbol: "POONAWALLA.NS", name: "Poonawalla Fincorp", price: 385, sector: "Finance", marketCap: 29600, marketCapCategory: "large", pe: 28.5, pb: 4.5, dividendYield: 0.3, week52High: 485, week52Low: 285 },
  { symbol: "SUNTV", yahooSymbol: "SUNTV.NS", name: "Sun TV Network", price: 685, sector: "Finance", marketCap: 27000, marketCapCategory: "large", pe: 12.5, pb: 3.2, dividendYield: 2.8, week52High: 825, week52Low: 485 },
  { symbol: "GICRE", yahooSymbol: "GICRE.NS", name: "General Insurance Corp", price: 385, sector: "Finance", marketCap: 67500, marketCapCategory: "large", pe: 12.5, pb: 0.8, dividendYield: 2.5, week52High: 485, week52Low: 285 },
  { symbol: "NIACL", yahooSymbol: "NIACL.NS", name: "New India Assurance", price: 225, sector: "Finance", marketCap: 37100, marketCapCategory: "large", pe: 18.5, pb: 1.2, dividendYield: 1.5, week52High: 285, week52Low: 165 },
  { symbol: "STARHEALTH", yahooSymbol: "STARHEALTH.NS", name: "Star Health Insurance", price: 585, sector: "Finance", marketCap: 33800, marketCapCategory: "large", pe: 42.5, pb: 5.8, dividendYield: 0, week52High: 785, week52Low: 385 },

  // ============ TELECOM ============
  { symbol: "BHARTIARTL", yahooSymbol: "BHARTIARTL.NS", name: "Bharti Airtel", price: 1620, sector: "Telecom", marketCap: 915000, marketCapCategory: "large", pe: 78.5, pb: 8.5, dividendYield: 0.3, week52High: 1785, week52Low: 1085 },
  { symbol: "IDEA", yahooSymbol: "IDEA.NS", name: "Vodafone Idea", price: 14, sector: "Telecom", marketCap: 97500, marketCapCategory: "large", pe: -5.2, pb: 0.5, dividendYield: 0, week52High: 19, week52Low: 8 },
  { symbol: "TATACOMM", yahooSymbol: "TATACOMM.NS", name: "Tata Communications", price: 1820, sector: "Telecom", marketCap: 51800, marketCapCategory: "large", pe: 42.5, pb: 12.5, dividendYield: 0.8, week52High: 2285, week52Low: 1485 },
  { symbol: "INDUSTOWER", yahooSymbol: "INDUSTOWER.NS", name: "Indus Towers", price: 345, sector: "Telecom", marketCap: 92800, marketCapCategory: "large", pe: 18.5, pb: 2.8, dividendYield: 2.5, week52High: 445, week52Low: 185 },
  { symbol: "STERLITE", yahooSymbol: "STERLITE.NS", name: "Sterlite Technologies", price: 145, sector: "Telecom", marketCap: 5750, marketCapCategory: "mid", pe: 28.5, pb: 1.8, dividendYield: 0.8, week52High: 225, week52Low: 105 },
  { symbol: "HFCL", yahooSymbol: "HFCL.NS", name: "HFCL", price: 125, sector: "Telecom", marketCap: 17800, marketCapCategory: "mid", pe: 42.5, pb: 4.5, dividendYield: 0.3, week52High: 168, week52Low: 78 },
  { symbol: "TEJAS", yahooSymbol: "TEJAS.NS", name: "Tejas Networks", price: 1085, sector: "Telecom", marketCap: 18500, marketCapCategory: "mid", pe: 85.5, pb: 8.5, dividendYield: 0, week52High: 1385, week52Low: 685 },

  // ============ CONSUMER & RETAIL ============
  { symbol: "TITAN", yahooSymbol: "TITAN.NS", name: "Titan Company", price: 3200, sector: "Consumer", marketCap: 284000, marketCapCategory: "large", pe: 85.5, pb: 22.5, dividendYield: 0.3, week52High: 3885, week52Low: 2685 },
  { symbol: "ASIANPAINT", yahooSymbol: "ASIANPAINT.NS", name: "Asian Paints", price: 2950, sector: "Consumer", marketCap: 283000, marketCapCategory: "large", pe: 55.2, pb: 18.5, dividendYield: 0.7, week52High: 3485, week52Low: 2485 },
  { symbol: "PAGEIND", yahooSymbol: "PAGEIND.NS", name: "Page Industries", price: 42000, sector: "Consumer", marketCap: 46800, marketCapCategory: "large", pe: 72.5, pb: 28.5, dividendYield: 0.6, week52High: 48585, week52Low: 34585 },
  { symbol: "PIDILITIND", yahooSymbol: "PIDILITIND.NS", name: "Pidilite Industries", price: 2950, sector: "Consumer", marketCap: 150000, marketCapCategory: "large", pe: 82.5, pb: 22.5, dividendYield: 0.4, week52High: 3385, week52Low: 2385 },
  { symbol: "HAVELLS", yahooSymbol: "HAVELLS.NS", name: "Havells India", price: 1620, sector: "Consumer", marketCap: 101500, marketCapCategory: "large", pe: 68.5, pb: 12.5, dividendYield: 0.6, week52High: 1885, week52Low: 1285 },
  { symbol: "VOLTAS", yahooSymbol: "VOLTAS.NS", name: "Voltas", price: 1280, sector: "Consumer", marketCap: 42400, marketCapCategory: "large", pe: 52.5, pb: 8.5, dividendYield: 0.4, week52High: 1685, week52Low: 885 },
  { symbol: "BERGER", yahooSymbol: "BERGER.NS", name: "Berger Paints", price: 585, sector: "Consumer", marketCap: 68500, marketCapCategory: "large", pe: 58.5, pb: 18.5, dividendYield: 0.5, week52High: 725, week52Low: 445 },
  { symbol: "KANSAINER", yahooSymbol: "KANSAINER.NS", name: "Kansai Nerolac Paints", price: 285, sector: "Consumer", marketCap: 15300, marketCapCategory: "mid", pe: 42.5, pb: 4.5, dividendYield: 0.8, week52High: 365, week52Low: 225 },
  { symbol: "INDIGO", yahooSymbol: "INDIGO.NS", name: "InterGlobe Aviation", price: 4250, sector: "Aviation", marketCap: 163800, marketCapCategory: "large", pe: 18.5, pb: 22.5, dividendYield: 0, week52High: 4985, week52Low: 2685 },
  { symbol: "CROMPTON", yahooSymbol: "CROMPTON.NS", name: "Crompton Greaves Consumer", price: 385, sector: "Consumer", marketCap: 24700, marketCapCategory: "large", pe: 42.5, pb: 8.5, dividendYield: 0.5, week52High: 485, week52Low: 285 },
  { symbol: "WHIRLPOOL", yahooSymbol: "WHIRLPOOL.NS", name: "Whirlpool of India", price: 1450, sector: "Consumer", marketCap: 18400, marketCapCategory: "mid", pe: 52.5, pb: 6.8, dividendYield: 0.4, week52High: 1785, week52Low: 1085 },
  { symbol: "BLUESTAR", yahooSymbol: "BLUESTAR.NS", name: "Blue Star", price: 1650, sector: "Consumer", marketCap: 34100, marketCapCategory: "large", pe: 68.5, pb: 18.5, dividendYield: 0.4, week52High: 1985, week52Low: 1185 },
  { symbol: "SYMPHONY", yahooSymbol: "SYMPHONY.NS", name: "Symphony", price: 1185, sector: "Consumer", marketCap: 8200, marketCapCategory: "mid", pe: 58.5, pb: 12.5, dividendYield: 0.8, week52High: 1485, week52Low: 785 },
  { symbol: "TRENT", yahooSymbol: "TRENT.NS", name: "Trent", price: 5850, sector: "Consumer", marketCap: 207500, marketCapCategory: "large", pe: 185, pb: 42.5, dividendYield: 0.1, week52High: 7485, week52Low: 2685 },
  { symbol: "DMART", yahooSymbol: "DMART.NS", name: "Avenue Supermarts", price: 3850, sector: "Consumer", marketCap: 250000, marketCapCategory: "large", pe: 108, pb: 15.5, dividendYield: 0, week52High: 4485, week52Low: 3285 },
  { symbol: "ZOMATO", yahooSymbol: "ZOMATO.NS", name: "Zomato", price: 185, sector: "Consumer", marketCap: 163500, marketCapCategory: "large", pe: 285, pb: 8.5, dividendYield: 0, week52High: 265, week52Low: 85 },
  { symbol: "NYKAA", yahooSymbol: "NYKAA.NS", name: "FSN E-Commerce Ventures", price: 165, sector: "Consumer", marketCap: 46800, marketCapCategory: "large", pe: 885, pb: 18.5, dividendYield: 0, week52High: 235, week52Low: 125 },
  { symbol: "DIXON", yahooSymbol: "DIXON.NS", name: "Dixon Technologies", price: 12500, sector: "Consumer", marketCap: 74600, marketCapCategory: "large", pe: 125, pb: 32.5, dividendYield: 0.1, week52High: 15485, week52Low: 5585 },
  { symbol: "POLYCAB", yahooSymbol: "POLYCAB.NS", name: "Polycab India", price: 6250, sector: "Consumer", marketCap: 94000, marketCapCategory: "large", pe: 48.5, pb: 12.5, dividendYield: 0.4, week52High: 7485, week52Low: 4285 },
  { symbol: "IRCTC", yahooSymbol: "IRCTC.NS", name: "IRCTC", price: 885, sector: "Consumer", marketCap: 70800, marketCapCategory: "large", pe: 52.5, pb: 18.5, dividendYield: 0.5, week52High: 1085, week52Low: 585 },
  { symbol: "SAPPHIRE", yahooSymbol: "SAPPHIRE.NS", name: "Sapphire Foods", price: 1450, sector: "Consumer", marketCap: 9250, marketCapCategory: "mid", pe: 125, pb: 8.5, dividendYield: 0, week52High: 1785, week52Low: 1085 },
  { symbol: "DEVYANI", yahooSymbol: "DEVYANI.NS", name: "Devyani International", price: 165, sector: "Consumer", marketCap: 19800, marketCapCategory: "mid", pe: 78.5, pb: 15.5, dividendYield: 0, week52High: 225, week52Low: 125 },
  { symbol: "JUBLFOOD", yahooSymbol: "JUBLFOOD.NS", name: "Jubilant Foodworks", price: 485, sector: "Consumer", marketCap: 32100, marketCapCategory: "large", pe: 78.5, pb: 12.5, dividendYield: 0.2, week52High: 625, week52Low: 345 },
  { symbol: "WESTLIFE", yahooSymbol: "WESTLIFE.NS", name: "Westlife Foodworld", price: 785, sector: "Consumer", marketCap: 12200, marketCapCategory: "mid", pe: 125, pb: 18.5, dividendYield: 0, week52High: 985, week52Low: 585 },
  { symbol: "VMART", yahooSymbol: "VMART.NS", name: "V-Mart Retail", price: 1850, sector: "Consumer", marketCap: 3650, marketCapCategory: "small", pe: -85.5, pb: 3.8, dividendYield: 0, week52High: 2485, week52Low: 1285 },

  // ============ REAL ESTATE ============
  { symbol: "DLF", yahooSymbol: "DLF.NS", name: "DLF", price: 850, sector: "Real Estate", marketCap: 210500, marketCapCategory: "large", pe: 48.5, pb: 3.8, dividendYield: 0.5, week52High: 985, week52Low: 545 },
  { symbol: "GODREJPROP", yahooSymbol: "GODREJPROP.NS", name: "Godrej Properties", price: 2650, sector: "Real Estate", marketCap: 73500, marketCapCategory: "large", pe: 68.5, pb: 5.8, dividendYield: 0, week52High: 3185, week52Low: 1985 },
  { symbol: "OBEROIRLTY", yahooSymbol: "OBEROIRLTY.NS", name: "Oberoi Realty", price: 1620, sector: "Real Estate", marketCap: 58900, marketCapCategory: "large", pe: 28.5, pb: 4.2, dividendYield: 0.3, week52High: 1985, week52Low: 1085 },
  { symbol: "PRESTIGE", yahooSymbol: "PRESTIGE.NS", name: "Prestige Estates", price: 1180, sector: "Real Estate", marketCap: 47300, marketCapCategory: "large", pe: 42.5, pb: 4.8, dividendYield: 0.2, week52High: 1585, week52Low: 785 },
  { symbol: "PHOENIXLTD", yahooSymbol: "PHOENIXLTD.NS", name: "Phoenix Mills", price: 1450, sector: "Real Estate", marketCap: 51900, marketCapCategory: "large", pe: 42.5, pb: 4.2, dividendYield: 0.3, week52High: 1785, week52Low: 1085 },
  { symbol: "LODHA", yahooSymbol: "LODHA.NS", name: "Macrotech Developers", price: 1285, sector: "Real Estate", marketCap: 122500, marketCapCategory: "large", pe: 52.5, pb: 5.8, dividendYield: 0.2, week52High: 1585, week52Low: 785 },
  { symbol: "BRIGADE", yahooSymbol: "BRIGADE.NS", name: "Brigade Enterprises", price: 1185, sector: "Real Estate", marketCap: 27400, marketCapCategory: "large", pe: 58.5, pb: 6.8, dividendYield: 0.3, week52High: 1485, week52Low: 785 },
  { symbol: "SOBHA", yahooSymbol: "SOBHA.NS", name: "Sobha", price: 1650, sector: "Real Estate", marketCap: 15700, marketCapCategory: "mid", pe: 28.5, pb: 2.8, dividendYield: 0.4, week52High: 2085, week52Low: 1085 },
  { symbol: "SUNTECK", yahooSymbol: "SUNTECK.NS", name: "Sunteck Realty", price: 485, sector: "Real Estate", marketCap: 7020, marketCapCategory: "mid", pe: 58.5, pb: 2.5, dividendYield: 0, week52High: 625, week52Low: 345 },
  { symbol: "MAHLIFE", yahooSymbol: "MAHLIFE.NS", name: "Mahindra Lifespace", price: 485, sector: "Real Estate", marketCap: 7450, marketCapCategory: "mid", pe: 145, pb: 3.5, dividendYield: 0, week52High: 625, week52Low: 345 },
  { symbol: "KOLTE", yahooSymbol: "KOLTEPATIL.NS", name: "Kolte-Patil Developers", price: 385, sector: "Real Estate", marketCap: 2950, marketCapCategory: "small", pe: 12.5, pb: 1.5, dividendYield: 1.5, week52High: 485, week52Low: 285 },
  { symbol: "SIGNATURE", yahooSymbol: "SIGNATUREGLOBAL.NS", name: "Signature Global", price: 1185, sector: "Real Estate", marketCap: 16500, marketCapCategory: "mid", pe: 85.5, pb: 8.5, dividendYield: 0, week52High: 1485, week52Low: 785 },

  // ============ LOGISTICS & AVIATION ============
  { symbol: "DELHIVERY", yahooSymbol: "DELHIVERY.NS", name: "Delhivery", price: 385, sector: "Logistics", marketCap: 28400, marketCapCategory: "large", pe: -85.5, pb: 2.8, dividendYield: 0, week52High: 485, week52Low: 285 },
  { symbol: "BLUEDART", yahooSymbol: "BLUEDART.NS", name: "Blue Dart Express", price: 7850, sector: "Logistics", marketCap: 18700, marketCapCategory: "mid", pe: 52.5, pb: 18.5, dividendYield: 0.8, week52High: 9285, week52Low: 5585 },
  { symbol: "CONCOR", yahooSymbol: "CONCOR.NS", name: "Container Corporation", price: 785, sector: "Logistics", marketCap: 47800, marketCapCategory: "large", pe: 32.5, pb: 3.2, dividendYield: 1.5, week52High: 1085, week52Low: 585 },
  { symbol: "MAHLOG", yahooSymbol: "MAHLOG.NS", name: "Mahindra Logistics", price: 385, sector: "Logistics", marketCap: 2750, marketCapCategory: "small", pe: 125, pb: 2.8, dividendYield: 0, week52High: 485, week52Low: 285 },
  { symbol: "TCI", yahooSymbol: "TCI.NS", name: "Transport Corp of India", price: 985, sector: "Logistics", marketCap: 7550, marketCapCategory: "mid", pe: 22.5, pb: 2.8, dividendYield: 0.8, week52High: 1285, week52Low: 685 },
  { symbol: "ALLCARGO", yahooSymbol: "ALLCARGO.NS", name: "Allcargo Logistics", price: 85, sector: "Logistics", marketCap: 2090, marketCapCategory: "small", pe: 18.5, pb: 1.2, dividendYield: 2.5, week52High: 125, week52Low: 58 },
  { symbol: "VRL", yahooSymbol: "VRLLOG.NS", name: "VRL Logistics", price: 585, sector: "Logistics", marketCap: 5320, marketCapCategory: "mid", pe: 28.5, pb: 5.2, dividendYield: 0.8, week52High: 725, week52Low: 425 },
  { symbol: "SPICEJET", yahooSymbol: "SPICEJET.NS", name: "SpiceJet", price: 58, sector: "Aviation", marketCap: 5450, marketCapCategory: "mid", pe: -12.5, pb: -2.5, dividendYield: 0, week52High: 85, week52Low: 35 },
  { symbol: "JETAIRWAYS", yahooSymbol: "JETAIRWAYS.NS", name: "Jet Airways", price: 18, sector: "Aviation", marketCap: 2050, marketCapCategory: "small", pe: -5.5, pb: -0.5, dividendYield: 0, week52High: 28, week52Low: 10 },

  // ============ CAPITAL GOODS & ENGINEERING ============
  { symbol: "SIEMENS", yahooSymbol: "SIEMENS.NS", name: "Siemens", price: 6850, sector: "Capital Goods", marketCap: 243500, marketCapCategory: "large", pe: 85.5, pb: 12.5, dividendYield: 0.3, week52High: 7885, week52Low: 4585 },
  { symbol: "ABB", yahooSymbol: "ABB.NS", name: "ABB India", price: 7250, sector: "Capital Goods", marketCap: 153600, marketCapCategory: "large", pe: 92.5, pb: 22.5, dividendYield: 0.2, week52High: 8585, week52Low: 4885 },
  { symbol: "BHEL", yahooSymbol: "BHEL.NS", name: "BHEL", price: 285, sector: "Capital Goods", marketCap: 99200, marketCapCategory: "large", pe: 85.5, pb: 3.2, dividendYield: 0.5, week52High: 385, week52Low: 165 },
  { symbol: "CGPOWER", yahooSymbol: "CGPOWER.NS", name: "CG Power & Industrial", price: 685, sector: "Capital Goods", marketCap: 104500, marketCapCategory: "large", pe: 68.5, pb: 18.5, dividendYield: 0.3, week52High: 885, week52Low: 385 },
  { symbol: "CUMMINSIND", yahooSymbol: "CUMMINSIND.NS", name: "Cummins India", price: 3450, sector: "Capital Goods", marketCap: 95600, marketCapCategory: "large", pe: 42.5, pb: 12.5, dividendYield: 1.2, week52High: 3885, week52Low: 2485 },
  { symbol: "THERMAX", yahooSymbol: "THERMAX.NS", name: "Thermax", price: 4850, sector: "Capital Goods", marketCap: 54600, marketCapCategory: "large", pe: 68.5, pb: 12.5, dividendYield: 0.3, week52High: 5685, week52Low: 3285 },
  { symbol: "GRINDWELL", yahooSymbol: "GRINDWELL.NS", name: "Grindwell Norton", price: 2450, sector: "Capital Goods", marketCap: 27200, marketCapCategory: "large", pe: 52.5, pb: 12.5, dividendYield: 0.5, week52High: 2885, week52Low: 1785 },
  { symbol: "SKFINDIA", yahooSymbol: "SKFINDIA.NS", name: "SKF India", price: 5250, sector: "Capital Goods", marketCap: 25900, marketCapCategory: "large", pe: 42.5, pb: 8.5, dividendYield: 0.8, week52High: 6285, week52Low: 3885 },
  { symbol: "TIMKEN", yahooSymbol: "TIMKEN.NS", name: "Timken India", price: 3250, sector: "Capital Goods", marketCap: 24500, marketCapCategory: "large", pe: 52.5, pb: 8.5, dividendYield: 0.4, week52High: 3885, week52Low: 2385 },
  { symbol: "SCHAEFFLER", yahooSymbol: "SCHAEFFLER.NS", name: "Schaeffler India", price: 3650, sector: "Capital Goods", marketCap: 57100, marketCapCategory: "large", pe: 42.5, pb: 8.5, dividendYield: 0.5, week52High: 4285, week52Low: 2685 },
  { symbol: "KALYANKJIL", yahooSymbol: "KALYANKJIL.NS", name: "Kalyan Jewellers", price: 585, sector: "Consumer", marketCap: 60200, marketCapCategory: "large", pe: 78.5, pb: 12.5, dividendYield: 0.2, week52High: 725, week52Low: 385 },
  { symbol: "HONAUT", yahooSymbol: "HONAUT.NS", name: "Honeywell Automation", price: 52500, sector: "Capital Goods", marketCap: 46500, marketCapCategory: "large", pe: 85.5, pb: 18.5, dividendYield: 0.3, week52High: 58585, week52Low: 38585 },
  { symbol: "AIAENG", yahooSymbol: "AIAENG.NS", name: "AIA Engineering", price: 3850, sector: "Capital Goods", marketCap: 36300, marketCapCategory: "large", pe: 38.5, pb: 5.8, dividendYield: 0.4, week52High: 4485, week52Low: 2885 },
  { symbol: "ELGIEQUIP", yahooSymbol: "ELGIEQUIP.NS", name: "Elgi Equipments", price: 685, sector: "Capital Goods", marketCap: 21700, marketCapCategory: "large", pe: 68.5, pb: 12.5, dividendYield: 0.4, week52High: 825, week52Low: 485 },
  { symbol: "KAYNES", yahooSymbol: "KAYNES.NS", name: "Kaynes Technology", price: 4850, sector: "Capital Goods", marketCap: 31200, marketCapCategory: "large", pe: 125, pb: 22.5, dividendYield: 0, week52High: 5885, week52Low: 2885 },
  { symbol: "TRIVENI", yahooSymbol: "TRIVENI.NS", name: "Triveni Turbine", price: 585, sector: "Capital Goods", marketCap: 18900, marketCapCategory: "mid", pe: 68.5, pb: 18.5, dividendYield: 0.3, week52High: 725, week52Low: 385 },
  { symbol: "KENNAMET", yahooSymbol: "KENNAMET.NS", name: "Kennametal India", price: 2450, sector: "Capital Goods", marketCap: 5380, marketCapCategory: "mid", pe: 28.5, pb: 4.5, dividendYield: 0.8, week52High: 2885, week52Low: 1785 },
  { symbol: "CARBORUNIV", yahooSymbol: "CARBORUNIV.NS", name: "Carborundum Universal", price: 1285, sector: "Capital Goods", marketCap: 24300, marketCapCategory: "large", pe: 42.5, pb: 6.8, dividendYield: 0.5, week52High: 1585, week52Low: 885 },
  { symbol: "WENDT", yahooSymbol: "WENDT.NS", name: "Wendt India", price: 7850, sector: "Capital Goods", marketCap: 1580, marketCapCategory: "small", pe: 35.5, pb: 5.2, dividendYield: 0.8, week52High: 9285, week52Low: 5585 },
  { symbol: "BEL", yahooSymbol: "BEL.NS", name: "Bharat Electronics", price: 285, sector: "Capital Goods", marketCap: 208500, marketCapCategory: "large", pe: 42.5, pb: 8.5, dividendYield: 1.2, week52High: 345, week52Low: 185 },
  { symbol: "HAL", yahooSymbol: "HAL.NS", name: "Hindustan Aeronautics", price: 4250, sector: "Capital Goods", marketCap: 284500, marketCapCategory: "large", pe: 28.5, pb: 8.5, dividendYield: 1.5, week52High: 5485, week52Low: 2685 },
  { symbol: "MAZDA", yahooSymbol: "MAZDOCK.NS", name: "Mazagon Dock", price: 4850, sector: "Capital Goods", marketCap: 97800, marketCapCategory: "large", pe: 42.5, pb: 12.5, dividendYield: 0.5, week52High: 5885, week52Low: 2885 },
  { symbol: "COCHINSHIP", yahooSymbol: "COCHINSHIP.NS", name: "Cochin Shipyard", price: 1850, sector: "Capital Goods", marketCap: 48700, marketCapCategory: "large", pe: 28.5, pb: 5.8, dividendYield: 1.2, week52High: 2285, week52Low: 1085 },
  { symbol: "GRSE", yahooSymbol: "GRSE.NS", name: "Garden Reach Shipbuilders", price: 1650, sector: "Capital Goods", marketCap: 18900, marketCapCategory: "mid", pe: 38.5, pb: 6.8, dividendYield: 0.8, week52High: 2085, week52Low: 985 },
  { symbol: "PARAS", yahooSymbol: "PARAS.NS", name: "Paras Defence", price: 985, sector: "Capital Goods", marketCap: 3850, marketCapCategory: "small", pe: 68.5, pb: 8.5, dividendYield: 0.3, week52High: 1285, week52Low: 685 },
  { symbol: "DATAPATT", yahooSymbol: "DATAPATT.NS", name: "Data Patterns", price: 2450, sector: "Capital Goods", marketCap: 14200, marketCapCategory: "mid", pe: 72.5, pb: 12.5, dividendYield: 0, week52High: 2885, week52Low: 1585 },
  { symbol: "ZENTEC", yahooSymbol: "ZENTEC.NS", name: "Zen Technologies", price: 1650, sector: "Capital Goods", marketCap: 14100, marketCapCategory: "mid", pe: 68.5, pb: 18.5, dividendYield: 0, week52High: 1985, week52Low: 985 },

  // ============ CHEMICALS ============
  { symbol: "PIDILITIND", yahooSymbol: "PIDILITIND.NS", name: "Pidilite Industries", price: 2950, sector: "Chemicals", marketCap: 150000, marketCapCategory: "large", pe: 82.5, pb: 22.5, dividendYield: 0.4, week52High: 3385, week52Low: 2385 },
  { symbol: "SRF", yahooSymbol: "SRF.NS", name: "SRF", price: 2450, sector: "Chemicals", marketCap: 72600, marketCapCategory: "large", pe: 38.5, pb: 6.8, dividendYield: 0.4, week52High: 2885, week52Low: 1885 },
  { symbol: "ATUL", yahooSymbol: "ATUL.NS", name: "Atul", price: 6850, sector: "Chemicals", marketCap: 20300, marketCapCategory: "large", pe: 42.5, pb: 4.5, dividendYield: 0.5, week52High: 8585, week52Low: 5585 },
  { symbol: "NAVINFLUOR", yahooSymbol: "NAVINFLUOR.NS", name: "Navin Fluorine", price: 3450, sector: "Chemicals", marketCap: 17100, marketCapCategory: "mid", pe: 42.5, pb: 6.8, dividendYield: 0.3, week52High: 4285, week52Low: 2585 },
  { symbol: "DEEPAKFERT", yahooSymbol: "DEEPAKFERT.NS", name: "Deepak Fertilisers", price: 585, sector: "Chemicals", marketCap: 7380, marketCapCategory: "mid", pe: 12.5, pb: 1.5, dividendYield: 1.2, week52High: 785, week52Low: 385 },
  { symbol: "DEEPAKNTR", yahooSymbol: "DEEPAKNTR.NS", name: "Deepak Nitrite", price: 2450, sector: "Chemicals", marketCap: 33400, marketCapCategory: "large", pe: 32.5, pb: 5.8, dividendYield: 0.4, week52High: 2885, week52Low: 1785 },
  { symbol: "FINEORG", yahooSymbol: "FINEORG.NS", name: "Fine Organic Industries", price: 4850, sector: "Chemicals", marketCap: 14900, marketCapCategory: "mid", pe: 42.5, pb: 8.5, dividendYield: 0.5, week52High: 5885, week52Low: 3585 },
  { symbol: "CLEAN", yahooSymbol: "CLEAN.NS", name: "Clean Science & Technology", price: 1450, sector: "Chemicals", marketCap: 15400, marketCapCategory: "mid", pe: 42.5, pb: 8.5, dividendYield: 0.3, week52High: 1785, week52Low: 1085 },
  { symbol: "TATACHEM", yahooSymbol: "TATACHEM.NS", name: "Tata Chemicals", price: 1085, sector: "Chemicals", marketCap: 27600, marketCapCategory: "large", pe: 12.5, pb: 1.5, dividendYield: 1.5, week52High: 1285, week52Low: 785 },
  { symbol: "BASF", yahooSymbol: "BASF.NS", name: "BASF India", price: 6850, sector: "Chemicals", marketCap: 29700, marketCapCategory: "large", pe: 52.5, pb: 8.5, dividendYield: 0.3, week52High: 8585, week52Low: 4885 },
  { symbol: "ANURAS", yahooSymbol: "ANURAS.NS", name: "Anupam Rasayan", price: 885, sector: "Chemicals", marketCap: 9520, marketCapCategory: "mid", pe: 42.5, pb: 4.5, dividendYield: 0, week52High: 1085, week52Low: 585 },
  { symbol: "GALAXYSURF", yahooSymbol: "GALAXYSURF.NS", name: "Galaxy Surfactants", price: 2850, sector: "Chemicals", marketCap: 10100, marketCapCategory: "mid", pe: 32.5, pb: 5.8, dividendYield: 0.8, week52High: 3285, week52Low: 2185 },
  { symbol: "PIIND", yahooSymbol: "PIIND.NS", name: "PI Industries", price: 3850, sector: "Chemicals", marketCap: 58400, marketCapCategory: "large", pe: 42.5, pb: 8.5, dividendYield: 0.3, week52High: 4485, week52Low: 2885 },
  { symbol: "AARTIIND", yahooSymbol: "AARTIIND.NS", name: "Aarti Industries", price: 485, sector: "Chemicals", marketCap: 17500, marketCapCategory: "mid", pe: 28.5, pb: 3.2, dividendYield: 0.5, week52High: 625, week52Low: 345 },
  { symbol: "SUMICHEM", yahooSymbol: "SUMICHEM.NS", name: "Sumitomo Chemical India", price: 485, sector: "Chemicals", marketCap: 24200, marketCapCategory: "large", pe: 42.5, pb: 8.5, dividendYield: 0.5, week52High: 585, week52Low: 345 },
  { symbol: "ALKYLAMINE", yahooSymbol: "ALKYLAMINE.NS", name: "Alkyl Amines Chemicals", price: 2250, sector: "Chemicals", marketCap: 11500, marketCapCategory: "mid", pe: 42.5, pb: 8.5, dividendYield: 0.3, week52High: 2685, week52Low: 1685 },
  { symbol: "BALAJI", yahooSymbol: "BALAMINES.NS", name: "Balaji Amines", price: 2450, sector: "Chemicals", marketCap: 7920, marketCapCategory: "mid", pe: 28.5, pb: 4.5, dividendYield: 0.3, week52High: 2885, week52Low: 1785 },
  { symbol: "VINATI", yahooSymbol: "VINATIORGA.NS", name: "Vinati Organics", price: 1850, sector: "Chemicals", marketCap: 19000, marketCapCategory: "mid", pe: 52.5, pb: 8.5, dividendYield: 0.3, week52High: 2285, week52Low: 1385 },
  { symbol: "IOLCP", yahooSymbol: "IOLCP.NS", name: "IOL Chemicals", price: 385, sector: "Chemicals", marketCap: 2250, marketCapCategory: "small", pe: 18.5, pb: 1.8, dividendYield: 0.5, week52High: 485, week52Low: 285 },

  // ============ FINTECH & NEW-AGE TECH ============
  { symbol: "PAYTM", yahooSymbol: "PAYTM.NS", name: "One97 Communications", price: 385, sector: "Fintech", marketCap: 24500, marketCapCategory: "large", pe: -25.5, pb: 2.5, dividendYield: 0, week52High: 985, week52Low: 315 },
  { symbol: "POLICYBZR", yahooSymbol: "POLICYBZR.NS", name: "PB Fintech", price: 1450, sector: "Fintech", marketCap: 65200, marketCapCategory: "large", pe: -125, pb: 12.5, dividendYield: 0, week52High: 1685, week52Low: 485 },
  { symbol: "CARTRADE", yahooSymbol: "CARTRADE.NS", name: "CarTrade Tech", price: 885, sector: "Fintech", marketCap: 4150, marketCapCategory: "small", pe: -42.5, pb: 2.5, dividendYield: 0, week52High: 1085, week52Low: 585 },
  { symbol: "EASEMYTRIP", yahooSymbol: "EASEMYTRIP.NS", name: "Easy Trip Planners", price: 38, sector: "Fintech", marketCap: 6750, marketCapCategory: "mid", pe: 42.5, pb: 8.5, dividendYield: 0.5, week52High: 52, week52Low: 28 },
  { symbol: "INFIBEAM", yahooSymbol: "INFIBEAM.NS", name: "Infibeam Avenues", price: 28, sector: "Fintech", marketCap: 7850, marketCapCategory: "mid", pe: 28.5, pb: 2.8, dividendYield: 0.3, week52High: 38, week52Low: 18 },
  { symbol: "ANGELONE", yahooSymbol: "ANGELONE.NS", name: "Angel One", price: 2850, sector: "Fintech", marketCap: 25700, marketCapCategory: "large", pe: 18.5, pb: 6.8, dividendYield: 1.2, week52High: 3485, week52Low: 1985 },
  { symbol: "CDSL", yahooSymbol: "CDSL.NS", name: "CDSL", price: 1450, sector: "Fintech", marketCap: 30300, marketCapCategory: "large", pe: 52.5, pb: 18.5, dividendYield: 0.8, week52High: 1785, week52Low: 1085 },
  { symbol: "BSE", yahooSymbol: "BSE.NS", name: "BSE", price: 4850, sector: "Fintech", marketCap: 65500, marketCapCategory: "large", pe: 85.5, pb: 12.5, dividendYield: 0.5, week52High: 5885, week52Low: 2885 },
  { symbol: "CAMS", yahooSymbol: "CAMS.NS", name: "Computer Age Management", price: 3850, sector: "Fintech", marketCap: 18900, marketCapCategory: "mid", pe: 52.5, pb: 22.5, dividendYield: 1.5, week52High: 4485, week52Low: 2885 },
  { symbol: "KFINTECH", yahooSymbol: "KFINTECH.NS", name: "KFin Technologies", price: 985, sector: "Fintech", marketCap: 16800, marketCapCategory: "mid", pe: 48.5, pb: 12.5, dividendYield: 0.5, week52High: 1285, week52Low: 685 },
  { symbol: "MCX", yahooSymbol: "MCX.NS", name: "Multi Commodity Exchange", price: 5850, sector: "Fintech", marketCap: 29800, marketCapCategory: "large", pe: 72.5, pb: 12.5, dividendYield: 0.5, week52High: 6885, week52Low: 3885 },
  { symbol: "IIFL", yahooSymbol: "IIFL.NS", name: "IIFL Finance", price: 485, sector: "Fintech", marketCap: 20600, marketCapCategory: "large", pe: 12.5, pb: 2.2, dividendYield: 1.5, week52High: 625, week52Low: 345 },
  { symbol: "IIFLFIN", yahooSymbol: "IIFLSEC.NS", name: "IIFL Securities", price: 285, sector: "Fintech", marketCap: 8650, marketCapCategory: "mid", pe: 12.5, pb: 2.5, dividendYield: 2.5, week52High: 385, week52Low: 185 },
  { symbol: "MOTILALOFS", yahooSymbol: "MOTILALOFS.NS", name: "Motilal Oswal Financial", price: 785, sector: "Fintech", marketCap: 11600, marketCapCategory: "mid", pe: 18.5, pb: 3.5, dividendYield: 1.5, week52High: 985, week52Low: 585 },
  { symbol: "HDFC AMC", yahooSymbol: "HDFCAMC.NS", name: "HDFC AMC", price: 4250, sector: "Fintech", marketCap: 90800, marketCapCategory: "large", pe: 42.5, pb: 12.5, dividendYield: 1.2, week52High: 4885, week52Low: 2985 },
  { symbol: "NIPPONIND", yahooSymbol: "NAM-INDIA.NS", name: "Nippon Life India AMC", price: 585, sector: "Fintech", marketCap: 36800, marketCapCategory: "large", pe: 28.5, pb: 8.5, dividendYield: 2.5, week52High: 725, week52Low: 385 },
  { symbol: "UTIAMC", yahooSymbol: "UTIAMC.NS", name: "UTI AMC", price: 1085, sector: "Fintech", marketCap: 13800, marketCapCategory: "mid", pe: 18.5, pb: 3.5, dividendYield: 3.5, week52High: 1385, week52Low: 785 },
  { symbol: "ABIRLAAMC", yahooSymbol: "ABSLAMC.NS", name: "Aditya Birla AMC", price: 485, sector: "Fintech", marketCap: 13900, marketCapCategory: "mid", pe: 22.5, pb: 4.5, dividendYield: 2.8, week52High: 625, week52Low: 345 },

  // ============ TEXTILES ============
  { symbol: "PAGEIND", yahooSymbol: "PAGEIND.NS", name: "Page Industries", price: 42000, sector: "Textiles", marketCap: 46800, marketCapCategory: "large", pe: 72.5, pb: 28.5, dividendYield: 0.6, week52High: 48585, week52Low: 34585 },
  { symbol: "RAYMOND", yahooSymbol: "RAYMOND.NS", name: "Raymond", price: 1650, sector: "Textiles", marketCap: 11000, marketCapCategory: "mid", pe: 28.5, pb: 2.5, dividendYield: 0.8, week52High: 2085, week52Low: 1185 },
  { symbol: "ARVIND", yahooSymbol: "ARVIND.NS", name: "Arvind", price: 385, sector: "Textiles", marketCap: 10100, marketCapCategory: "mid", pe: 18.5, pb: 1.5, dividendYield: 0.8, week52High: 485, week52Low: 285 },
  { symbol: "WELSPUNIND", yahooSymbol: "WELSPUNIND.NS", name: "Welspun India", price: 145, sector: "Textiles", marketCap: 14200, marketCapCategory: "mid", pe: 18.5, pb: 2.2, dividendYield: 1.5, week52High: 185, week52Low: 105 },
  { symbol: "KPRMILL", yahooSymbol: "KPRMILL.NS", name: "K.P.R. Mill", price: 885, sector: "Textiles", marketCap: 30200, marketCapCategory: "large", pe: 28.5, pb: 5.8, dividendYield: 0.5, week52High: 1085, week52Low: 585 },
  { symbol: "VARDHMAN", yahooSymbol: "VTL.NS", name: "Vardhman Textiles", price: 485, sector: "Textiles", marketCap: 13800, marketCapCategory: "mid", pe: 12.5, pb: 1.2, dividendYield: 1.5, week52High: 585, week52Low: 345 },
  { symbol: "SOMANYCERA", yahooSymbol: "SOMANYCERA.NS", name: "Somany Ceramics", price: 685, sector: "Textiles", marketCap: 2900, marketCapCategory: "small", pe: 22.5, pb: 2.8, dividendYield: 0.8, week52High: 885, week52Low: 485 },
  { symbol: "CERA", yahooSymbol: "CERA.NS", name: "Cera Sanitaryware", price: 8850, sector: "Consumer", marketCap: 11500, marketCapCategory: "mid", pe: 42.5, pb: 8.5, dividendYield: 0.5, week52High: 10585, week52Low: 6585 },
  { symbol: "TRIDENT", yahooSymbol: "TRIDENT.NS", name: "Trident", price: 32, sector: "Textiles", marketCap: 16300, marketCapCategory: "mid", pe: 18.5, pb: 2.2, dividendYield: 1.2, week52High: 45, week52Low: 25 },
  { symbol: "GOKEX", yahooSymbol: "GOKEX.NS", name: "Gokaldas Exports", price: 985, sector: "Textiles", marketCap: 6850, marketCapCategory: "mid", pe: 22.5, pb: 4.5, dividendYield: 0.3, week52High: 1285, week52Low: 685 },

  // ============ MEDIA & ENTERTAINMENT ============
  { symbol: "SUNTV", yahooSymbol: "SUNTV.NS", name: "Sun TV Network", price: 685, sector: "Media", marketCap: 27000, marketCapCategory: "large", pe: 12.5, pb: 3.2, dividendYield: 2.8, week52High: 825, week52Low: 485 },
  { symbol: "ZEEL", yahooSymbol: "ZEEL.NS", name: "Zee Entertainment", price: 145, sector: "Media", marketCap: 13900, marketCapCategory: "mid", pe: 22.5, pb: 1.2, dividendYield: 0.5, week52High: 225, week52Low: 105 },
  { symbol: "PVR", yahooSymbol: "PVRINOX.NS", name: "PVR INOX", price: 1450, sector: "Media", marketCap: 14200, marketCapCategory: "mid", pe: -28.5, pb: 2.5, dividendYield: 0, week52High: 1785, week52Low: 1085 },
  { symbol: "NAZARA", yahooSymbol: "NAZARA.NS", name: "Nazara Technologies", price: 985, sector: "Media", marketCap: 6520, marketCapCategory: "mid", pe: 125, pb: 8.5, dividendYield: 0, week52High: 1285, week52Low: 685 },
  { symbol: "TIPS", yahooSymbol: "TIPSINDLTD.NS", name: "Tips Industries", price: 685, sector: "Media", marketCap: 8750, marketCapCategory: "mid", pe: 52.5, pb: 18.5, dividendYield: 0.5, week52High: 885, week52Low: 485 },
  { symbol: "SAREGAMA", yahooSymbol: "SAREGAMA.NS", name: "Saregama India", price: 485, sector: "Media", marketCap: 9350, marketCapCategory: "mid", pe: 42.5, pb: 12.5, dividendYield: 0.5, week52High: 625, week52Low: 345 },
  { symbol: "NETWORK18", yahooSymbol: "NETWORK18.NS", name: "Network18 Media", price: 78, sector: "Media", marketCap: 8150, marketCapCategory: "mid", pe: -18.5, pb: 2.5, dividendYield: 0, week52High: 108, week52Low: 52 },
  { symbol: "TV18BRDCST", yahooSymbol: "TV18BRDCST.NS", name: "TV18 Broadcast", price: 42, sector: "Media", marketCap: 7250, marketCapCategory: "mid", pe: 18.5, pb: 1.5, dividendYield: 0, week52High: 58, week52Low: 32 },

  // ============ AGRICULTURE & FERTILIZERS ============
  { symbol: "UPL", yahooSymbol: "UPL.NS", name: "UPL", price: 545, sector: "Agriculture", marketCap: 40900, marketCapCategory: "large", pe: 18.5, pb: 1.5, dividendYield: 1.5, week52High: 685, week52Low: 385 },
  { symbol: "COROMANDEL", yahooSymbol: "COROMANDEL.NS", name: "Coromandel International", price: 1650, sector: "Agriculture", marketCap: 48500, marketCapCategory: "large", pe: 22.5, pb: 4.5, dividendYield: 0.8, week52High: 1985, week52Low: 1185 },
  { symbol: "CHAMBAL", yahooSymbol: "CHAMBLFERT.NS", name: "Chambal Fertilisers", price: 485, sector: "Agriculture", marketCap: 20100, marketCapCategory: "large", pe: 12.5, pb: 2.2, dividendYield: 2.5, week52High: 585, week52Low: 345 },
  { symbol: "GNFC", yahooSymbol: "GNFC.NS", name: "Gujarat Narmada Valley Fert", price: 585, sector: "Agriculture", marketCap: 9080, marketCapCategory: "mid", pe: 8.5, pb: 1.2, dividendYield: 3.5, week52High: 785, week52Low: 385 },
  { symbol: "GSFC", yahooSymbol: "GSFC.NS", name: "Gujarat State Fertilizers", price: 185, sector: "Agriculture", marketCap: 7380, marketCapCategory: "mid", pe: 8.5, pb: 0.8, dividendYield: 2.8, week52High: 245, week52Low: 125 },
  { symbol: "RCF", yahooSymbol: "RCF.NS", name: "Rashtriya Chemicals & Fert", price: 145, sector: "Agriculture", marketCap: 8020, marketCapCategory: "mid", pe: 12.5, pb: 1.2, dividendYield: 2.5, week52High: 185, week52Low: 105 },
  { symbol: "FACT", yahooSymbol: "FACT.NS", name: "Fertilisers & Chemicals Travancore", price: 785, sector: "Agriculture", marketCap: 5080, marketCapCategory: "mid", pe: 18.5, pb: 2.8, dividendYield: 1.2, week52High: 985, week52Low: 545 },
  { symbol: "ZUARI", yahooSymbol: "ZUARIAGRO.NS", name: "Zuari Agro Chemicals", price: 185, sector: "Agriculture", marketCap: 780, marketCapCategory: "small", pe: 12.5, pb: 0.8, dividendYield: 2.5, week52High: 245, week52Low: 125 },
  { symbol: "KAVERI", yahooSymbol: "KSCL.NS", name: "Kaveri Seed Company", price: 785, sector: "Agriculture", marketCap: 4850, marketCapCategory: "small", pe: 18.5, pb: 3.5, dividendYield: 1.8, week52High: 985, week52Low: 545 },
  { symbol: "DHANUKA", yahooSymbol: "DHANUKA.NS", name: "Dhanuka Agritech", price: 1450, sector: "Agriculture", marketCap: 6720, marketCapCategory: "mid", pe: 22.5, pb: 4.5, dividendYield: 0.8, week52High: 1785, week52Low: 1085 },
  { symbol: "RALLIS", yahooSymbol: "RALLIS.NS", name: "Rallis India", price: 285, sector: "Agriculture", marketCap: 5550, marketCapCategory: "mid", pe: 28.5, pb: 2.8, dividendYield: 1.2, week52High: 365, week52Low: 205 },
  { symbol: "BAYER", yahooSymbol: "BAYERCROP.NS", name: "Bayer CropScience", price: 6850, sector: "Agriculture", marketCap: 30800, marketCapCategory: "large", pe: 42.5, pb: 8.5, dividendYield: 0.5, week52High: 7885, week52Low: 4885 },

  // ============ MISCELLANEOUS ============
  { symbol: "INDIANHOTEL", yahooSymbol: "INDHOTEL.NS", name: "Indian Hotels", price: 685, sector: "Hotels", marketCap: 97600, marketCapCategory: "large", pe: 85.5, pb: 12.5, dividendYield: 0.3, week52High: 825, week52Low: 385 },
  { symbol: "LEMON", yahooSymbol: "LEMONTREE.NS", name: "Lemon Tree Hotels", price: 145, sector: "Hotels", marketCap: 11500, marketCapCategory: "mid", pe: 85.5, pb: 8.5, dividendYield: 0, week52High: 185, week52Low: 105 },
  { symbol: "CHALET", yahooSymbol: "CHALET.NS", name: "Chalet Hotels", price: 785, sector: "Hotels", marketCap: 16100, marketCapCategory: "mid", pe: 52.5, pb: 4.5, dividendYield: 0.3, week52High: 985, week52Low: 545 },
  { symbol: "EIH", yahooSymbol: "EIHOTEL.NS", name: "EIH (Oberoi Hotels)", price: 385, sector: "Hotels", marketCap: 24200, marketCapCategory: "large", pe: 68.5, pb: 6.8, dividendYield: 0.3, week52High: 485, week52Low: 285 },
  { symbol: "INDIAMART", yahooSymbol: "INDIAMART.NS", name: "IndiaMART InterMESH", price: 2850, sector: "E-commerce", marketCap: 17100, marketCapCategory: "mid", pe: 42.5, pb: 8.5, dividendYield: 0.5, week52High: 3485, week52Low: 2085 },
  { symbol: "JUSTDIAL", yahooSymbol: "JUSTDIAL.NS", name: "Just Dial", price: 1085, sector: "E-commerce", marketCap: 9250, marketCapCategory: "mid", pe: 22.5, pb: 2.8, dividendYield: 0, week52High: 1385, week52Low: 685 },
  { symbol: "AFFLE", yahooSymbol: "AFFLE.NS", name: "Affle India", price: 1450, sector: "E-commerce", marketCap: 19400, marketCapCategory: "mid", pe: 68.5, pb: 12.5, dividendYield: 0, week52High: 1785, week52Low: 985 },
  { symbol: "ZENSARTECH", yahooSymbol: "ZENSAR.NS", name: "Zensar Tech", price: 685, sector: "IT", marketCap: 15500, marketCapCategory: "mid", pe: 28.5, pb: 4.8, dividendYield: 1.0, week52High: 885, week52Low: 485 },
  { symbol: "RITES", yahooSymbol: "RITES.NS", name: "RITES", price: 685, sector: "Infrastructure", marketCap: 16500, marketCapCategory: "mid", pe: 22.5, pb: 4.5, dividendYield: 2.5, week52High: 885, week52Low: 485 },
  { symbol: "IRFC", yahooSymbol: "IRFC.NS", name: "Indian Railway Finance Corp", price: 165, sector: "Finance", marketCap: 215000, marketCapCategory: "large", pe: 28.5, pb: 3.2, dividendYield: 1.2, week52High: 225, week52Low: 85 },
  { symbol: "RECLTD", yahooSymbol: "RECLTD.NS", name: "REC", price: 485, sector: "Finance", marketCap: 127500, marketCapCategory: "large", pe: 8.5, pb: 1.5, dividendYield: 3.5, week52High: 625, week52Low: 285 },
  { symbol: "PFC", yahooSymbol: "PFC.NS", name: "Power Finance Corp", price: 485, sector: "Finance", marketCap: 160000, marketCapCategory: "large", pe: 6.5, pb: 1.2, dividendYield: 3.8, week52High: 585, week52Low: 285 },
  { symbol: "HUDCO", yahooSymbol: "HUDCO.NS", name: "HUDCO", price: 245, sector: "Finance", marketCap: 49100, marketCapCategory: "large", pe: 12.5, pb: 1.8, dividendYield: 2.5, week52High: 325, week52Low: 145 },
  { symbol: "IREDA", yahooSymbol: "IREDA.NS", name: "Indian Renewable Energy Dev Agency", price: 185, sector: "Finance", marketCap: 49800, marketCapCategory: "large", pe: 32.5, pb: 4.5, dividendYield: 0, week52High: 265, week52Low: 105 },
  { symbol: "CGCL", yahooSymbol: "CGCL.NS", name: "Capri Global Capital", price: 185, sector: "Finance", marketCap: 15200, marketCapCategory: "mid", pe: 28.5, pb: 2.8, dividendYield: 0, week52High: 245, week52Low: 125 },
  { symbol: "ABSLAMC", yahooSymbol: "ABSLAMC.NS", name: "Aditya Birla Sun Life AMC", price: 485, sector: "Finance", marketCap: 13900, marketCapCategory: "mid", pe: 22.5, pb: 4.5, dividendYield: 2.8, week52High: 625, week52Low: 345 },
  { symbol: "SUNDARM", yahooSymbol: "SUNDARMFIN.NS", name: "Sundaram Finance", price: 4250, sector: "Finance", marketCap: 47200, marketCapCategory: "large", pe: 22.5, pb: 3.5, dividendYield: 0.8, week52High: 4885, week52Low: 3285 },
  { symbol: "REDINGTON", yahooSymbol: "REDINGTON.NS", name: "Redington", price: 185, sector: "IT", marketCap: 14400, marketCapCategory: "mid", pe: 12.5, pb: 2.2, dividendYield: 2.5, week52High: 225, week52Low: 125 },
  { symbol: "MAPMYINDIA", yahooSymbol: "MAPMYINDIA.NS", name: "CE Info Systems", price: 1850, sector: "IT", marketCap: 10100, marketCapCategory: "mid", pe: 78.5, pb: 18.5, dividendYield: 0.3, week52High: 2285, week52Low: 1285 },
  { symbol: "LATENTVIEW", yahooSymbol: "LATENTVIEW.NS", name: "Latent View Analytics", price: 485, sector: "IT", marketCap: 9850, marketCapCategory: "mid", pe: 52.5, pb: 8.5, dividendYield: 0.5, week52High: 625, week52Low: 345 },
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
