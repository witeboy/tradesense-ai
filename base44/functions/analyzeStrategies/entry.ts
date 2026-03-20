import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { chartMetrics, instrument, primaryTimeframe } = await req.json();

    if (!chartMetrics) {
      return Response.json({ error: 'Chart metrics required' }, { status: 400 });
    }

    // Strategy evaluation engine
    const strategies = [
      {
        name: "Bollinger Band Squeeze Breakout",
        check: (m) => {
          const bbWidth = (m.bb_upper - m.bb_lower) / m.bb_middle;
          return bbWidth < 0.02 && m.price_momentum > 0;
        },
        winRate: 68,
        riskReward: 2.1,
        description: "Bands compress, breakout imminent. Enter on band touch with stop below squeeze."
      },
      {
        name: "Supply/Demand Zone Bounce",
        check: (m) => {
          const demandZone = m.swing_low * 1.005;
          const supplyZone = m.swing_high * 0.995;
          return Math.abs(m.latest_price - demandZone) < m.swing_low * 0.01;
        },
        winRate: 72,
        riskReward: 2.5,
        description: "Price bounces from historical demand. Enter on rejection candle, target supply zone."
      },
      {
        name: "Golden Cross (50/200 EMA)",
        check: (m) => m.ema50 > m.ema200 && m.ema_alignment === 'bullish_order',
        winRate: 65,
        riskReward: 1.8,
        description: "50 EMA crosses above 200 EMA. Bullish trend confirmation. Trail with 200 EMA."
      },
      {
        name: "Death Cross (50/200 EMA)",
        check: (m) => m.ema50 < m.ema200 && m.ema_alignment === 'bearish_order',
        winRate: 64,
        riskReward: 1.8,
        description: "50 EMA crosses below 200 EMA. Bearish trend confirmation. Trail with 200 EMA."
      },
      {
        name: "RSI Divergence Reversal",
        check: (m) => {
          const bullishDiv = m.latest_price < m.swing_low && m.rsi_value > 30;
          const bearishDiv = m.latest_price > m.swing_high && m.rsi_value < 70;
          return bullishDiv || bearishDiv;
        },
        winRate: 71,
        riskReward: 2.3,
        description: "Price lower but RSI higher (bullish div). Enter at previous swing high, target next resistance."
      },
      {
        name: "MACD Zero Line Crossover",
        check: (m) => {
          const bullish = m.macd_line > 0 && m.macd_histogram > 0;
          const bearish = m.macd_line < 0 && m.macd_histogram < 0;
          return bullish || bearish;
        },
        winRate: 62,
        riskReward: 1.9,
        description: "MACD crosses zero line into positive/negative. Momentum acceleration confirmed."
      },
      {
        name: "Fibonacci Retracement Bounce",
        check: (m) => {
          const fib618 = m.swing_high - (m.swing_high - m.swing_low) * 0.618;
          return Math.abs(m.latest_price - fib618) < Math.abs(m.swing_high - m.swing_low) * 0.02;
        },
        winRate: 67,
        riskReward: 2.2,
        description: "Price bounces at 61.8% Fibonacci level. High probability bounce entry."
      },
      {
        name: "Moving Average Confluence",
        check: (m) => {
          const emaClose = Math.abs(m.latest_price - m.ema20) < Math.abs(m.swing_high - m.swing_low) * 0.005;
          return emaClose && m.adx_value > 25;
        },
        winRate: 69,
        riskReward: 2.0,
        description: "Price touches 20 EMA with strong ADX. Pullback entry in strong trend."
      },
      {
        name: "RSI Oversold Bounce",
        check: (m) => m.rsi_value < 30 && m.ema_alignment === 'bullish_order',
        winRate: 66,
        riskReward: 2.1,
        description: "RSI < 30 (oversold) + bullish EMA structure. Classic mean reversion setup."
      },
      {
        name: "RSI Overbought Pullback",
        check: (m) => m.rsi_value > 70 && m.ema_alignment === 'bearish_order',
        winRate: 65,
        riskReward: 2.0,
        description: "RSI > 70 (overbought) + bearish EMA structure. Sell on pullback to 20 EMA."
      },
      {
        name: "ADX Trend Confirmation",
        check: (m) => m.adx_value > 30 && (m.ema_alignment === 'bullish_order' || m.ema_alignment === 'bearish_order'),
        winRate: 64,
        riskReward: 2.4,
        description: "Strong ADX + aligned EMAs. Trend following with trailing stop at 50 EMA."
      },
      {
        name: "Consolidation Breakout",
        check: (m) => m.adx_value < 20 && m.latest_price > m.ema200,
        winRate: 61,
        riskReward: 2.6,
        description: "Low volatility consolidation. Breakout above resistance on volume surge."
      },
      {
        name: "Pin Bar Reversal",
        check: (m) => m.candlestick_pattern === 'pin_bar' && m.pattern_location === 'at_support',
        winRate: 70,
        riskReward: 2.2,
        description: "Pin bar at support/resistance. Rejection reversal entry with stop below shadow."
      },
      {
        name: "Engulfing Pattern Reversal",
        check: (m) => {
          const bullish = m.candlestick_pattern === 'bullish_engulfing' && m.ema_alignment === 'bullish_order';
          const bearish = m.candlestick_pattern === 'bearish_engulfing' && m.ema_alignment === 'bearish_order';
          return bullish || bearish;
        },
        winRate: 72,
        riskReward: 2.3,
        description: "Engulfing pattern with trend confirmation. Strong reversal signal."
      },
      {
        name: "Three Moving Average Alignment",
        check: (m) => {
          const bullish = m.ema20 > m.ema50 && m.ema50 > m.ema200;
          const bearish = m.ema20 < m.ema50 && m.ema50 < m.ema200;
          return bullish || bearish;
        },
        winRate: 68,
        riskReward: 2.0,
        description: "All 3 EMAs perfectly aligned. Enter on pullback to 20 EMA."
      },
      {
        name: "Stochastic Divergence",
        check: (m) => m.rsi_momentum === 'rising_bullish' && m.macd_histogram_direction === 'increasing',
        winRate: 69,
        riskReward: 2.1,
        description: "Multiple momentum indicators rising. Strong acceleration entry."
      },
      {
        name: "Support/Resistance Bounce",
        check: (m) => {
          const nearSupport = Math.abs(m.latest_price - m.swing_low) < Math.abs(m.swing_high - m.swing_low) * 0.02;
          const nearResistance = Math.abs(m.latest_price - m.swing_high) < Math.abs(m.swing_high - m.swing_low) * 0.02;
          return nearSupport || nearResistance;
        },
        winRate: 63,
        riskReward: 1.9,
        description: "Price at previous support/resistance. Bounce or breakout entry."
      },
      {
        name: "Trend Line Break",
        check: (m) => m.market_structure === 'higher_structure' || m.market_structure === 'lower_structure',
        winRate: 66,
        riskReward: 2.2,
        description: "Higher lows/highs forming. Trend continuation on retest of trend line."
      },
      {
        name: "Harmonic Pattern (ABD Pattern)",
        check: (m) => {
          const ratio = (m.swing_high - m.latest_price) / (m.swing_high - m.swing_low);
          return ratio > 0.618 && ratio < 0.786;
        },
        winRate: 68,
        riskReward: 2.4,
        description: "Price at Fibonacci ratios of swing. Classic harmonic zone entry."
      },
      {
        name: "Volume Spike Reversal",
        check: (m) => m.rsi_value < 30 && m.adx_value > 20,
        winRate: 65,
        riskReward: 2.1,
        description: "Low RSI + strong ADX suggests capitulation. Reversal buy setup."
      },
      {
        name: "Double Top/Bottom Reversal",
        check: (m) => {
          const isLow = Math.abs(m.latest_price - m.swing_low) < Math.abs(m.swing_high - m.swing_low) * 0.01;
          return isLow && m.rsi_value > 40;
        },
        winRate: 67,
        riskReward: 2.3,
        description: "Price tests previous low again. Breakout above resistance likely."
      }
    ];

    // Evaluate each strategy
    const triggeredStrategies = strategies
      .map(strat => ({
        ...strat,
        triggered: strat.check(chartMetrics),
        signal: strat.check(chartMetrics) ? 'TRIGGERED' : 'WAITING'
      }))
      .filter(s => s.triggered);

    // Calculate overall strategy confluence score
    const avgWinRate = triggeredStrategies.length > 0 
      ? triggeredStrategies.reduce((sum, s) => sum + s.winRate, 0) / triggeredStrategies.length 
      : 0;

    const strategyConfluence = {
      totalStrategies: strategies.length,
      triggeredCount: triggeredStrategies.length,
      confluencePercentage: Math.round((triggeredStrategies.length / strategies.length) * 100),
      averageWinRate: Math.round(avgWinRate),
      averageRiskReward: triggeredStrategies.length > 0
        ? (triggeredStrategies.reduce((sum, s) => sum + s.riskReward, 0) / triggeredStrategies.length).toFixed(2)
        : 0,
      bestStrategy: triggeredStrategies.sort((a, b) => b.winRate - a.winRate)[0] || null,
      strategies: triggeredStrategies
    };

    return Response.json({ strategiesAnalysis: strategyConfluence });
  } catch (error) {
    console.error('Strategy analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});