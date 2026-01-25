import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PriceData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface CurrentPriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  timestamp: string;
  marketStatus: 'open' | 'closed' | 'pre-market' | 'post-market';
  source: 'alpha_vantage' | 'cache';
}

// Complete mapping of internal symbols to Alpha Vantage format
const SYMBOL_MAP: Record<string, string> = {
  // Indices
  'NIFTY': 'NIFTY50.NS',
  'BANKNIFTY': 'NIFTYBANK.NS',
  'NIFTYIT': 'CNXIT.NS',
  'NIFTYMIDCAP': 'NSEMDCP50.NS',
  'NIFTYSMLCAP': 'CNXSC.NS',
  'NIFTYPHARMA': 'CNXPHARMA.NS',
  'NIFTYMETAL': 'CNXMETAL.NS',
  'NIFTYAUTO': 'CNXAUTO.NS',
  'NIFTYREALTY': 'CNXREALTY.NS',
  'NIFTYFMCG': 'CNXFMCG.NS',
  
  // Banking
  'HDFCBANK': 'HDFCBANK.BSE',
  'ICICIBANK': 'ICICIBANK.BSE',
  'SBIN': 'SBIN.BSE',
  'KOTAKBANK': 'KOTAKBANK.BSE',
  'AXISBANK': 'AXISBANK.BSE',
  'INDUSINDBK': 'INDUSINDBK.BSE',
  'BANDHANBNK': 'BANDHANBNK.BSE',
  'FEDERALBNK': 'FEDERALBNK.BSE',
  'IDFCFIRSTB': 'IDFCFIRSTB.BSE',
  'PNB': 'PNB.BSE',
  'BANKBARODA': 'BANKBARODA.BSE',
  'CANBK': 'CANBK.BSE',
  'AUBANK': 'AUBANK.BSE',
  'YESBANK': 'YESBANK.BSE',
  'UNIONBANK': 'UNIONBANK.BSE',
  'INDIANB': 'INDIANB.BSE',
  'CENTRALBK': 'CENTRALBK.BSE',
  'MAHABANK': 'MAHABANK.BSE',
  'IOB': 'IOB.BSE',
  'UCOBANK': 'UCOBANK.BSE',
  'PSB': 'PSB.BSE',
  'KARURVYSYA': 'KARURVYSYA.BSE',
  'DCBBANK': 'DCBBANK.BSE',
  'SOUTHBANK': 'SOUTHBANK.BSE',
  'TMBANK': 'TMBANK.BSE',
  'CSBBANK': 'CSBBANK.BSE',
  'RBLBANK': 'RBLBANK.BSE',
  'EQUITASBNK': 'EQUITASBNK.BSE',
  'UJJIVANSFB': 'UJJIVANSFB.BSE',
  'SURYODAY': 'SURYODAY.BSE',
  'ESAFSFB': 'ESAFSFB.BSE',

  // IT
  'TCS': 'TCS.BSE',
  'INFY': 'INFY.BSE',
  'WIPRO': 'WIPRO.BSE',
  'HCLTECH': 'HCLTECH.BSE',
  'TECHM': 'TECHM.BSE',
  'LTIM': 'LTIM.BSE',
  'MPHASIS': 'MPHASIS.BSE',
  'COFORGE': 'COFORGE.BSE',
  'PERSISTENT': 'PERSISTENT.BSE',
  'LTTS': 'LTTS.BSE',
  'OFSS': 'OFSS.BSE',
  'CYIENT': 'CYIENT.BSE',
  'ECLERX': 'ECLERX.BSE',
  'TATAELXSI': 'TATAELXSI.BSE',
  'BIRLASOFT': 'BIRLASOFT.BSE',
  'ZENSAR': 'ZENSAR.BSE',
  'SONATSOFTW': 'SONATSOFTW.BSE',
  'NEWGEN': 'NEWGEN.BSE',
  'HAPPSTMNDS': 'HAPPSTMNDS.BSE',
  'ROUTE': 'ROUTE.BSE',
  'INTELLECT': 'INTELLECT.BSE',
  'KPITTECH': 'KPITTECH.BSE',
  'MASTEK': 'MASTEK.BSE',
  'RATEGAIN': 'RATEGAIN.BSE',
  'TANLA': 'TANLA.BSE',
  'REDINGTON': 'REDINGTON.BSE',
  'MAPMYINDIA': 'MAPMYINDIA.BSE',
  'LATENTVIEW': 'LATENTVIEW.BSE',

  // Oil & Gas
  'RELIANCE': 'RELIANCE.BSE',
  'ONGC': 'ONGC.BSE',
  'BPCL': 'BPCL.BSE',
  'IOC': 'IOC.BSE',
  'HINDPETRO': 'HINDPETRO.BSE',
  'GAIL': 'GAIL.BSE',
  'PETRONET': 'PETRONET.BSE',
  'OIL': 'OIL.BSE',
  'MGL': 'MGL.BSE',
  'IGL': 'IGL.BSE',
  'GUJGAS': 'GUJGAS.BSE',
  'MRPL': 'MRPL.BSE',
  'CHENNPETRO': 'CHENNPETRO.BSE',
  'CASTROLIND': 'CASTROLIND.BSE',
  'AEGISCHEM': 'AEGISCHEM.BSE',
  'GSPL': 'GSPL.BSE',

  // FMCG
  'HINDUNILVR': 'HINDUNILVR.BSE',
  'ITC': 'ITC.BSE',
  'NESTLEIND': 'NESTLEIND.BSE',
  'BRITANNIA': 'BRITANNIA.BSE',
  'DABUR': 'DABUR.BSE',
  'MARICO': 'MARICO.BSE',
  'GODREJCP': 'GODREJCP.BSE',
  'COLPAL': 'COLPAL.BSE',
  'TATACONSUM': 'TATACONSUM.BSE',
  'VBL': 'VBL.BSE',
  'PGHH': 'PGHH.BSE',
  'GILLETTE': 'GILLETTE.BSE',
  'EMAMILTD': 'EMAMILTD.BSE',
  'JYOTHYLAB': 'JYOTHYLAB.BSE',
  'RADICO': 'RADICO.BSE',
  'UNITDSPR': 'UNITDSPR.BSE',
  'MCDOWELL-N': 'MCDOWELL-N.BSE',
  'ZYDUSWELL': 'ZYDUSWELL.BSE',
  'BIKAJI': 'BIKAJI.BSE',
  'CCL': 'CCL.BSE',
  'GODFRYPHLP': 'GODFRYPHLP.BSE',

  // Pharma
  'SUNPHARMA': 'SUNPHARMA.BSE',
  'DRREDDY': 'DRREDDY.BSE',
  'CIPLA': 'CIPLA.BSE',
  'DIVISLAB': 'DIVISLAB.BSE',
  'APOLLOHOSP': 'APOLLOHOSP.BSE',
  'LUPIN': 'LUPIN.BSE',
  'BIOCON': 'BIOCON.BSE',
  'TORNTPHARM': 'TORNTPHARM.BSE',
  'ALKEM': 'ALKEM.BSE',
  'AUROPHARMA': 'AUROPHARMA.BSE',
  'ZYDUSLIFE': 'ZYDUSLIFE.BSE',
  'GLENMARK': 'GLENMARK.BSE',
  'IPCALAB': 'IPCALAB.BSE',
  'ABBOTINDIA': 'ABBOTINDIA.BSE',
  'SANOFI': 'SANOFI.BSE',
  'GLAND': 'GLAND.BSE',
  'LALPATHLAB': 'LALPATHLAB.BSE',
  'METROPOLIS': 'METROPOLIS.BSE',
  'NATCOPHARM': 'NATCOPHARM.BSE',
  'GRANULES': 'GRANULES.BSE',
  'LAURUSLABS': 'LAURUSLABS.BSE',
  'SYNGENE': 'SYNGENE.BSE',
  'ASTRAZEN': 'ASTRAZEN.BSE',
  'PFIZER': 'PFIZER.BSE',
  'GLAXO': 'GLAXO.BSE',
  'MANKIND': 'MANKIND.BSE',
  'JBCHEPHARM': 'JBCHEPHARM.BSE',
  'ERIS': 'ERIS.BSE',

  // Auto
  'TATAMOTORS': 'TATAMOTORS.BSE',
  'MARUTI': 'MARUTI.BSE',
  'M&M': 'M&M.BSE',
  'BAJAJ-AUTO': 'BAJAJ-AUTO.BSE',
  'EICHERMOT': 'EICHERMOT.BSE',
  'HEROMOTOCO': 'HEROMOTOCO.BSE',
  'TVSMOTOR': 'TVSMOTOR.BSE',
  'ASHOKLEY': 'ASHOKLEY.BSE',
  'MOTHERSON': 'MOTHERSON.BSE',
  'BHARATFORG': 'BHARATFORG.BSE',
  'MRF': 'MRF.BSE',
  'APOLLOTYRE': 'APOLLOTYRE.BSE',
  'BALKRISIND': 'BALKRISIND.BSE',
  'BOSCHLTD': 'BOSCHLTD.BSE',
  'EXIDEIND': 'EXIDEIND.BSE',
  'AMARAJABAT': 'AMARAJABAT.BSE',
  'CEATLTD': 'CEATLTD.BSE',
  'SUNDRMFAST': 'SUNDRMFAST.BSE',
  'ENDURANCE': 'ENDURANCE.BSE',
  'SWARAJENG': 'SWARAJENG.BSE',
  'FORCEMOT': 'FORCEMOT.BSE',
  'OLECTRA': 'OLECTRA.BSE',

  // Metals
  'TATASTEEL': 'TATASTEEL.BSE',
  'JSWSTEEL': 'JSWSTEEL.BSE',
  'HINDALCO': 'HINDALCO.BSE',
  'VEDL': 'VEDL.BSE',
  'COALINDIA': 'COALINDIA.BSE',
  'NMDC': 'NMDC.BSE',
  'SAIL': 'SAIL.BSE',
  'JINDALSTEL': 'JINDALSTEL.BSE',
  'NATIONALUM': 'NATIONALUM.BSE',
  'HINDCOPPER': 'HINDCOPPER.BSE',
  'MOIL': 'MOIL.BSE',
  'WELCORP': 'WELCORP.BSE',
  'APLAPOLLO': 'APLAPOLLO.BSE',
  'RATNAMANI': 'RATNAMANI.BSE',
  'JSLHISAR': 'JSLHISAR.BSE',
  'GMRINFRA': 'GMRINFRA.BSE',

  // Power & Utilities
  'NTPC': 'NTPC.BSE',
  'POWERGRID': 'POWERGRID.BSE',
  'ADANIGREEN': 'ADANIGREEN.BSE',
  'TATAPOWER': 'TATAPOWER.BSE',
  'ADANIPOWER': 'ADANIPOWER.BSE',
  'NHPC': 'NHPC.BSE',
  'SJVN': 'SJVN.BSE',
  'CESC': 'CESC.BSE',
  'TORNTPOWER': 'TORNTPOWER.BSE',
  'JSL': 'JSL.BSE',
  'NLCINDIA': 'NLCINDIA.BSE',
  'JSWENERGY': 'JSWENERGY.BSE',

  // Infra & Construction
  'LT': 'LT.BSE',
  'ADANIENT': 'ADANIENT.BSE',
  'ADANIPORTS': 'ADANIPORTS.BSE',
  'ULTRACEMCO': 'ULTRACEMCO.BSE',
  'GRASIM': 'GRASIM.BSE',
  'SHREECEM': 'SHREECEM.BSE',
  'AMBUJACEM': 'AMBUJACEM.BSE',
  'ACC': 'ACC.BSE',
  'DALMIACEM': 'DALMIACEM.BSE',
  'JKCEMENT': 'JKCEMENT.BSE',
  'RAMCOCEM': 'RAMCOCEM.BSE',
  'BIRLACORPN': 'BIRLACORPN.BSE',
  'HEIDELBCEM': 'HEIDELBCEM.BSE',
  'DLF': 'DLF.BSE',
  'GODREJPROP': 'GODREJPROP.BSE',
  'OBEROIRLTY': 'OBEROIRLTY.BSE',
  'PRESTIGE': 'PRESTIGE.BSE',
  'LODHA': 'LODHA.BSE',
  'BRIGADE': 'BRIGADE.BSE',
  'PHOENIXLTD': 'PHOENIXLTD.BSE',
  'SOBHA': 'SOBHA.BSE',
  'SUNTECK': 'SUNTECK.BSE',
  'KOLTEPATIL': 'KOLTEPATIL.BSE',
  'ASHIANA': 'ASHIANA.BSE',

  // Consumer Durables
  'TITAN': 'TITAN.BSE',
  'HAVELLS': 'HAVELLS.BSE',
  'VOLTAS': 'VOLTAS.BSE',
  'BLUESTARCO': 'BLUESTARCO.BSE',
  'CROMPTON': 'CROMPTON.BSE',
  'WHIRLPOOL': 'WHIRLPOOL.BSE',
  'BATAINDIA': 'BATAINDIA.BSE',
  'RELAXO': 'RELAXO.BSE',
  'RAJESHEXPO': 'RAJESHEXPO.BSE',
  'VGUARD': 'VGUARD.BSE',
  'ORIENTELEC': 'ORIENTELEC.BSE',
  'POLYCAB': 'POLYCAB.BSE',
  'DIXON': 'DIXON.BSE',
  'AMBER': 'AMBER.BSE',
  'KAJARIACER': 'KAJARIACER.BSE',

  // NBFC/Finance
  'BAJFINANCE': 'BAJFINANCE.BSE',
  'BAJAJFINSV': 'BAJAJFINSV.BSE',
  'SHRIRAMFIN': 'SHRIRAMFIN.BSE',
  'MUTHOOTFIN': 'MUTHOOTFIN.BSE',
  'MANAPPURAM': 'MANAPPURAM.BSE',
  'CHOLAFIN': 'CHOLAFIN.BSE',
  'M&MFIN': 'M&MFIN.BSE',
  'LICHSGFIN': 'LICHSGFIN.BSE',
  'CANFINHOME': 'CANFINHOME.BSE',
  'AAVAS': 'AAVAS.BSE',
  'HOMEFIRST': 'HOMEFIRST.BSE',
  'APTUS': 'APTUS.BSE',
  'POONAWALLA': 'POONAWALLA.BSE',
  'JMFINANCIL': 'JMFINANCIL.BSE',
  'CREDITACC': 'CREDITACC.BSE',
  'PNBHOUSING': 'PNBHOUSING.BSE',

  // Insurance
  'LICI': 'LICI.BSE',
  'SBILIFE': 'SBILIFE.BSE',
  'HDFCLIFE': 'HDFCLIFE.BSE',
  'ICICIPRULI': 'ICICIPRULI.BSE',
  'ICICIGI': 'ICICIGI.BSE',
  'BAJAJHFL': 'BAJAJHFL.BSE',
  'STARHEALTH': 'STARHEALTH.BSE',
  'MAXHEALTH': 'MAXHEALTH.BSE',
  'NIACL': 'NIACL.BSE',
  'GICRE': 'GICRE.BSE',

  // Telecom
  'BHARTIARTL': 'BHARTIARTL.BSE',
  'IDEA': 'IDEA.BSE',
  'TTML': 'TTML.BSE',
  'INDUSTOWER': 'INDUSTOWER.BSE',

  // Retail
  'DMART': 'DMART.BSE',
  'TRENT': 'TRENT.BSE',
  'SHOPERSTOP': 'SHOPERSTOP.BSE',
  'ABFRL': 'ABFRL.BSE',
  'VMART': 'VMART.BSE',
  'METRO': 'METRO.BSE',
  'KALYANKJIL': 'KALYANKJIL.BSE',

  // Capital Goods
  'HONAUT': 'HONAUT.BSE',
  'AIAENG': 'AIAENG.BSE',
  'ELGIEQUIP': 'ELGIEQUIP.BSE',
  'KAYNES': 'KAYNES.BSE',
  'TRIVENI': 'TRIVENI.BSE',
  'KENNAMET': 'KENNAMET.BSE',
  'CARBORUNIV': 'CARBORUNIV.BSE',
  'WENDT': 'WENDT.BSE',
  'BEL': 'BEL.BSE',
  'HAL': 'HAL.BSE',
  'MAZDA': 'MAZDOCK.BSE',
  'COCHINSHIP': 'COCHINSHIP.BSE',
  'GRSE': 'GRSE.BSE',
  'PARAS': 'PARAS.BSE',
  'DATAPATT': 'DATAPATT.BSE',
  'ZENTEC': 'ZENTEC.BSE',

  // Chemicals
  'PIDILITIND': 'PIDILITIND.BSE',
  'SRF': 'SRF.BSE',
  'ATUL': 'ATUL.BSE',
  'NAVINFLUOR': 'NAVINFLUOR.BSE',
  'DEEPAKFERT': 'DEEPAKFERT.BSE',
  'DEEPAKNTR': 'DEEPAKNTR.BSE',
  'FINEORG': 'FINEORG.BSE',
  'CLEAN': 'CLEAN.BSE',
  'TATACHEM': 'TATACHEM.BSE',
  'BASF': 'BASF.BSE',
  'ANURAS': 'ANURAS.BSE',
  'GALAXYSURF': 'GALAXYSURF.BSE',
  'PIIND': 'PIIND.BSE',
  'AARTIIND': 'AARTIIND.BSE',
  'SUMICHEM': 'SUMICHEM.BSE',
  'ALKYLAMINE': 'ALKYLAMINE.BSE',
  'BALAJI': 'BALAMINES.BSE',
  'VINATI': 'VINATIORGA.BSE',
  'IOLCP': 'IOLCP.BSE',
  'ASIANPAINT': 'ASIANPAINT.BSE',
  'BERGEPAINT': 'BERGEPAINT.BSE',
  'KANSAINER': 'KANSAINER.BSE',
  'AKZONOBEL': 'AKZONOBEL.BSE',

  // Fintech
  'PAYTM': 'PAYTM.BSE',
  'POLICYBZR': 'POLICYBZR.BSE',
  'CARTRADE': 'CARTRADE.BSE',
  'EASEMYTRIP': 'EASEMYTRIP.BSE',
  'INFIBEAM': 'INFIBEAM.BSE',
  'ANGELONE': 'ANGELONE.BSE',
  'CDSL': 'CDSL.BSE',
  'BSE': 'BSE.BSE',
  'CAMS': 'CAMS.BSE',
  'KFINTECH': 'KFINTECH.BSE',
  'MCX': 'MCX.BSE',
  'IIFL': 'IIFL.BSE',
  'MOTILALOFS': 'MOTILALOFS.BSE',
  'HDFCAMC': 'HDFCAMC.BSE',
  'NIPPONIND': 'NAM-INDIA.BSE',
  'UTIAMC': 'UTIAMC.BSE',
  'ABSLAMC': 'ABSLAMC.BSE',

  // Textiles
  'PAGEIND': 'PAGEIND.BSE',
  'RAYMOND': 'RAYMOND.BSE',
  'ARVIND': 'ARVIND.BSE',
  'WELSPUNIND': 'WELSPUNIND.BSE',
  'KPRMILL': 'KPRMILL.BSE',
  'VARDHMAN': 'VTL.BSE',
  'SOMANYCERA': 'SOMANYCERA.BSE',
  'CERA': 'CERA.BSE',
  'TRIDENT': 'TRIDENT.BSE',
  'GOKEX': 'GOKEX.BSE',

  // Media
  'SUNTV': 'SUNTV.BSE',
  'ZEEL': 'ZEEL.BSE',
  'PVR': 'PVRINOX.BSE',
  'NAZARA': 'NAZARA.BSE',
  'TIPS': 'TIPSINDLTD.BSE',
  'SAREGAMA': 'SAREGAMA.BSE',
  'NETWORK18': 'NETWORK18.BSE',
  'TV18BRDCST': 'TV18BRDCST.BSE',

  // Agriculture
  'UPL': 'UPL.BSE',
  'COROMANDEL': 'COROMANDEL.BSE',
  'CHAMBAL': 'CHAMBLFERT.BSE',
  'GNFC': 'GNFC.BSE',
  'GSFC': 'GSFC.BSE',
  'RCF': 'RCF.BSE',
  'FACT': 'FACT.BSE',
  'ZUARI': 'ZUARIAGRO.BSE',
  'KAVERI': 'KSCL.BSE',
  'DHANUKA': 'DHANUKA.BSE',
  'RALLIS': 'RALLIS.BSE',
  'BAYER': 'BAYERCROP.BSE',

  // Hotels & E-commerce
  'INDIANHOTEL': 'INDHOTEL.BSE',
  'LEMON': 'LEMONTREE.BSE',
  'CHALET': 'CHALET.BSE',
  'EIH': 'EIHOTEL.BSE',
  'INDIAMART': 'INDIAMART.BSE',
  'JUSTDIAL': 'JUSTDIAL.BSE',
  'AFFLE': 'AFFLE.BSE',

  // Finance
  'IRFC': 'IRFC.BSE',
  'RECLTD': 'RECLTD.BSE',
  'PFC': 'PFC.BSE',
  'HUDCO': 'HUDCO.BSE',
  'IREDA': 'IREDA.BSE',
  'CGCL': 'CGCL.BSE',
  'SUNDARM': 'SUNDARMFIN.BSE',
  'RITES': 'RITES.BSE',
};

// In-memory cache for quick lookups
const priceCache: Map<string, { data: any; expiresAt: number }> = new Map();

function isMarketOpen(): { status: 'open' | 'closed' | 'pre-market' | 'post-market'; message: string } {
  const now = new Date();
  const istOffset = 5.5 * 60;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const ist = new Date(utc + istOffset * 60000);
  
  const day = ist.getDay();
  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const timeInMinutes = hours * 60 + minutes;
  
  const preMarketStart = 9 * 60;
  const marketOpen = 9 * 60 + 15;
  const marketClose = 15 * 60 + 30;
  const postMarketEnd = 16 * 60;
  
  if (day === 0 || day === 6) {
    return { status: 'closed', message: 'Market closed (Weekend)' };
  }
  
  if (timeInMinutes >= preMarketStart && timeInMinutes < marketOpen) {
    return { status: 'pre-market', message: 'Pre-market session' };
  }
  
  if (timeInMinutes >= marketOpen && timeInMinutes <= marketClose) {
    return { status: 'open', message: 'Market is open' };
  }
  
  if (timeInMinutes > marketClose && timeInMinutes <= postMarketEnd) {
    return { status: 'post-market', message: 'Post-market session' };
  }
  
  return { status: 'closed', message: 'Market closed' };
}

async function fetchFromAlphaVantage(
  symbol: string, 
  type: 'current' | 'historical',
  apiKey: string
): Promise<any> {
  const alphaSymbol = SYMBOL_MAP[symbol.toUpperCase()] || `${symbol}.BSE`;
  
  try {
    if (type === 'current') {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaSymbol}&apikey=${apiKey}`;
      console.log(`Fetching current price for ${alphaSymbol}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
        const quote = data['Global Quote'];
        return {
          symbol: symbol.toUpperCase(),
          price: parseFloat(quote['05. price']) || 0,
          change: parseFloat(quote['09. change']) || 0,
          changePercent: parseFloat(quote['10. change percent']?.replace('%', '')) || 0,
          open: parseFloat(quote['02. open']) || 0,
          high: parseFloat(quote['03. high']) || 0,
          low: parseFloat(quote['04. low']) || 0,
          previousClose: parseFloat(quote['08. previous close']) || 0,
          volume: parseInt(quote['06. volume']) || 0,
          source: 'alpha_vantage' as const,
        };
      }
      
      if (data['Note'] || data['Information']) {
        console.warn('Alpha Vantage rate limit:', data['Note'] || data['Information']);
        return null;
      }
      
      console.warn('No quote data returned for', alphaSymbol, data);
      return null;
    } else {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${alphaSymbol}&outputsize=full&apikey=${apiKey}`;
      console.log(`Fetching historical data for ${alphaSymbol}`);
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data['Time Series (Daily)']) {
        const timeSeries = data['Time Series (Daily)'];
        const historicalData: PriceData[] = Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
          symbol: symbol.toUpperCase(),
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume']),
        }));
        
        historicalData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        return {
          data: historicalData,
          source: 'alpha_vantage' as const,
        };
      }
      
      if (data['Note'] || data['Information']) {
        console.warn('Alpha Vantage rate limit:', data['Note'] || data['Information']);
        return null;
      }
      
      console.warn('No historical data returned for', alphaSymbol, data);
      return null;
    }
  } catch (error) {
    console.error('Alpha Vantage API error:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol') || 'NIFTY';
    const days = parseInt(url.searchParams.get('days') || '365');
    const type = url.searchParams.get('type') || 'historical';

    const apiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');
    const marketStatus = isMarketOpen();
    const cacheKey = `${symbol}-${type}`;
    
    // Check cache first
    const cached = priceCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`Cache hit for ${cacheKey}`);
      const cachedData = cached.data;
      if (type === 'current') {
        return new Response(
          JSON.stringify({
            ...cachedData,
            marketStatus: marketStatus.status,
            source: 'cache',
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify(cachedData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if API key is configured
    if (!apiKey) {
      console.error('ALPHA_VANTAGE_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          error: 'Live data unavailable',
          symbol: symbol.toUpperCase(),
          reason: 'API key not configured',
          marketStatus: marketStatus.status,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (type === 'current') {
      const alphaData = await fetchFromAlphaVantage(symbol, 'current', apiKey);
      
      if (alphaData) {
        const response: CurrentPriceData = {
          ...alphaData,
          timestamp: new Date().toISOString(),
          marketStatus: marketStatus.status,
        };
        
        // Cache: 1 min when open, 5 min when closed
        const ttl = marketStatus.status === 'open' ? 60000 : 300000;
        priceCache.set(cacheKey, { data: response, expiresAt: Date.now() + ttl });
        
        return new Response(
          JSON.stringify(response),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // No fallback - return error
      console.error(`Unable to fetch live price for ${symbol}`);
      return new Response(
        JSON.stringify({ 
          error: 'Live data unavailable',
          symbol: symbol.toUpperCase(),
          reason: 'API rate limit or data unavailable',
          marketStatus: marketStatus.status,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Historical data
    const alphaData = await fetchFromAlphaVantage(symbol, 'historical', apiKey);
    
    if (alphaData) {
      const filteredData = alphaData.data.slice(-days);
      
      const response = {
        symbol: symbol.toUpperCase(),
        count: filteredData.length,
        source: alphaData.source,
        marketStatus: marketStatus.status,
        data: filteredData,
      };
      
      // Cache historical data for 1 hour
      priceCache.set(cacheKey, { data: response, expiresAt: Date.now() + 3600000 });
      
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // No fallback - return error
    console.error(`Unable to fetch live historical data for ${symbol}`);
    return new Response(
      JSON.stringify({ 
        error: 'Live historical data unavailable',
        symbol: symbol.toUpperCase(),
        reason: 'API rate limit or data unavailable',
        marketStatus: marketStatus.status,
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Price fetch error:", error);
    const message = error instanceof Error ? error.message : "An error occurred fetching prices";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
