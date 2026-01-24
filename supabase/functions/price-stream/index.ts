import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Yahoo Finance symbol mappings for Indian stocks
const YAHOO_SYMBOLS: Record<string, string> = {
  // Indices
  "NIFTY": "^NSEI",
  "NIFTY50": "^NSEI",
  "BANKNIFTY": "^NSEBANK",
  "NIFTYIT": "^CNXIT",
  "NIFTYMIDCAP": "^NSEMDCP50",
  "NIFTYSMLCAP": "^CNXSC",
  "NIFTYPHARMA": "^CNXPHARMA",
  "NIFTYMETAL": "^CNXMETAL",
  "NIFTYAUTO": "^CNXAUTO",
  "NIFTYREALTY": "^CNXREALTY",
  "NIFTYFMCG": "^CNXFMCG",
};

const getYahooSymbol = (symbol: string): string => {
  return YAHOO_SYMBOLS[symbol] || `${symbol}.NS`;
};

// Complete stock data with prices and sector-based volatility (400+ stocks)
interface StockConfig {
  price: number;
  volatility: number;
}

const STOCK_CONFIG: Record<string, StockConfig> = {
  // Indices (low volatility)
  "NIFTY": { price: 24500, volatility: 0.002 },
  "BANKNIFTY": { price: 51800, volatility: 0.003 },
  "NIFTYIT": { price: 41500, volatility: 0.003 },
  "NIFTYMIDCAP": { price: 15800, volatility: 0.003 },
  "NIFTYSMLCAP": { price: 18200, volatility: 0.004 },
  "NIFTYPHARMA": { price: 21500, volatility: 0.003 },
  "NIFTYMETAL": { price: 9200, volatility: 0.004 },
  "NIFTYAUTO": { price: 23500, volatility: 0.003 },
  "NIFTYREALTY": { price: 1050, volatility: 0.004 },
  "NIFTYFMCG": { price: 58500, volatility: 0.002 },

  // Banking - Large Cap
  "HDFCBANK": { price: 1680, volatility: 0.014 },
  "ICICIBANK": { price: 1120, volatility: 0.016 },
  "SBIN": { price: 780, volatility: 0.020 },
  "KOTAKBANK": { price: 1850, volatility: 0.014 },
  "AXISBANK": { price: 1080, volatility: 0.018 },
  "INDUSINDBK": { price: 1420, volatility: 0.020 },
  "BANDHANBNK": { price: 195, volatility: 0.025 },
  "FEDERALBNK": { price: 165, volatility: 0.022 },
  "IDFCFIRSTB": { price: 78, volatility: 0.025 },
  "PNB": { price: 105, volatility: 0.022 },
  "BANKBARODA": { price: 245, volatility: 0.020 },
  "CANBK": { price: 108, volatility: 0.022 },
  "AUBANK": { price: 620, volatility: 0.018 },
  "YESBANK": { price: 22, volatility: 0.035 },
  "UNIONBANK": { price: 125, volatility: 0.022 },
  "INDIANB": { price: 485, volatility: 0.020 },
  "CENTRALBK": { price: 52, volatility: 0.028 },
  "MAHABANK": { price: 58, volatility: 0.025 },
  "IOB": { price: 52, volatility: 0.028 },
  "UCOBANK": { price: 48, volatility: 0.028 },
  "PSB": { price: 58, volatility: 0.028 },
  "KARURVYSYA": { price: 185, volatility: 0.022 },
  "DCBBANK": { price: 118, volatility: 0.025 },
  "SOUTHBANK": { price: 28, volatility: 0.030 },
  "TMBANK": { price: 485, volatility: 0.020 },
  "CSBBANK": { price: 325, volatility: 0.022 },
  "RBLBANK": { price: 185, volatility: 0.028 },
  "EQUITASBNK": { price: 85, volatility: 0.025 },
  "UJJIVANSFB": { price: 42, volatility: 0.028 },
  "SURYODAY": { price: 145, volatility: 0.028 },
  "ESAFSFB": { price: 58, volatility: 0.030 },

  // IT - Large Cap
  "TCS": { price: 3950, volatility: 0.012 },
  "INFY": { price: 1520, volatility: 0.018 },
  "WIPRO": { price: 445, volatility: 0.015 },
  "HCLTECH": { price: 1780, volatility: 0.016 },
  "TECHM": { price: 1650, volatility: 0.018 },
  "LTIM": { price: 5850, volatility: 0.016 },
  "MPHASIS": { price: 2680, volatility: 0.018 },
  "COFORGE": { price: 5450, volatility: 0.020 },
  "PERSISTENT": { price: 5200, volatility: 0.020 },
  "LTTS": { price: 4850, volatility: 0.018 },
  "OFSS": { price: 9800, volatility: 0.015 },
  "CYIENT": { price: 1920, volatility: 0.020 },
  "ECLERX": { price: 2850, volatility: 0.022 },
  "TATAELXSI": { price: 6850, volatility: 0.022 },
  "BIRLASOFT": { price: 585, volatility: 0.022 },
  "ZENSAR": { price: 685, volatility: 0.022 },
  "SONATSOFTW": { price: 585, volatility: 0.025 },
  "NEWGEN": { price: 1285, volatility: 0.025 },
  "HAPPSTMNDS": { price: 785, volatility: 0.028 },
  "ROUTE": { price: 1650, volatility: 0.025 },
  "INTELLECT": { price: 785, volatility: 0.025 },
  "KPITTECH": { price: 1485, volatility: 0.028 },
  "MASTEK": { price: 2850, volatility: 0.025 },
  "RATEGAIN": { price: 685, volatility: 0.030 },
  "TANLA": { price: 985, volatility: 0.025 },
  "REDINGTON": { price: 185, volatility: 0.020 },
  "MAPMYINDIA": { price: 1850, volatility: 0.028 },
  "LATENTVIEW": { price: 485, volatility: 0.028 },

  // Oil & Gas
  "RELIANCE": { price: 2850, volatility: 0.015 },
  "ONGC": { price: 265, volatility: 0.018 },
  "BPCL": { price: 585, volatility: 0.018 },
  "IOC": { price: 168, volatility: 0.018 },
  "HINDPETRO": { price: 385, volatility: 0.020 },
  "GAIL": { price: 195, volatility: 0.016 },
  "PETRONET": { price: 345, volatility: 0.015 },
  "OIL": { price: 520, volatility: 0.020 },
  "MGL": { price: 1450, volatility: 0.018 },
  "IGL": { price: 485, volatility: 0.016 },
  "GUJGAS": { price: 545, volatility: 0.018 },
  "MRPL": { price: 185, volatility: 0.025 },
  "CHENNPETRO": { price: 685, volatility: 0.025 },
  "CASTROLIND": { price: 185, volatility: 0.015 },
  "AEGISCHEM": { price: 385, volatility: 0.020 },
  "GSPL": { price: 385, volatility: 0.018 },

  // FMCG
  "HINDUNILVR": { price: 2450, volatility: 0.010 },
  "ITC": { price: 460, volatility: 0.012 },
  "NESTLEIND": { price: 2480, volatility: 0.008 },
  "BRITANNIA": { price: 5200, volatility: 0.010 },
  "DABUR": { price: 585, volatility: 0.012 },
  "MARICO": { price: 635, volatility: 0.012 },
  "GODREJCP": { price: 1280, volatility: 0.014 },
  "COLPAL": { price: 2850, volatility: 0.010 },
  "TATACONSUM": { price: 1120, volatility: 0.014 },
  "VBL": { price: 1580, volatility: 0.016 },
  "PGHH": { price: 15800, volatility: 0.008 },
  "GILLETTE": { price: 6850, volatility: 0.010 },
  "EMAMILTD": { price: 585, volatility: 0.016 },
  "JYOTHYLAB": { price: 485, volatility: 0.018 },
  "RADICO": { price: 1850, volatility: 0.018 },
  "UNITDSPR": { price: 1185, volatility: 0.016 },
  "MCDOWELL-N": { price: 1850, volatility: 0.018 },
  "ZYDUSWELL": { price: 1850, volatility: 0.018 },
  "BIKAJI": { price: 685, volatility: 0.022 },
  "CCL": { price: 685, volatility: 0.020 },
  "GODFRYPHLP": { price: 4850, volatility: 0.018 },

  // Pharma
  "SUNPHARMA": { price: 1620, volatility: 0.016 },
  "DRREDDY": { price: 6200, volatility: 0.014 },
  "CIPLA": { price: 1480, volatility: 0.015 },
  "DIVISLAB": { price: 4950, volatility: 0.015 },
  "APOLLOHOSP": { price: 6800, volatility: 0.016 },
  "LUPIN": { price: 1680, volatility: 0.018 },
  "BIOCON": { price: 285, volatility: 0.022 },
  "TORNTPHARM": { price: 2850, volatility: 0.014 },
  "ALKEM": { price: 5450, volatility: 0.014 },
  "AUROPHARMA": { price: 1280, volatility: 0.018 },
  "ZYDUSLIFE": { price: 985, volatility: 0.016 },
  "GLENMARK": { price: 1185, volatility: 0.020 },
  "IPCALAB": { price: 1450, volatility: 0.016 },
  "ABBOTINDIA": { price: 26500, volatility: 0.010 },
  "SANOFI": { price: 6850, volatility: 0.012 },
  "GLAND": { price: 1850, volatility: 0.020 },
  "LALPATHLAB": { price: 2850, volatility: 0.018 },
  "METROPOLIS": { price: 1850, volatility: 0.020 },
  "NATCOPHARM": { price: 1185, volatility: 0.022 },
  "GRANULES": { price: 485, volatility: 0.022 },
  "LAURUSLABS": { price: 485, volatility: 0.025 },
  "SYNGENE": { price: 785, volatility: 0.018 },
  "ASTRAZEN": { price: 6850, volatility: 0.018 },
  "PFIZER": { price: 4850, volatility: 0.012 },
  "GLAXO": { price: 2450, volatility: 0.012 },
  "MANKIND": { price: 2185, volatility: 0.016 },
  "JBCHEPHARM": { price: 1850, volatility: 0.016 },
  "ERIS": { price: 985, volatility: 0.018 },

  // Auto
  "TATAMOTORS": { price: 920, volatility: 0.025 },
  "MARUTI": { price: 10800, volatility: 0.012 },
  "M&M": { price: 2850, volatility: 0.016 },
  "BAJAJ-AUTO": { price: 9200, volatility: 0.014 },
  "EICHERMOT": { price: 4850, volatility: 0.014 },
  "HEROMOTOCO": { price: 4200, volatility: 0.012 },
  "TVSMOTOR": { price: 2450, volatility: 0.018 },
  "ASHOKLEY": { price: 185, volatility: 0.022 },
  "MOTHERSON": { price: 145, volatility: 0.020 },
  "BHARATFORG": { price: 1350, volatility: 0.020 },
  "MRF": { price: 128500, volatility: 0.010 },
  "APOLLOTYRE": { price: 485, volatility: 0.020 },
  "BALKRISIND": { price: 2850, volatility: 0.018 },
  "BOSCHLTD": { price: 32500, volatility: 0.012 },
  "EXIDEIND": { price: 485, volatility: 0.018 },
  "AMARAJABAT": { price: 1185, volatility: 0.018 },
  "CEATLTD": { price: 2850, volatility: 0.020 },
  "SUNDRMFAST": { price: 1085, volatility: 0.018 },
  "ENDURANCE": { price: 2185, volatility: 0.018 },
  "SWARAJENG": { price: 2850, volatility: 0.018 },
  "FORCEMOT": { price: 6850, volatility: 0.022 },
  "OLECTRA": { price: 1450, volatility: 0.030 },

  // Metals
  "TATASTEEL": { price: 145, volatility: 0.022 },
  "JSWSTEEL": { price: 890, volatility: 0.020 },
  "HINDALCO": { price: 620, volatility: 0.022 },
  "VEDL": { price: 445, volatility: 0.025 },
  "COALINDIA": { price: 420, volatility: 0.015 },
  "NMDC": { price: 225, volatility: 0.020 },
  "SAIL": { price: 125, volatility: 0.025 },
  "JINDALSTEL": { price: 920, volatility: 0.022 },
  "NATIONALUM": { price: 185, volatility: 0.025 },
  "HINDCOPPER": { price: 285, volatility: 0.028 },
  "MOIL": { price: 385, volatility: 0.022 },
  "WELCORP": { price: 585, volatility: 0.022 },
  "APLAPOLLO": { price: 1585, volatility: 0.020 },
  "RATNAMANI": { price: 3250, volatility: 0.018 },
  "JSLHISAR": { price: 685, volatility: 0.022 },
  "GMRINFRA": { price: 85, volatility: 0.030 },

  // Power
  "NTPC": { price: 385, volatility: 0.012 },
  "POWERGRID": { price: 295, volatility: 0.010 },
  "ADANIGREEN": { price: 1850, volatility: 0.025 },
  "TATAPOWER": { price: 420, volatility: 0.020 },
  "ADANIPOWER": { price: 585, volatility: 0.025 },
  "NHPC": { price: 85, volatility: 0.018 },
  "SJVN": { price: 125, volatility: 0.020 },
  "CESC": { price: 145, volatility: 0.018 },
  "TORNTPOWER": { price: 1650, volatility: 0.014 },
  "JSL": { price: 785, volatility: 0.022 },
  "NLCINDIA": { price: 265, volatility: 0.020 },
  "JSWENERGY": { price: 585, volatility: 0.022 },

  // Infra & Construction
  "LT": { price: 3400, volatility: 0.013 },
  "ADANIENT": { price: 2850, volatility: 0.030 },
  "ADANIPORTS": { price: 1280, volatility: 0.022 },
  "ULTRACEMCO": { price: 11200, volatility: 0.012 },
  "GRASIM": { price: 2450, volatility: 0.014 },
  "SHREECEM": { price: 26500, volatility: 0.012 },
  "AMBUJACEM": { price: 585, volatility: 0.016 },
  "ACC": { price: 2450, volatility: 0.016 },
  "DALMIACEM": { price: 1850, volatility: 0.018 },
  "JKCEMENT": { price: 4250, volatility: 0.016 },
  "RAMCOCEM": { price: 985, volatility: 0.018 },
  "BIRLACORPN": { price: 1450, volatility: 0.020 },
  "HEIDELBCEM": { price: 185, volatility: 0.018 },
  "DLF": { price: 850, volatility: 0.022 },
  "GODREJPROP": { price: 2650, volatility: 0.022 },
  "OBEROIRLTY": { price: 1650, volatility: 0.022 },
  "PRESTIGE": { price: 1450, volatility: 0.022 },
  "LODHA": { price: 1285, volatility: 0.025 },
  "BRIGADE": { price: 1185, volatility: 0.025 },
  "PHOENIXLTD": { price: 1850, volatility: 0.022 },
  "SOBHA": { price: 1650, volatility: 0.025 },
  "SUNTECK": { price: 485, volatility: 0.028 },
  "KOLTEPATIL": { price: 485, volatility: 0.028 },
  "ASHIANA": { price: 285, volatility: 0.028 },

  // Consumer Durables
  "TITAN": { price: 3200, volatility: 0.014 },
  "HAVELLS": { price: 1450, volatility: 0.016 },
  "VOLTAS": { price: 1250, volatility: 0.018 },
  "BLUESTARCO": { price: 1650, volatility: 0.018 },
  "CROMPTON": { price: 385, volatility: 0.020 },
  "WHIRLPOOL": { price: 1350, volatility: 0.016 },
  "BATAINDIA": { price: 1450, volatility: 0.016 },
  "RELAXO": { price: 785, volatility: 0.020 },
  "RAJESHEXPO": { price: 785, volatility: 0.018 },
  "VGUARD": { price: 385, volatility: 0.020 },
  "ORIENTELEC": { price: 285, volatility: 0.022 },
  "POLYCAB": { price: 6450, volatility: 0.018 },
  "DIXON": { price: 12500, volatility: 0.025 },
  "AMBER": { price: 4850, volatility: 0.022 },
  "KAJARIACER": { price: 1285, volatility: 0.018 },

  // NBFC/Finance
  "BAJFINANCE": { price: 6800, volatility: 0.020 },
  "BAJAJFINSV": { price: 1650, volatility: 0.018 },
  "SHRIRAMFIN": { price: 2450, volatility: 0.018 },
  "MUTHOOTFIN": { price: 1650, volatility: 0.016 },
  "MANAPPURAM": { price: 185, volatility: 0.022 },
  "CHOLAFIN": { price: 1250, volatility: 0.018 },
  "M&MFIN": { price: 285, volatility: 0.022 },
  "LICHSGFIN": { price: 585, volatility: 0.022 },
  "CANFINHOME": { price: 785, volatility: 0.020 },
  "AAVAS": { price: 1650, volatility: 0.022 },
  "HOMEFIRST": { price: 985, volatility: 0.025 },
  "APTUS": { price: 385, volatility: 0.025 },
  "POONAWALLA": { price: 385, volatility: 0.028 },
  "JMFINANCIL": { price: 85, volatility: 0.028 },
  "CREDITACC": { price: 1185, volatility: 0.025 },
  "PNBHOUSING": { price: 785, volatility: 0.025 },

  // Insurance
  "LICI": { price: 985, volatility: 0.015 },
  "SBILIFE": { price: 1550, volatility: 0.014 },
  "HDFCLIFE": { price: 685, volatility: 0.016 },
  "ICICIPRULI": { price: 585, volatility: 0.018 },
  "ICICIGI": { price: 1750, volatility: 0.014 },
  "BAJAJHFL": { price: 145, volatility: 0.020 },
  "STARHEALTH": { price: 585, volatility: 0.020 },
  "MAXHEALTH": { price: 785, volatility: 0.020 },
  "NIACL": { price: 185, volatility: 0.022 },
  "GICRE": { price: 385, volatility: 0.020 },

  // Telecom
  "BHARTIARTL": { price: 1620, volatility: 0.015 },
  "IDEA": { price: 14, volatility: 0.035 },
  "TTML": { price: 85, volatility: 0.030 },
  "INDUSTOWER": { price: 385, volatility: 0.020 },

  // Retail
  "DMART": { price: 3850, volatility: 0.014 },
  "TRENT": { price: 5450, volatility: 0.022 },
  "SHOPERSTOP": { price: 785, volatility: 0.025 },
  "ABFRL": { price: 285, volatility: 0.025 },
  "VMART": { price: 2450, volatility: 0.025 },
  "METRO": { price: 185, volatility: 0.025 },
  "KALYANKJIL": { price: 585, volatility: 0.025 },

  // Capital Goods
  "HONAUT": { price: 52500, volatility: 0.012 },
  "AIAENG": { price: 3850, volatility: 0.016 },
  "ELGIEQUIP": { price: 685, volatility: 0.020 },
  "KAYNES": { price: 4850, volatility: 0.028 },
  "TRIVENI": { price: 585, volatility: 0.025 },
  "KENNAMET": { price: 2450, volatility: 0.018 },
  "CARBORUNIV": { price: 1285, volatility: 0.018 },
  "WENDT": { price: 7850, volatility: 0.020 },
  "BEL": { price: 285, volatility: 0.020 },
  "HAL": { price: 4250, volatility: 0.018 },
  "MAZDA": { price: 4850, volatility: 0.025 },
  "COCHINSHIP": { price: 1850, volatility: 0.025 },
  "GRSE": { price: 1650, volatility: 0.025 },
  "PARAS": { price: 985, volatility: 0.030 },
  "DATAPATT": { price: 2450, volatility: 0.028 },
  "ZENTEC": { price: 1650, volatility: 0.030 },

  // Chemicals
  "PIDILITIND": { price: 2950, volatility: 0.012 },
  "SRF": { price: 2450, volatility: 0.018 },
  "ATUL": { price: 6850, volatility: 0.016 },
  "NAVINFLUOR": { price: 3450, volatility: 0.022 },
  "DEEPAKFERT": { price: 585, volatility: 0.022 },
  "DEEPAKNTR": { price: 2450, volatility: 0.020 },
  "FINEORG": { price: 4850, volatility: 0.020 },
  "CLEAN": { price: 1450, volatility: 0.022 },
  "TATACHEM": { price: 1085, volatility: 0.016 },
  "BASF": { price: 6850, volatility: 0.016 },
  "ANURAS": { price: 885, volatility: 0.025 },
  "GALAXYSURF": { price: 2850, volatility: 0.018 },
  "PIIND": { price: 3850, volatility: 0.018 },
  "AARTIIND": { price: 485, volatility: 0.022 },
  "SUMICHEM": { price: 485, volatility: 0.020 },
  "ALKYLAMINE": { price: 2250, volatility: 0.022 },
  "BALAJI": { price: 2450, volatility: 0.022 },
  "VINATI": { price: 1850, volatility: 0.020 },
  "IOLCP": { price: 385, volatility: 0.028 },
  "ASIANPAINT": { price: 2950, volatility: 0.012 },
  "BERGEPAINT": { price: 485, volatility: 0.016 },
  "KANSAINER": { price: 385, volatility: 0.018 },
  "AKZONOBEL": { price: 3850, volatility: 0.014 },

  // Fintech
  "PAYTM": { price: 385, volatility: 0.035 },
  "POLICYBZR": { price: 1450, volatility: 0.030 },
  "CARTRADE": { price: 885, volatility: 0.030 },
  "EASEMYTRIP": { price: 38, volatility: 0.035 },
  "INFIBEAM": { price: 28, volatility: 0.035 },
  "ANGELONE": { price: 2850, volatility: 0.025 },
  "CDSL": { price: 1450, volatility: 0.022 },
  "BSE": { price: 4850, volatility: 0.025 },
  "CAMS": { price: 3850, volatility: 0.020 },
  "KFINTECH": { price: 985, volatility: 0.022 },
  "MCX": { price: 5850, volatility: 0.022 },
  "IIFL": { price: 485, volatility: 0.025 },
  "MOTILALOFS": { price: 785, volatility: 0.022 },
  "HDFCAMC": { price: 4250, volatility: 0.016 },
  "NIPPONIND": { price: 585, volatility: 0.018 },
  "UTIAMC": { price: 1085, volatility: 0.018 },
  "ABSLAMC": { price: 485, volatility: 0.020 },

  // Textiles
  "PAGEIND": { price: 42000, volatility: 0.014 },
  "RAYMOND": { price: 1650, volatility: 0.022 },
  "ARVIND": { price: 385, volatility: 0.022 },
  "WELSPUNIND": { price: 145, volatility: 0.022 },
  "KPRMILL": { price: 885, volatility: 0.020 },
  "VARDHMAN": { price: 485, volatility: 0.020 },
  "SOMANYCERA": { price: 685, volatility: 0.025 },
  "CERA": { price: 8850, volatility: 0.018 },
  "TRIDENT": { price: 32, volatility: 0.028 },
  "GOKEX": { price: 985, volatility: 0.025 },

  // Media
  "SUNTV": { price: 685, volatility: 0.018 },
  "ZEEL": { price: 145, volatility: 0.028 },
  "PVR": { price: 1450, volatility: 0.025 },
  "NAZARA": { price: 985, volatility: 0.030 },
  "TIPS": { price: 685, volatility: 0.028 },
  "SAREGAMA": { price: 485, volatility: 0.025 },
  "NETWORK18": { price: 78, volatility: 0.028 },
  "TV18BRDCST": { price: 42, volatility: 0.028 },

  // Agriculture
  "UPL": { price: 545, volatility: 0.020 },
  "COROMANDEL": { price: 1650, volatility: 0.016 },
  "CHAMBAL": { price: 485, volatility: 0.018 },
  "GNFC": { price: 585, volatility: 0.022 },
  "GSFC": { price: 185, volatility: 0.022 },
  "RCF": { price: 145, volatility: 0.022 },
  "FACT": { price: 785, volatility: 0.025 },
  "ZUARI": { price: 185, volatility: 0.028 },
  "KAVERI": { price: 785, volatility: 0.022 },
  "DHANUKA": { price: 1450, volatility: 0.020 },
  "RALLIS": { price: 285, volatility: 0.020 },
  "BAYER": { price: 6850, volatility: 0.014 },

  // Hotels & E-commerce
  "INDIANHOTEL": { price: 685, volatility: 0.020 },
  "LEMON": { price: 145, volatility: 0.025 },
  "CHALET": { price: 785, volatility: 0.022 },
  "EIH": { price: 385, volatility: 0.020 },
  "INDIAMART": { price: 2850, volatility: 0.022 },
  "JUSTDIAL": { price: 1085, volatility: 0.025 },
  "AFFLE": { price: 1450, volatility: 0.028 },

  // Finance
  "IRFC": { price: 165, volatility: 0.020 },
  "RECLTD": { price: 485, volatility: 0.018 },
  "PFC": { price: 485, volatility: 0.018 },
  "HUDCO": { price: 245, volatility: 0.022 },
  "IREDA": { price: 185, volatility: 0.028 },
  "CGCL": { price: 185, volatility: 0.025 },
  "SUNDARM": { price: 4250, volatility: 0.014 },
  "RITES": { price: 685, volatility: 0.020 },
};

// Price simulator class with full stock coverage
class PriceSimulator {
  private lastPrices: Map<string, number> = new Map();
  
  constructor() {
    // Initialize with base prices
    for (const [symbol, config] of Object.entries(STOCK_CONFIG)) {
      this.lastPrices.set(symbol, config.price);
    }
  }
  
  getPrice(symbol: string): { price: number; change: number; changePercent: number } {
    const upperSymbol = symbol.toUpperCase();
    const config = STOCK_CONFIG[upperSymbol];
    
    // Use config if available, otherwise generate reasonable defaults
    const basePrice = config?.price || 1000;
    const volatility = config?.volatility || 0.015;
    const lastPrice = this.lastPrices.get(upperSymbol) || basePrice;
    
    // Generate realistic tick movement
    const tickChange = (Math.random() - 0.5) * 2 * volatility * lastPrice;
    const newPrice = Math.max(lastPrice + tickChange, basePrice * 0.8);
    
    this.lastPrices.set(upperSymbol, newPrice);
    
    const change = newPrice - basePrice;
    const changePercent = (change / basePrice) * 100;
    
    return {
      price: Math.round(newPrice * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
    };
  }
}

const priceSimulator = new PriceSimulator();

// Store active WebSocket connections and their subscriptions
const connections = new Map<WebSocket, Set<string>>();

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if this is a WebSocket upgrade request
  const upgradeHeader = req.headers.get("upgrade");
  
  if (upgradeHeader?.toLowerCase() === "websocket") {
    try {
      const { socket, response } = Deno.upgradeWebSocket(req);
      
      const subscriptions = new Set<string>();
      connections.set(socket, subscriptions);
      
      let priceInterval: number | null = null;
      
      socket.onopen = () => {
        console.log("[WS] Client connected");
        
        // Send connection confirmation
        socket.send(JSON.stringify({
          type: "connected",
          message: "WebSocket connected to price stream",
          timestamp: new Date().toISOString(),
        }));
      };
      
      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("[WS] Received message:", message);
          
          if (message.action === "subscribe" && Array.isArray(message.symbols)) {
            // Add symbols to subscription
            for (const symbol of message.symbols) {
              subscriptions.add(symbol.toUpperCase());
            }
            
            console.log(`[WS] Subscribed to: ${Array.from(subscriptions).join(", ")}`);
            
            // Send subscription confirmation
            socket.send(JSON.stringify({
              type: "subscribed",
              symbols: Array.from(subscriptions),
              timestamp: new Date().toISOString(),
            }));
            
            // Start streaming prices if not already
            if (!priceInterval && subscriptions.size > 0) {
              priceInterval = setInterval(() => {
                if (socket.readyState === WebSocket.OPEN) {
                  for (const symbol of subscriptions) {
                    const priceData = priceSimulator.getPrice(symbol);
                    socket.send(JSON.stringify({
                      type: "price",
                      symbol,
                      yahooSymbol: getYahooSymbol(symbol),
                      ...priceData,
                      timestamp: new Date().toISOString(),
                    }));
                  }
                }
              }, 1000);
            }
          } else if (message.action === "unsubscribe" && Array.isArray(message.symbols)) {
            // Remove symbols from subscription
            for (const symbol of message.symbols) {
              subscriptions.delete(symbol.toUpperCase());
            }
            
            console.log(`[WS] Unsubscribed, remaining: ${Array.from(subscriptions).join(", ")}`);
            
            // Stop interval if no more subscriptions
            if (subscriptions.size === 0 && priceInterval) {
              clearInterval(priceInterval);
              priceInterval = null;
            }
            
            socket.send(JSON.stringify({
              type: "unsubscribed",
              symbols: Array.from(subscriptions),
              timestamp: new Date().toISOString(),
            }));
          }
        } catch (error) {
          console.error("[WS] Error processing message:", error);
          socket.send(JSON.stringify({
            type: "error",
            message: "Failed to process message",
            timestamp: new Date().toISOString(),
          }));
        }
      };
      
      socket.onclose = () => {
        console.log("[WS] Client disconnected");
        if (priceInterval) {
          clearInterval(priceInterval);
        }
        connections.delete(socket);
      };
      
      socket.onerror = (error) => {
        console.error("[WS] WebSocket error:", error);
      };
      
      return response;
    } catch (error) {
      console.error("[WS] Failed to upgrade connection:", error);
      return new Response(JSON.stringify({ error: "Failed to establish WebSocket connection" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
  
  // Handle regular HTTP requests (for fallback/REST API)
  try {
    const url = new URL(req.url);
    const symbols = url.searchParams.get("symbols")?.split(",") || [];
    
    if (symbols.length === 0) {
      return new Response(JSON.stringify({
        error: "No symbols provided",
        usage: "?symbols=RELIANCE,TCS,INFY or connect via WebSocket",
        availableSymbols: Object.keys(STOCK_CONFIG).length,
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const prices: Record<string, any> = {};
    for (const symbol of symbols) {
      const cleanSymbol = symbol.trim().toUpperCase();
      prices[cleanSymbol] = {
        ...priceSimulator.getPrice(cleanSymbol),
        yahooSymbol: getYahooSymbol(cleanSymbol),
        timestamp: new Date().toISOString(),
      };
    }
    
    return new Response(JSON.stringify({
      type: "prices",
      data: prices,
      source: "simulated",
      timestamp: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[HTTP] Error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
