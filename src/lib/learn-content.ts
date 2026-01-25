// Comprehensive Learn Content Library for AlgoTrade Pro

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface ContentSection {
  heading: string;
  body: string;
  tip?: string;
  warning?: string;
  interactiveComponent?: 'indicator-demo' | 'payoff-chart' | 'risk-calculator' | 'greeks-calculator';
  codeExample?: string;
}

export interface LessonContent {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  introduction: string;
  sections: ContentSection[];
  keyTakeaways: string[];
  quiz: QuizQuestion[];
  nextLessonId?: string;
  prevLessonId?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  category: 'Beginner' | 'Intermediate' | 'Advanced' | 'Essential';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessonCount: number;
  estimatedTime: string;
  lessons: LessonContent[];
}

// Alias for simpler usage
export type Lesson = LessonContent;

// ============================================
// MODULE 1: TRADING FUNDAMENTALS
// ============================================

const tradingFundamentalsLessons: LessonContent[] = [
  {
    id: 'what-is-algo-trading',
    moduleId: 'trading-fundamentals',
    title: 'What is Algorithmic Trading?',
    description: 'Understand the basics of automated trading systems and their advantages',
    duration: '12 min',
    difficulty: 'beginner',
    introduction: 'Algorithmic trading, also known as algo trading or automated trading, uses computer programs to execute trades based on predefined rules. In India, algo trading has grown significantly, now accounting for over 50% of NSE trading volume.',
    sections: [
      {
        heading: 'Definition and Core Concepts',
        body: `Algorithmic trading is the use of computer algorithms to automatically make trading decisions, submit orders, and manage positions. These algorithms follow a defined set of instructions based on timing, price, quantity, or mathematical models.

**Key Components:**
- **Strategy Logic**: Rules that determine when to buy or sell
- **Order Management**: How orders are placed and executed
- **Risk Management**: Rules to limit losses and protect capital
- **Backtesting Engine**: Testing strategies on historical data`,
        tip: 'Think of an algorithm as a recipe. Just like a recipe tells you exactly what ingredients to use and steps to follow, a trading algorithm specifies exact conditions for entering and exiting trades.'
      },
      {
        heading: 'Benefits of Algorithmic Trading',
        body: `**1. Emotion-Free Trading**
Human emotions like fear and greed often lead to poor trading decisions. Algorithms execute trades based purely on logic and predefined rules.

**2. Speed and Efficiency**
Algorithms can analyze market data and execute orders in milliseconds, far faster than any human trader.

**3. Backtesting Capability**
Before risking real money, you can test your strategy on years of historical data to see how it would have performed.

**4. Consistency**
Algorithms follow the same rules every time, ensuring consistent execution without fatigue or distraction.

**5. Diversification**
A single algorithm can monitor and trade multiple instruments simultaneously.`,
        warning: 'While algorithms remove emotional trading, they can also fail in unexpected market conditions. Always include safeguards and monitor your systems.'
      },
      {
        heading: 'Algo Trading in Indian Markets',
        body: `The Indian stock market, primarily NSE (National Stock Exchange) and BSE (Bombay Stock Exchange), has embraced algorithmic trading since SEBI approved it in 2008.

**Key Facts for Indian Markets:**
- Trading hours: 9:15 AM to 3:30 PM IST
- Pre-market session: 9:00 AM to 9:15 AM
- T+1 settlement cycle
- Circuit breakers at ±5%, ±10%, ±20% for indices

**Popular Strategies in India:**
1. **Momentum Trading**: Riding strong trends in stocks like RELIANCE, TCS
2. **Mean Reversion**: Trading when NIFTY deviates from moving averages
3. **Arbitrage**: Price differences between NSE and BSE
4. **Options Strategies**: Bank NIFTY weekly options are extremely popular`,
        tip: 'Bank NIFTY options have the highest liquidity in Indian markets, making them ideal for algo trading strategies.'
      },
      {
        heading: 'Getting Started with AlgoTrade Pro',
        body: `AlgoTrade Pro simplifies algorithmic trading for Indian markets. Here's how the platform helps you:

**1. Strategy Builder**
Create trading strategies using plain English descriptions. Our AI converts your ideas into executable code.

**2. Backtesting Engine**
Test your strategies on historical NSE/BSE data going back 10+ years.

**3. Paper Trading**
Practice with virtual money (₹1,00,000 default) before risking real capital.

**4. Live Trading**
Connect to brokers like Zerodha, Upstox, and Angel One for automated execution.

**5. Risk Management**
Built-in position sizing, stop-losses, and daily loss limits protect your capital.`
      }
    ],
    keyTakeaways: [
      'Algorithmic trading uses computer programs to execute trades based on predefined rules',
      'Key benefits include emotion-free trading, speed, backtesting capability, and consistency',
      'Indian markets (NSE/BSE) are well-suited for algo trading with high liquidity',
      'Always test strategies thoroughly before deploying with real money'
    ],
    quiz: [
      {
        id: 'q1-algo-def',
        question: 'What is the primary advantage of algorithmic trading over manual trading?',
        options: [
          'Guaranteed profits',
          'Emotion-free execution based on predefined rules',
          'No need for market knowledge',
          'Free trading without brokerage'
        ],
        correctAnswer: 1,
        explanation: 'Algorithmic trading removes emotional biases like fear and greed, executing trades purely based on logic and predefined rules.'
      },
      {
        id: 'q2-nse-hours',
        question: 'What are the regular trading hours for NSE?',
        options: [
          '9:00 AM to 4:00 PM IST',
          '9:15 AM to 3:30 PM IST',
          '10:00 AM to 3:00 PM IST',
          '9:30 AM to 4:00 PM IST'
        ],
        correctAnswer: 1,
        explanation: 'NSE regular trading hours are 9:15 AM to 3:30 PM IST, with a pre-market session from 9:00 AM to 9:15 AM.'
      },
      {
        id: 'q3-backtesting',
        question: 'What is backtesting?',
        options: [
          'Trading with borrowed money',
          'Testing a strategy on historical data before live trading',
          'Reversing a trade after execution',
          'Checking your account balance'
        ],
        correctAnswer: 1,
        explanation: 'Backtesting allows you to test your trading strategy on historical data to evaluate its performance before risking real money.'
      }
    ],
    nextLessonId: 'understanding-markets',
    prevLessonId: undefined
  },
  {
    id: 'understanding-markets',
    moduleId: 'trading-fundamentals',
    title: 'Understanding Market Types',
    description: 'Learn about equity, derivatives, and commodity markets in India',
    duration: '15 min',
    difficulty: 'beginner',
    introduction: 'Indian financial markets offer various instruments for trading. Understanding the differences between market types is essential for choosing the right instruments for your trading strategies.',
    sections: [
      {
        heading: 'Equity Markets (Cash Segment)',
        body: `The equity or cash segment is where stocks are bought and sold. When you buy a stock, you become a part-owner of that company.

**Key Characteristics:**
- Settlement: T+1 (you receive shares next day)
- No leverage by default
- No expiry date - hold indefinitely
- Dividends and voting rights

**Major Indices:**
- **NIFTY 50**: Top 50 companies by market cap
- **SENSEX**: Top 30 companies on BSE
- **NIFTY Bank**: Top banking stocks
- **NIFTY IT**: Information technology stocks

**Trading Considerations:**
- Minimum order: 1 share
- Brokerage: Typically ₹20 per order or 0.03%
- STT: 0.1% on sell side`,
        tip: 'For beginners, starting with large-cap stocks like RELIANCE, TCS, HDFC Bank is recommended due to high liquidity and lower volatility.'
      },
      {
        heading: 'Futures & Options (F&O) Segment',
        body: `Derivatives derive their value from an underlying asset. They allow trading with leverage but come with higher risk.

**Futures Contracts:**
- Agreement to buy/sell at a future date
- Lot size based (e.g., NIFTY = 25 units)
- Monthly expiry (last Thursday)
- Margin required (typically 10-15%)

**Options Contracts:**
- Right but not obligation to buy (Call) or sell (Put)
- Strike prices at various levels
- Weekly options for Bank NIFTY
- Premium = Time Value + Intrinsic Value

**Popular F&O Instruments:**
1. NIFTY 50 Options/Futures
2. Bank NIFTY Options (weekly)
3. Stock futures (180+ stocks)
4. Stock options (select liquid stocks)`,
        warning: 'F&O trading can result in losses exceeding your initial investment. Never trade F&O without proper risk management.'
      },
      {
        heading: 'Trading Sessions',
        body: `Understanding market timing is crucial for algorithmic trading:

**Pre-Market Session (9:00 AM - 9:15 AM)**
- Order collection and price discovery
- Opening price determined through call auction
- Good for placing orders before market opens

**Regular Trading (9:15 AM - 3:30 PM)**
- Continuous trading with real-time matching
- Most liquid and active period
- Best time for intraday strategies

**Closing Session (3:30 PM - 3:40 PM)**
- Market on Close (MOC) orders
- Volume spike at 3:30 PM

**Post-Market (3:40 PM - 4:00 PM)**
- Limited trading at closing price
- Lower liquidity

**Key Timing Strategies:**
- First 15 minutes: High volatility, wait for trend
- 9:45 AM - 2:30 PM: Best for intraday trading
- Last 30 minutes: Squaring off positions`,
        tip: 'Many successful traders avoid the first 15 minutes due to high volatility and false breakouts.'
      },
      {
        heading: 'Settlement and Regulations',
        body: `**Settlement Cycles:**
- Equity: T+1 (same day if ASBA)
- F&O: Same day (cash settlement)
- Options: Premium settled immediately

**SEBI Regulations for Algo Trading:**
- All algo strategies must be approved by exchanges
- Audit trail required for all orders
- Kill switch mandatory for risk control
- API access through registered brokers only

**Margin Requirements:**
- Equity delivery: No margin (full payment)
- Equity intraday: 5-20x leverage allowed
- F&O: SPAN + Exposure margin
- Peak margin reporting mandatory`
      }
    ],
    keyTakeaways: [
      'Equity markets are for long-term ownership; F&O for leveraged short-term trading',
      'Trading hours are 9:15 AM to 3:30 PM with specific sessions for different activities',
      'F&O requires margin and has lot sizes - understand risks before trading',
      'SEBI regulates all trading activities including algorithmic trading'
    ],
    quiz: [
      {
        id: 'q1-lot-size',
        question: 'What is the lot size for NIFTY 50 futures?',
        options: ['10 units', '25 units', '50 units', '75 units'],
        correctAnswer: 1,
        explanation: 'NIFTY 50 has a lot size of 25 units, meaning each lot represents 25 times the index value.'
      },
      {
        id: 'q2-settlement',
        question: 'What is the current settlement cycle for equity trades in India?',
        options: ['T+0', 'T+1', 'T+2', 'T+3'],
        correctAnswer: 1,
        explanation: 'India moved to T+1 settlement in 2023, meaning shares are delivered the next trading day.'
      },
      {
        id: 'q3-expiry',
        question: 'When do Bank NIFTY weekly options expire?',
        options: ['Every Monday', 'Every Wednesday', 'Every Thursday', 'Every Friday'],
        correctAnswer: 2,
        explanation: 'Bank NIFTY weekly options expire every Thursday. If Thursday is a holiday, they expire on the previous trading day.'
      }
    ],
    nextLessonId: 'order-types',
    prevLessonId: 'what-is-algo-trading'
  },
  {
    id: 'order-types',
    moduleId: 'trading-fundamentals',
    title: 'Order Types Explained',
    description: 'Master different order types for precise trade execution',
    duration: '10 min',
    difficulty: 'beginner',
    introduction: 'Understanding order types is fundamental to trading. The right order type ensures your trades execute at the price and time you want, while managing risk effectively.',
    sections: [
      {
        heading: 'Market Orders',
        body: `A market order executes immediately at the best available price.

**When to Use:**
- Need immediate execution
- High liquidity stocks
- Breakout entries where speed matters

**Advantages:**
- Guaranteed execution (if liquidity exists)
- Fastest execution
- Simple to use

**Disadvantages:**
- No price control
- Slippage in volatile markets
- Can get poor prices in illiquid stocks

**Example:**
If RELIANCE is trading at ₹2,500 and you place a market buy order for 10 shares, you might get filled at ₹2,500, ₹2,501, or ₹2,502 depending on available sellers.`,
        warning: 'Avoid market orders in illiquid stocks or during high volatility. The execution price can be significantly different from the displayed price.'
      },
      {
        heading: 'Limit Orders',
        body: `A limit order executes only at your specified price or better.

**When to Use:**
- Want price control
- Trading illiquid stocks
- Scaling into positions
- Placing orders overnight

**Advantages:**
- Complete price control
- Better fills in many cases
- Good for planning entries

**Disadvantages:**
- May not execute
- Can miss fast-moving opportunities
- Requires more attention

**Example:**
HDFC Bank is at ₹1,650. You place a limit buy at ₹1,640.
- If price drops to ₹1,640, your order executes
- If price never reaches ₹1,640, order remains open or expires`,
        tip: 'For algo trading, limit orders are often preferred as they give precise control over entry and exit prices.'
      },
      {
        heading: 'Stop-Loss Orders',
        body: `A stop-loss order triggers when price reaches your specified level, converting to a market or limit order.

**Stop-Loss Market (SL-M):**
- Triggers at stop price
- Executes immediately at market
- Guaranteed execution, not price

**Stop-Loss Limit (SL):**
- Triggers at stop price
- Executes only at limit price or better
- May not execute in fast markets

**Example:**
You buy TCS at ₹3,500 with stop-loss at ₹3,400.
- SL-M: At ₹3,400, sells at whatever price available
- SL: At ₹3,400, sells only at ₹3,400 or above

**Trailing Stop-Loss:**
A dynamic stop that moves with price:
- Buy at ₹100, trailing stop 5%
- Price goes to ₹110, stop moves to ₹104.50
- Price goes to ₹120, stop moves to ₹114`,
        tip: 'Always use stop-loss orders. The most common reason traders fail is letting small losses become large losses.'
      },
      {
        heading: 'Advanced Order Types',
        body: `**Bracket Orders (BO):**
Three orders in one: Entry + Target + Stop-Loss
- All linked together
- One triggers, others cancel
- Popular for intraday trading

**Cover Orders (CO):**
Entry with mandatory stop-loss
- Higher leverage available
- Stop-loss required at order placement
- Good for disciplined intraday trading

**After Market Orders (AMO):**
Place orders outside market hours
- Executes at next day's opening
- Good for overnight strategy planning

**Good Till Triggered (GTT):**
Order remains active until condition is met
- Valid for 1 year
- Triggers automatically when price hits
- Great for long-term entries

**Iceberg Orders:**
Large orders broken into smaller visible portions
- Hides true order size
- Reduces market impact
- Used by institutions`
      }
    ],
    keyTakeaways: [
      'Market orders guarantee execution but not price; use for liquid stocks and urgent trades',
      'Limit orders guarantee price but not execution; use for precise entries',
      'Always use stop-loss orders to protect capital',
      'Advanced orders like Bracket and GTT automate your trading plan'
    ],
    quiz: [
      {
        id: 'q1-market-order',
        question: 'When should you avoid using a market order?',
        options: [
          'When buying highly liquid stocks',
          'When trading illiquid stocks during volatile periods',
          'When you need immediate execution',
          'When the market is calm'
        ],
        correctAnswer: 1,
        explanation: 'Market orders in illiquid stocks can result in significant slippage - you may pay much more than the displayed price.'
      },
      {
        id: 'q2-bracket-order',
        question: 'What does a bracket order consist of?',
        options: [
          'Only an entry order',
          'Entry and stop-loss',
          'Entry, target, and stop-loss linked together',
          'Multiple limit orders at different prices'
        ],
        correctAnswer: 2,
        explanation: 'A bracket order includes an entry, a target (profit), and a stop-loss, all linked so that when one executes, the other cancels.'
      },
      {
        id: 'q3-gtt',
        question: 'How long does a GTT (Good Till Triggered) order remain active?',
        options: ['1 day', '1 week', '1 month', '1 year'],
        correctAnswer: 3,
        explanation: 'GTT orders remain active for up to 1 year or until they are triggered by the price condition being met.'
      }
    ],
    nextLessonId: 'reading-charts',
    prevLessonId: 'understanding-markets'
  },
  {
    id: 'reading-charts',
    moduleId: 'trading-fundamentals',
    title: 'Reading Price Charts',
    description: 'Learn to read candlestick charts, timeframes, and volume analysis',
    duration: '18 min',
    difficulty: 'beginner',
    introduction: 'Price charts are the primary tool for technical analysis. Understanding how to read candlesticks, interpret volume, and choose the right timeframe is essential for any trader.',
    sections: [
      {
        heading: 'Candlestick Basics',
        body: `Candlestick charts originated in Japan and are the most popular chart type for technical analysis.

**Anatomy of a Candlestick:**
\`\`\`
    |     <- Upper Wick/Shadow (High)
  ┌───┐
  │   │   <- Body (Open to Close)
  └───┘
    |     <- Lower Wick/Shadow (Low)
\`\`\`

**Green/White Candle (Bullish):**
- Close > Open
- Price went up during the period
- Body shows the range between open and close

**Red/Black Candle (Bearish):**
- Close < Open
- Price went down during the period
- Body shows the range between open and close

**Key Elements:**
- **Open**: First traded price in the period
- **High**: Highest price in the period
- **Low**: Lowest price in the period
- **Close**: Last traded price in the period`,
        tip: 'Long wicks indicate rejection of prices. A long lower wick suggests buyers stepped in; a long upper wick suggests sellers appeared.'
      },
      {
        heading: 'Important Candlestick Patterns',
        body: `**Single Candle Patterns:**

**Doji**: Open ≈ Close
- Indicates indecision
- Potential reversal signal
- More significant at support/resistance

**Hammer**: Small body, long lower wick
- Bullish reversal at bottom of downtrend
- Shows buyers rejecting lower prices

**Shooting Star**: Small body, long upper wick
- Bearish reversal at top of uptrend
- Shows sellers rejecting higher prices

**Multi-Candle Patterns:**

**Engulfing Pattern**: Second candle completely engulfs the first
- Bullish engulfing: Green candle engulfs red
- Bearish engulfing: Red candle engulfs green

**Morning Star**: Three-candle bullish reversal
1. Large red candle
2. Small body (doji-like)
3. Large green candle

**Evening Star**: Three-candle bearish reversal
- Opposite of morning star`,
        tip: 'Patterns are more reliable when they appear at key support/resistance levels with high volume confirmation.'
      },
      {
        heading: 'Choosing the Right Timeframe',
        body: `The timeframe you choose affects how you see the market:

**Common Timeframes:**

| Timeframe | Use Case | Holding Period |
|-----------|----------|----------------|
| 1-minute | Scalping | Seconds to minutes |
| 5-minute | Intraday | Minutes to hours |
| 15-minute | Day trading | Hours |
| 1-hour | Swing trading | Days |
| Daily | Position trading | Weeks |
| Weekly | Long-term investing | Months |

**Multi-Timeframe Analysis:**
Use multiple timeframes together:
1. **Higher timeframe**: Identify trend direction
2. **Trading timeframe**: Find entry signals
3. **Lower timeframe**: Fine-tune entries

**Example for Intraday Trading:**
- Daily chart: Confirm trend is up
- Hourly chart: Wait for pullback to support
- 15-minute chart: Enter on bullish pattern`,
        warning: 'Switching timeframes too frequently leads to confusion and overtrading. Stick to 2-3 timeframes that suit your strategy.'
      },
      {
        heading: 'Volume Analysis',
        body: `Volume confirms price movements. High volume = strong conviction.

**Volume Basics:**
- Volume bars appear below price chart
- Each bar = shares/contracts traded in that period
- Compare current volume to average (20-period typical)

**Volume Interpretation:**

**Price Up + High Volume = Strong Bullish**
- Buyers are committed
- Trend likely to continue

**Price Up + Low Volume = Weak Move**
- Lack of conviction
- Potential reversal ahead

**Price Down + High Volume = Strong Bearish**
- Sellers are aggressive
- Trend likely to continue

**Price Down + Low Volume = Weak Selling**
- Selling exhaustion possible
- Watch for reversal

**Volume Spikes:**
- Unusual volume often precedes major moves
- News events cause volume spikes
- Volume climax can mark trend endings`,
        tip: 'In Indian markets, watch volume at 9:15-9:30 AM and 3:00-3:30 PM. These periods often have the highest volume and most significant moves.'
      }
    ],
    keyTakeaways: [
      'Candlesticks show open, high, low, close in a visual format',
      'Key patterns like doji, hammer, and engulfing signal potential reversals',
      'Choose timeframes based on your trading style and holding period',
      'Volume confirms price moves - high volume = strong conviction'
    ],
    quiz: [
      {
        id: 'q1-bullish-candle',
        question: 'What does a green/white candlestick indicate?',
        options: [
          'The price closed lower than it opened',
          'The price closed higher than it opened',
          'There was no trading volume',
          'The market was closed'
        ],
        correctAnswer: 1,
        explanation: 'A green (or white) candlestick indicates the closing price was higher than the opening price, showing bullish price action.'
      },
      {
        id: 'q2-hammer',
        question: 'What does a hammer candlestick pattern typically indicate?',
        options: [
          'Continuation of downtrend',
          'Potential bullish reversal at the bottom of a downtrend',
          'Extreme selling pressure',
          'Market is closed'
        ],
        correctAnswer: 1,
        explanation: 'A hammer has a small body and long lower wick, showing buyers rejected lower prices - a potential bullish reversal signal.'
      },
      {
        id: 'q3-volume',
        question: 'What does price moving up on low volume suggest?',
        options: [
          'Strong bullish move',
          'Weak move with potential for reversal',
          'Bearish signal',
          'Volume is not important'
        ],
        correctAnswer: 1,
        explanation: 'Price moving up on low volume suggests lack of conviction. The move may not be sustainable and could reverse.'
      }
    ],
    nextLessonId: 'market-indices',
    prevLessonId: 'order-types'
  },
  {
    id: 'market-indices',
    moduleId: 'trading-fundamentals',
    title: 'Market Indices',
    description: 'Understanding NIFTY, SENSEX, and sector indices',
    duration: '12 min',
    difficulty: 'beginner',
    introduction: 'Market indices provide a snapshot of overall market health and specific sector performance. For algo trading, indices serve as benchmarks and tradable instruments.',
    sections: [
      {
        heading: 'What are Market Indices?',
        body: `A market index is a measurement of a section of the stock market. It's calculated from prices of selected stocks weighted by various criteria.

**Purpose of Indices:**
1. **Benchmark Performance**: Compare your portfolio returns
2. **Market Sentiment**: Gauge overall market direction
3. **Trading Instrument**: Trade index futures and options
4. **Sector Analysis**: Track specific industry performance

**Index Calculation Methods:**

**Market Cap Weighted (Most Common):**
- Larger companies have more influence
- Used by NIFTY, SENSEX
- Example: RELIANCE (₹17L Cr) impacts NIFTY more than a ₹10K Cr company

**Price Weighted:**
- Higher priced stocks have more influence
- Less common in India

**Equal Weighted:**
- All stocks have equal influence
- Used for some thematic indices`
      },
      {
        heading: 'Major Indian Indices',
        body: `**NIFTY 50 (NSE)**
- Top 50 companies by market cap and liquidity
- Base year: 1995 (base value: 1000)
- Calculated every 15 seconds during market hours
- Most traded index derivatives in the world

**Top 10 NIFTY Constituents (by weight):**
1. HDFC Bank (~10%)
2. Reliance Industries (~10%)
3. ICICI Bank (~7%)
4. Infosys (~6%)
5. TCS (~4%)
6. Bharti Airtel (~4%)
7. ITC (~4%)
8. L&T (~4%)
9. Axis Bank (~3%)
10. Kotak Bank (~3%)

**SENSEX (BSE)**
- Top 30 companies on BSE
- Base year: 1978-79 (base value: 100)
- Oldest index in India
- Similar composition to NIFTY

**Relationship:**
NIFTY and SENSEX move together 95%+ of the time. Most traders focus on NIFTY due to higher derivatives liquidity.`,
        tip: 'Bank NIFTY options alone account for over 85% of India\'s options trading volume. If you\'re interested in options trading, start here.'
      },
      {
        heading: 'Sector Indices',
        body: `Sector indices track specific industry performance:

**Bank NIFTY**
- 12 most liquid banking stocks
- Lot size: 15 units
- Weekly options (most liquid!)
- High volatility, great for day trading

**NIFTY IT**
- Technology companies
- TCS, Infosys, Wipro, HCL Tech, Tech Mahindra
- Correlated with NASDAQ/global tech

**NIFTY Financial Services**
- Broader than Bank NIFTY
- Includes insurance, NBFCs
- HDFC, Bajaj Finance, SBI Life

**Other Important Indices:**
- **NIFTY Pharma**: Healthcare and pharmaceuticals
- **NIFTY Auto**: Automobile manufacturers
- **NIFTY Metal**: Steel, aluminum companies
- **NIFTY FMCG**: Consumer goods
- **NIFTY Realty**: Real estate

**Trading Applications:**
- Sector rotation strategies
- Relative strength analysis
- Pair trading (long one sector, short another)`,
        tip: 'When NIFTY is range-bound, sector indices often show clearer trends. Look for sectors outperforming or underperforming the main index.'
      },
      {
        heading: 'Using Indices in Your Strategy',
        body: `**As a Filter:**
Only take long trades when NIFTY is above 20-day SMA (uptrend)
Only take short trades when NIFTY is below 20-day SMA (downtrend)

**Relative Strength:**
Compare stock performance to index:
- Stock up 2% while NIFTY up 0.5% = Strong stock
- Stock down 2% while NIFTY down 0.5% = Weak stock

**Index Trading Strategies:**

**NIFTY/Bank NIFTY Options:**
1. Sell OTM options on range-bound days
2. Buy options on breakout days
3. Straddle/strangle for volatility

**Index Futures:**
1. Trend following with moving averages
2. Support/resistance breakouts
3. Opening range breakout (ORB)

**Intraday Index Levels:**
- Previous day high/low
- Opening range (first 15-30 min)
- VWAP as dynamic support/resistance
- Pivot points (daily/weekly)`
      }
    ],
    keyTakeaways: [
      'NIFTY 50 and SENSEX are the main benchmarks for Indian markets',
      'Indices are market-cap weighted - top stocks have highest influence',
      'Bank NIFTY is the most traded derivative in India',
      'Use index direction as a filter for your stock trading strategies'
    ],
    quiz: [
      {
        id: 'q1-nifty-companies',
        question: 'How many companies are in the NIFTY 50 index?',
        options: ['30', '50', '100', '500'],
        correctAnswer: 1,
        explanation: 'NIFTY 50 consists of 50 companies selected based on market capitalization and liquidity from the NSE.'
      },
      {
        id: 'q2-weighted',
        question: 'How are NIFTY and SENSEX weighted?',
        options: [
          'Equal weight for all stocks',
          'Price weighted',
          'Market capitalization weighted',
          'Volume weighted'
        ],
        correctAnswer: 2,
        explanation: 'Both indices are market-cap weighted, meaning larger companies like HDFC Bank and Reliance have more influence on the index value.'
      },
      {
        id: 'q3-bank-nifty',
        question: 'What is special about Bank NIFTY options?',
        options: [
          'They only trade once a month',
          'They have weekly expiry and highest liquidity',
          'They cannot be traded by retail investors',
          'They don\'t have any special features'
        ],
        correctAnswer: 1,
        explanation: 'Bank NIFTY has weekly options expiring every Thursday, making it the most liquid options contract globally.'
      }
    ],
    nextLessonId: 'first-strategy',
    prevLessonId: 'reading-charts'
  },
  {
    id: 'first-strategy',
    moduleId: 'trading-fundamentals',
    title: 'Your First Trading Strategy',
    description: 'Build a simple moving average crossover strategy step by step',
    duration: '20 min',
    difficulty: 'beginner',
    introduction: 'Now that you understand the basics, let\'s build your first trading strategy. We\'ll create a classic moving average crossover system that you can backtest and paper trade.',
    sections: [
      {
        heading: 'The Moving Average Crossover Concept',
        body: `The moving average crossover is one of the oldest and most widely used trading strategies. It's simple, effective, and a great starting point for algo trading.

**Core Idea:**
- Use two moving averages: Fast (short period) and Slow (long period)
- Buy when Fast crosses above Slow (bullish)
- Sell when Fast crosses below Slow (bearish)

**Popular Combinations:**
- 9 & 21 EMA: Aggressive, more signals
- 20 & 50 SMA: Moderate
- 50 & 200 SMA: Conservative, major trends only

**Why It Works:**
- Fast MA reacts quickly to price changes
- Slow MA smooths out noise and shows trend
- Crossover indicates momentum shift

**Limitations:**
- Lags behind price (reactive, not predictive)
- Whipsaws in sideways markets
- Requires trending conditions`,
        tip: 'Start with 9 & 21 EMA for intraday trading on 15-minute charts. For swing trading, use 20 & 50 SMA on daily charts.'
      },
      {
        heading: 'Defining Entry Rules',
        body: `Let's define precise entry rules for our strategy:

**Long Entry (Buy):**
1. 9 EMA crosses above 21 EMA
2. Price is above both EMAs
3. RSI is above 50 (momentum confirmation)

**Short Entry (Sell):**
1. 9 EMA crosses below 21 EMA
2. Price is below both EMAs
3. RSI is below 50 (momentum confirmation)

**Entry Price:**
- Use market order for immediate entry
- Or limit order at current price

**Position Size:**
- Risk 1% of capital per trade
- Calculate based on stop-loss distance

**Example:**
\`\`\`
Capital: ₹1,00,000
Risk per trade: ₹1,000 (1%)
Entry: ₹500
Stop-loss: ₹480
Risk per share: ₹20
Position size: ₹1,000 / ₹20 = 50 shares
\`\`\``,
        interactiveComponent: 'indicator-demo'
      },
      {
        heading: 'Setting Exit Rules',
        body: `Exit rules are as important as entry rules. We need both stop-loss and profit-taking rules.

**Stop-Loss:**
- Initial stop: Below recent swing low (for longs)
- Or fixed percentage: 2% from entry
- Or ATR-based: Entry - 2 × ATR(14)

**Profit Target:**
- Fixed R:R ratio: 1:2 or 1:3
- Technical target: Next resistance level
- Trailing stop: Move stop as price advances

**Exit Signals:**
1. Stop-loss hit
2. Target hit
3. Opposite crossover signal
4. End of day (for intraday)

**Trailing Stop Example:**
\`\`\`
Entry: ₹100
Initial Stop: ₹95 (5% risk)
Price moves to ₹110
New Stop: ₹104.50 (5% below high)
Price moves to ₹120
New Stop: ₹114 (locked in profit!)
\`\`\``,
        warning: 'Never move your stop-loss further away from price. Only trail it in your favor to lock in profits.'
      },
      {
        heading: 'Complete Strategy Summary',
        body: `Here's our complete MA Crossover Strategy:

**Instrument:** Large-cap stocks (NIFTY 50 constituents)
**Timeframe:** 15-minute charts for intraday
**Indicators:** 9 EMA, 21 EMA, RSI(14)

**Entry Rules (Long):**
1. 9 EMA crosses above 21 EMA
2. Close > 9 EMA > 21 EMA
3. RSI(14) > 50
4. Time: After 9:30 AM, before 3:00 PM

**Exit Rules:**
1. Stop-loss: 2% below entry
2. Target: 4% above entry (2:1 R:R)
3. Trailing stop: 1.5% below highest price
4. Mandatory exit: 3:15 PM (square off)

**Position Sizing:**
- Risk 1% of capital per trade
- Maximum 3 open positions

**Filters:**
- Trade only when NIFTY is above 20 EMA (bullish market)
- Avoid trading on expiry days (Thursday)
- No new trades after 2:30 PM

**Next Steps:**
1. Backtest this strategy on historical data
2. Paper trade for 1-2 weeks
3. Analyze results and optimize
4. Go live with small capital`,
        tip: 'Document every trade in your journal. After 50 trades, you\'ll have enough data to evaluate your strategy properly.'
      }
    ],
    keyTakeaways: [
      'Moving average crossover is a simple but effective starting strategy',
      'Define precise entry and exit rules before trading',
      'Use RSI as confirmation for momentum direction',
      'Always use stop-loss and follow position sizing rules'
    ],
    quiz: [
      {
        id: 'q1-crossover',
        question: 'In a bullish MA crossover, what happens?',
        options: [
          'Slow MA crosses above Fast MA',
          'Fast MA crosses above Slow MA',
          'Both MAs point down',
          'Price crosses below both MAs'
        ],
        correctAnswer: 1,
        explanation: 'A bullish crossover occurs when the fast (short-period) MA crosses above the slow (long-period) MA, indicating upward momentum.'
      },
      {
        id: 'q2-position-size',
        question: 'If you have ₹2,00,000 capital, 1% risk rule, entry at ₹200, stop at ₹190, how many shares to buy?',
        options: ['100 shares', '200 shares', '500 shares', '1000 shares'],
        correctAnswer: 1,
        explanation: 'Risk = ₹2,000 (1%). Risk per share = ₹10. Shares = ₹2,000 ÷ ₹10 = 200 shares.'
      },
      {
        id: 'q3-exit',
        question: 'What should you NEVER do with a stop-loss?',
        options: [
          'Trail it in your favor',
          'Set it at entry time',
          'Move it further from price to avoid getting stopped out',
          'Use a fixed percentage'
        ],
        correctAnswer: 2,
        explanation: 'Never move your stop-loss away from price to avoid getting stopped out. This breaks risk management and leads to larger losses.'
      }
    ],
    nextLessonId: 'sma-ema',
    prevLessonId: 'market-indices'
  }
];

// ============================================
// MODULE 2: TECHNICAL INDICATORS
// ============================================

const technicalIndicatorsLessons: LessonContent[] = [
  {
    id: 'sma-ema',
    moduleId: 'technical-indicators',
    title: 'Moving Averages: SMA & EMA',
    description: 'Master Simple and Exponential Moving Averages for trend identification',
    duration: '15 min',
    difficulty: 'intermediate',
    introduction: 'Moving averages are the foundation of technical analysis. They smooth out price data to help identify trends and potential entry/exit points. This lesson covers both Simple (SMA) and Exponential (EMA) moving averages.',
    sections: [
      {
        heading: 'Simple Moving Average (SMA)',
        body: `The Simple Moving Average calculates the arithmetic mean of prices over a specified period.

**Formula:**
\`\`\`
SMA = (P1 + P2 + P3 + ... + Pn) / n

Where:
P = Price at each period
n = Number of periods
\`\`\`

**Example: 5-day SMA**
Closing prices: ₹100, ₹102, ₹98, ₹103, ₹105
SMA = (100 + 102 + 98 + 103 + 105) / 5 = ₹101.60

**Common SMA Periods:**
- **20-day**: Short-term trend, used by swing traders
- **50-day**: Medium-term trend, institutional reference
- **200-day**: Long-term trend, defines bull/bear market

**Characteristics:**
- Equal weight to all prices in the period
- Smoother than EMA
- Slower to react to price changes
- Good for identifying major trend changes`,
        tip: 'The 200-day SMA is watched by millions of traders. Price crossing this level often triggers significant buying or selling.'
      },
      {
        heading: 'Exponential Moving Average (EMA)',
        body: `The Exponential Moving Average gives more weight to recent prices, making it more responsive to new information.

**Formula:**
\`\`\`
EMA = (Price × k) + (Previous EMA × (1 - k))

Where:
k = 2 / (n + 1) (smoothing factor)
n = Number of periods
\`\`\`

**Example: 10-day EMA**
- Smoothing factor: 2 / (10 + 1) = 0.1818
- If yesterday's EMA = ₹100, today's close = ₹105
- Today's EMA = (105 × 0.1818) + (100 × 0.8182) = ₹100.91

**Common EMA Periods:**
- **9-day**: Very short-term, scalping
- **12/26-day**: Used in MACD calculation
- **21-day**: Popular for swing trading

**EMA vs SMA:**
| Factor | SMA | EMA |
|--------|-----|-----|
| Responsiveness | Slower | Faster |
| Noise | Less | More |
| Lag | More | Less |
| Best for | Trends | Entries |`,
        interactiveComponent: 'indicator-demo',
        tip: 'Use EMA for entries and exits, SMA for trend identification. Many traders use 9/21 EMA for short-term and 50/200 SMA for long-term.'
      },
      {
        heading: 'Trading Signals',
        body: `**Golden Cross (Bullish)**
- 50-day MA crosses above 200-day MA
- Signals potential long-term uptrend
- Historically reliable but lagging
- Example: NIFTY Golden Cross in April 2023 preceded a 15% rally

**Death Cross (Bearish)**
- 50-day MA crosses below 200-day MA
- Signals potential long-term downtrend
- Often occurs after significant decline has already happened

**Price-MA Crossovers:**
- Price crosses above MA = Bullish
- Price crosses below MA = Bearish
- Use multiple MAs for confirmation

**MA as Support/Resistance:**
In an uptrend:
- 21 EMA acts as dynamic support
- Pullbacks to 21 EMA are buying opportunities

In a downtrend:
- 21 EMA acts as dynamic resistance
- Rallies to 21 EMA are selling opportunities`,
        warning: 'Moving averages lag price action. Never rely solely on MA crossovers - always confirm with other indicators or price action.'
      },
      {
        heading: 'Practical Application',
        body: `**Multi-MA Strategy:**
Use three MAs together: 9 EMA, 21 EMA, 50 SMA

**Strong Uptrend:**
- Price > 9 EMA > 21 EMA > 50 SMA
- All MAs sloping upward
- Buy pullbacks to 21 EMA

**Strong Downtrend:**
- Price < 9 EMA < 21 EMA < 50 SMA
- All MAs sloping downward
- Sell rallies to 21 EMA

**Ranging Market:**
- MAs are flat and intertwined
- Avoid MA-based strategies
- Use oscillators instead

**Timeframe Alignment:**
1. Check daily chart MA direction (trend filter)
2. Use hourly chart for entry timing
3. Fine-tune with 15-min chart

**AlgoTrade Pro Implementation:**
In the strategy builder, add these conditions:
- Entry: "9 EMA crosses above 21 EMA"
- Filter: "Close above 50 SMA"
- Exit: "9 EMA crosses below 21 EMA"`,
        tip: 'Combining MA crossovers with RSI > 50 significantly improves win rate. Add this filter to your strategies.'
      }
    ],
    keyTakeaways: [
      'SMA gives equal weight to all prices; EMA weights recent prices more heavily',
      'Use longer MAs (50, 200) for trend direction; shorter MAs (9, 21) for timing',
      'Golden Cross (50 above 200) is bullish; Death Cross is bearish',
      'MAs work best in trending markets; avoid in sideways conditions'
    ],
    quiz: [
      {
        id: 'q1-ema-reaction',
        question: 'Which moving average reacts faster to price changes?',
        options: ['SMA', 'EMA', 'Both react equally', 'Depends on the period'],
        correctAnswer: 1,
        explanation: 'EMA reacts faster because it gives more weight to recent prices, making it more responsive to new price information.'
      },
      {
        id: 'q2-golden-cross',
        question: 'What is a Golden Cross?',
        options: [
          '50-day MA crosses below 200-day MA',
          '50-day MA crosses above 200-day MA',
          'Price crosses above 20-day MA',
          '9-day EMA crosses above 21-day EMA'
        ],
        correctAnswer: 1,
        explanation: 'A Golden Cross occurs when the 50-day moving average crosses above the 200-day moving average, signaling a potential long-term bullish trend.'
      },
      {
        id: 'q3-ma-support',
        question: 'In an uptrend, how does the 21 EMA typically act?',
        options: [
          'As resistance',
          'As dynamic support',
          'It has no significance',
          'As a sell signal'
        ],
        correctAnswer: 1,
        explanation: 'In an uptrend, the 21 EMA often acts as dynamic support, with prices bouncing off it during pullbacks.'
      }
    ],
    nextLessonId: 'rsi-indicator',
    prevLessonId: 'first-strategy'
  },
  {
    id: 'rsi-indicator',
    moduleId: 'technical-indicators',
    title: 'Relative Strength Index (RSI)',
    description: 'Learn to identify overbought and oversold conditions with RSI',
    duration: '14 min',
    difficulty: 'intermediate',
    introduction: 'The Relative Strength Index (RSI) is a momentum oscillator that measures the speed and magnitude of price changes. It helps identify overbought and oversold conditions, making it valuable for timing entries and exits.',
    sections: [
      {
        heading: 'RSI Calculation',
        body: `RSI oscillates between 0 and 100, measuring the magnitude of recent price changes.

**Formula:**
\`\`\`
RSI = 100 - (100 / (1 + RS))

Where:
RS = Average Gain / Average Loss
(over the lookback period)
\`\`\`

**Standard Settings:**
- Period: 14 (most common)
- Overbought: Above 70
- Oversold: Below 30

**Calculation Steps:**
1. Calculate price changes for each period
2. Separate gains and losses
3. Calculate average gain and average loss
4. Calculate RS (Relative Strength)
5. Calculate RSI

**Example:**
If average gain = 1.5 and average loss = 0.5:
- RS = 1.5 / 0.5 = 3
- RSI = 100 - (100 / (1 + 3)) = 75

This RSI of 75 indicates overbought conditions.`,
        tip: 'While 14-period is standard, try 7 for short-term trading and 21 for swing trading. Shorter periods = more sensitive.'
      },
      {
        heading: 'Overbought and Oversold',
        body: `**Overbought (RSI > 70):**
- Price has risen significantly
- May be due for a pullback
- NOT a sell signal by itself!

**Oversold (RSI < 30):**
- Price has fallen significantly
- May be due for a bounce
- NOT a buy signal by itself!

**Important Nuances:**

**In Strong Uptrends:**
- RSI can stay above 70 for extended periods
- Use 80 as overbought instead
- RSI dipping to 40-50 is a buying opportunity

**In Strong Downtrends:**
- RSI can stay below 30 for extended periods
- Use 20 as oversold instead
- RSI rising to 50-60 is a selling opportunity

**Trading Approach:**
Don't trade against the trend:
- In uptrend: Buy oversold bounces (RSI < 30)
- In downtrend: Sell overbought rallies (RSI > 70)
- Avoid buying overbought or selling oversold`,
        interactiveComponent: 'indicator-demo',
        warning: 'A stock can remain overbought or oversold much longer than you can remain solvent. Always wait for confirmation before trading.'
      },
      {
        heading: 'RSI Divergence',
        body: `Divergence occurs when price and RSI move in opposite directions, often signaling potential reversals.

**Bullish Divergence:**
- Price makes lower low
- RSI makes higher low
- Momentum weakening in downtrend
- Potential bottom/reversal

**Bearish Divergence:**
- Price makes higher high
- RSI makes lower high
- Momentum weakening in uptrend
- Potential top/reversal

**Trading Divergence:**
1. Identify divergence on chart
2. Wait for price confirmation (breakout, candlestick pattern)
3. Enter with stop below recent low (for bullish)
4. Target previous swing high

**Example - Bank NIFTY:**
\`\`\`
Jan 15: Price 44,000, RSI 25
Jan 22: Price 43,500, RSI 32 (higher RSI, lower price)
= Bullish divergence → Potential bottom
\`\`\`

**Hidden Divergence (Trend Continuation):**
- Bullish hidden: Higher low in price, lower low in RSI → Trend continues up
- Bearish hidden: Lower high in price, higher high in RSI → Trend continues down`,
        tip: 'Divergence works best on higher timeframes (daily, weekly). On lower timeframes, there are too many false signals.'
      },
      {
        heading: 'RSI Trading Strategies',
        body: `**Strategy 1: RSI Pullback (Trend Following)**
- Wait for RSI > 50 (confirms uptrend)
- Buy when RSI pulls back to 40-50 zone
- Stop-loss below recent swing low
- Target: New high or 2:1 R:R

**Strategy 2: RSI Reversal (Counter-Trend)**
- RSI below 30 (oversold)
- Wait for bullish candlestick pattern
- Buy with stop below the pattern
- Target: 50% retracement or RSI reaching 50

**Strategy 3: RSI + MA Combo**
- Price above 50 EMA (uptrend filter)
- RSI crosses above 30 (momentum turning up)
- Buy on the crossover
- Exit when RSI crosses below 70 or price closes below 50 EMA

**AlgoTrade Pro Entry Rules:**
\`\`\`
Condition 1: Close > SMA(50)
Condition 2: RSI(14) crosses above 30
Condition 3: RSI(14) < 50 (not overbought)

Exit: RSI(14) > 70 OR Close < SMA(50)
\`\`\`

**Timeframe Alignment:**
- Daily RSI for trend direction
- 4-hour RSI for entry timing
- Ensures you're trading with the bigger picture`,
        tip: 'Combine RSI with volume. RSI oversold + high volume = stronger bounce potential.'
      }
    ],
    keyTakeaways: [
      'RSI measures momentum on a 0-100 scale; 70+ is overbought, 30- is oversold',
      'Divergence between price and RSI often precedes reversals',
      'In strong trends, RSI can remain overbought/oversold for extended periods',
      'Combine RSI with trend filters (MA) for better signals'
    ],
    quiz: [
      {
        id: 'q1-rsi-range',
        question: 'What is the typical overbought level for RSI?',
        options: ['Above 50', 'Above 60', 'Above 70', 'Above 80'],
        correctAnswer: 2,
        explanation: 'The standard overbought level for RSI is 70. However, in strong uptrends, 80 may be more appropriate.'
      },
      {
        id: 'q2-bullish-divergence',
        question: 'Bullish divergence occurs when:',
        options: [
          'Price and RSI both make higher highs',
          'Price makes lower lows while RSI makes higher lows',
          'Price makes higher highs while RSI makes higher highs',
          'Both price and RSI fall together'
        ],
        correctAnswer: 1,
        explanation: 'Bullish divergence occurs when price makes a lower low but RSI makes a higher low, indicating weakening selling momentum.'
      },
      {
        id: 'q3-rsi-period',
        question: 'What is the most common period setting for RSI?',
        options: ['7 periods', '14 periods', '21 periods', '50 periods'],
        correctAnswer: 1,
        explanation: '14 periods is the standard RSI setting as developed by J. Welles Wilder. Shorter periods are more sensitive, longer periods are smoother.'
      }
    ],
    nextLessonId: 'macd-indicator',
    prevLessonId: 'sma-ema'
  },
  {
    id: 'macd-indicator',
    moduleId: 'technical-indicators',
    title: 'MACD: Moving Average Convergence Divergence',
    description: 'Understand MACD for trend and momentum analysis',
    duration: '16 min',
    difficulty: 'intermediate',
    introduction: 'MACD (Moving Average Convergence Divergence) is a versatile indicator that shows trend direction, momentum, and potential reversal points. It combines the benefits of moving averages with oscillator characteristics.',
    sections: [
      {
        heading: 'MACD Components',
        body: `MACD consists of three components displayed as lines and a histogram.

**1. MACD Line (Blue):**
\`\`\`
MACD Line = 12 EMA - 26 EMA
\`\`\`
- Measures short-term momentum vs medium-term momentum
- Positive when 12 EMA > 26 EMA (bullish)
- Negative when 12 EMA < 26 EMA (bearish)

**2. Signal Line (Orange/Red):**
\`\`\`
Signal Line = 9 EMA of MACD Line
\`\`\`
- Smoother version of MACD line
- Used for generating crossover signals
- Acts as a trigger for entries/exits

**3. MACD Histogram:**
\`\`\`
Histogram = MACD Line - Signal Line
\`\`\`
- Visual representation of momentum
- Green bars: MACD above Signal (bullish momentum)
- Red bars: MACD below Signal (bearish momentum)
- Bar height shows momentum strength

**Standard Settings:**
- Fast EMA: 12 periods
- Slow EMA: 26 periods
- Signal: 9 periods`,
        interactiveComponent: 'indicator-demo'
      },
      {
        heading: 'MACD Signals',
        body: `**1. Signal Line Crossover (Primary Signal)**

**Bullish Crossover:**
- MACD line crosses above Signal line
- Histogram turns from negative to positive
- Entry signal for long positions

**Bearish Crossover:**
- MACD line crosses below Signal line
- Histogram turns from positive to negative
- Exit long / Entry short signal

**2. Centerline Crossover (Trend Confirmation)**

**Bullish:**
- MACD crosses above zero line
- 12 EMA is now above 26 EMA
- Confirms uptrend

**Bearish:**
- MACD crosses below zero line
- 12 EMA is now below 26 EMA
- Confirms downtrend

**3. Histogram Analysis**

**Increasing Histogram (bars getting taller):**
- Momentum is strengthening
- Trend likely to continue

**Decreasing Histogram (bars getting shorter):**
- Momentum is weakening
- Potential reversal or consolidation ahead`,
        tip: 'The histogram often shows momentum changes before the actual crossover. Watch for shrinking bars as an early warning.'
      },
      {
        heading: 'MACD Divergence',
        body: `Like RSI, MACD can show divergence with price, often signaling reversals.

**Bullish Divergence:**
- Price: Lower low
- MACD: Higher low
- Signal: Selling momentum exhausted
- Action: Prepare for reversal up

**Bearish Divergence:**
- Price: Higher high
- MACD: Lower high
- Signal: Buying momentum exhausted
- Action: Prepare for reversal down

**Trading Divergence:**
1. Spot the divergence pattern
2. Wait for MACD histogram to shift (confirmation)
3. Enter when histogram bars turn (+ to - or - to +)
4. Stop-loss beyond recent extreme

**Example - NIFTY Daily:**
\`\`\`
Nov 1: Price 18,000 (high), MACD 150
Nov 15: Price 18,200 (higher high), MACD 120 (lower high)
= Bearish divergence → Potential top
\`\`\`

**Caution:**
Divergence can persist for a long time. Always wait for price confirmation before trading.`,
        warning: 'MACD divergence is more reliable on daily and weekly charts. Avoid trading divergence on charts below 1-hour.'
      },
      {
        heading: 'MACD Trading Strategies',
        body: `**Strategy 1: Classic Crossover**
- Buy: MACD crosses above Signal line
- Filter: MACD is above zero (uptrend)
- Stop: Below recent swing low
- Exit: MACD crosses below Signal line

**Strategy 2: Histogram Reversal**
- Wait for histogram to reach extreme (tall bars)
- Watch for bars to start shrinking
- Enter when first bar shrinks
- Catches moves earlier than crossover

**Strategy 3: MACD + RSI Combo**
- MACD above zero (trend filter)
- MACD crosses above Signal (momentum)
- RSI above 50 but below 70 (not overbought)
- Strong entry with multiple confirmations

**AlgoTrade Pro Implementation:**
\`\`\`
Entry Conditions:
1. MACD Line > 0 (uptrend)
2. MACD Line crosses above Signal Line
3. RSI(14) > 50

Exit Conditions:
1. MACD Line crosses below Signal Line
OR
2. RSI(14) > 75 (take profit)
\`\`\`

**Timeframe Considerations:**
- Daily MACD for position trading
- 4-hour MACD for swing trading
- 1-hour MACD for day trading (more noise)`,
        tip: 'MACD works best in trending markets. In sideways markets, it generates many false signals. Use ADX > 25 as a trend filter.'
      }
    ],
    keyTakeaways: [
      'MACD has three components: MACD line, Signal line, and Histogram',
      'Signal line crossovers are the primary entry/exit signals',
      'Centerline (zero) crossovers confirm trend direction',
      'Divergence between MACD and price can signal potential reversals'
    ],
    quiz: [
      {
        id: 'q1-macd-calc',
        question: 'How is the MACD line calculated?',
        options: [
          '26 EMA minus 12 EMA',
          '12 EMA minus 26 EMA',
          '12 SMA minus 26 SMA',
          '9 EMA of price'
        ],
        correctAnswer: 1,
        explanation: 'The MACD line is calculated by subtracting the 26-period EMA from the 12-period EMA.'
      },
      {
        id: 'q2-histogram',
        question: 'What does a shrinking MACD histogram indicate?',
        options: [
          'Trend is accelerating',
          'Momentum is weakening, potential reversal ahead',
          'Volume is decreasing',
          'The indicator is broken'
        ],
        correctAnswer: 1,
        explanation: 'A shrinking histogram means the MACD and Signal lines are converging, indicating weakening momentum and a potential reversal or consolidation.'
      },
      {
        id: 'q3-centerline',
        question: 'When MACD crosses above the zero line, what does it indicate?',
        options: [
          'Overbought conditions',
          'The 12 EMA has crossed above the 26 EMA (uptrend)',
          'Oversold conditions',
          'High volatility'
        ],
        correctAnswer: 1,
        explanation: 'When MACD crosses above zero, it means the 12 EMA is now above the 26 EMA, confirming bullish momentum and trend.'
      }
    ],
    nextLessonId: 'bollinger-bands',
    prevLessonId: 'rsi-indicator'
  },
  {
    id: 'bollinger-bands',
    moduleId: 'technical-indicators',
    title: 'Bollinger Bands',
    description: 'Use volatility bands for mean reversion and breakout trading',
    duration: '14 min',
    difficulty: 'intermediate',
    introduction: 'Bollinger Bands are volatility bands placed above and below a moving average. They expand and contract based on market volatility, making them versatile for both mean reversion and breakout strategies.',
    sections: [
      {
        heading: 'Bollinger Bands Calculation',
        body: `Bollinger Bands consist of three lines that adapt to volatility.

**Components:**
\`\`\`
Middle Band = 20-period SMA
Upper Band = Middle Band + (2 × Standard Deviation)
Lower Band = Middle Band - (2 × Standard Deviation)
\`\`\`

**Standard Settings:**
- Period: 20 (default)
- Standard Deviations: 2 (default)

**Why Standard Deviation?**
- Measures price volatility
- 2 standard deviations captures ~95% of price action
- Bands automatically widen in high volatility
- Bands contract in low volatility

**Interpreting Band Width:**

**Wide Bands:**
- High volatility period
- Large price swings expected
- Often after breakouts

**Narrow Bands (Squeeze):**
- Low volatility period
- Consolidation phase
- Breakout potential building`,
        interactiveComponent: 'indicator-demo'
      },
      {
        heading: 'Mean Reversion Trading',
        body: `Prices tend to revert to the mean (middle band) after touching the outer bands.

**Trading Logic:**
- Price at upper band → Overbought, may pull back
- Price at lower band → Oversold, may bounce
- Price returns to middle band (target)

**Mean Reversion Strategy:**

**Buy Signal:**
1. Price touches or closes below lower band
2. Wait for bullish candle (confirmation)
3. Enter long position
4. Stop-loss: 1-2% below lower band
5. Target: Middle band (20 SMA)

**Sell Signal:**
1. Price touches or closes above upper band
2. Wait for bearish candle (confirmation)
3. Enter short position
4. Stop-loss: 1-2% above upper band
5. Target: Middle band (20 SMA)

**Best Conditions:**
- Sideways/ranging markets
- Band width relatively stable
- No strong trend in place`,
        warning: 'Mean reversion fails in strong trends. Price can "walk the band" for extended periods in trending markets.'
      },
      {
        heading: 'Bollinger Band Squeeze',
        body: `The squeeze is one of the most powerful Bollinger Band patterns.

**What is a Squeeze?**
- Bands contract to narrow range
- Volatility at multi-week lows
- Precedes significant breakout

**Measuring the Squeeze:**
\`\`\`
Band Width = (Upper Band - Lower Band) / Middle Band

Squeeze = Band Width at 6-month low
\`\`\`

**Trading the Squeeze:**

**Setup:**
1. Identify squeeze (narrow bands)
2. Wait for expansion (bands start widening)
3. Enter in direction of breakout

**Long Entry:**
- Price closes above upper band
- Volume increases
- Stop-loss: Middle band or below lower band

**Short Entry:**
- Price closes below lower band
- Volume increases
- Stop-loss: Middle band or above upper band

**Example - RELIANCE:**
\`\`\`
Week 1-3: Bands contract, price in tight range
Week 4: Price breaks above upper band on high volume
Entry: ₹2,500 (above upper band)
Target: Previous resistance or 1.5× band width move
\`\`\``,
        tip: 'Combine Bollinger squeeze with volume. A breakout on low volume is likely false; high volume confirms the move.'
      },
      {
        heading: 'Advanced Bollinger Strategies',
        body: `**Double Bottom at Lower Band:**
- Price touches lower band twice
- Second touch has higher RSI (bullish divergence)
- Strong reversal signal
- Enter on break above middle band

**Band Walk (Trend Following):**
When price is trending strongly:
- In uptrend: Price walks along upper band
- In downtrend: Price walks along lower band
- Don't fight the trend!

**Pullback to Middle Band:**
- Price makes new high above upper band
- Pulls back to middle band (20 SMA)
- Middle band acts as support
- Entry opportunity in direction of trend

**Bollinger + RSI Combination:**
\`\`\`
Buy when:
- Price at or below lower band
- RSI below 30
- Bullish candlestick pattern

Sell when:
- Price at or above upper band
- RSI above 70
- Bearish candlestick pattern
\`\`\`

**AlgoTrade Pro Implementation:**
\`\`\`
Entry (Long):
1. Close < Lower Bollinger Band
2. RSI(14) < 35
3. Wait for Close > Previous Close (confirmation)

Exit:
1. Close > Middle Band (target)
OR
2. RSI(14) > 60
\`\`\``,
        tip: 'Use 2.5 or 3 standard deviations for more extreme signals with higher probability but fewer trades.'
      }
    ],
    keyTakeaways: [
      'Bollinger Bands adapt to volatility using standard deviation',
      'Mean reversion works in ranging markets; price returns to middle band',
      'The squeeze (narrow bands) often precedes significant breakouts',
      'In trends, price can walk along the bands - don\'t fight it'
    ],
    quiz: [
      {
        id: 'q1-bb-calc',
        question: 'What is the standard deviation multiplier for Bollinger Bands?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1,
        explanation: 'Standard Bollinger Bands use 2 standard deviations from the 20-period SMA, capturing approximately 95% of price action.'
      },
      {
        id: 'q2-squeeze',
        question: 'What does a Bollinger Band squeeze indicate?',
        options: [
          'Strong trend in progress',
          'Low volatility, potential breakout ahead',
          'Overbought conditions',
          'Oversold conditions'
        ],
        correctAnswer: 1,
        explanation: 'A squeeze occurs when bands contract, indicating low volatility. This consolidation often precedes a significant price breakout.'
      },
      {
        id: 'q3-band-walk',
        question: 'In a strong uptrend, where does price typically trade relative to Bollinger Bands?',
        options: [
          'Below the lower band',
          'Around the middle band',
          'Along or above the upper band',
          'Oscillating between bands'
        ],
        correctAnswer: 2,
        explanation: 'In strong uptrends, price often "walks" along the upper band, with the middle band acting as support during pullbacks.'
      }
    ],
    nextLessonId: 'atr-indicator',
    prevLessonId: 'macd-indicator'
  },
  {
    id: 'atr-indicator',
    moduleId: 'technical-indicators',
    title: 'ATR: Average True Range',
    description: 'Measure volatility and set intelligent stop-losses with ATR',
    duration: '12 min',
    difficulty: 'intermediate',
    introduction: 'Average True Range (ATR) measures market volatility by calculating the average range between high and low prices. It\'s essential for setting stop-losses and position sizing based on current market conditions.',
    sections: [
      {
        heading: 'ATR Calculation',
        body: `ATR measures the "true range" of price movement, accounting for gaps.

**True Range (TR) - Greatest of:**
\`\`\`
1. Current High - Current Low
2. |Current High - Previous Close|
3. |Current Low - Previous Close|
\`\`\`

**ATR Formula:**
\`\`\`
ATR = 14-period average of True Range
(usually exponential or simple average)
\`\`\`

**Why Three Calculations?**
- Accounts for gaps between sessions
- Captures full range of price movement
- More accurate than just high-low

**Example:**
\`\`\`
Previous Close: ₹100
Current High: ₹106
Current Low: ₹99

TR Calculations:
1. 106 - 99 = ₹7
2. |106 - 100| = ₹6
3. |99 - 100| = ₹1

True Range = ₹7 (highest value)
\`\`\``,
        tip: 'ATR doesn\'t indicate direction, only volatility magnitude. High ATR means larger moves (up or down), not necessarily bullish or bearish.'
      },
      {
        heading: 'Using ATR for Stop-Losses',
        body: `ATR-based stops adapt to current volatility, preventing premature exits.

**The Problem with Fixed % Stops:**
- 2% stop may be too tight in volatile stock
- 2% stop may be too wide in calm stock
- Doesn't adapt to market conditions

**ATR-Based Stop Formula:**
\`\`\`
Stop-Loss = Entry Price - (Multiplier × ATR)

Common Multipliers:
- Aggressive: 1.5 × ATR
- Moderate: 2.0 × ATR
- Conservative: 3.0 × ATR
\`\`\`

**Example - RELIANCE:**
\`\`\`
Entry: ₹2,500
14-day ATR: ₹50
Stop Multiplier: 2×

Stop-Loss = ₹2,500 - (2 × ₹50) = ₹2,400

This gives the trade room to breathe based on 
RELIANCE's actual volatility.
\`\`\`

**ATR Trailing Stop:**
- Calculate stop level each day
- Move stop up only (for longs)
- Locks in profits while giving room`,
        warning: 'ATR changes daily. Recalculate or use a fixed ATR value from entry for consistency during the trade.'
      },
      {
        heading: 'ATR for Position Sizing',
        body: `Use ATR to standardize risk across different stocks.

**The Problem:**
- INFY might move ₹30/day (ATR)
- TCS might move ₹80/day (ATR)
- Same ₹ position has different risk

**ATR-Based Position Sizing:**
\`\`\`
Risk Amount = Capital × Risk %
Stop Distance = ATR × Multiplier
Position Size = Risk Amount / Stop Distance
\`\`\`

**Example:**
\`\`\`
Capital: ₹5,00,000
Risk per trade: 1% = ₹5,000
Stock ATR: ₹25
Stop: 2 × ATR = ₹50

Position Size = ₹5,000 / ₹50 = 100 shares

If stock price is ₹500:
Trade Value = 100 × ₹500 = ₹50,000
This equals 10% of capital with 1% risk
\`\`\`

**Volatility Normalization:**
Using ATR ensures each trade has similar risk profile regardless of the stock's volatility characteristics.`,
        interactiveComponent: 'risk-calculator'
      },
      {
        heading: 'ATR Trading Applications',
        body: `**1. Identifying Volatility Regimes:**
- ATR increasing → Volatility expanding
- ATR decreasing → Volatility contracting
- Low ATR → Potential breakout coming

**2. Filtering Trade Signals:**
\`\`\`
If current range > 1.5 × ATR:
  Skip the trade (abnormal day)
  
If current range < 0.5 × ATR:
  Wait for more action
\`\`\`

**3. Profit Targets:**
\`\`\`
Target = Entry + (2 × ATR) to (3 × ATR)
Gives realistic target based on what stock can move
\`\`\`

**4. Breakout Confirmation:**
\`\`\`
Valid breakout:
- Price moves beyond range by 0.5 × ATR
- ATR is expanding (volatility increase)
\`\`\`

**AlgoTrade Pro ATR Settings:**
\`\`\`
Entry Filter:
- Only trade if 14-day ATR > ₹10 (min volatility)
- Only trade if 14-day ATR < ₹100 (max volatility)

Stop-Loss:
- Type: ATR-based
- Multiplier: 2.0
- Period: 14

Position Sizing:
- Risk: 1% of capital
- ATR multiplier: 2.0
\`\`\``,
        tip: 'Compare current ATR to its 20-day average. High relative ATR often follows news and may not be sustainable.'
      }
    ],
    keyTakeaways: [
      'ATR measures volatility, not direction - useful for risk management',
      'Use ATR-based stops (typically 2× ATR) instead of fixed percentages',
      'ATR helps normalize position sizes across stocks with different volatilities',
      'Low ATR often precedes breakouts; high ATR may indicate extreme conditions'
    ],
    quiz: [
      {
        id: 'q1-atr-use',
        question: 'What is the primary use of ATR in trading?',
        options: [
          'Predicting price direction',
          'Measuring volatility for stop-losses and position sizing',
          'Identifying overbought conditions',
          'Calculating moving averages'
        ],
        correctAnswer: 1,
        explanation: 'ATR measures volatility magnitude, making it ideal for setting stop-losses that adapt to market conditions and normalizing position sizes.'
      },
      {
        id: 'q2-atr-stop',
        question: 'If ATR is ₹30 and you use a 2× ATR stop, what is your stop distance from entry?',
        options: ['₹15', '₹30', '₹60', '₹90'],
        correctAnswer: 2,
        explanation: '2 × ATR = 2 × ₹30 = ₹60. Your stop-loss would be placed ₹60 below your entry (for long positions).'
      },
      {
        id: 'q3-low-atr',
        question: 'What does a decreasing ATR typically indicate?',
        options: [
          'Strong uptrend',
          'Strong downtrend',
          'Volatility contracting, potential breakout ahead',
          'Overbought conditions'
        ],
        correctAnswer: 2,
        explanation: 'Decreasing ATR indicates contracting volatility, often a sign of consolidation. This frequently precedes a significant breakout.'
      }
    ],
    nextLessonId: 'stochastic-indicator',
    prevLessonId: 'bollinger-bands'
  },
  {
    id: 'stochastic-indicator',
    moduleId: 'technical-indicators',
    title: 'Stochastic Oscillator',
    description: 'Use the stochastic for momentum and overbought/oversold signals',
    duration: '12 min',
    difficulty: 'intermediate',
    introduction: 'The Stochastic Oscillator compares a stock\'s closing price to its price range over a specific period. It\'s excellent for identifying overbought/oversold conditions and momentum shifts.',
    sections: [
      {
        heading: 'Stochastic Calculation',
        body: `The Stochastic measures where the current close is relative to the recent range.

**%K Formula (Fast Stochastic):**
\`\`\`
%K = ((Close - Lowest Low) / (Highest High - Lowest Low)) × 100

Where:
- Lookback period: typically 14 days
- Lowest Low: Lowest low in the period
- Highest High: Highest high in the period
\`\`\`

**%D Formula (Signal Line):**
\`\`\`
%D = 3-period SMA of %K
\`\`\`

**Example:**
\`\`\`
14-day High: ₹110
14-day Low: ₹90
Current Close: ₹105

%K = ((105 - 90) / (110 - 90)) × 100
%K = (15 / 20) × 100 = 75%

Close is 75% of the way between the low and high.
\`\`\`

**Standard Settings:**
- %K period: 14
- %D period: 3
- Overbought: > 80
- Oversold: < 20`,
        interactiveComponent: 'indicator-demo'
      },
      {
        heading: 'Fast vs Slow Stochastic',
        body: `**Fast Stochastic:**
- Raw %K and 3-period %D
- Very sensitive to price changes
- More signals, more noise
- Good for short-term trading

**Slow Stochastic (More Common):**
- %K smoothed with 3-period SMA
- %D is 3-period SMA of smoothed %K
- Fewer signals, less noise
- Standard for most trading

**Full Stochastic:**
- Allows customization of smoothing
- %K: X-period SMA of Fast %K
- %D: Y-period SMA of %K
- Most flexible option

**Recommendation:**
Use Slow Stochastic (14, 3, 3) for most trading. Switch to Fast for scalping or very short-term trades.`,
        tip: 'Most charting platforms show Slow Stochastic by default. Verify your settings before trading.'
      },
      {
        heading: 'Stochastic Trading Signals',
        body: `**Overbought/Oversold:**
- %K > 80: Overbought (potential sell)
- %K < 20: Oversold (potential buy)
- NOT instant signals - wait for confirmation

**%K/%D Crossovers:**

**Bullish Crossover:**
- %K crosses above %D
- Stronger when in oversold zone (< 20)
- Entry signal for longs

**Bearish Crossover:**
- %K crosses below %D
- Stronger when in overbought zone (> 80)
- Exit longs / Entry shorts

**Divergence (Like RSI):**

**Bullish Divergence:**
- Price: Lower low
- Stochastic: Higher low
- Signal: Selling exhaustion

**Bearish Divergence:**
- Price: Higher high
- Stochastic: Lower high
- Signal: Buying exhaustion`,
        warning: 'In strong trends, Stochastic can stay overbought/oversold for extended periods. Don\'t sell just because %K is at 80.'
      },
      {
        heading: 'Stochastic Trading Strategies',
        body: `**Strategy 1: Oversold Bounce**
\`\`\`
Conditions:
1. Stochastic %K < 20
2. %K crosses above %D
3. Price above 50 SMA (uptrend filter)

Entry: Next candle open
Stop: Below recent swing low
Target: 2:1 risk-reward
\`\`\`

**Strategy 2: Trend Pullback**
\`\`\`
In Uptrend (price > 50 SMA):
1. Wait for Stochastic to drop to 20-30
2. Buy when %K turns up (crosses above %D)
3. Stop below the pullback low
4. Ride the trend continuation
\`\`\`

**Strategy 3: Stochastic + RSI Combo**
\`\`\`
Buy Signal:
- RSI < 35 (oversold)
- Stochastic %K < 25 (oversold)
- Both turning up together
- Strong confluence = high probability

Sell Signal:
- RSI > 65 (overbought)
- Stochastic %K > 75 (overbought)
- Both turning down together
\`\`\`

**Timeframe Tips:**
- Daily: Best for swing trades
- Hourly: Good for day trading
- 15-min: Many false signals, use with trend filter

**Stochastic Pop:**
When %K rises from < 20 to > 80 quickly:
- Shows strong momentum surge
- Often start of new trend
- Consider following the momentum`,
        tip: 'Stochastic works best in ranging markets. In trending markets, combine with MA trend filter.'
      }
    ],
    keyTakeaways: [
      'Stochastic shows where price closed relative to its recent range',
      '%K above 80 is overbought; below 20 is oversold',
      '%K/%D crossovers in extreme zones provide entry signals',
      'Works best in ranging markets; add trend filter for trending markets'
    ],
    quiz: [
      {
        id: 'q1-stoch-calc',
        question: 'What does the Stochastic %K measure?',
        options: [
          'Volume relative to average',
          'Price momentum',
          'Where current close is relative to the recent high-low range',
          'Trend direction'
        ],
        correctAnswer: 2,
        explanation: '%K measures where the current closing price sits within the recent trading range, expressed as a percentage from 0 to 100.'
      },
      {
        id: 'q2-bullish-cross',
        question: 'When is a Stochastic bullish crossover most reliable?',
        options: [
          'When %K is at 50',
          'When %K is above 80',
          'When %K is below 20 (oversold zone)',
          'It doesn\'t matter where'
        ],
        correctAnswer: 2,
        explanation: 'Bullish crossovers (%K crossing above %D) are most reliable in the oversold zone (below 20), as they indicate a potential reversal from oversold conditions.'
      },
      {
        id: 'q3-slow-stoch',
        question: 'What is the difference between Fast and Slow Stochastic?',
        options: [
          'Fast uses more periods',
          'Slow Stochastic smooths %K, resulting in fewer signals',
          'They are the same',
          'Slow is faster'
        ],
        correctAnswer: 1,
        explanation: 'Slow Stochastic applies smoothing to the %K line, reducing noise and false signals compared to the more volatile Fast Stochastic.'
      }
    ],
    nextLessonId: 'vwap-indicator',
    prevLessonId: 'atr-indicator'
  },
  {
    id: 'vwap-indicator',
    moduleId: 'technical-indicators',
    title: 'VWAP: Volume Weighted Average Price',
    description: 'Master the institutional benchmark for intraday trading',
    duration: '11 min',
    difficulty: 'intermediate',
    introduction: 'VWAP (Volume Weighted Average Price) is the average price weighted by volume throughout the day. It\'s the benchmark institutions use and a powerful tool for intraday traders.',
    sections: [
      {
        heading: 'VWAP Calculation',
        body: `VWAP calculates the average price paid for a stock, weighted by volume.

**Formula:**
\`\`\`
VWAP = Σ(Price × Volume) / Σ(Volume)

Cumulative from market open to current time
\`\`\`

**Step-by-Step:**
1. Calculate typical price: (High + Low + Close) / 3
2. Multiply by volume
3. Add to running total
4. Divide by cumulative volume

**Example:**
\`\`\`
Period 1: Price ₹100, Volume 1000
Period 2: Price ₹102, Volume 2000
Period 3: Price ₹98, Volume 1500

VWAP = (100×1000 + 102×2000 + 98×1500) / (1000+2000+1500)
     = (100000 + 204000 + 147000) / 4500
     = ₹100.22
\`\`\`

**Key Characteristics:**
- Resets at market open each day
- Only meaningful for intraday trading
- Smoother than price (less noise)
- Weighted toward high-volume periods`,
        tip: 'VWAP is most relevant for liquid stocks with consistent volume. Avoid using it for illiquid stocks.'
      },
      {
        heading: 'Why VWAP Matters',
        body: `**Institutional Benchmark:**
- Large orders executed near VWAP are considered "good fills"
- Institutions often benchmark traders against VWAP
- Creates natural support/resistance

**Market Interpretation:**

**Price Above VWAP:**
- Buyers are paying above-average prices
- Bullish intraday bias
- Pullbacks to VWAP may find support

**Price Below VWAP:**
- Sellers are getting below-average prices
- Bearish intraday bias
- Rallies to VWAP may find resistance

**Price at VWAP:**
- Fair value for the day
- Often battleground zone
- Breakout or rejection likely

**Volume Confirmation:**
- High volume moves away from VWAP = Strong
- Low volume moves away from VWAP = Weak
- Volume climax at VWAP = Important level`,
        warning: 'VWAP loses significance near market close as most of the day\'s volume has been established. Focus on VWAP signals in the first 4 hours.'
      },
      {
        heading: 'VWAP Trading Strategies',
        body: `**Strategy 1: VWAP Bounce (Trend Trading)**
\`\`\`
Setup (Bullish):
1. Price opens above VWAP
2. Pulls back to touch VWAP
3. Holds at VWAP with bullish candle
4. Buy the bounce

Stop: Below VWAP
Target: Previous high or VWAP + (Entry - VWAP)
\`\`\`

**Strategy 2: VWAP Breakout**
\`\`\`
Setup:
1. Price consolidates near VWAP
2. Volume builds (compression)
3. Strong break above/below VWAP
4. Enter in direction of break

Confirmation: Volume spike on breakout
\`\`\`

**Strategy 3: VWAP Reversal**
\`\`\`
Setup (Short):
1. Price gaps up significantly (3%+)
2. Opens way above VWAP
3. Fails to hold highs
4. Breaks below opening range

Target: VWAP (mean reversion)
This is called "fading the gap"
\`\`\`

**VWAP Bands:**
Some traders add standard deviation bands around VWAP:
- 1 SD: ~68% of price action
- 2 SD: ~95% of price action
- Touch 2SD = Extreme, potential reversal`,
        tip: 'Trade in direction of VWAP slope. Upward sloping VWAP = bullish; downward sloping = bearish.'
      },
      {
        heading: 'VWAP in Indian Markets',
        body: `**Best Timeframes:**
- Primary: 1-minute and 5-minute charts
- Signal: 15-minute chart
- Not useful on daily/weekly charts

**When to Use VWAP:**

**High Effectiveness:**
- Index stocks (NIFTY 50 constituents)
- Bank NIFTY components
- High ADV (Average Daily Volume) stocks

**Low Effectiveness:**
- Small-cap stocks
- Illiquid stocks
- Pre/post market hours

**Indian Market Timing:**
\`\`\`
9:15-9:30: VWAP still establishing (avoid)
9:30-11:00: Best VWAP signals (highest volume)
11:00-2:00: VWAP established, use for support/resistance
2:00-3:30: VWAP becomes stale, focus on closing
\`\`\`

**Combining with Other Tools:**
\`\`\`
Long Entry:
1. Price > VWAP (bullish)
2. Price pulls back to VWAP
3. RSI > 50 (momentum confirmation)
4. Volume on bounce > average

Short Entry:
1. Price < VWAP (bearish)
2. Price rallies to VWAP
3. RSI < 50 (momentum confirmation)
4. Rejection candle at VWAP
\`\`\``,
        tip: 'VWAP is particularly powerful during the first hour when it establishes the day\'s value area. Watch for price to test and react to VWAP during this time.'
      }
    ],
    keyTakeaways: [
      'VWAP is the volume-weighted average price, resetting daily',
      'Institutions benchmark execution against VWAP - it creates natural support/resistance',
      'Trade in direction of VWAP slope and use bounces off VWAP as entries',
      'Most effective in first 4 hours; loses significance near close'
    ],
    quiz: [
      {
        id: 'q1-vwap-reset',
        question: 'When does VWAP reset?',
        options: [
          'It never resets',
          'At market open each day',
          'Every hour',
          'At the end of each week'
        ],
        correctAnswer: 1,
        explanation: 'VWAP resets at market open each trading day, making it purely an intraday indicator.'
      },
      {
        id: 'q2-above-vwap',
        question: 'What does price trading above VWAP generally indicate?',
        options: [
          'Bearish sentiment',
          'Buyers are paying above-average prices, bullish bias',
          'The stock is overvalued',
          'Low volume'
        ],
        correctAnswer: 1,
        explanation: 'When price is above VWAP, buyers are willing to pay more than the day\'s average, indicating bullish intraday sentiment.'
      },
      {
        id: 'q3-vwap-liquid',
        question: 'For which stocks is VWAP most effective?',
        options: [
          'Illiquid small-cap stocks',
          'Stocks with inconsistent volume',
          'High-volume, liquid stocks like NIFTY 50 constituents',
          'All stocks equally'
        ],
        correctAnswer: 2,
        explanation: 'VWAP is most meaningful for high-volume, liquid stocks where institutional participation is significant and volume is consistent.'
      }
    ],
    nextLessonId: 'obv-indicator',
    prevLessonId: 'stochastic-indicator'
  },
  {
    id: 'obv-indicator',
    moduleId: 'technical-indicators',
    title: 'OBV: On-Balance Volume',
    description: 'Track smart money with volume analysis',
    duration: '10 min',
    difficulty: 'intermediate',
    introduction: 'On-Balance Volume (OBV) uses volume flow to predict price movements. It\'s based on the idea that volume precedes price - smart money accumulates before price rises and distributes before price falls.',
    sections: [
      {
        heading: 'OBV Calculation',
        body: `OBV is a cumulative indicator that adds or subtracts volume based on price direction.

**Rules:**
\`\`\`
If Close > Previous Close:
  OBV = Previous OBV + Current Volume

If Close < Previous Close:
  OBV = Previous OBV - Current Volume

If Close = Previous Close:
  OBV = Previous OBV (unchanged)
\`\`\`

**Example:**
\`\`\`
Day 1: Close ₹100, Volume 1,000,000 → OBV = 1,000,000
Day 2: Close ₹102, Volume 1,200,000 → OBV = 2,200,000 (up day, add)
Day 3: Close ₹101, Volume 800,000 → OBV = 1,400,000 (down day, subtract)
Day 4: Close ₹103, Volume 1,500,000 → OBV = 2,900,000 (up day, add)
\`\`\`

**Key Insight:**
The absolute OBV value doesn't matter - only the trend matters.
- Rising OBV = Buying pressure (accumulation)
- Falling OBV = Selling pressure (distribution)`,
        tip: 'Focus on OBV direction, not the actual number. A rising OBV line means more volume is flowing into up days than down days.'
      },
      {
        heading: 'Reading OBV Signals',
        body: `**Confirmation Signals:**

**Bullish Confirmation:**
- Price making higher highs
- OBV making higher highs
- Volume supporting the move
- Trend likely to continue

**Bearish Confirmation:**
- Price making lower lows
- OBV making lower lows
- Volume supporting the decline
- Trend likely to continue

**Divergence Signals (More Powerful):**

**Bullish Divergence:**
- Price: Lower low or flat
- OBV: Higher high
- Smart money accumulating
- Potential bottom/reversal

**Bearish Divergence:**
- Price: Higher high or flat
- OBV: Lower high
- Smart money distributing
- Potential top/reversal

**Example - HDFC Bank:**
\`\`\`
Week 1: Price ₹1,600, OBV rising
Week 2: Price ₹1,580 (lower), OBV still rising
Week 3: Price ₹1,590, OBV making new high

= Bullish divergence → Price likely to follow OBV up
\`\`\``,
        interactiveComponent: 'indicator-demo'
      },
      {
        heading: 'OBV Trading Strategies',
        body: `**Strategy 1: OBV Breakout Confirmation**
\`\`\`
Setup:
1. Price consolidating near resistance
2. OBV trending higher during consolidation
3. Price breaks out above resistance
4. OBV confirms with new high

Entry: Breakout candle close
Stop: Below consolidation low
Target: Measured move (resistance + consolidation height)
\`\`\`

**Strategy 2: OBV Divergence Trade**
\`\`\`
Bullish Setup:
1. Price makes lower low
2. OBV makes higher low
3. Wait for price to break above recent high
4. Enter on breakout

Stop: Below divergence low
Target: 2:1 or previous swing high
\`\`\`

**Strategy 3: OBV Trend Line**
Draw trend lines on OBV:
- OBV breaking above falling trend line = Bullish
- OBV breaking below rising trend line = Bearish
- Often leads price breakout by 1-3 days

**Combining OBV with Other Tools:**
\`\`\`
Strong Buy Signal:
1. OBV making new high
2. Price above 20 EMA
3. RSI > 50
4. MACD above zero

Avoid signals with conflicting OBV (price up, OBV down)
\`\`\``,
        tip: 'OBV breakouts often precede price breakouts. If OBV breaks to new highs while price is still consolidating, prepare for a move.'
      },
      {
        heading: 'OBV Limitations and Tips',
        body: `**Limitations:**

**1. Gap Days:**
A gap up on low volume adds all volume to OBV
- Can distort the indicator
- Consider gaps separately

**2. Illiquid Stocks:**
- Erratic volume skews OBV
- Best used on liquid stocks

**3. No Absolute Levels:**
- Unlike RSI, no overbought/oversold
- Only relative comparison matters

**Best Practices:**

**Use Multiple Timeframes:**
- Daily OBV for swing trading trend
- Weekly OBV for position trading confirmation
- Look for alignment across timeframes

**Combine with Price Action:**
- OBV divergence + candlestick pattern = Stronger signal
- OBV breakout + price breakout = Confirmation

**Sector Comparison:**
- Compare stock OBV to sector OBV
- Outperformance: Stock OBV rising faster than sector
- Underperformance: Stock OBV lagging sector

**Watch for Accumulation Patterns:**
\`\`\`
Signs of Smart Money Buying:
- Price flat or slightly down
- OBV trending up steadily
- Low volume on down days
- High volume on up days
\`\`\``,
        warning: 'OBV is a confirming indicator, not a primary signal generator. Always use with price action and other tools.'
      }
    ],
    keyTakeaways: [
      'OBV adds volume on up days and subtracts on down days - tracks cumulative buying/selling pressure',
      'Rising OBV = accumulation; falling OBV = distribution',
      'OBV divergence from price often precedes major reversals',
      'OBV breakouts can signal price breakouts before they happen'
    ],
    quiz: [
      {
        id: 'q1-obv-calc',
        question: 'If today\'s close is higher than yesterday\'s, what happens to OBV?',
        options: [
          'Today\'s volume is subtracted from OBV',
          'Today\'s volume is added to OBV',
          'OBV remains unchanged',
          'OBV is reset to zero'
        ],
        correctAnswer: 1,
        explanation: 'When price closes higher than the previous close, today\'s volume is added to OBV, representing buying pressure.'
      },
      {
        id: 'q2-bullish-div',
        question: 'Bullish OBV divergence occurs when:',
        options: [
          'Price and OBV both rise',
          'Price and OBV both fall',
          'Price makes lower lows while OBV makes higher lows',
          'OBV falls while price rises'
        ],
        correctAnswer: 2,
        explanation: 'Bullish divergence shows price making lower lows (weakening) while OBV makes higher lows (accumulation), suggesting a potential reversal upward.'
      },
      {
        id: 'q3-obv-focus',
        question: 'What should you focus on when analyzing OBV?',
        options: [
          'The absolute OBV value',
          'The direction/trend of OBV',
          'Specific overbought/oversold levels',
          'Daily OBV changes only'
        ],
        correctAnswer: 1,
        explanation: 'The absolute value of OBV is meaningless. What matters is the direction - is OBV trending up (accumulation) or down (distribution)?'
      }
    ],
    nextLessonId: 'position-sizing-lesson',
    prevLessonId: 'vwap-indicator'
  }
];

// ============================================
// MODULE 3: RISK MANAGEMENT
// ============================================

const riskManagementLessons: LessonContent[] = [
  {
    id: 'position-sizing-lesson',
    moduleId: 'risk-management',
    title: 'Position Sizing Mastery',
    description: 'Calculate optimal position sizes to protect capital',
    duration: '15 min',
    difficulty: 'intermediate',
    introduction: 'Position sizing is arguably the most important aspect of trading. It determines how much capital to allocate to each trade, ensuring you survive losing streaks while maximizing gains on winning trades.',
    sections: [
      {
        heading: 'The 1-2% Rule',
        body: `The most fundamental risk management rule: never risk more than 1-2% of your capital on a single trade.

**Why 1-2%?**
- 10 consecutive losses at 2% = 18% drawdown (survivable)
- 10 consecutive losses at 10% = 65% drawdown (account devastation)
- Allows for normal losing streaks without ruin

**Calculating Risk Amount:**
\`\`\`
Risk Amount = Account Capital × Risk Percentage

Example:
Account: ₹5,00,000
Risk: 1%
Risk per trade: ₹5,000

This means your stop-loss should not result in 
more than ₹5,000 loss.
\`\`\`

**Adjusting Risk Based on Conditions:**
- New strategy, still testing: 0.5%
- Proven strategy, high confidence: 1-2%
- Multiple positions: Total risk should not exceed 5-6%`,
        tip: 'Start with 0.5-1% risk when you\'re new. Increase only after proving consistent profitability over 50+ trades.'
      },
      {
        heading: 'Calculating Position Size',
        body: `Position size depends on your risk amount and stop-loss distance.

**Formula:**
\`\`\`
Position Size = Risk Amount / Risk Per Share
Risk Per Share = Entry Price - Stop-Loss Price
\`\`\`

**Step-by-Step Example:**
\`\`\`
Account: ₹5,00,000
Risk: 1% = ₹5,000
Entry: ₹500
Stop-Loss: ₹475

Risk Per Share = ₹500 - ₹475 = ₹25
Position Size = ₹5,000 / ₹25 = 200 shares
Trade Value = 200 × ₹500 = ₹1,00,000 (20% of capital)

If stopped out: Loss = 200 × ₹25 = ₹5,000 (exactly 1%)
\`\`\`

**Position Size Calculator:**
\`\`\`
Inputs:
- Account Capital: ₹___
- Risk %: ___
- Entry Price: ₹___
- Stop-Loss: ₹___

Outputs:
- Shares: ___
- Trade Value: ₹___
- Max Loss: ₹___
\`\`\``,
        interactiveComponent: 'risk-calculator'
      },
      {
        heading: 'ATR-Based Position Sizing',
        body: `Using ATR makes position sizing adapt to market volatility.

**Standard Method:**
\`\`\`
Stop Distance = 2 × ATR(14)
Position Size = Risk Amount / Stop Distance
\`\`\`

**Example:**
\`\`\`
Account: ₹5,00,000
Risk: 1% = ₹5,000
Stock Price: ₹1,000
ATR(14): ₹30
Stop Distance: 2 × ₹30 = ₹60

Position Size = ₹5,000 / ₹60 = 83 shares
Trade Value = 83 × ₹1,000 = ₹83,000
\`\`\`

**Volatility Normalization:**
Different stocks have different volatility. ATR normalizes:

| Stock | Price | ATR | 2×ATR | Shares (₹5K risk) |
|-------|-------|-----|-------|-------------------|
| RELIANCE | ₹2,500 | ₹50 | ₹100 | 50 |
| INFY | ₹1,500 | ₹25 | ₹50 | 100 |
| HDFC | ₹1,600 | ₹40 | ₹80 | 62 |

All trades have same ₹5,000 risk despite different volatility!`,
        tip: 'ATR-based sizing is superior to fixed percentage stops. It automatically adjusts for each stock\'s behavior.'
      },
      {
        heading: 'Kelly Criterion (Advanced)',
        body: `The Kelly Criterion calculates the optimal bet size to maximize long-term growth.

**Formula:**
\`\`\`
Kelly % = W - ((1 - W) / R)

Where:
W = Win rate (as decimal)
R = Risk-Reward ratio (average win / average loss)
\`\`\`

**Example:**
\`\`\`
Win Rate: 55% (0.55)
Average Win: ₹3,000
Average Loss: ₹1,500
R = 3,000 / 1,500 = 2

Kelly % = 0.55 - ((1 - 0.55) / 2)
Kelly % = 0.55 - 0.225 = 0.325 = 32.5%
\`\`\`

**Half Kelly:**
Full Kelly is too aggressive for most traders. Use Half Kelly (16.25% in above example) for:
- Smoother equity curve
- Less psychological stress
- Buffer for estimation errors

**When to Use Kelly:**
- Only with proven strategies (100+ trades)
- Must have accurate win rate and R:R data
- Not for beginners - stick to 1-2% rule

**AlgoTrade Pro Position Sizing:**
Configure in Platform:
1. Fixed percentage (1-2%)
2. ATR-based with multiplier
3. Kelly with half-Kelly option
4. Maximum position size cap`,
        warning: 'Never use full Kelly - the formula assumes perfect knowledge of win rate and R:R. Real trading always has uncertainty.'
      }
    ],
    keyTakeaways: [
      'Never risk more than 1-2% of capital per trade',
      'Position size = Risk Amount / (Entry - Stop-Loss)',
      'ATR-based sizing adapts to each stock\'s volatility',
      'Kelly Criterion maximizes growth but use Half Kelly for safety'
    ],
    quiz: [
      {
        id: 'q1-risk-pct',
        question: 'What is the maximum recommended risk per trade for most traders?',
        options: ['0.1%', '1-2%', '5-10%', '20%'],
        correctAnswer: 1,
        explanation: 'The 1-2% rule is the gold standard for risk management. It allows surviving losing streaks while maintaining meaningful position sizes.'
      },
      {
        id: 'q2-position-size',
        question: 'If risk is ₹5,000, entry is ₹100, and stop-loss is ₹95, how many shares to buy?',
        options: ['50', '100', '500', '1000'],
        correctAnswer: 1,
        explanation: 'Risk per share = ₹100 - ₹95 = ₹5. Position size = ₹5,000 / ₹5 = 1,000 shares.'
      },
      {
        id: 'q3-atr-benefit',
        question: 'Why use ATR for position sizing?',
        options: [
          'It guarantees profits',
          'It adapts to each stock\'s volatility',
          'It makes calculations easier',
          'It\'s required by SEBI'
        ],
        correctAnswer: 1,
        explanation: 'ATR-based position sizing normalizes risk across stocks with different volatility characteristics, ensuring consistent risk per trade.'
      }
    ],
    nextLessonId: 'stop-loss-strategies',
    prevLessonId: 'obv-indicator'
  },
  {
    id: 'stop-loss-strategies',
    moduleId: 'risk-management',
    title: 'Stop-Loss Strategies',
    description: 'Protect capital with intelligent stop-loss placement',
    duration: '14 min',
    difficulty: 'intermediate',
    introduction: 'A stop-loss is your insurance policy against catastrophic losses. Proper stop-loss placement is the difference between a manageable loss and account devastation.',
    sections: [
      {
        heading: 'Why Stop-Losses Are Non-Negotiable',
        body: `**The Math of Losses:**
\`\`\`
Loss       Recovery Needed
-10%       +11%
-20%       +25%
-30%       +43%
-50%       +100%
-70%       +233%
-90%       +900%
\`\`\`

**Key Insight:** Small losses are recoverable; large losses can be fatal.

**Psychological Benefits:**
1. Defines maximum loss upfront
2. Removes decision-making stress
3. Prevents "hoping" for recovery
4. Maintains discipline

**Common Mistakes:**
- Not using stops ("I'll monitor it")
- Moving stops further away
- Mental stops (not actual orders)
- Stops too tight (normal volatility hits them)`,
        warning: 'Never trade without a stop-loss. Every trade should have a predetermined exit point before you enter.'
      },
      {
        heading: 'Fixed Percentage Stops',
        body: `The simplest approach: set stop at X% below entry.

**Common Percentages:**
- Intraday trading: 0.5-1%
- Swing trading: 2-3%
- Position trading: 5-8%

**Example:**
\`\`\`
Entry: ₹1,000
Stop %: 2%
Stop-Loss: ₹1,000 × (1 - 0.02) = ₹980
\`\`\`

**Advantages:**
- Simple to calculate
- Easy to automate
- Consistent approach

**Disadvantages:**
- Ignores market structure
- Same % for all stocks
- May be too tight for volatile stocks
- May be too wide for calm stocks

**When to Use:**
- Beginning traders (simplicity)
- Very liquid markets
- When volatility is consistent`,
        tip: 'Use fixed % stops only as a starting point. As you gain experience, move to structure-based or ATR-based stops.'
      },
      {
        heading: 'Structure-Based Stops',
        body: `Place stops at technical levels where if price reaches, your trade thesis is invalid.

**For Long Positions:**
- Below recent swing low
- Below major support level
- Below moving average (e.g., 20 EMA)
- Below pattern low (for breakouts)

**For Short Positions:**
- Above recent swing high
- Above major resistance
- Above moving average
- Above pattern high

**Example - Long Trade:**
\`\`\`
Entry: ₹500 (breakout above ₹495 resistance)
Recent swing low: ₹480
Structure stop: ₹478 (just below swing low)

Thesis: "Price broke resistance; if it falls back 
below ₹480, the breakout failed."
\`\`\`

**Buffer Placement:**
Don't place stop exactly at structure level:
- Add 0.5-1% buffer below support
- Avoids stop hunts and wicks

**Advantages:**
- Based on market reality
- Logical invalidation point
- Less likely to be hit by noise`,
        tip: 'Look at where your stop would be BEFORE entering. If the structure-based stop requires too much risk, skip the trade.'
      },
      {
        heading: 'ATR-Based & Trailing Stops',
        body: `**ATR-Based Stops:**
Adapt stop distance to current volatility.

\`\`\`
Stop = Entry - (Multiplier × ATR)

Common Multipliers:
- Aggressive: 1.5× ATR
- Standard: 2.0× ATR
- Conservative: 3.0× ATR
\`\`\`

**Trailing Stops:**
Move stop in your favor as price advances.

**Fixed Trailing:**
- Set X% trailing (e.g., 3%)
- Stop moves up as price makes new highs
- Example: High ₹550, stop at ₹533.50 (3% below)

**ATR Trailing:**
- Recalculate stop daily/hourly
- Stop = Highest Close - (2 × ATR)
- Adapts to changing volatility

**Chandelier Exit:**
Popular trailing stop formula:
\`\`\`
Long: Stop = Highest High (n) - (3 × ATR)
Short: Stop = Lowest Low (n) + (3 × ATR)

n = lookback period (typically 22 days)
\`\`\`

**Implementation in AlgoTrade Pro:**
\`\`\`
Stop-Loss Settings:
Type: ATR Trailing
ATR Period: 14
Multiplier: 2.0
Trail After: ₹0 (immediate)
Update: Every 15 minutes
\`\`\``,
        tip: 'Trailing stops lock in profits but can exit too early in choppy markets. Use wider trails (3× ATR) for trending strategies.'
      }
    ],
    keyTakeaways: [
      'Always use stop-losses - they\'re insurance against catastrophic losses',
      'Fixed % stops are simple but don\'t account for market structure',
      'Structure-based stops use technical levels as logical invalidation points',
      'ATR-based stops adapt to volatility; trailing stops lock in profits'
    ],
    quiz: [
      {
        id: 'q1-recovery',
        question: 'How much gain is needed to recover from a 50% loss?',
        options: ['50%', '75%', '100%', '150%'],
        correctAnswer: 2,
        explanation: 'A 50% loss means ₹100 becomes ₹50. To get back to ₹100, you need ₹50 gain, which is 100% of ₹50.'
      },
      {
        id: 'q2-structure-stop',
        question: 'Where should you place a structure-based stop for a long position?',
        options: [
          'Above the entry point',
          'At a random percentage below entry',
          'Below recent swing low or support',
          'At the current price'
        ],
        correctAnswer: 2,
        explanation: 'Structure-based stops are placed below significant support levels (swing lows, support zones) - the point where your trade thesis becomes invalid.'
      },
      {
        id: 'q3-atr-stop',
        question: 'If ATR is ₹20 and you use a 2× ATR stop on a long entry at ₹500, where is your stop?',
        options: ['₹480', '₹460', '₹440', '₹520'],
        correctAnswer: 1,
        explanation: 'Stop = Entry - (2 × ATR) = ₹500 - (2 × ₹20) = ₹500 - ₹40 = ₹460.'
      }
    ],
    nextLessonId: 'risk-reward-ratios',
    prevLessonId: 'position-sizing-lesson'
  },
  {
    id: 'risk-reward-ratios',
    moduleId: 'risk-management',
    title: 'Risk-Reward Ratios',
    description: 'Structure trades for asymmetric returns',
    duration: '12 min',
    difficulty: 'intermediate',
    introduction: 'Risk-reward ratios determine the potential profit versus potential loss on each trade. A favorable risk-reward allows you to be profitable even with a modest win rate.',
    sections: [
      {
        heading: 'Understanding Risk-Reward',
        body: `Risk-Reward Ratio (R:R) compares potential reward to potential risk.

**Formula:**
\`\`\`
R:R = (Target Price - Entry) / (Entry - Stop-Loss)
\`\`\`

**Example:**
\`\`\`
Entry: ₹100
Stop-Loss: ₹95 (₹5 risk)
Target: ₹115 (₹15 reward)

R:R = ₹15 / ₹5 = 3:1 (3R)
\`\`\`

**Common Ratios:**
- 1:1 = Break even at 50% win rate
- 2:1 = Profitable at 34% win rate
- 3:1 = Profitable at 25% win rate

**Why R:R Matters:**
With 2:1 R:R and 40% win rate:
\`\`\`
10 trades, risking ₹1,000 each:
Wins: 4 × ₹2,000 = ₹8,000
Losses: 6 × ₹1,000 = ₹6,000
Net: +₹2,000 profit (20% return on risk)
\`\`\``,
        tip: 'Minimum 2:1 R:R should be your baseline. Only take 1:1 trades if you have a very high probability setup (>65%).'
      },
      {
        heading: 'Win Rate and R:R Relationship',
        body: `Your win rate and R:R must work together for profitability.

**Breakeven Win Rates:**
\`\`\`
R:R Ratio    Required Win Rate to Break Even
1:1          50%
1.5:1        40%
2:1          33.3%
3:1          25%
4:1          20%
5:1          16.7%
\`\`\`

**Expectancy Formula:**
\`\`\`
Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss)

Example:
Win Rate: 40%
Avg Win: ₹2,000
Avg Loss: ₹1,000

Expectancy = (0.40 × ₹2,000) - (0.60 × ₹1,000)
           = ₹800 - ₹600 = ₹200 per trade
\`\`\`

**Finding Your Sweet Spot:**
- Trend followers: Lower win rate (35-45%), higher R:R (2-5:1)
- Mean reversion: Higher win rate (55-70%), lower R:R (1-1.5:1)
- Breakout traders: 30-40% win rate, 3:1+ R:R

**Track Your Metrics:**
After 50+ trades, calculate:
1. Actual win rate
2. Average win size
3. Average loss size
4. Actual R:R
5. Expectancy per trade`,
        tip: 'Most beginners focus on win rate but R:R is often more important. A 35% win rate with 3:1 R:R beats 60% win rate with 0.5:1 R:R.'
      },
      {
        heading: 'Setting Realistic Targets',
        body: `Targets should be based on technical analysis, not arbitrary numbers.

**Technical Target Methods:**

**1. Support/Resistance:**
- Previous swing high (for longs)
- Previous swing low (for shorts)
- Round numbers (₹500, ₹1000)

**2. Fibonacci Extensions:**
- 1.272× extension of prior swing
- 1.618× extension (golden ratio)
- Measure from swing low to high

**3. Measured Move:**
\`\`\`
Target = Breakout Point + (Prior Swing Height)

Example:
Consolidation: ₹90 to ₹100
Breakout at: ₹100
Target: ₹100 + ₹10 = ₹110
\`\`\`

**4. ATR-Based:**
\`\`\`
Target = Entry + (Multiple × ATR)
2× ATR for conservative
3× ATR for standard
4× ATR for aggressive
\`\`\`

**Scaling Out:**
Take partial profits at multiple levels:
- 50% at 2R
- 25% at 3R
- 25% trailing for big moves`,
        warning: 'Don\'t set targets too far just to improve R:R. Targets should be at realistic price levels that the market can reach.'
      },
      {
        heading: 'Trade Selection by R:R',
        body: `Use R:R as a filter for trade selection.

**Pre-Trade Checklist:**
\`\`\`
1. Identify entry point
2. Identify stop-loss (structure or ATR)
3. Identify target (technical level)
4. Calculate R:R
5. Only take trade if R:R ≥ 2:1
\`\`\`

**Example Screening Process:**
\`\`\`
Setup A:
Entry: ₹500, Stop: ₹490, Target: ₹525
R:R = ₹25/₹10 = 2.5:1 ✓ Take trade

Setup B:
Entry: ₹200, Stop: ₹190, Target: ₹215
R:R = ₹15/₹10 = 1.5:1 ✗ Skip trade

Setup C:
Entry: ₹1000, Stop: ₹980, Target: ₹1080
R:R = ₹80/₹20 = 4:1 ✓ Strong trade
\`\`\`

**Adjusting for Probability:**
Higher probability setups can have lower R:R:
- A+ setup with 70% confidence: 1.5:1 okay
- C setup with 40% confidence: Need 3:1+

**AlgoTrade Pro R:R Configuration:**
\`\`\`
Entry Rules → Risk Management tab:
- Minimum R:R: 2.0
- Target calculation: ATR-based
- ATR multiplier for target: 4
- Stop ATR multiplier: 2
\`\`\``,
        tip: 'Calculate R:R BEFORE entering. If you can\'t achieve 2:1, wait for a better entry or skip the trade entirely.'
      }
    ],
    keyTakeaways: [
      'Risk-Reward Ratio = Potential Reward / Potential Risk',
      'Minimum 2:1 R:R allows profitability even with modest win rates',
      'Set targets at technical levels, not arbitrary numbers',
      'Use R:R as a filter - skip trades that don\'t meet your minimum'
    ],
    quiz: [
      {
        id: 'q1-rr-calc',
        question: 'Entry ₹100, Stop ₹96, Target ₹112. What is the R:R?',
        options: ['2:1', '3:1', '4:1', '1:1'],
        correctAnswer: 1,
        explanation: 'Risk = ₹100 - ₹96 = ₹4. Reward = ₹112 - ₹100 = ₹12. R:R = 12/4 = 3:1.'
      },
      {
        id: 'q2-breakeven',
        question: 'At 2:1 R:R, what win rate is needed to break even?',
        options: ['25%', '33.3%', '50%', '66.7%'],
        correctAnswer: 1,
        explanation: 'At 2:1 R:R, you need to win 33.3% of trades to break even. 1 win (₹2) covers 2 losses (₹1 each).'
      },
      {
        id: 'q3-filter',
        question: 'What is the recommended minimum R:R for most traders?',
        options: ['0.5:1', '1:1', '2:1', '5:1'],
        correctAnswer: 2,
        explanation: '2:1 R:R is the recommended minimum as it allows profitability with moderate win rates (40-50%).'
      }
    ],
    nextLessonId: 'portfolio-diversification',
    prevLessonId: 'stop-loss-strategies'
  },
  {
    id: 'portfolio-diversification',
    moduleId: 'risk-management',
    title: 'Portfolio Diversification',
    description: 'Reduce risk through intelligent allocation',
    duration: '13 min',
    difficulty: 'intermediate',
    introduction: 'Diversification is the only free lunch in investing. By spreading risk across uncorrelated assets, you can reduce portfolio volatility without sacrificing returns.',
    sections: [
      {
        heading: 'Why Diversification Works',
        body: `**The Core Concept:**
When one asset zigs, another zags. Overall portfolio volatility decreases.

**Mathematical Benefit:**
\`\`\`
Portfolio Risk < Average of Individual Risks
(When assets are not perfectly correlated)
\`\`\`

**Example:**
\`\`\`
Stock A volatility: 30%
Stock B volatility: 30%
Correlation: 0.2 (low)

50/50 Portfolio volatility: ~22%
(Less than either individual stock!)
\`\`\`

**Types of Diversification:**
1. **Across Stocks**: Multiple companies
2. **Across Sectors**: Banking, IT, Pharma, etc.
3. **Across Market Cap**: Large, Mid, Small
4. **Across Strategies**: Momentum, Mean Reversion
5. **Across Timeframes**: Intraday, Swing, Position

**Indian Market Sectors:**
- Banking & Finance (HDFC, ICICI, Kotak)
- IT Services (TCS, Infosys, Wipro)
- Oil & Gas (Reliance, ONGC, BPCL)
- FMCG (HUL, ITC, Nestle)
- Pharma (Sun Pharma, Dr. Reddy's)
- Auto (Maruti, M&M, Tata Motors)`,
        tip: 'True diversification comes from uncorrelated assets. Two banking stocks aren\'t really diversified - they\'ll move together.'
      },
      {
        heading: 'Correlation in Indian Markets',
        body: `**Understanding Correlation:**
\`\`\`
+1.0 = Perfect positive (move together)
0.0 = No relationship
-1.0 = Perfect negative (opposite moves)
\`\`\`

**Typical Indian Stock Correlations:**

**High Correlation (0.7-0.9):**
- HDFC Bank ↔ ICICI Bank
- TCS ↔ Infosys
- RELIANCE ↔ NIFTY

**Medium Correlation (0.4-0.6):**
- Banking ↔ IT sectors
- Large Cap ↔ Mid Cap

**Lower Correlation (0.2-0.4):**
- IT ↔ Pharma
- Banking ↔ Metals
- Domestic ↔ Export-oriented

**Very Low/Negative:**
- Stocks ↔ Gold
- IT (USD income) ↔ Rupee depreciation

**Portfolio Construction:**
\`\`\`
Aim for positions with correlation < 0.5
Example portfolio:
- 25% Banking (HDFC Bank)
- 25% IT (Infosys)
- 20% Consumer (HUL)
- 15% Pharma (Sun Pharma)
- 15% Infrastructure (L&T)
\`\`\``,
        warning: 'In a market crash, correlations spike towards 1. Diversification helps in normal markets but may not fully protect in crises.'
      },
      {
        heading: 'Position Limits and Allocation',
        body: `**Maximum Position Sizes:**

**Single Stock:**
- Conservative: 5% of portfolio
- Moderate: 10% of portfolio
- Aggressive: 15% of portfolio

**Single Sector:**
- Maximum: 25-30% of portfolio
- Prevents sector-specific crashes

**Single Strategy:**
- Maximum: 50% of capital
- Spread across multiple strategies

**Portfolio Allocation Models:**

**Equal Weight:**
\`\`\`
10 stocks × 10% each = 100%
Simple, rebalance monthly
\`\`\`

**Risk Parity:**
\`\`\`
Allocate inversely to volatility
High volatility stock → Smaller position
Low volatility stock → Larger position
Goal: Equal risk contribution
\`\`\`

**Core-Satellite:**
\`\`\`
Core (70%): Index/large caps (stable)
Satellite (30%): High conviction picks
\`\`\`

**AlgoTrade Pro Settings:**
\`\`\`
Portfolio Limits:
- Max positions: 10
- Max per stock: 10%
- Max per sector: 25%
- Max correlated positions: 3
\`\`\``,
        tip: 'When one position grows significantly due to gains, rebalance. Letting winners run too long increases concentration risk.'
      },
      {
        heading: 'Strategy Diversification',
        body: `**Beyond Stock Diversification:**
Run multiple uncorrelated strategies simultaneously.

**Strategy Correlation:**
\`\`\`
Trend Following + Mean Reversion = Low correlation
(One profits in trends, other in ranges)

Two Momentum Strategies = High correlation
(Both long in uptrends, both lose in ranges)
\`\`\`

**Sample Strategy Portfolio:**
\`\`\`
Strategy 1: MA Crossover (Trend, 30% capital)
Strategy 2: RSI Oversold (Mean Reversion, 25%)
Strategy 3: Breakout (Momentum, 25%)
Strategy 4: Pairs Trading (Market Neutral, 20%)
\`\`\`

**Timeframe Diversification:**
\`\`\`
Intraday strategy (daily P&L)
Swing strategy (weekly P&L)
Position strategy (monthly P&L)

Different strategies hit differently on any given day.
\`\`\`

**Market Condition Diversification:**
\`\`\`
Trending markets → Trend following active
Ranging markets → Mean reversion active
Volatile markets → Options strategies active

Use market regime detection to switch.
\`\`\`

**Equity Curve Smoothing:**
When strategies are uncorrelated:
- Bad days for Strategy A offset by Strategy B
- Overall equity curve becomes smoother
- Drawdowns are shallower
- Easier to stay disciplined`,
        tip: 'Your best strategy will have periods of underperformance. Having uncorrelated strategies keeps you profitable overall.'
      }
    ],
    keyTakeaways: [
      'Diversification reduces risk without sacrificing returns',
      'Focus on correlation - uncorrelated assets provide true diversification',
      'Set position limits: max 10% per stock, 25% per sector',
      'Diversify across strategies and timeframes, not just stocks'
    ],
    quiz: [
      {
        id: 'q1-correlation',
        question: 'What correlation between assets provides the best diversification benefit?',
        options: ['+1.0', '+0.8', '0.0', '-0.5'],
        correctAnswer: 2,
        explanation: 'Zero or negative correlation provides the best diversification. Assets that don\'t move together reduce overall portfolio volatility.'
      },
      {
        id: 'q2-max-position',
        question: 'What is a reasonable maximum allocation to a single stock?',
        options: ['5-10%', '25-30%', '50%', '100%'],
        correctAnswer: 0,
        explanation: '5-10% maximum per stock is recommended. This limits the impact of any single stock\'s poor performance on your portfolio.'
      },
      {
        id: 'q3-strategy-div',
        question: 'Why combine trend following with mean reversion strategies?',
        options: [
          'They both profit in trending markets',
          'They have low correlation - one works when the other doesn\'t',
          'They use the same indicators',
          'There\'s no benefit'
        ],
        correctAnswer: 1,
        explanation: 'Trend following profits in trending markets while mean reversion profits in ranging markets. Together they provide strategy diversification.'
      }
    ],
    nextLessonId: 'capital-preservation',
    prevLessonId: 'risk-reward-ratios'
  },
  {
    id: 'capital-preservation',
    moduleId: 'risk-management',
    title: 'Capital Preservation',
    description: 'Survive drawdowns and protect your trading capital',
    duration: '14 min',
    difficulty: 'intermediate',
    introduction: 'Your primary job as a trader is to survive. Capital preservation ensures you stay in the game long enough to let your edge play out. This lesson covers advanced techniques to protect your capital.',
    sections: [
      {
        heading: 'Daily Loss Limits',
        body: `**The Concept:**
Set a maximum loss amount for each day. When hit, stop trading.

**Recommended Daily Limits:**
- Conservative: 1% of capital
- Standard: 2% of capital
- Aggressive: 3% of capital

**Example:**
\`\`\`
Capital: ₹5,00,000
Daily Limit: 2% = ₹10,000

If losses reach ₹10,000 today:
- Close all positions
- Stop trading for the day
- Review what went wrong
\`\`\`

**Why Daily Limits Work:**
1. Prevents emotional overtrading after losses
2. Limits damage from "one of those days"
3. Forces review and improvement
4. Preserves capital for better days

**Implementation:**
\`\`\`
AlgoTrade Pro Safety Settings:
Daily Loss Limit: 2%
Action: Auto-close all positions
Notify: Email + SMS
Resume: Next trading day
\`\`\``,
        tip: 'After hitting daily limit, review your trades before tomorrow. Often a pattern emerges (news day, overtrading, etc.).'
      },
      {
        heading: 'Drawdown Management',
        body: `**Understanding Drawdown:**
Drawdown = Peak equity - Current equity

\`\`\`
Peak: ₹5,50,000
Current: ₹4,80,000
Drawdown: ₹70,000 (12.7%)
\`\`\`

**Drawdown Response Levels:**

**5% Drawdown (Yellow Zone):**
- Reduce position sizes by 25%
- Review recent trades for errors
- Ensure rules are being followed

**10% Drawdown (Orange Zone):**
- Reduce position sizes by 50%
- Review strategy performance
- Consider taking a 1-2 day break

**15% Drawdown (Red Zone):**
- Stop all trading
- Comprehensive strategy review
- Paper trade before returning

**20%+ Drawdown (Critical):**
- Full stop required
- Fundamental strategy reassessment
- Consider external review/coaching

**Equity Curve Circuit Breakers:**
\`\`\`
If equity falls below 20-day moving average of equity:
→ Reduce position sizes 50%
→ Only take A+ setups
→ Resume normal when equity > 20-day MA
\`\`\``,
        warning: 'Most traders quit after large drawdowns. Having predefined rules prevents emotional decisions during tough times.'
      },
      {
        heading: 'The Power of Compounding',
        body: `**Compounding Gains:**
Consistent small gains compound dramatically over time.

**Scenario Analysis:**
\`\`\`
Starting Capital: ₹5,00,000

2% monthly returns (24% annually):
Year 1: ₹6,20,000
Year 3: ₹9,60,000
Year 5: ₹14,80,000
Year 10: ₹43,80,000

vs. 

5% monthly (60% annually):
Year 1: ₹8,95,000
Year 3: ₹28,60,000
Year 5: ₹91,30,000
Year 10: ₹1,67,00,000
\`\`\`

**The Rule of 72:**
\`\`\`
Years to double = 72 / Annual return %

20% return → 3.6 years to double
30% return → 2.4 years to double
50% return → 1.4 years to double
\`\`\`

**Why Protection Matters:**
\`\`\`
Path A: +50%, -30%, +50%, -30% = Net +10.25%
Path B: +20%, +20%, +20%, +20% = Net +107%

Consistency beats volatility in the long run.
\`\`\``,
        tip: 'A 25% annual return may seem modest, but ₹10 lakh becomes ₹93 lakh in 10 years. Consistency is the key.'
      },
      {
        heading: 'Psychological Capital Management',
        body: `**Trading is a Mental Game:**
Your psychological capital is as important as financial capital.

**Signs of Psychological Drain:**
- Checking P&L constantly
- Difficulty sleeping over trades
- Revenge trading after losses
- Second-guessing your system
- Trading larger to "make it back"

**Protection Strategies:**

**1. Scheduled Trading:**
- Set specific trading hours
- Don't check markets outside hours
- Take regular breaks (every 2 hours)

**2. Position Size for Sleep:**
\`\`\`
Ask: "Can I sleep with this position?"
If no → Position is too large
Reduce until comfortable
\`\`\`

**3. Equity Milestones:**
- Set withdrawal rules at milestones
- Take 10% profits when equity up 50%
- Reward yourself for good performance

**4. Trading Journal:**
- Track emotions alongside trades
- Identify patterns (tired = losses?)
- Review weekly

**5. Vacation Rule:**
- Take 1 week off every quarter
- Complete trading break
- Return with fresh perspective

**AlgoTrade Pro Automation:**
Let the system trade while you manage emotions:
- Automatic entry/exit execution
- No manual intervention needed
- Just monitor, don't micro-manage`,
        warning: 'Trading while emotionally compromised is like driving drunk. Take breaks when you notice stress signals.'
      }
    ],
    keyTakeaways: [
      'Set daily loss limits (2% recommended) and stop trading when hit',
      'Have predefined drawdown response levels with position size reductions',
      'Consistency compounds - avoid large swings in either direction',
      'Protect psychological capital as carefully as financial capital'
    ],
    quiz: [
      {
        id: 'q1-daily-limit',
        question: 'What is a recommended daily loss limit for most traders?',
        options: ['0.5%', '2%', '5%', '10%'],
        correctAnswer: 1,
        explanation: '2% daily loss limit is standard. It prevents catastrophic single-day losses while allowing normal trading activity.'
      },
      {
        id: 'q2-drawdown',
        question: 'At what drawdown level should you reduce position sizes by 50%?',
        options: ['5%', '10%', '20%', '30%'],
        correctAnswer: 1,
        explanation: 'At 10% drawdown (Orange Zone), reducing position sizes by 50% helps prevent further damage while you assess what\'s going wrong.'
      },
      {
        id: 'q3-compound',
        question: 'Using the Rule of 72, how long to double capital at 24% annual return?',
        options: ['2 years', '3 years', '4 years', '5 years'],
        correctAnswer: 1,
        explanation: 'Years to double = 72 / 24 = 3 years. Consistent 24% annual returns double your capital every 3 years.'
      }
    ],
    nextLessonId: 'strategy-components',
    prevLessonId: 'portfolio-diversification'
  }
];

// Continue with more modules...
// For brevity, I'll add placeholder structures for remaining modules

// ============================================
// MODULE 4: STRATEGY BUILDING
// ============================================

const strategyBuildingLessons: LessonContent[] = [
  {
    id: 'strategy-components',
    moduleId: 'strategy-building',
    title: 'Strategy Components',
    description: 'Understand the building blocks of a complete trading strategy',
    duration: '18 min',
    difficulty: 'intermediate',
    introduction: 'A complete trading strategy is more than just entry signals. This lesson covers all the components needed to build a robust, tradeable system.',
    sections: [
      {
        heading: 'The Five Pillars of a Trading Strategy',
        body: `Every complete strategy needs these five components:

**1. Entry Rules**
- When exactly do you enter?
- What signals must align?
- Example: "Buy when RSI crosses above 30 AND price is above 50 SMA"

**2. Exit Rules**
- Profit taking rules
- Stop-loss rules  
- Time-based exits
- Example: "Sell at 2× ATR profit OR stop at 1× ATR loss"

**3. Position Sizing**
- How much capital per trade?
- Risk per trade calculation
- Example: "Risk 1% of capital, size based on ATR stop"

**4. Trade Filters**
- What conditions must exist to take any trades?
- Market environment filters
- Example: "Only trade when VIX < 20 AND market above 200 SMA"

**5. Trade Management**
- How do you manage open positions?
- Scaling in/out rules
- Trailing stop rules
- Example: "Move stop to breakeven after 1R profit"`,
        tip: 'Most traders focus only on entries. Exits and position sizing often matter more for overall performance.'
      },
      {
        heading: 'Entry Signal Design',
        body: `**Types of Entry Signals:**

**Momentum/Trend:**
- Moving average crossovers
- Price breaking resistance
- Higher highs/higher lows

**Mean Reversion:**
- RSI oversold/overbought
- Price at Bollinger Band extreme
- Deviation from VWAP

**Volatility Breakout:**
- Bollinger squeeze breakout
- ATR expansion
- Range breakout

**Multiple Confirmation:**
Combine signals for higher probability:
\`\`\`
Entry = Signal A AND Signal B AND Filter

Example:
- EMA crossover (trend)
- RSI > 50 (momentum)
- Price > VWAP (intraday bias)
\`\`\`

**Signal Quality Grading:**
\`\`\`
A Grade: All conditions met perfectly
B Grade: Most conditions met
C Grade: Minimum conditions met

Adjust position size by grade:
A = Full size, B = 75%, C = 50%
\`\`\``
      },
      {
        heading: 'Exit Strategy Framework',
        body: `**Three Exit Categories:**

**1. Stop-Loss Exits (Protect Capital)**
\`\`\`
- Initial stop: Set at entry
- Never move further from price
- Types: Fixed %, Structure, ATR-based
\`\`\`

**2. Profit Target Exits (Lock Gains)**
\`\`\`
- Fixed R:R targets (2R, 3R)
- Technical levels (resistance)
- Scaling out (50% at 2R, 50% at 3R)
\`\`\`

**3. Trailing Stop Exits (Ride Winners)**
\`\`\`
- ATR trailing (2× ATR behind)
- Percentage trailing (3% below high)
- Structure trailing (below swing lows)
\`\`\`

**Exit Decision Matrix:**
\`\`\`
| Signal          | Action              |
|-----------------|---------------------|
| Stop hit        | Full exit, no delay |
| Target 1 hit    | Exit 50%            |
| Target 2 hit    | Exit remaining      |
| Opposite signal | Exit all            |
| Time limit      | Exit all            |
\`\`\``,
        tip: 'Consider partial exits: Take some profit at conservative target, let the rest run with trailing stop.'
      },
      {
        heading: 'Building Your First Complete Strategy',
        body: `**Example: Trend Pullback Strategy**

**Universe:** NIFTY 50 stocks
**Timeframe:** Daily chart

**Entry Rules:**
\`\`\`
1. Stock above 50 SMA (uptrend)
2. RSI(14) drops below 40 (pullback)
3. RSI(14) then crosses above 40 (momentum returning)
4. Volume > 20-day average (confirmation)
\`\`\`

**Exit Rules:**
\`\`\`
Stop-Loss: 2× ATR(14) below entry
Target 1: 3× ATR above entry (exit 50%)
Target 2: Trail remaining at 2× ATR
Time Exit: Close after 10 trading days if neither hit
\`\`\`

**Position Sizing:**
\`\`\`
Risk: 1% of capital
Stop Distance: 2× ATR
Position = (Capital × 0.01) / (2× ATR)
Max positions: 5
\`\`\`

**Filters:**
\`\`\`
1. NIFTY above 50 SMA (market uptrend)
2. VIX below 25 (reasonable volatility)
3. No trades on expiry Thursday
4. No trades after 2:30 PM
\`\`\`

**Trade Management:**
\`\`\`
- After 1R profit: Move stop to breakeven
- After Target 1: Trail at 2× ATR
- Review if NIFTY closes below 50 SMA
\`\`\``
      }
    ],
    keyTakeaways: [
      'Complete strategies have 5 pillars: Entry, Exit, Sizing, Filters, Management',
      'Use multiple confirmations for higher probability entries',
      'Design exits before entries - know your risk before you enter',
      'Write out every rule explicitly before trading'
    ],
    quiz: [
      {
        id: 'q1-pillars',
        question: 'Which is NOT one of the five pillars of a trading strategy?',
        options: [
          'Entry Rules',
          'Position Sizing',
          'News Analysis',
          'Trade Filters'
        ],
        correctAnswer: 2,
        explanation: 'The five pillars are Entry, Exit, Position Sizing, Trade Filters, and Trade Management. News can inform filters but isn\'t a core pillar.'
      },
      {
        id: 'q2-multiple-conf',
        question: 'Why use multiple confirmation signals for entries?',
        options: [
          'To generate more trades',
          'For higher probability setups',
          'To confuse the market',
          'Regulations require it'
        ],
        correctAnswer: 1,
        explanation: 'Multiple confirmations (e.g., trend + momentum + volume) filter out weaker signals, leaving higher probability setups.'
      },
      {
        id: 'q3-exit-first',
        question: 'Why should you design exit rules before entry rules?',
        options: [
          'It\'s required by law',
          'To know your risk and R:R before entering',
          'Exits don\'t matter',
          'To trade faster'
        ],
        correctAnswer: 1,
        explanation: 'Knowing your stop-loss and target before entering tells you the exact risk and whether the R:R makes the trade worthwhile.'
      }
    ],
    nextLessonId: 'backtesting-basics',
    prevLessonId: 'capital-preservation'
  },
  {
    id: 'backtesting-basics',
    moduleId: 'strategy-building',
    title: 'Backtesting Fundamentals',
    description: 'Test your strategies on historical data before risking real money',
    duration: '16 min',
    difficulty: 'intermediate',
    introduction: 'Backtesting allows you to simulate how a strategy would have performed historically. It\'s essential for validating ideas before committing capital.',
    sections: [
      {
        heading: 'What is Backtesting?',
        body: `Backtesting simulates trading a strategy on historical data.

**The Process:**
1. Define your strategy rules precisely
2. Apply rules to historical price data
3. Track every entry, exit, and position
4. Calculate performance metrics
5. Analyze results

**Why Backtest?**
- Validate your trading idea
- Identify strategy weaknesses
- Optimize parameters
- Build confidence before live trading
- Estimate realistic returns

**What You Need:**
- Historical price data (OHLCV)
- Strategy rules (unambiguous)
- Backtesting platform/code
- Performance metrics to track`,
        tip: 'A strategy that looks good in your head might fail in backtesting. Always verify before trading.'
      },
      {
        heading: 'Avoiding Backtest Pitfalls',
        body: `**Common Mistakes:**

**1. Overfitting (Curve Fitting)**
- Optimizing parameters too much on historical data
- Strategy works perfectly on past but fails on future
- Solution: Use out-of-sample testing

**2. Look-Ahead Bias**
- Using information that wasn't available at trade time
- Example: Using today's high to calculate entry
- Solution: Strict data timestamp discipline

**3. Survivorship Bias**
- Only testing stocks that still exist today
- Ignores delisted stocks (often failures)
- Solution: Use point-in-time data

**4. Ignoring Transaction Costs**
\`\`\`
Include realistic costs:
- Brokerage: ~0.03% per trade
- STT: 0.1% on sell (equity)
- Slippage: 0.05-0.2%
\`\`\`

**5. Unrealistic Assumptions**
- Assuming you get exact price
- Ignoring liquidity constraints
- Perfect order fills
- Solution: Add realistic slippage`
      },
      {
        heading: 'Key Performance Metrics',
        body: `**Returns:**
\`\`\`
Total Return = (End Value - Start Value) / Start Value
CAGR = (End/Start)^(1/years) - 1
\`\`\`

**Risk Metrics:**
\`\`\`
Max Drawdown = Largest peak-to-trough decline
Sharpe Ratio = (Return - Risk Free) / Volatility
Sortino Ratio = (Return - Risk Free) / Downside Vol
\`\`\`

**Trade Metrics:**
\`\`\`
Win Rate = Winning Trades / Total Trades
Avg Win = Average profit on winners
Avg Loss = Average loss on losers
Profit Factor = Gross Profits / Gross Losses
Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss)
\`\`\`

**What's "Good"?**
\`\`\`
| Metric        | Good    | Excellent |
|---------------|---------|-----------|
| CAGR          | 15-25%  | 30%+      |
| Max Drawdown  | <20%    | <15%      |
| Sharpe Ratio  | >1.0    | >2.0      |
| Win Rate      | 40-60%  | 60%+      |
| Profit Factor | >1.5    | >2.0      |
\`\`\``,
        tip: 'Look at metrics holistically. High returns with huge drawdowns isn\'t sustainable.'
      },
      {
        heading: 'Walk-Forward Analysis',
        body: `**The Problem with Simple Backtesting:**
- You see the full history
- Easy to overfit parameters
- Past performance doesn't guarantee future

**Walk-Forward Solution:**
1. Split data into periods
2. Optimize on first period (in-sample)
3. Test on next period (out-of-sample)
4. Roll forward and repeat
5. Combine out-of-sample results

**Example:**
\`\`\`
Data: 2019-2024 (5 years)

Step 1: Optimize on 2019-2020
Step 2: Test on 2021 (out-of-sample)
Step 3: Optimize on 2020-2021
Step 4: Test on 2022 (out-of-sample)
... continue ...

Final: Combine all out-of-sample periods
\`\`\`

**Monte Carlo Simulation:**
Randomize trade order to test robustness:
- Shuffle trades 1000 times
- Calculate metrics for each shuffle
- Get confidence intervals

This shows how results might vary with different trade sequences.`
      }
    ],
    keyTakeaways: [
      'Backtesting validates strategies before risking real money',
      'Avoid overfitting, look-ahead bias, and survivorship bias',
      'Track multiple metrics: returns, drawdown, Sharpe, win rate',
      'Use walk-forward analysis for robust validation'
    ],
    quiz: [
      {
        id: 'q1-overfit',
        question: 'What is overfitting in backtesting?',
        options: [
          'Testing too many strategies',
          'Optimizing too much on historical data so it fails on new data',
          'Using too few trades',
          'Trading too frequently'
        ],
        correctAnswer: 1,
        explanation: 'Overfitting means the strategy is tuned perfectly to historical quirks but fails on new data because it\'s too specific.'
      },
      {
        id: 'q2-sharpe',
        question: 'What does a Sharpe Ratio of 2.0 indicate?',
        options: [
          'Poor performance',
          'Excellent risk-adjusted returns',
          '200% annual returns',
          'Low volatility only'
        ],
        correctAnswer: 1,
        explanation: 'Sharpe Ratio >2.0 is excellent, showing strong returns relative to the volatility/risk taken.'
      },
      {
        id: 'q3-walkforward',
        question: 'What is walk-forward analysis?',
        options: [
          'Optimizing on all data',
          'Testing without looking at results',
          'Optimizing on one period, testing on the next, then rolling forward',
          'Walking while trading'
        ],
        correctAnswer: 2,
        explanation: 'Walk-forward splits data into optimize/test periods, rolling forward to simulate how the strategy would adapt over time.'
      }
    ],
    nextLessonId: 'performance-metrics',
    prevLessonId: 'strategy-components'
  },
  // Additional strategy building lessons would follow...
  {
    id: 'performance-metrics',
    moduleId: 'strategy-building',
    title: 'Performance Metrics Deep Dive',
    description: 'Master the metrics that separate good strategies from great ones',
    duration: '15 min',
    difficulty: 'intermediate',
    introduction: 'Understanding performance metrics helps you evaluate strategies objectively and make data-driven decisions.',
    sections: [
      {
        heading: 'Return Metrics',
        body: `Understanding different ways to measure returns.

**Total Return:**
\`\`\`
Total Return = (Ending Value / Starting Value) - 1

Example:
Start: ₹5,00,000
End: ₹7,50,000
Return = (7,50,000 / 5,00,000) - 1 = 50%
\`\`\`

**CAGR (Compound Annual Growth Rate):**
\`\`\`
CAGR = (Ending / Starting)^(1/years) - 1

Example (3 years):
CAGR = (7,50,000 / 5,00,000)^(1/3) - 1 = 14.5%
\`\`\`

**Monthly/Daily Returns:**
Track granular performance for analysis.
- Monthly returns for equity curve
- Daily returns for volatility calculation`
      },
      {
        heading: 'Risk Metrics',
        body: `**Maximum Drawdown:**
The worst peak-to-trough decline in portfolio value.
\`\`\`
For each point: Drawdown = (Peak - Current) / Peak
Max Drawdown = Maximum of all drawdowns
\`\`\`

**Sharpe Ratio:**
Risk-adjusted return measure.
\`\`\`
Sharpe = (Return - Risk-Free Rate) / Standard Deviation

Example:
Return: 25%
Risk-Free: 6%
Volatility: 15%
Sharpe = (25 - 6) / 15 = 1.27
\`\`\`

**Calmar Ratio:**
Return relative to maximum drawdown.
\`\`\`
Calmar = CAGR / Max Drawdown

Example:
CAGR: 20%
Max DD: 15%
Calmar = 20 / 15 = 1.33
\`\`\``
      },
      {
        heading: 'Trade Statistics',
        body: `**Win Rate:**
\`\`\`
Win Rate = Winning Trades / Total Trades × 100

Example: 45 wins out of 100 = 45%
\`\`\`

**Average Win/Loss:**
\`\`\`
Avg Win = Sum of Profits / Number of Wins
Avg Loss = Sum of Losses / Number of Losses
\`\`\`

**Profit Factor:**
\`\`\`
Profit Factor = Gross Profits / Gross Losses

>1.5 is good, >2.0 is excellent
\`\`\`

**Expectancy:**
Average profit per trade.
\`\`\`
Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss)

Should be positive for profitable strategy
\`\`\``
      },
      {
        heading: 'Equity Curve Analysis',
        body: `**What to Look For:**

**Smooth Upward Slope:**
- Consistent gains over time
- No prolonged flat periods
- Gentle drawdowns

**Warning Signs:**
- Long flat periods (strategy not working)
- Steep drops (poor risk management)
- Most gains from few trades (luck?)

**Benchmark Comparison:**
Always compare to buy-and-hold NIFTY:
- If strategy < NIFTY: Why bother?
- Risk-adjusted should beat passive

**Recovery Analysis:**
\`\`\`
Recovery Factor = Net Profit / Max Drawdown

>2.0 is good (profit 2× the max pain)
\`\`\``
      }
    ],
    keyTakeaways: [
      'CAGR shows annualized compound growth - the "real" return',
      'Max drawdown reveals worst-case scenario - can you survive it?',
      'Sharpe >1.0 is good, >2.0 is excellent risk-adjusted performance',
      'Profit factor >1.5 with positive expectancy indicates a viable edge'
    ],
    quiz: [
      {
        id: 'q1-cagr',
        question: '₹1,00,000 becomes ₹1,44,000 in 2 years. What is the CAGR?',
        options: ['22%', '44%', '20%', '14.4%'],
        correctAnswer: 2,
        explanation: 'CAGR = (1,44,000/1,00,000)^(1/2) - 1 = 1.44^0.5 - 1 = 1.2 - 1 = 20%'
      },
      {
        id: 'q2-sharpe-good',
        question: 'What is considered a good Sharpe Ratio?',
        options: ['< 0.5', '0.5 - 1.0', '> 1.0', '> 3.0 only'],
        correctAnswer: 2,
        explanation: 'Sharpe > 1.0 is considered good, meaning the strategy delivers good returns relative to the volatility.'
      },
      {
        id: 'q3-profit-factor',
        question: 'Gross profits = ₹50,000, Gross losses = ₹25,000. What is the profit factor?',
        options: ['0.5', '1.0', '2.0', '25,000'],
        correctAnswer: 2,
        explanation: 'Profit Factor = ₹50,000 / ₹25,000 = 2.0. This is excellent - you make ₹2 for every ₹1 you lose.'
      }
    ],
    nextLessonId: 'strategy-optimization',
    prevLessonId: 'backtesting-basics'
  },
  {
    id: 'strategy-optimization',
    moduleId: 'strategy-building',
    title: 'Strategy Optimization',
    description: 'Fine-tune your strategy without overfitting',
    duration: '14 min',
    difficulty: 'intermediate',
    introduction: 'Optimization finds the best parameters for your strategy. But be careful - too much optimization leads to overfitting.',
    sections: [
      {
        heading: 'What to Optimize',
        body: `Focus on parameters that matter:

**Good Candidates:**
- Moving average periods (9, 12, 20, 50)
- RSI period and thresholds
- ATR multiplier for stops
- Holding period

**Bad Candidates:**
- Exact entry/exit prices
- Day of week filters
- Arbitrary time windows

**Keep It Simple:**
- Fewer parameters = less overfitting
- Each parameter should have logical basis
- Document why each parameter exists`
      },
      {
        heading: 'Optimization Methods',
        body: `**Grid Search:**
Test all combinations of parameters.
\`\`\`
SMA periods: [10, 20, 30, 50]
RSI threshold: [25, 30, 35]
Total: 4 × 3 = 12 combinations
\`\`\`

**Random Search:**
Sample random combinations. Often as effective as grid search.

**Walk-Forward Optimization:**
The gold standard:
1. Optimize on period 1
2. Test on period 2
3. Reoptimize including period 2
4. Test on period 3
5. Continue...`
      },
      {
        heading: 'Detecting Overfitting',
        body: `**Signs of Overfitting:**
- In-sample results >> Out-of-sample
- Too many parameters
- Equity curve too smooth
- "Magic" parameters without logic

**Prevention:**
- Use walk-forward validation
- Limit parameters (< 5 ideally)
- Ensure parameters make sense
- Test on different time periods
- Test on different instruments`
      },
      {
        heading: 'Robustness Testing',
        body: `**Parameter Sensitivity:**
Good strategies work across parameter ranges.
\`\`\`
If SMA(20) works, SMA(18) and SMA(22) should too
Big performance drop for small changes = fragile
\`\`\`

**Monte Carlo:**
Randomize trade sequence 1000 times.
If results vary wildly = unreliable

**Market Regime Testing:**
Test separately on:
- Bull markets
- Bear markets
- Sideways markets
- High volatility periods`
      }
    ],
    keyTakeaways: [
      'Optimize meaningful parameters with logical basis',
      'Use walk-forward optimization to prevent overfitting',
      'Good strategies are robust to small parameter changes',
      'If it only works with exact parameters, it\'s probably overfit'
    ],
    quiz: [
      {
        id: 'q1-overfit-sign',
        question: 'Which is a sign of overfitting?',
        options: [
          'Strategy works on multiple stocks',
          'In-sample results much better than out-of-sample',
          'Parameters have logical basis',
          'Strategy is simple'
        ],
        correctAnswer: 1,
        explanation: 'A big gap between in-sample (training) and out-of-sample (test) performance indicates the strategy is fitted to historical noise.'
      },
      {
        id: 'q2-params',
        question: 'Why limit the number of parameters?',
        options: [
          'Computers can\'t handle more',
          'More parameters = higher overfitting risk',
          'It\'s a legal requirement',
          'Parameters don\'t matter'
        ],
        correctAnswer: 1,
        explanation: 'Each parameter adds degrees of freedom to fit historical data. More parameters = more overfitting risk.'
      },
      {
        id: 'q3-robust',
        question: 'A robust strategy shows:',
        options: [
          'Huge performance drop with small parameter changes',
          'Similar performance across a range of parameters',
          'Only works in bull markets',
          '100% win rate'
        ],
        correctAnswer: 1,
        explanation: 'Robust strategies aren\'t sensitive to exact parameter values. If SMA(20) works, SMA(18-22) should work too.'
      }
    ],
    nextLessonId: 'paper-to-live',
    prevLessonId: 'performance-metrics'
  },
  {
    id: 'paper-to-live',
    moduleId: 'strategy-building',
    title: 'From Paper Trading to Live',
    description: 'Successfully transition your strategy to real money',
    duration: '15 min',
    difficulty: 'intermediate',
    introduction: 'The gap between paper trading and live trading is where many traders fail. This lesson prepares you for a smooth transition.',
    sections: [
      {
        heading: 'Paper Trading Validation',
        body: `Before going live, your paper trading should show:

**Minimum Requirements:**
- 50+ trades completed
- 2+ months of trading
- Positive expectancy
- Metrics match backtest (within 20%)
- Consistent execution

**What to Track:**
- Fill prices vs expected
- Slippage amount
- Execution delays
- Emotional state during trades`
      },
      {
        heading: 'Differences from Paper',
        body: `**Real Money Challenges:**

**1. Slippage:**
- Paper: Perfect fills
- Live: May get worse prices
- Budget 0.1-0.2% slippage

**2. Liquidity:**
- Paper: Unlimited
- Live: Large orders move price
- Check ADV before trading

**3. Emotions:**
- Paper: "Just play money"
- Live: Fear and greed are real
- Losses hurt more

**4. Execution:**
- Paper: Instant
- Live: Network delays, errors possible
- Have backup plans`
      },
      {
        heading: 'Gradual Transition',
        body: `**Week 1-2: 25% Position Size**
- Trade with quarter size
- Get used to real money
- Verify fills and execution

**Week 3-4: 50% Position Size**
- Increase if results match paper
- If not, return to quarter size
- Track all metrics

**Month 2: 75% Position Size**
- Nearly full size
- Should feel comfortable now
- Final verification phase

**Month 3+: Full Position Size**
- Full deployment
- Continue monitoring closely
- Weekly performance review`
      },
      {
        heading: 'Going Live Checklist',
        body: `**Before First Live Trade:**
\`\`\`
□ Broker connection tested
□ Order types verified
□ Emergency contacts ready
□ Daily loss limit set
□ Kill switch configured
□ First trade size = 25%
□ Trade journal ready
□ Calm emotional state
\`\`\`

**First Week Priorities:**
- Execute correctly
- Don't worry about P&L
- Document everything
- Note differences from paper

**When to Pause:**
- 3+ execution errors
- Performance far from expected
- Emotional distress
- Technical issues`
      }
    ],
    keyTakeaways: [
      'Paper trade minimum 50 trades over 2 months before live',
      'Live trading has slippage, emotions, and execution challenges',
      'Transition gradually: 25% → 50% → 75% → 100% over 2-3 months',
      'Have emergency protocols and don\'t rush the transition'
    ],
    quiz: [
      {
        id: 'q1-min-paper',
        question: 'What is the minimum paper trading before going live?',
        options: ['10 trades', '50+ trades over 2+ months', '1 week', '1 profitable day'],
        correctAnswer: 1,
        explanation: '50+ trades over 2+ months provides statistically meaningful data and tests various market conditions.'
      },
      {
        id: 'q2-size-start',
        question: 'What position size should you start with when going live?',
        options: ['100%', '75%', '50%', '25%'],
        correctAnswer: 3,
        explanation: 'Start with 25% to minimize damage while you verify everything works correctly with real money.'
      },
      {
        id: 'q3-difference',
        question: 'What is a key difference between paper and live trading?',
        options: [
          'Paper trading is more expensive',
          'Live trading has slippage and emotional pressure',
          'Paper trading is harder',
          'There is no difference'
        ],
        correctAnswer: 1,
        explanation: 'Live trading introduces real slippage, emotional pressure, and execution challenges that paper trading doesn\'t fully simulate.'
      }
    ],
    nextLessonId: 'going-live',
    prevLessonId: 'strategy-optimization'
  },
  {
    id: 'going-live',
    moduleId: 'strategy-building',
    title: 'Going Live: The Final Step',
    description: 'Launch your trading system with confidence',
    duration: '12 min',
    difficulty: 'intermediate',
    introduction: 'You\'ve built, tested, and paper traded your strategy. Now it\'s time to trade with real money.',
    sections: [
      {
        heading: 'Pre-Launch Checklist',
        body: `**Technical Setup:**
\`\`\`
□ Broker API connected
□ Test orders successful
□ Stop-losses verified
□ Kill switch tested
□ Backup internet ready
□ Mobile trading app setup
\`\`\`

**Capital & Risk:**
\`\`\`
□ Trading capital segregated
□ Daily loss limit: 2%
□ Max drawdown limit: 15%
□ Position sizing verified
□ Emergency fund separate
\`\`\``
      },
      {
        heading: 'First Live Day',
        body: `**Morning Routine:**
1. Check overnight news
2. Review market conditions
3. Verify all systems online
4. Set daily loss alerts
5. Take one trade at time

**During Trading:**
- Follow the system exactly
- Don't override signals
- Log every decision
- Take breaks hourly

**End of Day:**
- Review all trades
- Compare to expected behavior
- Note any issues
- Update trade journal`
      },
      {
        heading: 'Ongoing Monitoring',
        body: `**Daily:**
- P&L review
- Trade execution quality
- System performance check

**Weekly:**
- Win rate calculation
- Comparison to backtest
- Strategy adjustment needs

**Monthly:**
- Full performance review
- Strategy health assessment
- Capital reallocation if needed`
      },
      {
        heading: 'When Things Go Wrong',
        body: `**Immediate Issues:**
- Execution errors: Stop, fix, resume
- Internet down: Use mobile backup
- Major loss: Pause, review, continue next day

**Strategy Not Working:**
- 20% worse than backtest: Reduce size
- 30% worse: Pause trading
- 50% worse: Full review needed

**Recovery Protocol:**
1. Stop trading immediately
2. Identify the problem
3. Paper trade the fix
4. Gradually resume live`
      }
    ],
    keyTakeaways: [
      'Complete technical and capital checklists before first trade',
      'First days: Focus on execution, not profits',
      'Monitor daily, review weekly, assess monthly',
      'Have clear protocols for when things go wrong'
    ],
    quiz: [
      {
        id: 'q1-first-day',
        question: 'What should be your focus on the first live trading day?',
        options: [
          'Making maximum profit',
          'Proper execution and following the system',
          'Overriding signals to improve results',
          'Taking as many trades as possible'
        ],
        correctAnswer: 1,
        explanation: 'First days are about verifying proper execution and that the system works as expected, not about maximizing profits.'
      },
      {
        id: 'q2-worse',
        question: 'If strategy is 30% worse than backtest, you should:',
        options: [
          'Increase position size to recover',
          'Continue trading normally',
          'Pause trading and review',
          'Ignore it'
        ],
        correctAnswer: 2,
        explanation: 'Significant underperformance (30%) requires pausing to understand what\'s different. Don\'t throw more money at a problem.'
      },
      {
        id: 'q3-review',
        question: 'How often should you do a full performance review?',
        options: ['Hourly', 'Daily', 'Weekly', 'Monthly'],
        correctAnswer: 3,
        explanation: 'Monthly reviews provide enough data for meaningful analysis while not being so frequent that you overreact to noise.'
      }
    ],
    nextLessonId: 'what-are-derivatives',
    prevLessonId: 'paper-to-live'
  }
];

// ============================================
// MODULE 5: F&O BASICS
// ============================================

const fnoBasicsLessons: LessonContent[] = [
  {
    id: 'what-are-derivatives',
    moduleId: 'fno-basics',
    title: 'What are Derivatives?',
    description: 'Understanding futures and options in Indian markets',
    duration: '14 min',
    difficulty: 'advanced',
    introduction: 'Derivatives are financial instruments whose value is derived from an underlying asset. In India, F&O trading on NSE is one of the largest derivatives markets globally.',
    sections: [
      {
        heading: 'Derivatives Explained',
        body: `**What is a Derivative?**
A contract whose value is "derived" from an underlying asset.

**Underlying Assets in India:**
- Index: NIFTY 50, Bank NIFTY, NIFTY IT
- Stocks: 180+ F&O eligible stocks
- Currencies: USD/INR, EUR/INR
- Commodities: Gold, Silver, Crude (MCX)

**Types of Derivatives:**

**Futures:**
- Agreement to buy/sell at future date
- Obligatory for both parties
- Used for hedging and speculation

**Options:**
- Right but not obligation
- Buyer pays premium
- Can call (buy) or put (sell)`
      },
      {
        heading: 'Indian F&O Market',
        body: `**NSE F&O Statistics:**
- Largest derivatives market globally by volume
- Bank NIFTY options: Most traded contract
- Weekly options on Bank NIFTY (every Thursday)

**Key Terms:**

**Lot Size:**
Minimum tradeable quantity
- NIFTY: 25 units
- Bank NIFTY: 15 units
- Stocks: Varies (e.g., Reliance = 250)

**Expiry:**
- Monthly: Last Thursday of month
- Weekly: Every Thursday (Bank NIFTY)

**Margin:**
Capital required to trade
- SPAN margin + Exposure margin
- Typically 10-15% of contract value`
      },
      {
        heading: 'Futures vs Options',
        body: `**Futures:**
\`\`\`
Pros:
- Simpler to understand
- Linear payoff
- No premium decay

Cons:
- Unlimited loss potential
- Higher margin required
- Obligated to honor contract
\`\`\`

**Options:**
\`\`\`
Pros:
- Limited risk for buyers
- Leverage with defined risk
- Strategic flexibility

Cons:
- Premium decay (time value)
- More complex Greeks
- Options can expire worthless
\`\`\`

**When to Use:**
- Strong directional view → Futures
- Limited risk trades → Options
- Income generation → Option selling
- Hedging portfolio → Options`
      },
      {
        heading: 'Risk Warning',
        body: `**⚠️ Critical Risks:**

**Futures:**
- Loss can exceed investment
- Margin calls possible
- Gap risk on overnight positions

**Options (Selling):**
- Unlimited loss potential
- Margin requirements high
- Black swan events

**Options (Buying):**
- Can lose 100% of premium
- Time decay works against you
- Need to be right on timing too

**SEBI Regulations:**
- Risk disclosure required
- Margin requirements strict
- Position limits enforced

**Before Trading F&O:**
1. Paper trade extensively
2. Start with defined risk (buying options)
3. Never trade more than you can lose
4. Understand margin requirements`
      }
    ],
    keyTakeaways: [
      'Derivatives derive value from underlying assets like NIFTY or stocks',
      'Futures are obligations; options give rights',
      'Indian F&O market (NSE) is one of the largest globally',
      'F&O carries significant risk - understand before trading'
    ],
    quiz: [
      {
        id: 'q1-derivative',
        question: 'What is a derivative?',
        options: [
          'A type of stock',
          'A contract deriving value from an underlying asset',
          'A bond',
          'A mutual fund'
        ],
        correctAnswer: 1,
        explanation: 'Derivatives are contracts whose value is derived from an underlying asset like an index, stock, or commodity.'
      },
      {
        id: 'q2-nifty-lot',
        question: 'What is the lot size for NIFTY 50 futures?',
        options: ['10', '15', '25', '50'],
        correctAnswer: 2,
        explanation: 'NIFTY 50 has a lot size of 25 units. Each contract represents 25× the index value.'
      },
      {
        id: 'q3-expiry',
        question: 'When do Bank NIFTY weekly options expire?',
        options: ['Monday', 'Wednesday', 'Thursday', 'Friday'],
        correctAnswer: 2,
        explanation: 'Bank NIFTY weekly options expire every Thursday, making them the most actively traded options globally.'
      }
    ],
    nextLessonId: 'futures-contracts',
    prevLessonId: 'going-live'
  },
  {
    id: 'futures-contracts',
    moduleId: 'fno-basics',
    title: 'Understanding Futures',
    description: 'Master futures trading mechanics and strategies',
    duration: '15 min',
    difficulty: 'advanced',
    introduction: 'Futures contracts are agreements to buy or sell an asset at a predetermined price on a future date. They\'re simpler than options but carry significant risk.',
    sections: [
      {
        heading: 'Futures Mechanics',
        body: `**Contract Specifications:**
\`\`\`
NIFTY Futures:
- Lot Size: 25 units
- Tick Size: 0.05 points
- Contract Value: NIFTY × 25
- Example: 22,000 × 25 = ₹5,50,000
\`\`\`

**Available Contracts:**
- Current month
- Next month
- Month after (far month)

**Pricing:**
\`\`\`
Futures Price = Spot + Cost of Carry

Cost of Carry = Spot × r × (t/365)
r = interest rate, t = days to expiry

If NIFTY = 22,000, r = 6%, t = 30 days:
Premium = 22,000 × 0.06 × (30/365) = ₹108
Futures = 22,100 (approx)
\`\`\``
      },
      {
        heading: 'Margin Requirements',
        body: `**Types of Margin:**

**SPAN Margin:**
- Initial margin for position
- Typically 8-12% of contract value

**Exposure Margin:**
- Additional margin buffer
- Typically 2-3% of contract value

**Example:**
\`\`\`
NIFTY at 22,000
Contract value: ₹5,50,000
SPAN: ~₹50,000 (9%)
Exposure: ~₹15,000 (2.7%)
Total: ~₹65,000 needed
\`\`\`

**Margin Call:**
If losses erode margin below maintenance level:
- Add funds immediately
- Or position will be squared off
- Broker may close position anytime`
      },
      {
        heading: 'Trading Futures',
        body: `**Long Position:**
- Buy futures = Bullish view
- Profit if price goes up
- Loss if price goes down
- Unlimited profit/loss potential

**Short Position:**
- Sell futures = Bearish view
- Profit if price goes down
- Loss if price goes up
- Unlimited profit/loss potential

**Exit Methods:**
1. Square off before expiry (most common)
2. Roll over to next month
3. Hold till expiry (physical/cash settlement)

**P&L Calculation:**
\`\`\`
Long P&L = (Exit - Entry) × Lot Size
Short P&L = (Entry - Exit) × Lot Size

Example (Long):
Entry: 22,000
Exit: 22,200
Lot: 25
P&L = (22,200 - 22,000) × 25 = ₹5,000
\`\`\``
      },
      {
        heading: 'Futures Strategies',
        body: `**1. Trend Following:**
- Buy futures in uptrend
- Short futures in downtrend
- Use with moving averages

**2. Hedging:**
- Own stocks, worried about fall
- Short futures to hedge
- Locks in current value

**3. Calendar Spread:**
- Buy far month, sell near month
- Profit from spread changes
- Lower risk than outright

**Risk Management:**
\`\`\`
- Use stop-losses always
- Size position for 1-2% risk
- Don't overtrade leverage
- Close positions before news events
\`\`\`

**Common Mistakes:**
- Overleveraging
- No stop-loss
- Holding through expiry without plan
- Ignoring margin requirements`
      }
    ],
    keyTakeaways: [
      'Futures are binding contracts to buy/sell at future date',
      'Margin is only ~10-15% of contract value (leverage)',
      'Both profit and loss are unlimited',
      'Always use stop-losses and proper position sizing'
    ],
    quiz: [
      {
        id: 'q1-margin',
        question: 'NIFTY at 22,000, lot size 25. Approximate margin needed?',
        options: ['₹5,500', '₹22,000', '₹55,000-70,000', '₹5,50,000'],
        correctAnswer: 2,
        explanation: 'Contract value is ₹5,50,000. Margin is ~10-12% = ₹55,000-70,000.'
      },
      {
        id: 'q2-long',
        question: 'If you expect NIFTY to rise, you should:',
        options: [
          'Sell NIFTY futures',
          'Buy NIFTY futures',
          'Do nothing',
          'Buy puts'
        ],
        correctAnswer: 1,
        explanation: 'Buying (going long) futures profits when the underlying goes up.'
      },
      {
        id: 'q3-pnl',
        question: 'Long at 22,000, exit at 21,800, lot 25. P&L?',
        options: ['₹5,000 profit', '₹5,000 loss', '₹200 profit', '₹200 loss'],
        correctAnswer: 1,
        explanation: 'P&L = (21,800 - 22,000) × 25 = -200 × 25 = -₹5,000 loss.'
      }
    ],
    nextLessonId: 'options-calls-puts',
    prevLessonId: 'what-are-derivatives'
  },
  // Additional F&O lessons would follow...
  {
    id: 'options-calls-puts',
    moduleId: 'fno-basics',
    title: 'Options: Calls and Puts',
    description: 'Understanding option basics and mechanics',
    duration: '18 min',
    difficulty: 'advanced',
    introduction: 'Options give you the right (but not obligation) to buy or sell at a specific price. They offer strategic flexibility with defined risk.',
    sections: [
      {
        heading: 'Call vs Put Options',
        body: `**Call Option (CE):**
- Right to BUY at strike price
- Buyer: Bullish view
- Seller: Neutral to bearish
- Profit when price goes up

**Put Option (PE):**
- Right to SELL at strike price
- Buyer: Bearish view
- Seller: Neutral to bullish
- Profit when price goes down

**Premium:**
- Price paid for the option
- Buyer pays, seller receives
- Represents maximum buyer loss`
      },
      {
        heading: 'Option Components',
        body: `**Strike Price:**
The price at which you can buy/sell.
\`\`\`
NIFTY at 22,000
22,000 strike = ATM (At The Money)
22,200 strike = OTM call (Out of Money)
21,800 strike = ITM call (In The Money)
\`\`\`

**Premium Components:**
\`\`\`
Premium = Intrinsic Value + Time Value

Intrinsic: Real value if expired now
Time: Probability value before expiry
\`\`\`

**Expiry:**
- Options expire on expiry day
- OTM options expire worthless
- ITM options have intrinsic value`
      },
      {
        heading: 'Buying Options',
        body: `**Call Buying:**
\`\`\`
View: Bullish
Max Loss: Premium paid
Max Profit: Unlimited
Breakeven: Strike + Premium

Example:
Buy NIFTY 22,000 CE at ₹200
Lot: 25
Cost: ₹200 × 25 = ₹5,000

If NIFTY goes to 22,500:
Intrinsic: 22,500 - 22,000 = ₹500
Profit: (₹500 - ₹200) × 25 = ₹7,500
\`\`\`

**Put Buying:**
\`\`\`
View: Bearish
Max Loss: Premium paid
Max Profit: Strike price (practically)
Breakeven: Strike - Premium
\`\`\``,
        interactiveComponent: 'payoff-chart'
      },
      {
        heading: 'Selling Options',
        body: `**Call Selling (Short Call):**
\`\`\`
View: Neutral to bearish
Max Profit: Premium received
Max Loss: Unlimited!
Keep premium if expires worthless
\`\`\`

**Put Selling (Short Put):**
\`\`\`
View: Neutral to bullish
Max Profit: Premium received
Max Loss: Strike × Lot Size (huge)
Keep premium if expires worthless
\`\`\`

**⚠️ Warning:**
Option selling has unlimited risk.
- Requires high margin
- Naked selling is extremely risky
- Spreads limit risk`
      }
    ],
    keyTakeaways: [
      'Calls = right to buy (bullish); Puts = right to sell (bearish)',
      'Buyers pay premium with limited risk; sellers collect premium with higher risk',
      'Premium = Intrinsic value + Time value',
      'Option buying has defined risk; selling has potentially unlimited risk'
    ],
    quiz: [
      {
        id: 'q1-call-view',
        question: 'Buying a call option indicates what view?',
        options: ['Bearish', 'Bullish', 'Neutral', 'Confused'],
        correctAnswer: 1,
        explanation: 'Call buyers profit when price goes up, so buying a call indicates a bullish view.'
      },
      {
        id: 'q2-max-loss',
        question: 'Maximum loss for a call buyer is:',
        options: ['Unlimited', 'Strike price', 'Premium paid', 'Zero'],
        correctAnswer: 2,
        explanation: 'Option buyers can only lose the premium they paid - their risk is limited and defined.'
      },
      {
        id: 'q3-otm',
        question: 'NIFTY at 22,000. A 22,200 call is:',
        options: ['ITM', 'ATM', 'OTM', 'None'],
        correctAnswer: 2,
        explanation: 'Strike 22,200 is above spot 22,000, so the call has no intrinsic value = Out of The Money.'
      }
    ],
    nextLessonId: 'understanding-greeks',
    prevLessonId: 'futures-contracts'
  },
  {
    id: 'understanding-greeks',
    moduleId: 'fno-basics',
    title: 'Understanding Option Greeks',
    description: 'Master Delta, Gamma, Theta, Vega, and Rho',
    duration: '20 min',
    difficulty: 'advanced',
    introduction: 'The Greeks measure how option prices change with various factors. Understanding them is essential for option trading.',
    sections: [
      {
        heading: 'Delta',
        body: `**What is Delta?**
Rate of change of option price with underlying price.

**Values:**
- Calls: 0 to +1
- Puts: 0 to -1
- ATM options: ~0.5 (calls) or -0.5 (puts)

**Interpretation:**
\`\`\`
Delta = 0.5 means:
If underlying moves ₹10
Option moves ~₹5

Example:
NIFTY 22,000 CE, Delta = 0.55
If NIFTY goes up ₹100:
Option premium increases ~₹55
\`\`\`

**Uses:**
- Probability of expiring ITM
- Hedge ratio for delta neutral
- Position sizing`,
        interactiveComponent: 'greeks-calculator'
      },
      {
        heading: 'Gamma',
        body: `**What is Gamma?**
Rate of change of Delta itself.

**Characteristics:**
- Highest for ATM options
- Decreases for ITM/OTM
- Higher near expiry

**Why It Matters:**
\`\`\`
High Gamma (ATM, near expiry):
- Delta changes rapidly
- Big swings in position value
- Hard to delta hedge

Low Gamma (ITM/OTM):
- Delta more stable
- Easier to manage
\`\`\`

**Gamma Risk:**
Near expiry ATM options have explosive gamma.
Small price moves cause huge P&L swings.`
      },
      {
        heading: 'Theta',
        body: `**What is Theta?**
Time decay - value lost per day.

**Characteristics:**
- Always negative for buyers
- Positive for sellers (they benefit)
- Accelerates near expiry
- Highest for ATM options

**Example:**
\`\`\`
Theta = -5 means:
Option loses ₹5 per day (all else equal)

Weekly option, 2 days to expiry:
Monday ₹50 premium
Tuesday: ₹30 (lost ₹20)
Thursday (expiry): ₹5 or zero
\`\`\`

**Time Decay Acceleration:**
- 30 days out: Slow decay
- 7 days out: Moderate decay
- 2 days out: Rapid decay
- Expiry day: Maximum decay`
      },
      {
        heading: 'Vega and Rho',
        body: `**Vega:**
Sensitivity to volatility changes.

\`\`\`
Vega = 10 means:
If IV increases 1%, premium increases ₹10

High Vega = More sensitive to IV
ATM options have highest Vega
\`\`\`

**Volatility Impact:**
- Before events (earnings): IV rises, premiums up
- After events: IV crashes, premiums collapse
- Called "IV crush"

**Rho:**
Sensitivity to interest rates.
- Minor impact in India
- Can mostly ignore for short-term trades
- Matters for long-dated options

**Greek Summary:**
\`\`\`
| Greek | Measures | Buyers | Sellers |
|-------|----------|--------|---------|
| Delta | Direction| Want high | Want low |
| Gamma | Delta stability | Risky | Risky |
| Theta | Time decay | Enemy | Friend |
| Vega | Vol sensitivity | Varies | Varies |
\`\`\``
      }
    ],
    keyTakeaways: [
      'Delta measures how much option price moves with underlying',
      'Gamma measures how fast Delta changes - highest for ATM near expiry',
      'Theta is time decay - always works against buyers',
      'Vega measures volatility sensitivity - important around events'
    ],
    quiz: [
      {
        id: 'q1-delta',
        question: 'A call with Delta = 0.7. If underlying up ₹100, option premium:',
        options: ['Up ₹30', 'Up ₹70', 'Down ₹70', 'Up ₹100'],
        correctAnswer: 1,
        explanation: 'Delta 0.7 means 70% move. ₹100 × 0.7 = ₹70 increase in premium.'
      },
      {
        id: 'q2-theta',
        question: 'Who benefits from Theta (time decay)?',
        options: ['Option buyers', 'Option sellers', 'Both equally', 'Neither'],
        correctAnswer: 1,
        explanation: 'Time decay erodes option value. Sellers collect premium that decays, so they benefit.'
      },
      {
        id: 'q3-gamma',
        question: 'When is Gamma highest?',
        options: [
          'Deep ITM options',
          'Deep OTM options',
          'ATM options near expiry',
          'Far dated options'
        ],
        correctAnswer: 2,
        explanation: 'ATM options near expiry have maximum gamma - their delta can swing wildly with small price moves.'
      }
    ],
    nextLessonId: 'option-strategies',
    prevLessonId: 'options-calls-puts'
  },
  // Placeholders for remaining F&O lessons
  {
    id: 'option-strategies',
    moduleId: 'fno-basics',
    title: 'Common Option Strategies',
    description: 'Learn popular strategies like spreads, straddles, and iron condors',
    duration: '22 min',
    difficulty: 'advanced',
    introduction: 'Option strategies combine multiple legs to create specific risk/reward profiles.',
    sections: [
      {
        heading: 'Covered Call',
        body: `Own stock + Sell OTM call.
- Income from premium
- Limited upside (stock called away at strike)
- Still exposed to downside

Best when: Neutral to mildly bullish, want income.`,
        interactiveComponent: 'payoff-chart'
      },
      {
        heading: 'Bull Call Spread',
        body: `Buy ATM call + Sell OTM call.
\`\`\`
Example:
Buy 22,000 CE at ₹200
Sell 22,200 CE at ₹100
Net cost: ₹100

Max Profit: ₹200 - ₹100 = ₹100
Max Loss: ₹100 (net premium)
Breakeven: 22,100
\`\`\`

Lower cost than naked call, but capped profit.`
      },
      {
        heading: 'Straddle & Strangle',
        body: `**Long Straddle:** Buy ATM Call + ATM Put
- Profit from big move in either direction
- Need volatility to pay for both premiums
- Best before major events

**Long Strangle:** Buy OTM Call + OTM Put
- Cheaper than straddle
- Need bigger move to profit
- Less theta decay`
      },
      {
        heading: 'Iron Condor',
        body: `Sell OTM put spread + Sell OTM call spread.
- Collect premium from both sides
- Profit if price stays in range
- Popular for weekly income

\`\`\`
Example:
Sell 21,800 PE, Buy 21,600 PE
Sell 22,200 CE, Buy 22,400 CE

Max profit: Total premium received
Max loss: Spread width - premium
\`\`\`

**Risk:** Big moves can wipe out weeks of gains.`
      }
    ],
    keyTakeaways: [
      'Spreads limit risk but also cap profits',
      'Straddles profit from movement; direction doesn\'t matter',
      'Iron condors profit from stability and time decay',
      'Match strategy to your market outlook'
    ],
    quiz: [
      {
        id: 'q1-covered',
        question: 'A covered call involves:',
        options: [
          'Buying call and put',
          'Owning stock and selling call',
          'Selling naked call',
          'Buying two calls'
        ],
        correctAnswer: 1,
        explanation: 'Covered call = long stock + short call. The stock "covers" the call obligation if assigned.'
      },
      {
        id: 'q2-straddle',
        question: 'When is a long straddle profitable?',
        options: [
          'Price stays flat',
          'Price moves significantly in either direction',
          'Only when price goes up',
          'Only when price goes down'
        ],
        correctAnswer: 1,
        explanation: 'Long straddles profit from big moves in either direction. They lose if price stays near the strike.'
      },
      {
        id: 'q3-condor',
        question: 'An iron condor profits when:',
        options: [
          'Price has a big move',
          'Price stays within a range',
          'Volatility spikes',
          'There\'s a gap opening'
        ],
        correctAnswer: 1,
        explanation: 'Iron condors sell premium on both sides. They profit from stability and time decay when price stays in range.'
      }
    ],
    nextLessonId: 'fno-risk-management',
    prevLessonId: 'understanding-greeks'
  },
  {
    id: 'fno-risk-management',
    moduleId: 'fno-basics',
    title: 'F&O Risk Management',
    description: 'Special risk considerations for derivatives trading',
    duration: '15 min',
    difficulty: 'advanced',
    introduction: 'F&O requires extra risk management due to leverage, time decay, and margin requirements.',
    sections: [
      {
        heading: 'Leverage Risk',
        body: `**The Double-Edged Sword:**
Futures leverage works both ways.
\`\`\`
₹65,000 margin controls ₹5,50,000 position
8.5× leverage

+2% move = +17% on margin (₹11,000 profit)
-2% move = -17% on margin (₹11,000 loss)
\`\`\`

**Key Rules:**
- Never use full available leverage
- Size positions for 1-2% account risk
- Have cash buffer for margin calls`
      },
      {
        heading: 'Option-Specific Risks',
        body: `**For Buyers:**
- Can lose 100% of premium
- Time works against you
- Need to be right on direction AND timing

**For Sellers:**
- Unlimited loss potential (naked)
- Margin requirements high
- Gap risk overnight

**Mitigation:**
- Use spreads to limit risk
- Avoid expiry week gamma risk
- Never sell naked near events`
      },
      {
        heading: 'Position Sizing for F&O',
        body: `**Futures Sizing:**
\`\`\`
Risk = 1% of capital
Position value = Risk / (Stop % × Lot Size)

Example:
Capital: ₹10,00,000
Risk: ₹10,000
Stop: 1% from entry
Position: ₹10,000 / 0.01 = ₹10,00,000 notional
= About 2 lots of NIFTY max
\`\`\`

**Options Sizing:**
\`\`\`
Risk per option trade: 1-2% of capital
Never put more than 5% in single expiry
\`\`\``
      },
      {
        heading: 'Emergency Protocols',
        body: `**Margin Call:**
1. Add funds immediately
2. Or close positions to reduce margin
3. Never ignore - broker will liquidate

**Big Adverse Move:**
1. Have pre-defined max loss
2. Exit if reached - no exceptions
3. Don't average down on losers

**Event Risk:**
- Elections, RBI policy, Budget
- Reduce positions before
- Close naked positions
- Prepare for gaps`
      }
    ],
    keyTakeaways: [
      'F&O leverage amplifies gains AND losses equally',
      'Use spreads to limit risk when selling options',
      'Size positions so 1 loss = 1-2% of capital max',
      'Have clear exit rules and follow them'
    ],
    quiz: [
      {
        id: 'q1-leverage',
        question: '8× leverage with 3% adverse move loses what % of margin?',
        options: ['3%', '8%', '24%', '100%'],
        correctAnswer: 2,
        explanation: '8× leverage × 3% move = 24% loss on margin. Leverage amplifies both ways.'
      },
      {
        id: 'q2-naked',
        question: 'Naked option selling risk is:',
        options: ['Limited to premium', 'Unlimited/Very high', 'Zero', 'Same as buying'],
        correctAnswer: 1,
        explanation: 'Naked (uncovered) option selling has unlimited risk. A big move against you can cause huge losses.'
      },
      {
        id: 'q3-sizing',
        question: 'Maximum recommended risk per F&O trade:',
        options: ['0.5%', '1-2%', '5-10%', '25%'],
        correctAnswer: 1,
        explanation: '1-2% risk per trade is recommended. This ensures surviving a losing streak without account devastation.'
      }
    ],
    nextLessonId: 'paper-trading-getting-started',
    prevLessonId: 'option-strategies'
  }
];

// ============================================
// MODULE 6: PAPER TRADING GUIDE
// ============================================

const paperTradingLessons: LessonContent[] = [
  {
    id: 'paper-trading-getting-started',
    moduleId: 'paper-trading-guide',
    title: 'Getting Started with Paper Trading',
    description: 'Set up your paper trading account and understand the simulator',
    duration: '10 min',
    difficulty: 'beginner',
    introduction: 'Paper trading lets you practice strategies with virtual money before risking real capital. It\'s essential for building confidence and testing ideas.',
    sections: [
      {
        heading: 'Why Paper Trade?',
        body: `**Benefits:**
1. Risk-free learning environment
2. Test strategies before live trading
3. Build execution skills
4. Validate backtest results
5. Develop trading discipline

**What to Practice:**
- Order execution (market, limit, SL)
- Position sizing calculations
- Entry and exit timing
- Trade management
- Emotional reactions to wins/losses`
      },
      {
        heading: 'Setting Up Your Account',
        body: `**Initial Setup:**
1. Navigate to Paper Trading section
2. Default virtual capital: ₹1,00,000
3. Can reset anytime if needed

**Account Settings:**
- Starting balance
- Default order type
- Slippage simulation
- Transaction costs

**Tracking:**
- All trades logged automatically
- P&L updated in real-time
- Performance metrics calculated`
      },
      {
        heading: 'Understanding the Interface',
        body: `**Main Components:**

**1. Watchlist:**
- Add stocks to monitor
- Real-time prices
- Quick order buttons

**2. Chart:**
- Live price charts
- Technical indicators
- Drawing tools

**3. Order Panel:**
- Enter trades
- Set stop-loss and target
- View open orders

**4. Positions:**
- Current open positions
- Unrealized P&L
- Quick close buttons`
      },
      {
        heading: 'Best Practices',
        body: `**Treat It Like Real Money:**
- Follow your actual trading plan
- Use real position sizing
- Maintain discipline
- Don't "redo" bad trades

**Keep a Journal:**
- Log every trade reason
- Record emotions
- Note what you learned
- Review weekly

**Minimum Duration:**
- Trade for 2+ months
- Complete 50+ trades
- Before considering live trading`
      }
    ],
    keyTakeaways: [
      'Paper trading is essential practice before live trading',
      'Treat virtual money like real money for proper learning',
      'Track everything - trades, emotions, lessons',
      'Minimum 50 trades over 2 months before going live'
    ],
    quiz: [
      {
        id: 'q1-why-paper',
        question: 'Primary benefit of paper trading is:',
        options: [
          'Making real money',
          'Risk-free practice and strategy validation',
          'It\'s required by law',
          'Paper trading is faster'
        ],
        correctAnswer: 1,
        explanation: 'Paper trading lets you practice and validate strategies without risking real capital.'
      },
      {
        id: 'q2-treat',
        question: 'How should you treat paper trading capital?',
        options: [
          'Take big risks since it\'s not real',
          'Like real money - same discipline',
          'Trade more frequently than you would live',
          'Ignore losses'
        ],
        correctAnswer: 1,
        explanation: 'Treating paper money like real money builds the discipline and habits you\'ll need for live trading.'
      },
      {
        id: 'q3-min',
        question: 'Minimum recommended paper trading before live:',
        options: [
          '5 trades in 1 week',
          '50+ trades over 2+ months',
          '1 profitable trade',
          '100 trades in 1 day'
        ],
        correctAnswer: 1,
        explanation: '50+ trades over 2+ months provides statistically meaningful results and tests various market conditions.'
      }
    ],
    nextLessonId: 'first-paper-trade',
    prevLessonId: 'fno-risk-management'
  },
  {
    id: 'first-paper-trade',
    moduleId: 'paper-trading-guide',
    title: 'Placing Your First Paper Trade',
    description: 'Step-by-step guide to executing paper trades',
    duration: '12 min',
    difficulty: 'beginner',
    introduction: 'Let\'s walk through placing your first paper trade from start to finish.',
    sections: [
      {
        heading: 'Selecting a Stock',
        body: `**Start with Liquid Stocks:**
Choose from NIFTY 50 for best experience:
- RELIANCE
- TCS
- HDFC Bank
- Infosys
- ICICI Bank

**Why Liquid Stocks:**
- Realistic fills
- Accurate prices
- Good for learning`
      },
      {
        heading: 'Analyzing for Entry',
        body: `**Before Trading, Check:**
1. Overall market trend (NIFTY direction)
2. Stock trend (above/below 50 SMA?)
3. Entry signal (RSI, MA crossover, etc.)
4. Stop-loss level
5. Target level
6. Risk-reward ratio (minimum 2:1)

**Calculate Position Size:**
\`\`\`
Risk amount: 1% of ₹1,00,000 = ₹1,000
Stop distance: Entry - SL
Shares = Risk / Stop distance
\`\`\``
      },
      {
        heading: 'Executing the Trade',
        body: `**Step by Step:**
1. Open order panel
2. Select stock from watchlist
3. Choose Buy or Sell
4. Enter quantity (calculated position size)
5. Set stop-loss price
6. Set target price (optional)
7. Review order details
8. Confirm order

**Order Types:**
- Market: Execute now at current price
- Limit: Execute at specified price or better
- SL-M: Stop-loss market order`
      },
      {
        heading: 'Managing the Trade',
        body: `**After Entry:**
1. Monitor price action
2. Don't move stop further away
3. Consider trailing stop if in profit

**Exit Triggers:**
- Stop-loss hit: Exit immediately
- Target hit: Take profit
- Signal reversal: Consider exit
- Time exit: If nothing happening

**Record Everything:**
- Entry reason
- How it felt
- Exit reason
- Lessons learned`
      }
    ],
    keyTakeaways: [
      'Start with liquid NIFTY 50 stocks',
      'Always calculate position size before entry',
      'Set stop-loss at order placement time',
      'Record everything for learning'
    ],
    quiz: [
      {
        id: 'q1-liquid',
        question: 'Why start with liquid stocks?',
        options: [
          'They always go up',
          'Realistic fills and accurate prices',
          'Lower brokerage',
          'Required by platform'
        ],
        correctAnswer: 1,
        explanation: 'Liquid stocks give realistic execution and accurate prices, making paper trading closer to real trading.'
      },
      {
        id: 'q2-before',
        question: 'What must you calculate BEFORE entering a trade?',
        options: [
          'Tomorrow\'s price',
          'Position size based on risk',
          'Broker\'s profit',
          'Weather forecast'
        ],
        correctAnswer: 1,
        explanation: 'Always calculate position size based on your risk amount and stop distance before entering.'
      },
      {
        id: 'q3-sl',
        question: 'When should you set your stop-loss?',
        options: [
          'After the trade goes against you',
          'At order placement time',
          'Never use stops in paper trading',
          'Only if you feel like it'
        ],
        correctAnswer: 1,
        explanation: 'Set stop-loss at the time of order placement. Good habits in paper trading carry over to live trading.'
      }
    ],
    nextLessonId: 'tracking-paper-performance',
    prevLessonId: 'paper-trading-getting-started'
  },
  {
    id: 'tracking-paper-performance',
    moduleId: 'paper-trading-guide',
    title: 'Tracking Your Performance',
    description: 'Analyze your paper trading results effectively',
    duration: '11 min',
    difficulty: 'beginner',
    introduction: 'Tracking performance helps you identify strengths and weaknesses in your trading.',
    sections: [
      {
        heading: 'Key Metrics to Track',
        body: `**Must Track:**
- Total P&L
- Win rate
- Average win vs average loss
- Largest win and loss
- Number of trades

**Calculate:**
\`\`\`
Profit Factor = Gross Wins / Gross Losses
Expectancy = (Win% × Avg Win) - (Loss% × Avg Loss)
\`\`\`

**Compare to Backtest:**
Are live results within 20% of backtest?`
      },
      {
        heading: 'Trade Journal',
        body: `**For Each Trade Record:**
1. Date and time
2. Stock and direction
3. Entry reason (setup)
4. Entry and exit prices
5. P&L
6. Emotions during trade
7. What went well
8. What could improve

**Weekly Review:**
- Total trades taken
- Win/loss breakdown
- Best and worst trades
- Patterns noticed`
      },
      {
        heading: 'Performance Dashboard',
        body: `**AlgoTrade Pro Tracks:**
- Equity curve (visual P&L over time)
- Daily/weekly/monthly returns
- Win rate by setup type
- Average holding time
- Risk metrics

**Use Dashboard To:**
- Spot winning patterns
- Identify losing setups
- Track improvement over time`
      },
      {
        heading: 'Making Improvements',
        body: `**Common Issues Found:**
1. Overtrading: Too many trades
2. Undersizing: Missing good moves
3. Early exits: Closing winners too soon
4. Late exits: Holding losers too long

**Action Steps:**
- If win rate low: Review entry criteria
- If avg loss > avg win: Improve exits
- If drawdown high: Reduce position size
- If flat: Strategy may need adjustment`
      }
    ],
    keyTakeaways: [
      'Track win rate, P&L, profit factor, and expectancy',
      'Keep detailed trade journal with emotions and lessons',
      'Compare paper results to backtest expectations',
      'Review weekly and make data-driven improvements'
    ],
    quiz: [
      {
        id: 'q1-pf',
        question: 'Profit Factor = ?',
        options: [
          'Wins / Losses count',
          'Gross Wins / Gross Losses',
          'Average win only',
          'Total P&L'
        ],
        correctAnswer: 1,
        explanation: 'Profit Factor = Gross Profits / Gross Losses. Above 1.5 is good, above 2.0 is excellent.'
      },
      {
        id: 'q2-journal',
        question: 'What should NOT be in a trade journal?',
        options: [
          'Entry reason',
          'Emotions during trade',
          'Random predictions for tomorrow',
          'Exit price'
        ],
        correctAnswer: 2,
        explanation: 'Trade journals should contain facts about past trades and lessons learned, not random predictions.'
      },
      {
        id: 'q3-compare',
        question: 'Paper results should be within what % of backtest?',
        options: ['1%', '10%', '20%', '50%'],
        correctAnswer: 2,
        explanation: '20% is reasonable variance due to slippage and real-time execution differences.'
      }
    ],
    nextLessonId: 'transitioning-to-live',
    prevLessonId: 'first-paper-trade'
  },
  {
    id: 'transitioning-to-live',
    moduleId: 'paper-trading-guide',
    title: 'Transitioning to Live Trading',
    description: 'When and how to move from paper to real money',
    duration: '14 min',
    difficulty: 'beginner',
    introduction: 'Moving from paper to live trading is a significant step. This lesson helps you do it safely.',
    sections: [
      {
        heading: 'Readiness Checklist',
        body: `**Before Going Live:**
\`\`\`
□ 50+ paper trades completed
□ 2+ months of paper trading
□ Positive expectancy proven
□ Metrics close to backtest
□ Trading plan documented
□ Emotionally comfortable
□ Capital you can afford to lose
□ Broker account ready
\`\`\`

**If Any Unchecked:**
Continue paper trading.`
      },
      {
        heading: 'Broker Setup',
        body: `**Connect to Broker:**
AlgoTrade Pro supports:
- Zerodha (Kite Connect API)
- Upstox (API)
- Angel One (Smart API)

**Steps:**
1. Open broker account
2. Enable API access
3. Connect in AlgoTrade Pro
4. Verify connection with small test

**Start with Equity:**
- Simpler than F&O
- Lower risk
- Same platform skills apply`
      },
      {
        heading: 'Gradual Size Increase',
        body: `**Phase 1 (Week 1-2): 25% Size**
- Quarter of planned position size
- Focus on execution
- Verify fills and slippage

**Phase 2 (Week 3-4): 50% Size**
- If Phase 1 went well
- Still building confidence
- Monitoring performance

**Phase 3 (Month 2): 75% Size**
- Nearly full deployment
- Should feel comfortable

**Phase 4 (Month 3+): 100% Size**
- Full position sizing
- Ongoing monitoring`
      },
      {
        heading: 'Live Trading Psychology',
        body: `**Real Money Differences:**
- Losses feel real and painful
- Fear of missing out (FOMO)
- Tendency to revenge trade
- Overconfidence after wins

**Coping Strategies:**
- Stick to the plan rigidly
- Take breaks after losses
- Celebrate process, not outcomes
- Maintain paper trading journal habit

**Red Flags (Pause Trading):**
- Overriding your system
- Increasing size after losses
- Skipping stop-losses
- Can't sleep due to positions`
      }
    ],
    keyTakeaways: [
      'Complete full readiness checklist before going live',
      'Start at 25% size and increase gradually',
      'Expect psychological differences with real money',
      'Pause if you see red flag behaviors'
    ],
    quiz: [
      {
        id: 'q1-ready',
        question: 'Minimum paper trades before live:',
        options: ['10', '25', '50+', '100 mandatory'],
        correctAnswer: 2,
        explanation: '50+ trades provides statistically meaningful data to validate your strategy and skills.'
      },
      {
        id: 'q2-start-size',
        question: 'What size should you start with when going live?',
        options: ['100%', '75%', '50%', '25%'],
        correctAnswer: 3,
        explanation: 'Start at 25% to minimize damage while you verify execution and adjust to real money emotions.'
      },
      {
        id: 'q3-red-flag',
        question: 'Which is a red flag to pause live trading?',
        options: [
          'Following your trading plan',
          'Taking small positions',
          'Skipping stop-losses to "give it more room"',
          'Keeping a trade journal'
        ],
        correctAnswer: 2,
        explanation: 'Skipping stop-losses is dangerous behavior that leads to large losses. Pause and review if this happens.'
      }
    ],
    nextLessonId: undefined,
    prevLessonId: 'tracking-paper-performance'
  }
];

// ============================================
// COMBINE ALL MODULES
// ============================================

export const MODULES: Module[] = [
  {
    id: 'trading-fundamentals',
    title: 'Trading Fundamentals',
    description: 'Master the basics of algorithmic trading and Indian markets',
    icon: 'BookOpen',
    color: 'from-blue-500 to-cyan-500',
    category: 'Beginner',
    difficulty: 'beginner',
    lessonCount: tradingFundamentalsLessons.length,
    estimatedTime: '1.5 hours',
    lessons: tradingFundamentalsLessons
  },
  {
    id: 'technical-indicators',
    title: 'Technical Indicators',
    description: 'Learn to use SMA, EMA, RSI, MACD, Bollinger Bands, and more',
    icon: 'TrendingUp',
    color: 'from-purple-500 to-pink-500',
    category: 'Intermediate',
    difficulty: 'intermediate',
    lessonCount: technicalIndicatorsLessons.length,
    estimatedTime: '2 hours',
    lessons: technicalIndicatorsLessons
  },
  {
    id: 'risk-management',
    title: 'Risk Management',
    description: 'Protect your capital with position sizing and stop-losses',
    icon: 'Shield',
    color: 'from-green-500 to-emerald-500',
    category: 'Essential',
    difficulty: 'intermediate',
    lessonCount: riskManagementLessons.length,
    estimatedTime: '1.5 hours',
    lessons: riskManagementLessons
  },
  {
    id: 'strategy-building',
    title: 'Strategy Building',
    description: 'Design, backtest, and optimize trading strategies',
    icon: 'Cpu',
    color: 'from-orange-500 to-amber-500',
    category: 'Intermediate',
    difficulty: 'intermediate',
    lessonCount: strategyBuildingLessons.length,
    estimatedTime: '2 hours',
    lessons: strategyBuildingLessons
  },
  {
    id: 'fno-basics',
    title: 'F&O Basics',
    description: 'Introduction to futures, options, and derivatives trading',
    icon: 'BarChart3',
    color: 'from-red-500 to-rose-500',
    category: 'Advanced',
    difficulty: 'advanced',
    lessonCount: fnoBasicsLessons.length,
    estimatedTime: '2.5 hours',
    lessons: fnoBasicsLessons
  },
  {
    id: 'paper-trading-guide',
    title: 'Paper Trading Guide',
    description: 'Practice trading without risking real money',
    icon: 'FileText',
    color: 'from-indigo-500 to-violet-500',
    category: 'Beginner',
    difficulty: 'beginner',
    lessonCount: paperTradingLessons.length,
    estimatedTime: '45 min',
    lessons: paperTradingLessons
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getAllLessons(): LessonContent[] {
  return MODULES.flatMap(m => m.lessons);
}

export function getModuleById(moduleId: string): Module | undefined {
  return MODULES.find(m => m.id === moduleId);
}

export function getLessonById(lessonId: string): LessonContent | undefined {
  return getAllLessons().find(l => l.id === lessonId);
}

export function getLessonsByModule(moduleId: string): LessonContent[] {
  const module = getModuleById(moduleId);
  return module?.lessons || [];
}

export function getNextLesson(currentLessonId: string): LessonContent | undefined {
  const lesson = getLessonById(currentLessonId);
  if (lesson?.nextLessonId) {
    return getLessonById(lesson.nextLessonId);
  }
  return undefined;
}

export function getPreviousLesson(currentLessonId: string): LessonContent | undefined {
  const lesson = getLessonById(currentLessonId);
  if (lesson?.prevLessonId) {
    return getLessonById(lesson.prevLessonId);
  }
  return undefined;
}

export function getTotalLessonCount(): number {
  return getAllLessons().length;
}

export function getTotalEstimatedTime(): string {
  // Sum up all module times
  return '~10 hours';
}

// Helper function to get lesson by module and lesson ID
export function getLesson(moduleId: string, lessonId: string): LessonContent | undefined {
  const module = getModuleById(moduleId);
  return module?.lessons.find(l => l.id === lessonId);
}

// Helper function to get adjacent lessons for navigation
export function getAdjacentLessons(moduleId: string, lessonId: string): { prev: LessonContent | undefined; next: LessonContent | undefined } {
  const module = getModuleById(moduleId);
  if (!module) return { prev: undefined, next: undefined };
  
  const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
  if (lessonIndex === -1) return { prev: undefined, next: undefined };
  
  return {
    prev: lessonIndex > 0 ? module.lessons[lessonIndex - 1] : undefined,
    next: lessonIndex < module.lessons.length - 1 ? module.lessons[lessonIndex + 1] : undefined,
  };
}
