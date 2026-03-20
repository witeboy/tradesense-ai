import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Loader2, AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function InstrumentResearchPanel({ instrument }) {
  const [researchData, setResearchData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (instrument) {
      loadInstrumentResearch();
    }
  }, [instrument]);

  const loadInstrumentResearch = async () => {
    setIsLoading(true);
    try {
      const research = await base44.integrations.Core.InvokeLLM({
        prompt: `Provide current fundamental analysis for ${instrument}. Include:
1. CENTRAL BANK STANCE - Current interest rates, recent policy, inflation targets
2. ECONOMIC INDICATORS - Latest GDP, unemployment, inflation rate
3. VOLATILITY - Historical volatility, expected moves, VIX equivalent
4. MARKET SENTIMENT - Bullish/Bearish bias from news and positioning
5. KEY LEVELS - Major support/resistance from recent price action
6. UPCOMING CATALYSTS - Next 7 days economic data, central bank meetings, earnings (if applicable)
7. TRADE BIAS - Overall recommendation: Strong Buy/Buy/Neutral/Sell/Strong Sell

Be concise and specific with numbers.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            central_bank_stance: { type: "string" },
            economic_indicators: { type: "string" },
            volatility_assessment: { type: "string" },
            market_sentiment: { type: "string", enum: ["Strong Bullish", "Bullish", "Neutral", "Bearish", "Strong Bearish"] },
            key_support_resistance: { type: "string" },
            upcoming_catalysts: { type: "array", items: { type: "string" } },
            trade_bias: { type: "string", enum: ["Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell"] }
          }
        }
      });

      setResearchData(research);
    } catch (error) {
      console.error("Research error:", error);
    }
    setIsLoading(false);
  };

  if (!instrument) {
    return (
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl">
        <CardContent className="p-4 text-center">
          <AlertCircle className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-700 dark:text-slate-400 text-sm">Select an instrument to see fundamental data</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
          <span className="text-slate-700 dark:text-slate-300 text-sm">Researching {instrument}...</span>
        </CardContent>
      </Card>
    );
  }

  if (!researchData) {
    return null;
  }

  const sentimentColor = {
    "Strong Bullish": "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300",
    "Bullish": "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300",
    "Neutral": "bg-slate-100 dark:bg-slate-500/20 text-slate-800 dark:text-slate-300",
    "Bearish": "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300",
    "Strong Bearish": "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-300"
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white dark:bg-[#242526]/90 border-slate-200 dark:border-slate-700/50 backdrop-blur rounded-xl shadow-lg">
        <CardHeader className="p-4 pb-3">
          <CardTitle className="text-slate-900 dark:text-white text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            {instrument} Fundamental Research
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 pt-0 space-y-3">
          {/* Sentiment Badge */}
          <div className="flex items-center gap-2">
            <span className="text-slate-700 dark:text-slate-400 text-xs font-medium">Market Sentiment:</span>
            <Badge className={`${sentimentColor[researchData.market_sentiment] || sentimentColor.Neutral} text-xs`}>
              {researchData.market_sentiment}
            </Badge>
            <Badge className={`${sentimentColor[researchData.trade_bias] || sentimentColor.Neutral} text-xs`}>
              {researchData.trade_bias}
            </Badge>
          </div>

          {/* Key Sections */}
          <div className="grid gap-2">
            {/* Central Bank */}
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/50">
              <p className="text-slate-900 dark:text-white font-semibold text-xs mb-1">🏦 Central Bank Stance</p>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                {researchData.central_bank_stance}
              </p>
            </div>

            {/* Economic Indicators */}
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/50">
              <p className="text-slate-900 dark:text-white font-semibold text-xs mb-1">📊 Economic Indicators</p>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                {researchData.economic_indicators}
              </p>
            </div>

            {/* Volatility */}
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/50">
              <p className="text-slate-900 dark:text-white font-semibold text-xs mb-1">⚡ Volatility</p>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                {researchData.volatility_assessment}
              </p>
            </div>

            {/* Support/Resistance */}
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700/50">
              <p className="text-slate-900 dark:text-white font-semibold text-xs mb-1">📍 Key Levels</p>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                {researchData.key_support_resistance}
              </p>
            </div>

            {/* Catalysts */}
            {Array.isArray(researchData.upcoming_catalysts) && researchData.upcoming_catalysts.length > 0 && (
              <div className="p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30">
                <p className="text-slate-900 dark:text-white font-semibold text-xs mb-1">📅 Next 7 Days</p>
                <ul className="space-y-0.5">
                  {researchData.upcoming_catalysts.slice(0, 3).map((catalyst, idx) => (
                    <li key={idx} className="text-slate-700 dark:text-slate-300 text-xs">
                      • {catalyst}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="text-slate-500 dark:text-slate-500 text-xs italic">
            Research updated: {new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}