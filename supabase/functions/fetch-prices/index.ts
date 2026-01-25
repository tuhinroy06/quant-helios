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
  source: 'alpha_vantage' | 'yahoo' | 'cache';
}

// Symbol mapping for Alpha Vantage
const ALPHA_SYMBOL_MAP: Record<string, string> = {
  'NIFTY': 'NIFTY50.NS',
  'BANKNIFTY': 'NIFTYBANK.NS',
  'HDFCBANK': 'HDFCBANK.BSE',
  'ICICIBANK': 'ICICIBANK.BSE',
  'SBIN': 'SBIN.BSE',
  'KOTAKBANK': 'KOTAKBANK.BSE',
  'AXISBANK': 'AXISBANK.BSE',
  'TCS': 'TCS.BSE',
  'INFY': 'INFY.BSE',
  'WIPRO': 'WIPRO.BSE',
  'HCLTECH': 'HCLTECH.BSE',
  'RELIANCE': 'RELIANCE.BSE',
  'ITC': 'ITC.BSE',
  'LT': 'LT.BSE',
};

// Symbol mapping for Yahoo Finance (NSE suffix)
// Some stocks have different tickers or aren't available on Yahoo
const YAHOO_SYMBOL_MAP: Record<string, string> = {
  // Indices
  'NIFTY': '^NSEI',
  'BANKNIFTY': '^NSEBANK',
  'NIFTYIT': '^CNXIT',
  'NIFTYMIDCAP': '^NSEMDCP50',
  'NIFTYSMLCAP': '^CNXSC',
  'NIFTYPHARMA': '^CNXPHARMA',
  'NIFTYMETAL': '^CNXMETAL',
  'NIFTYAUTO': '^CNXAUTO',
  'NIFTYREALTY': '^CNXREALTY',
  'NIFTYFMCG': '^CNXFMCG',
  
  // Banking - Large Cap
  'HDFCBANK': 'HDFCBANK.NS',
  'ICICIBANK': 'ICICIBANK.NS',
  'SBIN': 'SBIN.NS',
  'KOTAKBANK': 'KOTAKBANK.NS',
  'AXISBANK': 'AXISBANK.NS',
  'INDUSINDBK': 'INDUSINDBK.NS',
  'BANDHANBNK': 'BANDHANBNK.NS',
  'FEDERALBNK': 'FEDERALBNK.NS',
  'IDFCFIRSTB': 'IDFCFIRSTB.NS',
  'PNB': 'PNB.NS',
  'BANKBARODA': 'BANKBARODA.NS',
  'CANBK': 'CANBK.NS',
  'AUBANK': 'AUBANK.NS',
  'YESBANK': 'YESBANK.NS',
  'UNIONBANK': 'UNIONBK.NS',
  'INDIANB': 'INDIANB.NS',
  'CENTRALBK': 'CENTRALBK.NS',
  'MAHABANK': 'MAHABANK.NS',
  'IOB': 'IOB.NS',
  'UCOBANK': 'UCOBANK.NS',
  'PSB': 'PSB.NS',
  'KARURVYSYA': 'KARURVYSYA.NS',
  'DCBBANK': 'DCBBANK.NS',
  'SOUTHBANK': 'SOUTHBANK.NS',
  'CSBBANK': 'CSBBANK.NS',
  'RBLBANK': 'RBLBANK.NS',
  'EQUITASBNK': 'EQUITASBNK.NS',
  'UJJIVANSFB': 'UJJIVANSFB.NS',
  'SURYODAY': 'SURYODAY.NS',
  'ESAFSFB': 'ESAFSFB.NS',
  
  // IT
  'TCS': 'TCS.NS',
  'INFY': 'INFY.NS',
  'WIPRO': 'WIPRO.NS',
  'HCLTECH': 'HCLTECH.NS',
  'TECHM': 'TECHM.NS',
  'LTIM': 'LTIM.NS',
  'MPHASIS': 'MPHASIS.NS',
  'COFORGE': 'COFORGE.NS',
  'PERSISTENT': 'PERSISTENT.NS',
  'LTTS': 'LTTS.NS',
  'OFSS': 'OFSS.NS',
  'CYIENT': 'CYIENT.NS',
  'ECLERX': 'ECLERX.NS',
  'TATAELXSI': 'TATAELXSI.NS',
  'SONATSOFTW': 'SONATSOFTW.NS',
  'NEWGEN': 'NEWGEN.NS',
  'HAPPSTMNDS': 'HAPPSTMNDS.NS',
  'ROUTE': 'ROUTE.NS',
  'INTELLECT': 'INTELLECT.NS',
  'KPITTECH': 'KPITTECH.NS',
  'MASTEK': 'MASTEK.NS',
  'RATEGAIN': 'RATEGAIN.NS',
  'TANLA': 'TANLA.NS',
  
  // Oil & Gas
  'RELIANCE': 'RELIANCE.NS',
  'ONGC': 'ONGC.NS',
  'BPCL': 'BPCL.NS',
  'IOC': 'IOC.NS',
  'HINDPETRO': 'HINDPETRO.NS',
  'GAIL': 'GAIL.NS',
  'PETRONET': 'PETRONET.NS',
  'OIL': 'OIL.NS',
  'MGL': 'MGL.NS',
  'IGL': 'IGL.NS',
  'GUJGAS': 'GUJGAS.NS',
  'MRPL': 'MRPL.NS',
  'CHENNPETRO': 'CHENNPETRO.NS',
  'CASTROLIND': 'CASTROLIND.NS',
  'GSPL': 'GSPL.NS',
  
  // FMCG
  'HINDUNILVR': 'HINDUNILVR.NS',
  'ITC': 'ITC.NS',
  'NESTLEIND': 'NESTLEIND.NS',
  'BRITANNIA': 'BRITANNIA.NS',
  'DABUR': 'DABUR.NS',
  'MARICO': 'MARICO.NS',
  'GODREJCP': 'GODREJCP.NS',
  'COLPAL': 'COLPAL.NS',
  'TATACONSUM': 'TATACONSUM.NS',
  'VBL': 'VBL.NS',
  'PGHH': 'PGHH.NS',
  'GILLETTE': 'GILLETTE.NS',
  'EMAMILTD': 'EMAMILTD.NS',
  'JYOTHYLAB': 'JYOTHYLAB.NS',
  'RADICO': 'RADICO.NS',
  'UNITDSPR': 'UNITDSPR.NS',
  'ZYDUSWELL': 'ZYDUSWELL.NS',
  'BIKAJI': 'BIKAJI.NS',
  'CCL': 'CCL.NS',
  'GODFRYPHLP': 'GODFRYPHLP.NS',
  
  // Pharma
  'SUNPHARMA': 'SUNPHARMA.NS',
  'DRREDDY': 'DRREDDY.NS',
  'CIPLA': 'CIPLA.NS',
  'DIVISLAB': 'DIVISLAB.NS',
  'APOLLOHOSP': 'APOLLOHOSP.NS',
  'LUPIN': 'LUPIN.NS',
  'BIOCON': 'BIOCON.NS',
  'TORNTPHARM': 'TORNTPHARM.NS',
  'ALKEM': 'ALKEM.NS',
  'AUROPHARMA': 'AUROPHARMA.NS',
  'ZYDUSLIFE': 'ZYDUSLIFE.NS',
  'GLENMARK': 'GLENMARK.NS',
  'IPCALAB': 'IPCALAB.NS',
  'ABBOTINDIA': 'ABBOTINDIA.NS',
  'SANOFI': 'SANOFI.NS',
  'GLAND': 'GLAND.NS',
  'LALPATHLAB': 'LALPATHLAB.NS',
  'METROPOLIS': 'METROPOLIS.NS',
  'NATCOPHARM': 'NATCOPHARM.NS',
  'GRANULES': 'GRANULES.NS',
  'LAURUSLABS': 'LAURUSLABS.NS',
  'SYNGENE': 'SYNGENE.NS',
  'ASTRAZEN': 'ASTRAZEN.NS',
  'PFIZER': 'PFIZER.NS',
  'GLAXO': 'GLAXO.NS',
  'MANKIND': 'MANKIND.NS',
  'JBCHEPHARM': 'JBCHEPHARM.NS',
  'ERIS': 'ERIS.NS',
  
  // Auto
  'TATAMOTORS': 'TATAMOTORS.NS',
  'MARUTI': 'MARUTI.NS',
  'M&M': 'M%26M.NS',
  'BAJAJ-AUTO': 'BAJAJ-AUTO.NS',
  'EICHERMOT': 'EICHERMOT.NS',
  'HEROMOTOCO': 'HEROMOTOCO.NS',
  'TVSMOTOR': 'TVSMOTOR.NS',
  'ASHOKLEY': 'ASHOKLEY.NS',
  'MOTHERSON': 'MOTHERSON.NS',
  'BHARATFORG': 'BHARATFORG.NS',
  'MRF': 'MRF.NS',
  'APOLLOTYRE': 'APOLLOTYRE.NS',
  'BALKRISIND': 'BALKRISIND.NS',
  'BOSCHLTD': 'BOSCHLTD.NS',
  'EXIDEIND': 'EXIDEIND.NS',
  'AMARAJABAT': 'AMARAJABAT.NS',
  'CEATLTD': 'CEATLTD.NS',
  'SUNDRMFAST': 'SUNDRMFAST.NS',
  'ENDURANCE': 'ENDURANCE.NS',
  'SWARAJENG': 'SWARAJENG.NS',
  'FORCEMOT': 'FORCEMOT.NS',
  'OLECTRA': 'OLECTRA.NS',
  
  // Metals
  'TATASTEEL': 'TATASTEEL.NS',
  'JSWSTEEL': 'JSWSTEEL.NS',
  'HINDALCO': 'HINDALCO.NS',
  'VEDL': 'VEDL.NS',
  'COALINDIA': 'COALINDIA.NS',
  'NMDC': 'NMDC.NS',
  'SAIL': 'SAIL.NS',
  'JINDALSTEL': 'JINDALSTEL.NS',
  'NATIONALUM': 'NATIONALUM.NS',
  'HINDCOPPER': 'HINDCOPPER.NS',
  'MOIL': 'MOIL.NS',
  'WELCORP': 'WELCORP.NS',
  'APLAPOLLO': 'APLAPOLLO.NS',
  'RATNAMANI': 'RATNAMANI.NS',
  'JSLHISAR': 'JSL.NS',
  'GMRINFRA': 'GMRINFRA.NS',
  
  // Power & Utilities
  'NTPC': 'NTPC.NS',
  'POWERGRID': 'POWERGRID.NS',
  'ADANIGREEN': 'ADANIGREEN.NS',
  'TATAPOWER': 'TATAPOWER.NS',
  'ADANIPOWER': 'ADANIPOWER.NS',
  'NHPC': 'NHPC.NS',
  'SJVN': 'SJVN.NS',
  'TORNTPOWER': 'TORNTPOWER.NS',
  'CESC': 'CESC.NS',
  'JSL': 'JSL.NS',
  'NLCINDIA': 'NLCINDIA.NS',
  'RPOWER': 'RPOWER.NS',
  'RECLTD': 'RECLTD.NS',
  'PFC': 'PFC.NS',
  'IRFC': 'IRFC.NS',
  
  // Infrastructure & Construction
  'LT': 'LT.NS',
  'ADANIENT': 'ADANIENT.NS',
  'ADANIPORTS': 'ADANIPORTS.NS',
  'DLF': 'DLF.NS',
  'GODREJPROP': 'GODREJPROP.NS',
  'OBEROIRLTY': 'OBEROIRLTY.NS',
  'PHOENIXLTD': 'PHOENIXLTD.NS',
  'PRESTIGE': 'PRESTIGE.NS',
  'BRIGADE': 'BRIGADE.NS',
  'SOBHA': 'SOBHA.NS',
  'SUNTECK': 'SUNTECK.NS',
  'LODHA': 'LODHA.NS',
  'IRB': 'IRB.NS',
  'KEC': 'KEC.NS',
  'NBCC': 'NBCC.NS',
  'BEL': 'BEL.NS',
  'HAL': 'HAL.NS',
  'BHEL': 'BHEL.NS',
  
  // Financial Services
  'BAJFINANCE': 'BAJFINANCE.NS',
  'BAJAJFINSV': 'BAJAJFINSV.NS',
  'LICHSGFIN': 'LICHSGFIN.NS',
  'MUTHOOTFIN': 'MUTHOOTFIN.NS',
  'CHOLAFIN': 'CHOLAFIN.NS',
  'M&MFIN': 'M%26MFIN.NS',
  'SHRIRAMFIN': 'SHRIRAMFIN.NS',
  'POONAWALLA': 'POONAWALLA.NS',
  'MANAPPURAM': 'MANAPPURAM.NS',
  'IIFL': 'IIFL.NS',
  'CANFINHOME': 'CANFINHOME.NS',
  'SUNDARMFIN': 'SUNDARMFIN.NS',
  'HDFCAMC': 'HDFCAMC.NS',
  'ICICIGI': 'ICICIGI.NS',
  'ICICIPRULI': 'ICICIPRULI.NS',
  'SBILIFE': 'SBILIFE.NS',
  'HDFCLIFE': 'HDFCLIFE.NS',
  'LICI': 'LICI.NS',
  'SBICARD': 'SBICARD.NS',
  
  // Telecom & Media
  'BHARTIARTL': 'BHARTIARTL.NS',
  'JIO': 'RELIANCE.NS',
  'IDEA': 'IDEA.NS',
  'TTML': 'TTML.NS',
  'ZEEL': 'ZEEL.NS',
  'SUNTV': 'SUNTV.NS',
  'PVR': 'PVRINOX.NS',
  'NAZARA': 'NAZARA.NS',
  
  // Retail
  'DMART': 'DMART.NS',
  'TRENT': 'TRENT.NS',
  'TITAN': 'TITAN.NS',
  'PAGEIND': 'PAGEIND.NS',
  'VIP': 'VIPIND.NS',
  'RELAXO': 'RELAXO.NS',
  'BATAINDIA': 'BATAINDIA.NS',
  'ABFRL': 'ABFRL.NS',
  'SHOPERSTOP': 'SHOPERSTOP.NS',
  'CAMPUS': 'CAMPUS.NS',
  'METROBRAND': 'METROBRAND.NS',
  'MEDPLUS': 'MEDPLUS.NS',
  
  // Cement & Building Materials
  'ULTRACEMCO': 'ULTRACEMCO.NS',
  'GRASIM': 'GRASIM.NS',
  'AMBUJACEM': 'AMBUJACEM.NS',
  'SHREECEM': 'SHREECEM.NS',
  'ACC': 'ACC.NS',
  'DALMIACEM': 'DALMIACEM.NS',
  'RAMCOCEM': 'RAMCOCEM.NS',
  'JKCEMENT': 'JKCEMENT.NS',
  'INDIACEM': 'INDIACEM.NS',
  'BIRLACORPN': 'BIRLACORPN.NS',
  'HEIDELBERG': 'HEIDELBERG.NS',
  'JKLAKSHMI': 'JKLAKSHMI.NS',
  'STARCEMENT': 'STARCEMENT.NS',
  'ASIANPAINT': 'ASIANPAINT.NS',
  'BERGEPAINT': 'BERGEPAINT.NS',
  'PIDILITIND': 'PIDILITIND.NS',
  'KANSAINER': 'KANSAINER.NS',
  'AKZONOBEL': 'AKZONOBEL.NS',
  
  // Chemicals
  'PIIND': 'PIIND.NS',
  'NAVINFLUOR': 'NAVINFLUOR.NS',
  'AARTIIND': 'AARTIIND.NS',
  'DEEPAKFERT': 'DEEPAKFERT.NS',
  'DEEPAKNTR': 'DEEPAKNTR.NS',
  'FINPIPE': 'FINPIPE.NS',
  'SUDARSCHEM': 'SUDARSCHEM.NS',
  'GNFC': 'GNFC.NS',
  'GSFC': 'GSFC.NS',
  'NOCIL': 'NOCIL.NS',
  'TATACHEM': 'TATACHEM.NS',
  'SRF': 'SRF.NS',
  'FLUOROCHEM': 'FLUOROCHEM.NS',
  'UPL': 'UPL.NS',
  'COROMANDEL': 'COROMANDEL.NS',
  'CHAMBLFERT': 'CHAMBLFERT.NS',
  'BASF': 'BASF.NS',
  
  // Capital Goods
  'SIEMENS': 'SIEMENS.NS',
  'ABB': 'ABB.NS',
  'HAVELLS': 'HAVELLS.NS',
  'CROMPTON': 'CROMPTON.NS',
  'VOLTAS': 'VOLTAS.NS',
  'BLUESTARCO': 'BLUESTARCO.NS',
  'THERMAX': 'THERMAX.NS',
  'CUMMINSIND': 'CUMMINSIND.NS',
  'ESCORTS': 'ESCORTS.NS',
  'ELGIEQUIP': 'ELGIEQUIP.NS',
  'GRINDWELL': 'GRINDWELL.NS',
  'AIAENG': 'AIAENG.NS',
  'TIMKEN': 'TIMKEN.NS',
  'SCHAEFFLER': 'SCHAEFFLER.NS',
  'SKFIND': 'SKFINDIA.NS',
  
  // Logistics & Transport
  'CONCOR': 'CONCOR.NS',
  'BLUEDART': 'BLUEDART.NS',
  'TCI': 'TCI.NS',
  'GATI': 'GATI.NS',
  'DELHIVERY': 'DELHIVERY.NS',
  'MAHLOG': 'MAHLOG.NS',
  
  // Hotels & Tourism
  'INDHOTEL': 'INDHOTEL.NS',
  'LEMON': 'LEMONTREE.NS',
  'CHALET': 'CHALET.NS',
  'EIHOTEL': 'EIHOTEL.NS',
  
  // Others
  'IRCTC': 'IRCTC.NS',
  'ZOMATO': 'ZOMATO.NS',
  'PAYTM': 'PAYTM.NS',
  'NYKAA': 'NYKAA.NS',
  'POLICYBZR': 'POLICYBZR.NS',
  'CARTRADE': 'CARTRADE.NS',
  'MAPMYINDIA': 'MAPMYINDIA.NS',
};

// In-memory cache
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

// Fetch from Yahoo Finance (no API key needed)
async function fetchFromYahoo(
  symbol: string,
  type: 'current' | 'historical'
): Promise<any> {
  const yahooSymbol = YAHOO_SYMBOL_MAP[symbol.toUpperCase()] || `${symbol}.NS`;
  
  try {
    if (type === 'current') {
      // Yahoo Finance quote endpoint
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=2d`;
      console.log(`[Yahoo] Fetching current price for ${yahooSymbol}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      if (!response.ok) {
        console.warn(`[Yahoo] HTTP error for ${yahooSymbol}: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.chart?.result?.[0]) {
        const result = data.chart.result[0];
        const meta = result.meta;
        const quote = result.indicators?.quote?.[0];
        
        if (meta && meta.regularMarketPrice) {
          const previousClose = meta.chartPreviousClose || meta.previousClose || 0;
          const currentPrice = meta.regularMarketPrice;
          const change = currentPrice - previousClose;
          const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
          
          return {
            symbol: symbol.toUpperCase(),
            price: currentPrice,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            open: meta.regularMarketOpen || quote?.open?.[quote.open.length - 1] || currentPrice,
            high: meta.regularMarketDayHigh || quote?.high?.[quote.high.length - 1] || currentPrice,
            low: meta.regularMarketDayLow || quote?.low?.[quote.low.length - 1] || currentPrice,
            previousClose: previousClose,
            volume: meta.regularMarketVolume || 0,
            source: 'yahoo' as const,
          };
        }
      }
      
      console.warn(`[Yahoo] No data returned for ${yahooSymbol}`);
      return null;
    } else {
      // Historical data
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1y`;
      console.log(`[Yahoo] Fetching historical data for ${yahooSymbol}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
      
      if (!response.ok) {
        console.warn(`[Yahoo] HTTP error for historical ${yahooSymbol}: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      
      if (data.chart?.result?.[0]) {
        const result = data.chart.result[0];
        const timestamps = result.timestamp || [];
        const quote = result.indicators?.quote?.[0] || {};
        
        const historicalData: PriceData[] = timestamps.map((ts: number, i: number) => ({
          symbol: symbol.toUpperCase(),
          date: new Date(ts * 1000).toISOString().split('T')[0],
          open: quote.open?.[i] || 0,
          high: quote.high?.[i] || 0,
          low: quote.low?.[i] || 0,
          close: quote.close?.[i] || 0,
          volume: quote.volume?.[i] || 0,
        })).filter((d: PriceData) => d.close > 0);
        
        return {
          data: historicalData,
          source: 'yahoo' as const,
        };
      }
      
      console.warn(`[Yahoo] No historical data for ${yahooSymbol}`);
      return null;
    }
  } catch (error) {
    console.error(`[Yahoo] API error for ${symbol}:`, error);
    return null;
  }
}

// Fetch from Alpha Vantage
async function fetchFromAlphaVantage(
  symbol: string,
  type: 'current' | 'historical',
  apiKey: string
): Promise<any> {
  const alphaSymbol = ALPHA_SYMBOL_MAP[symbol.toUpperCase()] || `${symbol}.BSE`;
  
  try {
    if (type === 'current') {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${alphaSymbol}&apikey=${apiKey}`;
      console.log(`[Alpha] Fetching current price for ${alphaSymbol}`);
      
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
        console.warn('[Alpha] Rate limit hit');
        return null;
      }
      
      return null;
    } else {
      const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${alphaSymbol}&outputsize=full&apikey=${apiKey}`;
      console.log(`[Alpha] Fetching historical data for ${alphaSymbol}`);
      
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
        console.warn('[Alpha] Rate limit hit for historical');
        return null;
      }
      
      return null;
    }
  } catch (error) {
    console.error('[Alpha] API error:', error);
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
    const cacheKey = `${symbol.toUpperCase()}-${type}`;
    
    // Check cache first
    const cached = priceCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`[Cache] Hit for ${cacheKey}`);
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

    if (type === 'current') {
      // Try Yahoo Finance first (no rate limits)
      let result = await fetchFromYahoo(symbol, 'current');
      
      // If Yahoo fails, try Alpha Vantage
      if (!result && apiKey) {
        result = await fetchFromAlphaVantage(symbol, 'current', apiKey);
      }
      
      if (result) {
        const response: CurrentPriceData = {
          ...result,
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
      
      // All sources failed
      console.error(`[Error] No live data for ${symbol}`);
      return new Response(
        JSON.stringify({ 
          error: 'Live data unavailable',
          symbol: symbol.toUpperCase(),
          reason: 'All data sources unavailable',
          marketStatus: marketStatus.status,
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Historical data
    // Try Yahoo first
    let result = await fetchFromYahoo(symbol, 'historical');
    
    // If Yahoo fails, try Alpha Vantage
    if (!result && apiKey) {
      result = await fetchFromAlphaVantage(symbol, 'historical', apiKey);
    }
    
    if (result) {
      const filteredData = result.data.slice(-days);
      
      const response = {
        symbol: symbol.toUpperCase(),
        count: filteredData.length,
        source: result.source,
        marketStatus: marketStatus.status,
        data: filteredData,
      };
      
      // Cache historical for 1 hour
      priceCache.set(cacheKey, { data: response, expiresAt: Date.now() + 3600000 });
      
      return new Response(
        JSON.stringify(response),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // All sources failed
    console.error(`[Error] No historical data for ${symbol}`);
    return new Response(
      JSON.stringify({ 
        error: 'Live historical data unavailable',
        symbol: symbol.toUpperCase(),
        reason: 'All data sources unavailable',
        marketStatus: marketStatus.status,
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Price fetch error:", error);
    const message = error instanceof Error ? error.message : "An error occurred";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
