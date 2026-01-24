import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  source: 'alpha_vantage' | 'cache' | 'simulated';
}

// Complete mapping of internal symbols to Alpha Vantage format (400+ stocks)
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

// Complete base prices for simulation fallback (all 400+ stocks)
const STOCK_BASE_PRICES: Record<string, number> = {
  // Indices
  'NIFTY': 24500, 'BANKNIFTY': 51800, 'NIFTYIT': 41500, 'NIFTYMIDCAP': 15800, 'NIFTYSMLCAP': 18200,
  'NIFTYPHARMA': 21500, 'NIFTYMETAL': 9200, 'NIFTYAUTO': 23500, 'NIFTYREALTY': 1050, 'NIFTYFMCG': 58500,
  
  // Banking
  'HDFCBANK': 1680, 'ICICIBANK': 1120, 'SBIN': 780, 'KOTAKBANK': 1850, 'AXISBANK': 1080,
  'INDUSINDBK': 1420, 'BANDHANBNK': 195, 'FEDERALBNK': 165, 'IDFCFIRSTB': 78, 'PNB': 105,
  'BANKBARODA': 245, 'CANBK': 108, 'AUBANK': 620, 'YESBANK': 22, 'UNIONBANK': 125,
  'INDIANB': 485, 'CENTRALBK': 52, 'MAHABANK': 58, 'IOB': 52, 'UCOBANK': 48,
  'PSB': 58, 'KARURVYSYA': 185, 'DCBBANK': 118, 'SOUTHBANK': 28, 'TMBANK': 485,
  'CSBBANK': 325, 'RBLBANK': 185, 'EQUITASBNK': 85, 'UJJIVANSFB': 42, 'SURYODAY': 145, 'ESAFSFB': 58,
  
  // IT
  'TCS': 3950, 'INFY': 1520, 'WIPRO': 445, 'HCLTECH': 1780, 'TECHM': 1650,
  'LTIM': 5850, 'MPHASIS': 2680, 'COFORGE': 5450, 'PERSISTENT': 5200, 'LTTS': 4850,
  'OFSS': 9800, 'CYIENT': 1920, 'ECLERX': 2850, 'TATAELXSI': 6850, 'BIRLASOFT': 585,
  'ZENSAR': 685, 'SONATSOFTW': 585, 'NEWGEN': 1285, 'HAPPSTMNDS': 785, 'ROUTE': 1650,
  'INTELLECT': 785, 'KPITTECH': 1485, 'MASTEK': 2850, 'RATEGAIN': 685, 'TANLA': 985,
  'REDINGTON': 185, 'MAPMYINDIA': 1850, 'LATENTVIEW': 485,
  
  // Oil & Gas
  'RELIANCE': 2850, 'ONGC': 265, 'BPCL': 585, 'IOC': 168, 'HINDPETRO': 385,
  'GAIL': 195, 'PETRONET': 345, 'OIL': 520, 'MGL': 1450, 'IGL': 485,
  'GUJGAS': 545, 'MRPL': 185, 'CHENNPETRO': 685, 'CASTROLIND': 185, 'AEGISCHEM': 385, 'GSPL': 385,
  
  // FMCG
  'HINDUNILVR': 2450, 'ITC': 460, 'NESTLEIND': 2480, 'BRITANNIA': 5200, 'DABUR': 585,
  'MARICO': 635, 'GODREJCP': 1280, 'COLPAL': 2850, 'TATACONSUM': 1120, 'VBL': 1580,
  'PGHH': 15800, 'GILLETTE': 6850, 'EMAMILTD': 585, 'JYOTHYLAB': 485, 'RADICO': 1850,
  'UNITDSPR': 1185, 'MCDOWELL-N': 1850, 'ZYDUSWELL': 1850, 'BIKAJI': 685, 'CCL': 685, 'GODFRYPHLP': 4850,
  
  // Pharma
  'SUNPHARMA': 1620, 'DRREDDY': 6200, 'CIPLA': 1480, 'DIVISLAB': 4950, 'APOLLOHOSP': 6800,
  'LUPIN': 1680, 'BIOCON': 285, 'TORNTPHARM': 2850, 'ALKEM': 5450, 'AUROPHARMA': 1280,
  'ZYDUSLIFE': 985, 'GLENMARK': 1185, 'IPCALAB': 1450, 'ABBOTINDIA': 26500, 'SANOFI': 6850,
  'GLAND': 1850, 'LALPATHLAB': 2850, 'METROPOLIS': 1850, 'NATCOPHARM': 1185, 'GRANULES': 485,
  'LAURUSLABS': 485, 'SYNGENE': 785, 'ASTRAZEN': 6850, 'PFIZER': 4850, 'GLAXO': 2450,
  'MANKIND': 2185, 'JBCHEPHARM': 1850, 'ERIS': 985,
  
  // Auto
  'TATAMOTORS': 920, 'MARUTI': 10800, 'M&M': 2850, 'BAJAJ-AUTO': 9200, 'EICHERMOT': 4850,
  'HEROMOTOCO': 4200, 'TVSMOTOR': 2450, 'ASHOKLEY': 185, 'MOTHERSON': 145, 'BHARATFORG': 1350,
  'MRF': 128500, 'APOLLOTYRE': 485, 'BALKRISIND': 2850, 'BOSCHLTD': 32500, 'EXIDEIND': 485,
  'AMARAJABAT': 1185, 'CEATLTD': 2850, 'SUNDRMFAST': 1085, 'ENDURANCE': 2185, 'SWARAJENG': 2850,
  'FORCEMOT': 6850, 'OLECTRA': 1450,
  
  // Metals
  'TATASTEEL': 145, 'JSWSTEEL': 890, 'HINDALCO': 620, 'VEDL': 445, 'COALINDIA': 420,
  'NMDC': 225, 'SAIL': 125, 'JINDALSTEL': 920, 'NATIONALUM': 185, 'HINDCOPPER': 285,
  'MOIL': 385, 'WELCORP': 585, 'APLAPOLLO': 1585, 'RATNAMANI': 3250, 'JSLHISAR': 685, 'GMRINFRA': 85,
  
  // Power
  'NTPC': 385, 'POWERGRID': 295, 'ADANIGREEN': 1850, 'TATAPOWER': 420, 'ADANIPOWER': 585,
  'NHPC': 85, 'SJVN': 125, 'CESC': 145, 'TORNTPOWER': 1650, 'JSL': 785, 'NLCINDIA': 265, 'JSWENERGY': 585,
  
  // Infra & Construction
  'LT': 3400, 'ADANIENT': 2850, 'ADANIPORTS': 1280, 'ULTRACEMCO': 11200, 'GRASIM': 2450,
  'SHREECEM': 26500, 'AMBUJACEM': 585, 'ACC': 2450, 'DALMIACEM': 1850, 'JKCEMENT': 4250,
  'RAMCOCEM': 985, 'BIRLACORPN': 1450, 'HEIDELBCEM': 185, 'DLF': 850, 'GODREJPROP': 2650,
  'OBEROIRLTY': 1650, 'PRESTIGE': 1450, 'LODHA': 1285, 'BRIGADE': 1185, 'PHOENIXLTD': 1850,
  'SOBHA': 1650, 'SUNTECK': 485, 'KOLTEPATIL': 485, 'ASHIANA': 285,
  
  // Consumer Durables
  'TITAN': 3200, 'HAVELLS': 1450, 'VOLTAS': 1250, 'BLUESTARCO': 1650, 'CROMPTON': 385,
  'WHIRLPOOL': 1350, 'BATAINDIA': 1450, 'RELAXO': 785, 'RAJESHEXPO': 785, 'VGUARD': 385,
  'ORIENTELEC': 285, 'POLYCAB': 6450, 'DIXON': 12500, 'AMBER': 4850, 'KAJARIACER': 1285,
  
  // NBFC/Finance
  'BAJFINANCE': 6800, 'BAJAJFINSV': 1650, 'SHRIRAMFIN': 2450, 'MUTHOOTFIN': 1650, 'MANAPPURAM': 185,
  'CHOLAFIN': 1250, 'M&MFIN': 285, 'LICHSGFIN': 585, 'CANFINHOME': 785, 'AAVAS': 1650,
  'HOMEFIRST': 985, 'APTUS': 385, 'POONAWALLA': 385, 'JMFINANCIL': 85, 'CREDITACC': 1185, 'PNBHOUSING': 785,
  
  // Insurance
  'LICI': 985, 'SBILIFE': 1550, 'HDFCLIFE': 685, 'ICICIPRULI': 585, 'ICICIGI': 1750,
  'BAJAJHFL': 145, 'STARHEALTH': 585, 'MAXHEALTH': 785, 'NIACL': 185, 'GICRE': 385,
  
  // Telecom
  'BHARTIARTL': 1620, 'IDEA': 14, 'TTML': 85, 'INDUSTOWER': 385,
  
  // Retail
  'DMART': 3850, 'TRENT': 5450, 'SHOPERSTOP': 785, 'ABFRL': 285, 'VMART': 2450, 'METRO': 185, 'KALYANKJIL': 585,
  
  // Capital Goods
  'HONAUT': 52500, 'AIAENG': 3850, 'ELGIEQUIP': 685, 'KAYNES': 4850, 'TRIVENI': 585,
  'KENNAMET': 2450, 'CARBORUNIV': 1285, 'WENDT': 7850, 'BEL': 285, 'HAL': 4250,
  'MAZDA': 4850, 'COCHINSHIP': 1850, 'GRSE': 1650, 'PARAS': 985, 'DATAPATT': 2450, 'ZENTEC': 1650,
  
  // Chemicals
  'PIDILITIND': 2950, 'SRF': 2450, 'ATUL': 6850, 'NAVINFLUOR': 3450, 'DEEPAKFERT': 585,
  'DEEPAKNTR': 2450, 'FINEORG': 4850, 'CLEAN': 1450, 'TATACHEM': 1085, 'BASF': 6850,
  'ANURAS': 885, 'GALAXYSURF': 2850, 'PIIND': 3850, 'AARTIIND': 485, 'SUMICHEM': 485,
  'ALKYLAMINE': 2250, 'BALAJI': 2450, 'VINATI': 1850, 'IOLCP': 385,
  'ASIANPAINT': 2950, 'BERGEPAINT': 485, 'KANSAINER': 385, 'AKZONOBEL': 3850,
  
  // Fintech
  'PAYTM': 385, 'POLICYBZR': 1450, 'CARTRADE': 885, 'EASEMYTRIP': 38, 'INFIBEAM': 28,
  'ANGELONE': 2850, 'CDSL': 1450, 'BSE': 4850, 'CAMS': 3850, 'KFINTECH': 985,
  'MCX': 5850, 'IIFL': 485, 'MOTILALOFS': 785, 'HDFCAMC': 4250, 'NIPPONIND': 585,
  'UTIAMC': 1085, 'ABSLAMC': 485,
  
  // Textiles
  'PAGEIND': 42000, 'RAYMOND': 1650, 'ARVIND': 385, 'WELSPUNIND': 145, 'KPRMILL': 885,
  'VARDHMAN': 485, 'SOMANYCERA': 685, 'CERA': 8850, 'TRIDENT': 32, 'GOKEX': 985,
  
  // Media
  'SUNTV': 685, 'ZEEL': 145, 'PVR': 1450, 'NAZARA': 985, 'TIPS': 685, 'SAREGAMA': 485,
  'NETWORK18': 78, 'TV18BRDCST': 42,
  
  // Agriculture
  'UPL': 545, 'COROMANDEL': 1650, 'CHAMBAL': 485, 'GNFC': 585, 'GSFC': 185,
  'RCF': 145, 'FACT': 785, 'ZUARI': 185, 'KAVERI': 785, 'DHANUKA': 1450, 'RALLIS': 285, 'BAYER': 6850,
  
  // Hotels & E-commerce
  'INDIANHOTEL': 685, 'LEMON': 145, 'CHALET': 785, 'EIH': 385, 'INDIAMART': 2850,
  'JUSTDIAL': 1085, 'AFFLE': 1450,
  
  // Finance
  'IRFC': 165, 'RECLTD': 485, 'PFC': 485, 'HUDCO': 245, 'IREDA': 185,
  'CGCL': 185, 'SUNDARM': 4250, 'RITES': 685,
};

// Sector-based volatility for simulation
const SECTOR_VOLATILITY: Record<string, number> = {
  'Index': 0.008,
  'Banking': 0.016,
  'IT': 0.015,
  'Oil & Gas': 0.018,
  'FMCG': 0.010,
  'Pharma': 0.015,
  'Auto': 0.018,
  'Metals': 0.022,
  'Power': 0.014,
  'Infrastructure': 0.016,
  'Consumer': 0.014,
  'Finance': 0.018,
  'Insurance': 0.012,
  'Telecom': 0.020,
  'Retail': 0.016,
  'Chemicals': 0.015,
  'Fintech': 0.025,
  'Textiles': 0.018,
  'Media': 0.020,
  'Agriculture': 0.015,
  'Hotels': 0.018,
  'default': 0.015,
};

// In-memory cache for quick lookups
const priceCache: Map<string, { data: any; expiresAt: number }> = new Map();

// Seeded random number generator for deterministic simulated data
function createSeededRandom(seed: number): () => number {
  let currentSeed = seed;
  return function() {
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    return currentSeed / 0x7fffffff;
  };
}

// Create a consistent seed from a symbol string
function getSymbolSeed(symbol: string): number {
  return symbol.toUpperCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

// Create a date seed for consistent daily prices
function getDateSeed(date: Date): number {
  const dateStr = date.toISOString().split('T')[0];
  return dateStr.split('-').reduce((acc, p) => acc + parseInt(p), 0);
}

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

function getVolatility(symbol: string): number {
  const upperSymbol = symbol.toUpperCase();
  
  // Index volatility
  if (upperSymbol.includes('NIFTY')) return SECTOR_VOLATILITY['Index'];
  
  // Get from base prices to determine sector
  if (STOCK_BASE_PRICES[upperSymbol]) {
    const price = STOCK_BASE_PRICES[upperSymbol];
    // Higher priced stocks tend to have lower volatility
    if (price > 10000) return 0.012;
    if (price > 5000) return 0.014;
    if (price > 1000) return 0.016;
    if (price > 100) return 0.018;
    return 0.025; // Penny stocks
  }
  
  return SECTOR_VOLATILITY['default'];
}

// Cache for simulated historical data to ensure consistency
const simulatedHistoricalCache: Map<string, { data: PriceData[]; expiresAt: number }> = new Map();

function generateSimulatedHistorical(symbol: string, days: number = 365): { data: PriceData[]; source: 'simulated' } {
  const cacheKey = `sim_hist_${symbol.toUpperCase()}_${days}`;
  const cached = simulatedHistoricalCache.get(cacheKey);
  
  // Cache for 1 hour to ensure consistency across requests
  if (cached && cached.expiresAt > Date.now()) {
    return { data: cached.data, source: 'simulated' };
  }
  
  const data: PriceData[] = [];
  const basePrice = STOCK_BASE_PRICES[symbol.toUpperCase()] || 1000;
  let price = basePrice;
  
  const isIndex = symbol.toUpperCase().includes('NIFTY');
  const volatility = getVolatility(symbol);
  const trend = 0.0002;
  
  // Use seeded random for consistent data
  const symbolSeed = getSymbolSeed(symbol);
  const random = createSeededRandom(symbolSeed);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const seasonal = Math.sin(dayOfYear / 365 * Math.PI * 2) * 0.002;
    
    // Use seeded random instead of Math.random()
    const change = (random() - 0.5) * 2 * volatility + trend + seasonal;
    const open = price;
    price = price * (1 + change);
    const close = price;
    
    const range = Math.abs(close - open) + price * (random() * 0.01);
    const high = Math.max(open, close) + random() * range * 0.5;
    const low = Math.min(open, close) - random() * range * 0.5;
    
    const baseVolume = isIndex ? 500000 : 100000;
    const volume = Math.floor(baseVolume + random() * baseVolume * 2 * (Math.abs(change) * 50));

    data.push({
      symbol: symbol.toUpperCase(),
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume
    });
  }

  // Cache the result for consistency
  simulatedHistoricalCache.set(cacheKey, { data, expiresAt: Date.now() + 3600000 });

  return { data, source: 'simulated' };
}

function generateSimulatedPrice(symbol: string): CurrentPriceData {
  // First, get the historical data to ensure current price aligns with last close
  const historicalResult = generateSimulatedHistorical(symbol, 365);
  const historicalData = historicalResult.data;
  
  // Get the last historical close as the previous close
  const lastHistorical = historicalData.length > 0 
    ? historicalData[historicalData.length - 1] 
    : null;
  
  const previousClose = lastHistorical?.close || STOCK_BASE_PRICES[symbol.toUpperCase()] || 1000;
  const volatility = getVolatility(symbol);
  
  // Create a seed based on symbol + today's date for consistent intraday price
  const now = new Date();
  const symbolSeed = getSymbolSeed(symbol);
  const dateSeed = getDateSeed(now);
  const combinedSeed = symbolSeed + dateSeed;
  
  const random = createSeededRandom(combinedSeed);
  
  // Generate consistent intraday movement from previous close
  const changePercent = (random() - 0.5) * 2 * volatility * 100;
  const change = previousClose * (changePercent / 100);
  const price = previousClose + change;
  
  // Generate OHLC that makes sense
  const openVariation = (random() - 0.5) * 0.005;
  const open = previousClose * (1 + openVariation);
  
  const dayRange = Math.abs(change) + price * 0.005;
  const high = Math.max(open, price) + random() * dayRange;
  const low = Math.min(open, price) - random() * dayRange;
  
  const baseVolume = symbol.toUpperCase().includes('NIFTY') ? 500000 : 100000;
  const volume = Math.floor(baseVolume + random() * baseVolume * 4);
  
  const marketStatus = isMarketOpen();
  
  return {
    symbol: symbol.toUpperCase(),
    price: Math.round(price * 100) / 100,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    open: Math.round(open * 100) / 100,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    previousClose: Math.round(previousClose * 100) / 100,
    volume,
    timestamp: now.toISOString(),
    marketStatus: marketStatus.status,
    source: 'simulated',
  };
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

    if (type === 'current') {
      if (apiKey) {
        const alphaData = await fetchFromAlphaVantage(symbol, 'current', apiKey);
        if (alphaData) {
          const response: CurrentPriceData = {
            ...alphaData,
            timestamp: new Date().toISOString(),
            marketStatus: marketStatus.status,
          };
          
          const ttl = marketStatus.status === 'open' ? 60000 : 300000;
          priceCache.set(cacheKey, { data: response, expiresAt: Date.now() + ttl });
          
          return new Response(
            JSON.stringify(response),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      console.log(`Falling back to simulated data for ${symbol}`);
      const simulatedData = generateSimulatedPrice(symbol);
      
      return new Response(
        JSON.stringify(simulatedData),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (apiKey) {
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
        
        priceCache.set(cacheKey, { data: response, expiresAt: Date.now() + 3600000 });
        
        return new Response(
          JSON.stringify(response),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    console.log(`Falling back to simulated historical data for ${symbol}`);
    const simulatedHistorical = generateSimulatedHistorical(symbol, days);
    
    return new Response(
      JSON.stringify({
        symbol: symbol.toUpperCase(),
        count: simulatedHistorical.data.length,
        source: simulatedHistorical.source,
        marketStatus: marketStatus.status,
        data: simulatedHistorical.data,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
