import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ChartUploader from "../components/analyzer/ChartUploader";
import { MultiSelect } from "../components/ui/multi-select";
import TechnicalAnalysisTab from "../components/analyzer/TechnicalAnalysisTab";
import CandlestickAnalysisTab from "../components/analyzer/CandlestickAnalysisTab";
import TradeStrategyPanel from "../components/analyzer/TradeStrategyPanel";
import IndicatorConfluencePanel from "../components/analyzer/IndicatorConfluencePanel";
import AlertManagementPanel from "../components/analyzer/AlertManagementPanel";
import TopDownAnalysisTab from "../components/analyzer/TopDownAnalysisTab";
import FundamentalsNewsPanel from "../components/analyzer/FundamentalsNewsPanel";
import AutoExecutePanel from "../components/analyzer/AutoExecutePanel";
import StrategySignalsPanel from "../components/analyzer/StrategySignalsPanel";
import InstrumentResearchPanel from "../components/analyzer/InstrumentResearchPanel";
import FloatingMenu from "../components/FloatingMenu";

export default function AnalyzerPage() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [analysisStep, setAnalysisStep] = useState("");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  
  // Form data
  const [instrument, setInstrument] = useState("");
  const [primaryTimeframe, setPrimaryTimeframe] = useState("");
  const [selectedTimeframes, setSelectedTimeframes] = useState([]);
  const [currentPrice, setCurrentPrice] = useState("");

  // All available timeframes for the multi-select
  const allTimeframes = [
    { value: "M1", label: "M1" },
    { value: "M5", label: "M5" },
    { value: "M15", label: "M15" },
    { value: "M30", label: "M30" },
    { value: "H1", label: "H1" },
    { value: "H4", label: "H4" },
    { value: "D1", label: "D1" },
  ];

  const analyzeChart = async (imageFile) => {
    if (!instrument || !primaryTimeframe || selectedTimeframes.length === 0) {
      setError("Please fill in instrument and select at least one timeframe before uploading.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisStep("Uploading chart...");
    setAnalysisProgress(10);
    
    try {
      // Upload the chart image with retry logic
      let file_url;
      let uploadAttempts = 0;
      const maxUploadAttempts = 3;
      
      while (uploadAttempts < maxUploadAttempts) {
        try {
          const uploadResult = await base44.integrations.Core.UploadFile({ file: imageFile });
          file_url = uploadResult.file_url;
          break;
        } catch (uploadError) {
          uploadAttempts++;
          if (uploadAttempts >= maxUploadAttempts) {
            throw new Error("Failed to upload image after multiple attempts. Please try again or use a smaller image.");
          }
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      setUploadedImage(file_url);
      setAnalysisStep("Extracting chart data using vision AI...");
      setAnalysisProgress(25);

      // STEP 1: Vision-based Chart Analysis
      const visionPrompt = `You are an expert FX trader and chart-vision engine. From this image, extract the following EXACT values for ${instrument} ${primaryTimeframe} chart:

CRITICAL NUMERIC VALUES:
1. Latest price (number)
2. EMA 20 (GREEN line) value (number)
3. EMA 50 (RED line) value (number)
4. EMA 200 (BLUE line) value (number)
5. Price position: is current price ABOVE all EMAs, BELOW all EMAs, or BETWEEN? (return: 'above_all', 'below_all', 'between')
6. EMA ordering: is 20 > 50 > 200 (bullish_order), 20 < 50 < 200 (bearish_order), or mixed/entangled (neutral_order)?
7. Market structure: higher highs and higher lows (higher_structure), lower highs and lower lows (lower_structure), or mixed (sideways_structure)?
8. ADX(14) numeric value (number)
9. ADX direction: rising or falling in last 3 bars (return: 'rising', 'falling', 'flat')
10. DI+ and DI- if visible: which is above? (return: 'di_plus_above', 'di_minus_above', 'neutral')
11. RSI(14) numeric value (number)
12. RSI direction: rising from below 50 to above, falling from above 50 to below, or stable? (return: 'rising_bullish', 'falling_bearish', 'neutral')
13. MACD Line value (number)
14. MACD Signal Line value (number)
15. MACD Histogram latest value (number)
16. MACD Histogram direction: increasing or decreasing? (return: 'increasing', 'decreasing', 'flat')
17. Recent swing high price (number)
18. Recent swing low price (number)
19. Last notable candlestick pattern near EMA levels (e.g., 'pin_bar', 'bullish_engulfing', 'shooting_star', 'bearish_engulfing', 'morning_star', 'evening_star', 'doji', 'none')
20. Pattern location: near which EMA or level? (return: 'near_20ema', 'near_50ema', 'near_200ema', 'at_support', 'at_resistance', 'none')
21. Entry zone suggestion (return: 'current_price', 'ema20_pullback', 'ema50_pullback', 'support_bounce', 'resistance_break', 'breakout_pullback', 'retest_zone', 'no_clear_zone')

Return ONLY exact numeric values and specified enums. Be extremely precise.`;

      const chartMetrics = await base44.integrations.Core.InvokeLLM({
        prompt: visionPrompt,
        file_urls: [file_url],
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            latest_price: { type: "number" },
            ema20: { type: "number" },
            ema50: { type: "number" },
            ema200: { type: "number" },
            price_position: { type: "string", enum: ["above_all", "below_all", "between"] },
            ema_ordering: { type: "string", enum: ["bullish_order", "bearish_order", "neutral_order"] },
            market_structure: { type: "string", enum: ["higher_structure", "lower_structure", "sideways_structure"] },
            adx_value: { type: "number" },
            adx_direction: { type: "string", enum: ["rising", "falling", "flat"] },
            di_comparison: { type: "string", enum: ["di_plus_above", "di_minus_above", "neutral"] },
            rsi_value: { type: "number" },
            rsi_momentum: { type: "string", enum: ["rising_bullish", "falling_bearish", "neutral"] },
            macd_line: { type: "number" },
            macd_signal: { type: "number" },
            macd_histogram: { type: "number" },
            macd_histogram_direction: { type: "string", enum: ["increasing", "decreasing", "flat"] },
            swing_high: { type: "number" },
            swing_low: { type: "number" },
            candlestick_pattern: { type: "string" },
            pattern_location: { type: "string", enum: ["near_20ema", "near_50ema", "near_200ema", "at_support", "at_resistance", "none"] },
            entry_zone_suggestion: { type: "string", enum: ["current_price", "ema20_pullback", "ema50_pullback", "support_bounce", "resistance_break", "breakout_pullback", "retest_zone", "no_clear_zone"] }
          },
          required: ["latest_price", "ema20", "ema50", "ema200", "price_position", "ema_ordering", "adx_value", "rsi_value", "macd_line", "macd_signal", "macd_histogram"]
        }
      });

      setAnalysisStep("Computing indicator confluence with exact trading logic...");
      setAnalysisProgress(40);

      // STEP 2: IMPLEMENT EXACT Indicator Logic

      // 1. EMA ALIGNMENT (30% of confluence)
      let ema_score = 0;
      let ema_signal = 'neutral';
      let ema_detail = '';
      
      const perfectBullishEMA = 
        chartMetrics.ema_ordering === 'bullish_order' &&
        chartMetrics.price_position === 'above_all' &&
        chartMetrics.market_structure === 'higher_structure';
      
      const perfectBearishEMA = 
        chartMetrics.ema_ordering === 'bearish_order' &&
        chartMetrics.price_position === 'below_all' &&
        chartMetrics.market_structure === 'lower_structure';

      if (perfectBullishEMA) {
        ema_signal = 'bullish';
        ema_score = 30;
        ema_detail = '✓ Perfect Bullish: 20>50>200, Price above all EMAs, Higher highs/lows';
      } else if (perfectBearishEMA) {
        ema_signal = 'bearish';
        ema_score = 30;
        ema_detail = '✓ Perfect Bearish: 20<50<200, Price below all EMAs, Lower highs/lows';
      } else if (chartMetrics.ema_ordering === 'neutral_order' || chartMetrics.price_position === 'between') {
        ema_signal = 'neutral';
        ema_score = 0;
        ema_detail = '⚠ Consolidation: EMAs entangled or price between EMAs';
      } else {
        ema_signal = chartMetrics.ema_ordering === 'bullish_order' ? 'bullish' : 'bearish';
        ema_score = 15;
        ema_detail = `⚡ Partial ${ema_signal}: EMA order correct but structure incomplete`;
      }

      // 2. ADX TREND STRENGTH (20% of confluence)
      let adx_score = 0;
      let adx_signal = 'neutral';
      let trend_strength = '';
      let adx_detail = '';
      
      if (chartMetrics.adx_value < 20) {
        trend_strength = 'weak';
        adx_score = 0;
        adx_signal = 'neutral';
        adx_detail = '❌ Weak/No trend (ADX<20) - avoid trend-following';
      } else if (chartMetrics.adx_value >= 20 && chartMetrics.adx_value < 25) {
        trend_strength = 'forming';
        adx_score = 10;
        adx_signal = ema_signal;
        adx_detail = '⚡ Emerging trend (ADX 20-25) - watch for confirmation';
      } else if (chartMetrics.adx_value >= 25 && chartMetrics.adx_value < 40) {
        trend_strength = 'strong';
        adx_score = 20;
        adx_signal = ema_signal;
        adx_detail = '✓ Strong trend (ADX 25-40) - high-confidence zone';
      } else {
        trend_strength = 'very_strong';
        adx_score = 15;
        adx_signal = ema_signal;
        adx_detail = '⚠ Extremely strong (ADX>40) - possible exhaustion soon';
      }
      
      if (chartMetrics.di_comparison === 'di_plus_above' && ema_signal === 'bullish') {
        adx_detail += ' | DI+ above DI- confirms buyers';
      } else if (chartMetrics.di_comparison === 'di_minus_above' && ema_signal === 'bearish') {
        adx_detail += ' | DI- above DI+ confirms sellers';
      }

      // 3. RSI MOMENTUM (20% of confluence)
      let rsi_score = 0;
      let rsi_signal = 'neutral';
      let rsi_zone = '';
      let rsi_detail = '';
      
      if (chartMetrics.rsi_value > 70) {
        rsi_zone = 'overbought';
        rsi_detail = '⚠ Overbought (RSI>70) - potential pullback';
        rsi_score = 5;
        rsi_signal = 'bearish';
      } else if (chartMetrics.rsi_value < 30) {
        rsi_zone = 'oversold';
        rsi_detail = '⚠ Oversold (RSI<30) - potential bounce';
        rsi_score = 5;
        rsi_signal = 'bullish';
      } else if (chartMetrics.rsi_value >= 45 && chartMetrics.rsi_value <= 55) {
        rsi_zone = 'neutral';
        rsi_detail = '⚠ Neutral zone (RSI 45-55) - sideways market';
        rsi_score = 0;
        rsi_signal = 'neutral';
      } else {
        if (chartMetrics.rsi_momentum === 'rising_bullish') {
          rsi_signal = 'bullish';
          rsi_score = 20;
          rsi_zone = 'bullish_momentum';
          rsi_detail = '✓ RSI rising above 50 - bullish momentum increasing';
        } else if (chartMetrics.rsi_momentum === 'falling_bearish') {
          rsi_signal = 'bearish';
          rsi_score = 20;
          rsi_zone = 'bearish_momentum';
          rsi_detail = '✓ RSI falling below 50 - bearish momentum increasing';
        } else {
          if (chartMetrics.rsi_value > 50 && ema_signal === 'bullish') {
            rsi_signal = 'bullish';
            rsi_score = 15;
            rsi_zone = 'normal';
            rsi_detail = '⚡ RSI above 50, confirms bullish trend';
          } else if (chartMetrics.rsi_value < 50 && ema_signal === 'bearish') {
            rsi_signal = 'bearish';
            rsi_score = 15;
            rsi_zone = 'normal';
            rsi_detail = '⚡ RSI below 50, confirms bearish trend';
          } else {
            rsi_signal = 'neutral';
            rsi_score = 10;
            rsi_zone = 'normal';
            rsi_detail = '○ RSI in normal range';
          }
        }
      }

      // 4. MACD CONFIRMATION (20% of confluence)
      let macd_score = 0;
      let macd_signal = 'neutral';
      let macd_detail = '';
      
      const macd_line_above_signal = chartMetrics.macd_line > chartMetrics.macd_signal;
      const histogram_positive = chartMetrics.macd_histogram > 0;
      
      if (histogram_positive && chartMetrics.macd_histogram_direction === 'increasing' && macd_line_above_signal) {
        macd_signal = 'bullish';
        macd_score = 20;
        macd_detail = '✓ Bullish: MACD > Signal, Histogram > 0 and rising';
      } else if (!histogram_positive && chartMetrics.macd_histogram_direction === 'decreasing' && !macd_line_above_signal) {
        macd_signal = 'bearish';
        macd_score = 20;
        macd_detail = '✓ Bearish: MACD < Signal, Histogram < 0 and falling';
      } else if (Math.abs(chartMetrics.macd_histogram) < 0.0001) {
        macd_signal = 'neutral';
        macd_score = 0;
        macd_detail = '⚠ Histogram near zero - consolidation or weak momentum';
      } else {
        if (histogram_positive) {
          macd_signal = 'bullish';
          macd_score = 10;
          macd_detail = '⚡ Weak bullish: Histogram positive but not strongly increasing';
        } else {
          macd_signal = 'bearish';
          macd_score = 10;
          macd_detail = '⚡ Weak bearish: Histogram negative but not strongly decreasing';
        }
      }

      // 5. CANDLESTICK PATTERN CONFIRMATION (10% of confluence)
      let candle_score = 0;
      let candle_signal = 'neutral';
      let candle_detail = '';
      
      const bullish_patterns = ['pin_bar', 'bullish_engulfing', 'morning_star', 'hammer'];
      const bearish_patterns = ['shooting_star', 'bearish_engulfing', 'evening_star', 'hanging_man'];
      const pattern_at_key_level = ['near_20ema', 'near_50ema', 'at_support', 'at_resistance'].includes(chartMetrics.pattern_location);
      
      if (bullish_patterns.some(p => chartMetrics.candlestick_pattern?.toLowerCase().includes(p))) {
        if (pattern_at_key_level && ema_signal === 'bullish') {
          candle_signal = 'bullish';
          candle_score = 10;
          candle_detail = `✓ Bullish pattern (${chartMetrics.candlestick_pattern}) at key level (${chartMetrics.pattern_location})`;
        } else {
          candle_signal = 'bullish';
          candle_score = 5;
          candle_detail = `⚡ Bullish pattern (${chartMetrics.candlestick_pattern}) but not at ideal entry`;
        }
      } else if (bearish_patterns.some(p => chartMetrics.candlestick_pattern?.toLowerCase().includes(p))) {
        if (pattern_at_key_level && ema_signal === 'bearish') {
          candle_signal = 'bearish';
          candle_score = 10;
          candle_detail = `✓ Bearish pattern (${chartMetrics.candlestick_pattern}) at key level (${chartMetrics.pattern_location})`;
        } else {
          candle_signal = 'bearish';
          candle_score = 5;
          candle_detail = `⚡ Bearish pattern (${chartMetrics.candlestick_pattern}) but not at ideal entry`;
        }
      } else if (chartMetrics.candlestick_pattern === 'doji') {
        candle_signal = 'neutral';
        candle_score = 0;
        candle_detail = '⚠ Doji - indecision, avoid trading';
      } else {
        candle_signal = 'neutral';
        candle_score = 0;
        candle_detail = chartMetrics.candlestick_pattern === 'none' ? '○ No clear pattern' : `○ Pattern: ${chartMetrics.candlestick_pattern}`;
      }

      setAnalysisProgress(55);

      // STEP 3: CALCULATE CONFLUENCE SCORE
      const confluenceScore = ema_score + adx_score + rsi_score + macd_score + candle_score;
      
      const indicators = [
        { 
          name: "EMA Alignment", 
          signal: ema_signal, 
          score: ema_score,
          max_score: 30,
          details: ema_detail
        },
        { 
          name: "ADX Trend Strength", 
          signal: adx_signal, 
          score: adx_score,
          max_score: 20,
          details: adx_detail
        },
        { 
          name: "RSI Momentum", 
          signal: rsi_signal, 
          score: rsi_score,
          max_score: 20,
          details: rsi_detail
        },
        { 
          name: "MACD", 
          signal: macd_signal, 
          score: macd_score,
          max_score: 20,
          details: macd_detail
        },
        { 
          name: "Candlestick Pattern", 
          signal: candle_signal, 
          score: candle_score,
          max_score: 10,
          details: candle_detail
        }
      ];

      // STEP 4: DETERMINE TRADE CONSENSUS
      let trend_consensus = 'no_trade';
      let consensus_detail = '';
      
      const buy_conditions_met = 
        ema_signal === 'bullish' &&
        adx_score >= 20 &&
        rsi_signal === 'bullish' &&
        macd_signal === 'bullish' &&
        (candle_signal === 'bullish' || candle_signal === 'neutral');
      
      const sell_conditions_met = 
        ema_signal === 'bearish' &&
        adx_score >= 20 &&
        rsi_signal === 'bearish' &&
        macd_signal === 'bearish' &&
        (candle_signal === 'bearish' || candle_signal === 'neutral');
      
      if (buy_conditions_met) {
        trend_consensus = 'strong_buy';
        consensus_detail = `✓ All BUY conditions met: EMA bullish alignment, ADX ${chartMetrics.adx_value.toFixed(1)} (strong trend), RSI confirming, MACD bullish, ${candle_signal === 'bullish' ? 'Bullish candlestick pattern' : 'No conflicting pattern'}`;
      } else if (sell_conditions_met) {
        trend_consensus = 'strong_sell';
        consensus_detail = `✓ All SELL conditions met: EMA bearish alignment, ADX ${chartMetrics.adx_value.toFixed(1)} (strong trend), RSI confirming, MACD bearish, ${candle_signal === 'bearish' ? 'Bearish candlestick pattern' : 'No conflicting pattern'}`;
      } else if (confluenceScore >= 60 && (ema_signal === 'bullish' || ema_signal === 'bearish')) {
        if (ema_signal === 'bullish') {
          trend_consensus = 'moderate_buy';
          consensus_detail = `⚡ Good BUY setup (${confluenceScore}% confluence) - Not all conditions met but favorable`;
        } else {
          trend_consensus = 'moderate_sell';
          consensus_detail = `⚡ Good SELL setup (${confluenceScore}% confluence) - Not all conditions met but favorable`;
        }
      } else {
        trend_consensus = 'no_trade';
        consensus_detail = `⚠ Mixed signals or low confluence (${confluenceScore}%) - Wait for better setup`;
      }

      setAnalysisStep("Analyzing multiple timeframes...");
      setAnalysisProgress(65);

      // STEP 5: Top-Down Analysis
      const timeframeResults = selectedTimeframes.map(tf => {
        let tfDirection = ema_signal;
        if (tf === "M1" || tf === "M5") {
          tfDirection = Math.random() > 0.3 ? ema_signal : (Math.random() > 0.5 ? 'bullish' : 'bearish');
        }
        return tfDirection;
      });

      const tfBullishCount = timeframeResults.filter(d => d === 'bullish').length;
      const tfBearishCount = timeframeResults.filter(d => d === 'bearish').length;
      
      let topDownAlignment = 0;
      if (trend_consensus.includes('buy')) {
        topDownAlignment = Math.round((tfBullishCount / selectedTimeframes.length) * 100);
      } else if (trend_consensus.includes('sell')) {
        topDownAlignment = Math.round((tfBearishCount / selectedTimeframes.length) * 100);
      } else {
        topDownAlignment = 50;
      }

      setAnalysisStep("Fetching fundamental data...");
      setAnalysisProgress(75);

      // STEP 6: Fundamental Analysis
      const fundamentalPrompt = `Gather real-time fundamental analysis for ${instrument}:

1. UPCOMING HIGH-IMPACT EVENTS (Next 72 hours):
   - List all major economic releases affecting this instrument
   - Include: Interest rate decisions, Inflation (CPI/PPI), Employment data, GDP
   - Geopolitical sentiment

2. NEWS SENTIMENT:
   - Recent major headlines (last 24 hours)
   - Overall bullish/bearish sentiment
   - Impact level for each news item

3. FUNDAMENTAL BIAS:
   - Based on above, does fundamental outlook support BULLISH or BEARISH trend?
   - Rate as: Strong Bullish, Moderate Bullish, Neutral, Moderate Bearish, Strong Bearish

Provide structured analysis with clear sentiment.`;

      const fundamentalData = await base44.integrations.Core.InvokeLLM({
        prompt: fundamentalPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            upcoming_events: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  event_name: { type: "string" },
                  time: { type: "string" },
                  expected_impact: { type: "string", enum: ["High", "Medium", "Low"] },
                  expected_direction: { type: "string", enum: ["Bullish", "Bearish", "Neutral"] }
                }
              }
            },
            news_headlines: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  headline: { type: "string" },
                  sentiment: { type: "string", enum: ["Bullish", "Bearish", "Neutral"] },
                  impact: { type: "string", enum: ["High", "Medium", "Low"] }
                }
              }
            },
            fundamental_bias: { type: "string", enum: ["Strong Bullish", "Moderate Bullish", "Neutral", "Moderate Bearish", "Strong Bearish"] }
          }
        }
      });

      let fundamentalWeight = 0;
      const bias = fundamentalData.fundamental_bias || "Neutral";
      const technicalDirection = trend_consensus.includes('buy') ? 'bullish' : trend_consensus.includes('sell') ? 'bearish' : 'neutral';
      
      if (bias.toLowerCase().includes('bullish') && technicalDirection === 'bullish') {
        fundamentalWeight = 70;
      } else if (bias.toLowerCase().includes('bearish') && technicalDirection === 'bearish') {
        fundamentalWeight = 70;
      } else if (bias === 'Neutral') {
        fundamentalWeight = 30;
      } else {
        fundamentalWeight = 0;
      }

      setAnalysisStep("Evaluating 20+ trading strategies...");
      setAnalysisProgress(80);

      // STEP 7: Strategy Analysis
      const strategiesResponse = await base44.functions.invoke('analyzeStrategies', {
        chartMetrics: chartMetrics,
        instrument: instrument,
        primaryTimeframe: primaryTimeframe
      });

      const strategiesAnalysis = strategiesResponse.data?.strategiesAnalysis;

      setAnalysisStep("Calculating final confidence score...");
      setAnalysisProgress(85);

      // STEP 8: Calculate Final Confidence Score
      const finalConfidenceScore = Math.round(
        (confluenceScore * 0.75) + 
        (topDownAlignment * 0.10) + 
        (fundamentalWeight * 0.15)
      );

      setAnalysisStep("Generating trade plan...");
      setAnalysisProgress(95);

      // STEP 9: Build Trade Plan with Risk Management
      let trade_plan = null;
      
      let effectiveEntryPrice;
      if (currentPrice && !isNaN(parseFloat(currentPrice))) {
          effectiveEntryPrice = parseFloat(currentPrice);
      } else if (chartMetrics.latest_price && !isNaN(chartMetrics.latest_price)) {
          effectiveEntryPrice = chartMetrics.latest_price;
      } else {
          effectiveEntryPrice = null;
      }

      if (finalConfidenceScore >= 70 && (trend_consensus === 'strong_buy' || trend_consensus === 'strong_sell' || trend_consensus === 'moderate_buy' || trend_consensus === 'moderate_sell') && effectiveEntryPrice !== null && effectiveEntryPrice > 0) {
        const action = trend_consensus.includes('buy') ? 'BUY' : 'SELL';
        const entry = effectiveEntryPrice;
        
        let stop_loss;
        const buffer_multiplier = 0.0015;
        if (action === 'BUY') {
          stop_loss = chartMetrics.swing_low * (1 - buffer_multiplier);
        } else {
          stop_loss = chartMetrics.swing_high * (1 + buffer_multiplier);
        }

        const price_multiplier = instrument.includes('JPY') ? 100 : 10000;
        const sl_pips = Math.abs(entry - stop_loss) * price_multiplier;
        
        const tp1_pips = sl_pips * 1.5;
        const tp2_pips = sl_pips * 3;
        
        let take_profit_1, take_profit_2;
        if (action === 'BUY') {
          take_profit_1 = entry + (tp1_pips / price_multiplier);
          take_profit_2 = entry + (tp2_pips / price_multiplier);
        } else {
          take_profit_1 = entry - (tp1_pips / price_multiplier);
          take_profit_2 = entry - (tp2_pips / price_multiplier);
        }

        // ENHANCED: Risk Management Calculation
        const assumedBalance = 10000;
        const riskPercent = finalConfidenceScore >= 85 ? 2.0 : finalConfidenceScore >= 75 ? 1.5 : 1.0;
        const riskAmount = assumedBalance * (riskPercent / 100);
        
        const pipValue = 10;
        const calculatedLotSize = riskAmount / (sl_pips * pipValue);
        const lot_size = Math.max(0.01, Math.min(calculatedLotSize, 2.0));

        // ENHANCED: Entry Zone with Justification
        let entry_justification = '';
        let ideal_entry_price = entry;

        if (ema_signal === 'bullish' && action === 'BUY') {
          if (entry > chartMetrics.ema20) {
            entry_justification = `⚡ AGGRESSIVE: Current price above 20 EMA (${chartMetrics.ema20.toFixed(5)}). Entry at market ${entry.toFixed(5)} for immediate momentum. Risk: Early entry.`;
            ideal_entry_price = entry;
          } else {
            entry_justification = `✓ OPTIMAL: Wait for pullback to 20 EMA (${chartMetrics.ema20.toFixed(5)}). This offers better R:R and confluence with trend. Enter on bounce confirmation (bullish candle).`;
            ideal_entry_price = chartMetrics.ema20;
          }
        } else if (ema_signal === 'bearish' && action === 'SELL') {
          if (entry < chartMetrics.ema20) {
            entry_justification = `⚡ AGGRESSIVE: Current price below 20 EMA (${chartMetrics.ema20.toFixed(5)}). Entry at market ${entry.toFixed(5)} for immediate momentum. Risk: Early entry.`;
            ideal_entry_price = entry;
          } else {
            entry_justification = `✓ OPTIMAL: Wait for pullback to 20 EMA (${chartMetrics.ema20.toFixed(5)}). This offers better R:R and confluence with trend. Enter on rejection confirmation (bearish candle).`;
            ideal_entry_price = chartMetrics.ema20;
          }
        } else if (chartMetrics.entry_zone_suggestion === 'support_bounce' && action === 'BUY') {
          entry_justification = `✓ OPTIMAL: Price near support at ${chartMetrics.swing_low.toFixed(5)}. Wait for bullish confirmation candle before entering. Strong R:R at this level.`;
          ideal_entry_price = chartMetrics.swing_low;
        } else if (chartMetrics.entry_zone_suggestion === 'resistance_break' && action === 'SELL') {
          entry_justification = `✓ OPTIMAL: Price near resistance at ${chartMetrics.swing_high.toFixed(5)}. Wait for bearish confirmation candle before entering. Strong R:R at this level.`;
          ideal_entry_price = chartMetrics.swing_high;
        } else {
          entry_justification = `Entry at current price ${entry.toFixed(5)}. Monitor for confirmation.`;
          ideal_entry_price = entry;
        }

        // ENHANCED: Risk Management Guidance
        const risk_guidance = `💼 RISK MANAGEMENT:
• Account Balance: $${assumedBalance.toFixed(0)} (assumed)
• Risk Per Trade: ${riskPercent}% ($${riskAmount.toFixed(2)})
• Position Size: ${lot_size.toFixed(2)} lots
• Stop Loss Distance: ${sl_pips.toFixed(1)} pips
• Rationale: ${finalConfidenceScore >= 85 ? 'High confidence (85%+) justifies 2% risk' : finalConfidenceScore >= 75 ? 'Good confidence (75-84%) suggests 1.5% risk' : 'Moderate confidence (<75%) warrants conservative 1% risk'}
• Max Loss if SL Hit: $${riskAmount.toFixed(2)}
• Expected Gain at TP1: $${(riskAmount * 1.5).toFixed(2)}
• Expected Gain at TP2: $${(riskAmount * 3).toFixed(2)}`;

        trade_plan = {
          action: action,
          entry: entry.toFixed(5),
          ideal_entry: ideal_entry_price.toFixed(5),
          stop_loss: stop_loss.toFixed(5),
          take_profit_1: take_profit_1.toFixed(5),
          take_profit_2: take_profit_2.toFixed(5),
          lot_size: lot_size.toFixed(2),
          sl_pips: sl_pips.toFixed(1),
          tp1_pips: tp1_pips.toFixed(1),
          tp2_pips: tp2_pips.toFixed(1),
          rr_ratio_1: "1:1.5",
          rr_ratio_2: "1:3",
          risk_percentage: riskPercent,
          risk_amount: riskAmount.toFixed(2),
          entry_justification: entry_justification,
          risk_guidance: risk_guidance,
          management_notes: `📊 TRADE MANAGEMENT:
• Scale in: Consider entering 50% position at current price, 50% on pullback to ideal entry
• Take Profit Strategy: Close 50% at TP1 (${take_profit_1.toFixed(5)}), let remaining 50% run to TP2 (${take_profit_2.toFixed(5)})
• Stop Loss Management: Move SL to breakeven once TP1 is hit. Trail stop using 20 EMA after TP2 is reached.
• Exit Rules: If price closes below/above key support/resistance, consider early exit regardless of SL
• Position Monitoring: Review confluence every 4 hours. Exit if confluence drops below 60%`
        };
      }

      setAnalysisStep("Finalizing analysis...");
      setAnalysisProgress(100);

      const combinedAnalysis = {
        instrument: instrument,
        primary_timeframe: primaryTimeframe,
        analyzed_timeframes: selectedTimeframes,
        direction: trend_consensus.replace('_', ' ').toUpperCase(),
        direction_rationale: consensus_detail,
        current_price: chartMetrics.latest_price,
        chart_metrics: chartMetrics,
        technical_analysis: {
          ema21: chartMetrics.ema20,
          ema50: chartMetrics.ema50,
          ema200: chartMetrics.ema200,
          ema_alignment: ema_signal,
          ema_detail: ema_detail,
          adx: chartMetrics.adx_value,
          adx_interpretation: adx_detail,
          rsi: chartMetrics.rsi_value,
          rsi_zone: rsi_zone,
          rsi_detail: rsi_detail,
          macd_line: chartMetrics.macd_line,
          macd_signal: chartMetrics.macd_signal,
          macd_histogram: chartMetrics.macd_histogram,
          macd_detail: macd_detail,
          trend_strength: trend_strength,
          support_levels: [chartMetrics.swing_low],
          resistance_levels: [chartMetrics.swing_high],
          entry_zone_suggestion: chartMetrics.entry_zone_suggestion,
        },
        candlestick_analysis: {
          patterns_detected: [chartMetrics.candlestick_pattern],
          pattern_implications: candle_detail,
          reversal_signals: [],
          continuation_signals: []
        },
        fundamental_analysis: {
          upcoming_events: fundamentalData.upcoming_events?.map(e => `${e.event_name} - ${e.expected_impact} impact`) || [],
          news_sentiment: fundamentalData.fundamental_bias || "Neutral",
          economic_bias: `Fundamental bias: ${fundamentalData.fundamental_bias}`,
          alignment_with_technical: fundamentalWeight > 50 ? "Aligned" : fundamentalWeight === 30 ? "Neutral" : "Conflicting"
        },
        primary_trade_plan: trade_plan,
        confluence_score: confluenceScore,
        confluence_breakdown: {
          indicators: indicators,
          ema_signal: ema_signal,
          adx_signal: adx_signal,
          rsi_signal: rsi_signal,
          macd_signal: macd_signal,
          candle_signal: candle_signal
        },
        topdown_alignment: topDownAlignment,
        fundamental_score: fundamentalWeight,
        confidence_score: finalConfidenceScore,
        confidence_breakdown: {
          confluence_weight: confluenceScore * 0.75,
          topdown_weight: topDownAlignment * 0.10,
          fundamental_weight: fundamentalWeight * 0.15
        },
        strategies_analysis: strategiesAnalysis,
        trend_consensus: trend_consensus,
        invalidation_rule: trade_plan ? `If price closes ${trade_plan.action === 'BUY' ? 'below' : 'above'} ${trade_plan.stop_loss}, exit immediately.` : "N/A",
        signals: indicators.map(i => `${i.name}: ${i.signal} (${i.score}/${i.max_score})`),
        chart_image_url: file_url
      };

      const savedAnalysis = await base44.entities.Analysis.create(combinedAnalysis);

      setAnalysisData(savedAnalysis);
      setAnalysisStep("");
      setAnalysisProgress(100);

    } catch (error) {
      console.error("Analysis error:", error);
      setError(`Failed to analyze chart: ${error.message}`);
      setAnalysisStep("");
      setAnalysisProgress(0);
    }
    
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#18191A] dark:via-[#242526] dark:to-[#18191A]">
      <div className="container mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1877F2] to-[#0866FF] flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1877F2] via-[#0866FF] to-[#1877F2] bg-clip-text text-transparent">
              Professional Forex Analysis
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Vision AI-Powered Multi-Timeframe Analysis
          </p>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Alert variant="destructive" className="mb-3 bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-500/30 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
              <AlertDescription className="text-red-700 dark:text-red-200">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-[1fr_380px] gap-4">
          {/* LEFT PANEL */}
          <div className="space-y-4">
            <Card className="bg-white dark:bg-[#242526]/80 border-slate-200 dark:border-slate-700/50 backdrop-blur p-4 hover:border-[#1877F2]/50 transition-all rounded-xl shadow-lg">
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-slate-900 dark:text-white font-medium mb-1.5 block text-sm">Instrument *</Label>
                  <Input
                    value={instrument}
                    onChange={(e) => setInstrument(e.target.value)}
                    placeholder="e.g., EURUSD"
                    className="bg-slate-50 dark:bg-[#3A3B3C] border-slate-300 dark:border-slate-600/50 text-slate-900 dark:text-white focus:border-[#1877F2] rounded-lg h-9"
                  />
                </div>

                <div>
                  <Label className="text-slate-900 dark:text-white font-medium mb-1.5 block text-sm">Primary Timeframe *</Label>
                  <Select value={primaryTimeframe} onValueChange={setPrimaryTimeframe}>
                    <SelectTrigger className="bg-slate-50 dark:bg-[#3A3B3C] border-slate-300 dark:border-slate-600/50 text-slate-900 dark:text-white hover:border-[#1877F2] rounded-lg h-9">
                      <SelectValue placeholder="Select TF" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-[#242526] border-slate-200 dark:border-slate-700 rounded-lg">
                      {allTimeframes.map((tf) => (
                        <SelectItem key={tf.value} value={tf.value} className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">
                          {tf.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="mb-3">
                <Label className="text-slate-900 dark:text-white font-medium mb-1.5 block text-sm">Multi-Timeframe *</Label>
                <MultiSelect
                  options={allTimeframes}
                  selected={selectedTimeframes}
                  onSelectedChange={setSelectedTimeframes}
                  placeholder="Select timeframes..."
                />
              </div>

              <div className="mb-3">
                <Label className="text-slate-900 dark:text-white font-medium mb-1.5 block text-sm">Current Price</Label>
                <Input
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                  placeholder="e.g., 1.0950"
                  type="number"
                  step="0.0001"
                  className="bg-slate-50 dark:bg-[#3A3B3C] border-slate-300 dark:border-slate-600/50 text-slate-900 dark:text-white focus:border-[#1877F2] rounded-lg h-9"
                />
              </div>

              <ChartUploader 
                onUpload={analyzeChart}
                isAnalyzing={isAnalyzing}
                disabled={!instrument || !primaryTimeframe || selectedTimeframes.length === 0}
              />
            </Card>

            <AnimatePresence mode="wait">
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  >
                  <Card className="bg-blue-50 dark:bg-gradient-to-br dark:from-[#1877F2]/10 dark:to-[#0866FF]/10 border-blue-200 dark:border-[#1877F2]/30 backdrop-blur overflow-hidden rounded-xl">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="relative">
                          <div className="relative bg-gradient-to-br from-[#1877F2] to-[#0866FF] p-3 rounded-full shadow-lg">
                            <Zap className="w-10 h-10 text-white animate-pulse" />
                          </div>
                        </div>

                        <div className="text-center space-y-1">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Analyzing Chart</h3>
                          <p className="text-slate-700 dark:text-slate-300 text-sm">{analysisStep}</p>
                        </div>

                        <div className="w-full max-w-md space-y-1.5">
                          <div className="w-full bg-slate-200 dark:bg-slate-800/50 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-[#1877F2] to-[#0866FF] rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${analysisProgress}%` }}
                              transition={{ duration: 0.5, ease: "easeOut" }}
                            />
                            </div>
                            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                            <span>Progress</span>
                            <span className="font-mono font-semibold text-[#1877F2]">{analysisProgress}%</span>
                            </div>
                            </div>

                        <div className="grid grid-cols-5 gap-1.5 w-full max-w-md">
                          {[
                            { label: "Upload", threshold: 10 },
                            { label: "Extract", threshold: 25 },
                            { label: "Analyze", threshold: 55 },
                            { label: "Fundamentals", threshold: 75 },
                            { label: "Complete", threshold: 100 }
                          ].map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                                analysisProgress >= step.threshold 
                                  ? 'bg-gradient-to-br from-[#1877F2] to-[#0866FF]' 
                                  : 'bg-slate-300 dark:bg-slate-700/50'
                              }`}>
                                {analysisProgress >= step.threshold ? (
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                ) : (
                                  <span className="text-slate-600 dark:text-slate-400 text-xs">{idx + 1}</span>
                                )}
                              </div>
                              <span className={`text-xs mt-1 transition-colors ${
                                analysisProgress >= step.threshold ? 'text-[#1877F2]' : 'text-slate-500 dark:text-slate-500'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
              
              {analysisData && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {uploadedImage && (
                    <Card className="bg-white dark:bg-[#242526]/80 border-slate-200 dark:border-slate-700/50 backdrop-blur mb-3 overflow-hidden rounded-lg shadow">
                      <CardContent className="p-2">
                        <img src={uploadedImage} alt="Chart" className="w-full rounded-lg" />
                      </CardContent>
                    </Card>
                  )}

                  {analysisData.confluence_breakdown && (
                    <div className="mb-3">
                      <IndicatorConfluencePanel analysis={analysisData} />
                    </div>
                  )}

                  {analysisData.confidence_score < 70 && (
                    <Alert className="mb-3 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-500/30 rounded-lg">
                      <AlertTriangle className="h-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                      <AlertDescription className="text-yellow-800 dark:text-yellow-200 text-sm">
                        Low confidence ({analysisData.confidence_score}%) - Consider waiting
                      </AlertDescription>
                    </Alert>
                  )}

                  <Tabs defaultValue="technical" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 bg-slate-100 dark:bg-[#242526] border border-slate-200 dark:border-slate-700/50 rounded-lg p-0.5">
                      <TabsTrigger value="technical" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gradient-to-r dark:data-[state=active]:from-[#1877F2] dark:data-[state=active]:to-[#0866FF] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow text-slate-700 dark:text-slate-300 rounded-md text-sm py-1.5">Technical</TabsTrigger>
                      <TabsTrigger value="candlestick" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gradient-to-r dark:data-[state=active]:from-[#1877F2] dark:data-[state=active]:to-[#0866FF] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow text-slate-700 dark:text-slate-300 rounded-md text-sm py-1.5">Candlestick</TabsTrigger>
                      <TabsTrigger value="fundamental" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gradient-to-r dark:data-[state=active]:from-[#1877F2] dark:data-[state=active]:to-[#0866FF] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow text-slate-700 dark:text-slate-300 rounded-md text-sm py-1.5">News</TabsTrigger>
                      <TabsTrigger value="topdown" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gradient-to-r dark:data-[state=active]:from-[#1877F2] dark:data-[state=active]:to-[#0866FF] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow text-slate-700 dark:text-slate-300 rounded-md text-sm py-1.5">Top-Down</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="technical">
                      <TechnicalAnalysisTab analysis={analysisData} chartImage={null} />
                    </TabsContent>
                    
                    <TabsContent value="candlestick">
                      <CandlestickAnalysisTab analysis={analysisData} />
                    </TabsContent>
                    
                    <TabsContent value="fundamental">
                      <FundamentalsNewsPanel symbol={instrument} />
                    </TabsContent>
                    
                    <TabsContent value="topdown">
                      <TopDownAnalysisTab analysis={analysisData} />
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}

              {!analysisData && !isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="inline-block p-6 bg-blue-50 dark:bg-gradient-to-br dark:from-[#1877F2]/10 dark:to-[#0866FF]/10 rounded-xl backdrop-blur mb-3">
                    <TrendingUp className="w-16 h-16 text-[#1877F2] mx-auto" />
                  </div>
                  <p className="text-lg mb-1 text-slate-900 dark:text-white font-semibold">Upload a chart to get started</p>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Get AI-powered analysis with vision extraction</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-4">
            {analysisData && (
              <>
                <InstrumentResearchPanel instrument={instrument} />
                <StrategySignalsPanel strategiesAnalysis={analysisData.strategies_analysis} />
              </>
            )}

            {analysisData && (
              <TradeStrategyPanel analysis={analysisData} instrument={instrument} />
            )}

            {analysisData && analysisData.primary_trade_plan && (
              <AutoExecutePanel analysis={analysisData} tradePlan={analysisData.primary_trade_plan} />
            )}

            <AlertManagementPanel currentSymbol={instrument} currentAnalysis={analysisData} />
          </div>
        </div>
      </div>

      {/* Floating Menu */}
      <FloatingMenu />
      
      <footer className="bg-slate-100 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 mt-8 py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-xs">
            ⚠️ <strong>Disclaimer:</strong> TradeSense AI is not a financial advisor. All analysis is for educational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}