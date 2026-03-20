import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Shield, DollarSign, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function TradeStrategyPanel({ analysis }) {
  if (!analysis || !analysis.primary_trade_plan) {
    return (
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 backdrop-blur">
        <CardContent className="p-4 text-center">
          <Target className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-700 dark:text-slate-400 text-sm">No trade strategy available</p>
          <p className="text-slate-500 dark:text-slate-500 text-xs mt-1">
            Analyze a chart to generate strategy
          </p>
        </CardContent>
      </Card>
    );
  }

  const plan = analysis.primary_trade_plan;
  const isLong = plan.action === 'BUY';

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return typeof price === 'number' ? price.toFixed(5) : price;
  };

  // Get entry ranges from technical analysis
  const hasEntryRanges = analysis.technical_analysis && 
                         (analysis.technical_analysis.ema21 || analysis.technical_analysis.ema50);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white dark:bg-[#242526]/90 border-slate-200 dark:border-slate-700/50 backdrop-blur hover:border-[#1877F2]/50 transition-all rounded-xl shadow-lg">
        <CardHeader className="p-4 pb-3">
          <CardTitle className="text-slate-900 dark:text-white flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${isLong ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-rose-500'}`}>
                {isLong ? (
                  <TrendingUp className="w-4 h-4 text-white" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] bg-clip-text text-transparent font-bold">
                Trade Strategy
              </span>
            </span>
            <Badge className={`${isLong ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'} text-white text-sm px-4 py-1 rounded-full`}>
              {plan.action}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 p-4 pt-0">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-700">
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">
                Entry Price Range
              </h4>
            </div>

            {hasEntryRanges ? (
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-white dark:bg-[#3A3B3C]/50 border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-700 dark:text-white text-xs font-medium">Upper Range (Current)</span>
                    <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white text-xs px-2 py-0.5 rounded-full">
                      Market
                    </Badge>
                  </div>
                  <p className="text-slate-900 dark:text-white font-mono text-xl font-bold">
                    {formatPrice(plan.entry)}
                  </p>
                </div>

                {analysis.technical_analysis.ema21 && (
                  <div className="p-2 rounded-lg bg-white dark:bg-[#3A3B3C]/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Lower (20 EMA)</span>
                      <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white text-xs px-1.5 py-0">
                        Preferred
                      </Badge>
                    </div>
                    <p className="text-slate-900 dark:text-white font-mono text-lg font-bold">
                      {formatPrice(analysis.technical_analysis.ema21)}
                    </p>
                  </div>
                )}

                {analysis.technical_analysis.ema50 && (
                  <div className="p-2 rounded-lg bg-white dark:bg-[#3A3B3C]/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-medium">Alternative (50 EMA)</span>
                      <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white text-xs px-1.5 py-0">
                        Deeper
                      </Badge>
                    </div>
                    <p className="text-slate-900 dark:text-white font-mono text-lg font-bold">
                      {formatPrice(analysis.technical_analysis.ema50)}
                    </p>
                  </div>
                )}

                <div className="p-2 rounded-lg bg-white dark:bg-[#3A3B3C]/50 border border-slate-200 dark:border-slate-700">
                  <p className="text-slate-700 dark:text-slate-300 text-xs">
                    💡 Set limit orders at these levels
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-white dark:bg-[#3A3B3C]/50">
                <p className="text-slate-900 dark:text-white font-mono text-xl font-bold mb-1">
                  {formatPrice(plan.entry)}
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-xs">Market entry</p>
              </div>
            )}
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Stop Loss</h4>
            </div>
            <p className="text-slate-900 dark:text-white font-mono text-2xl font-bold mb-2">
              {formatPrice(plan.stop_loss)}
            </p>
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-[#3A3B3C]/30">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Risk</span>
              <span className="text-slate-900 dark:text-white font-mono font-bold">{plan.sl_pips} pips</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">TP1</h4>
                </div>
                <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white text-xs px-2 py-0">
                  {plan.rr_ratio_1 || '1:1.5'}
                </Badge>
              </div>
              <p className="text-slate-900 dark:text-white font-mono text-xl font-bold mb-1.5">
                {formatPrice(plan.take_profit_1)}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Profit</span>
                <span className="text-slate-900 dark:text-white font-mono font-semibold">{plan.tp1_pips} pips</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-white">TP2</h4>
                </div>
                <Badge className="bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white text-xs px-2 py-0">
                  {plan.rr_ratio_2 || '1:3'}
                </Badge>
              </div>
              <p className="text-slate-900 dark:text-white font-mono text-xl font-bold mb-1.5">
                {formatPrice(plan.take_profit_2)}
              </p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Profit</span>
                <span className="text-slate-900 dark:text-white font-mono font-semibold">{plan.tp2_pips} pips</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-700">
            <div className="flex items-center gap-1.5 mb-2">
              <DollarSign className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Position Sizing</h4>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-600 dark:text-slate-400 text-xs block mb-0.5">Lot Size</span>
                <p className="text-slate-900 dark:text-white font-mono text-lg font-bold">{plan.lot_size}</p>
              </div>
              <div>
                <span className="text-slate-600 dark:text-slate-400 text-xs block mb-0.5">Risk %</span>
                <p className="text-slate-900 dark:text-white font-mono text-lg font-bold">{plan.risk_percentage}%</p>
              </div>
            </div>
          </div>

          {plan.entry_justification && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-700">
              <h5 className="text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-1.5 text-sm">
                <span>🎯</span> Entry Zone Strategy
              </h5>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                {plan.entry_justification}
              </p>
            </div>
          )}

          {plan.risk_guidance && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-700">
              <h5 className="text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-1.5 text-sm">
                <span>⚖️</span> Risk Management
              </h5>
              <pre className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                {plan.risk_guidance}
              </pre>
            </div>
          )}

          {plan.management_notes && (
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/40 border border-slate-300 dark:border-slate-700">
              <h5 className="text-slate-900 dark:text-white font-semibold mb-2 flex items-center gap-1.5 text-sm">
                <span>💡</span> Trade Management
              </h5>
              <pre className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                {plan.management_notes}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}