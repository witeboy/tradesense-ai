import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Shield, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

export default function TradeStrategyPanel({ analysis }) {
  if (!analysis || !analysis.primary_trade_plan) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-6 text-center">
          <Target className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">No trade strategy available</p>
          <p className="text-slate-500 text-sm mt-2">
            Upload and analyze a chart to generate trade strategy
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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}>
      <Card className="bg-[#242526]/90 border-slate-700/50 backdrop-blur-xl hover:border-[#1877F2]/50 transition-all duration-300 rounded-3xl shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-3">
              <div className={`p-3 rounded-xl shadow-lg ${isLong ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-rose-500'}`}>
                {isLong ? (
                  <TrendingUp className="w-6 h-6 text-white" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-white" />
                )}
              </div>
              <span className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] bg-clip-text text-transparent font-bold text-xl">
                🎯 Trade Strategy
              </span>
            </span>
            <Badge className={`${isLong ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-red-500 to-rose-500'} text-white text-base px-6 py-2 rounded-full shadow-lg`}>
              {plan.action}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Entry Price Range */}
          <div className={`p-5 rounded-2xl bg-gradient-to-br ${
            isLong ? 'from-green-900/20 to-emerald-900/20 border-green-500/40' : 'from-red-900/20 to-rose-900/20 border-red-500/40'
          } border-2 shadow-xl`}>
            <div className="flex items-center gap-2 mb-3">
              <Target className={`w-5 h-5 ${isLong ? 'text-green-400' : 'text-red-400'}`} />
              <h4 className={`font-bold text-lg ${isLong ? 'text-green-200' : 'text-red-200'}`}>
                Entry Price Range
              </h4>
            </div>

            {hasEntryRanges ? (
              <div className="space-y-3">
                {/* Upper Range (Primary Entry) */}
                <div className="p-4 rounded-xl bg-[#3A3B3C]/50 border border-[#1877F2]/30 shadow-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white text-sm font-semibold">Upper Range (Current)</span>
                    <Badge className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] text-white border-0 text-xs px-3 py-1 rounded-full shadow-lg">
                      Market Entry
                    </Badge>
                  </div>
                  <p className="text-[#1877F2] font-mono text-3xl font-bold">
                    {formatPrice(plan.entry)}
                  </p>
                </div>

                {/* Lower Range (20 EMA) */}
                {analysis.technical_analysis.ema21 && (
                  <div className="p-3 rounded-lg bg-slate-900/40 border border-green-500/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-300 text-sm font-medium">Lower Range (20 EMA)</span>
                      <Badge className="bg-green-500/20 text-green-300 border border-green-500/30 text-xs">
                        Preferred
                      </Badge>
                    </div>
                    <p className="text-green-400 font-mono text-2xl font-bold">
                      {formatPrice(analysis.technical_analysis.ema21)}
                    </p>
                  </div>
                )}

                {/* Alternative Entry (50 EMA) */}
                {analysis.technical_analysis.ema50 && (
                  <div className="p-3 rounded-lg bg-slate-900/40 border border-yellow-500/20">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-300 text-sm font-medium">Alternative (50 EMA)</span>
                      <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 text-xs">
                        Deeper Pullback
                      </Badge>
                    </div>
                    <p className="text-yellow-400 font-mono text-2xl font-bold">
                      {formatPrice(analysis.technical_analysis.ema50)}
                    </p>
                  </div>
                )}

                <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/20">
                  <p className="text-blue-200 text-xs leading-relaxed">
                    💡 Set limit orders at these levels to catch optimal entries during pullbacks
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-900/40">
                <p className="text-slate-300 font-mono text-2xl font-bold mb-2">
                  {formatPrice(plan.entry)}
                </p>
                <p className="text-slate-400 text-xs">Market entry price</p>
              </div>
            )}
          </div>

          {/* Stop Loss */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-red-900/20 to-rose-900/20 border-2 border-red-500/40 shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-xl bg-red-500/20">
                <Shield className="w-6 h-6 text-red-400" />
              </div>
              <h4 className="font-bold text-xl text-white">🛡️ Stop Loss</h4>
            </div>
            <p className="text-red-400 font-mono text-4xl font-bold mb-3">
              {formatPrice(plan.stop_loss)}
            </p>
            <div className="flex items-center justify-between text-sm p-3 rounded-lg bg-[#3A3B3C]/30">
              <span className="text-slate-400 font-semibold">Risk</span>
              <span className="text-red-400 font-mono font-bold">{plan.sl_pips} pips</span>
            </div>
          </div>

          {/* Take Profits */}
          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-2 border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <h4 className="font-bold text-lg text-green-200">Take Profit 1</h4>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                  {plan.rr_ratio_1 || '1:1.5'}
                </Badge>
              </div>
              <p className="text-green-300 font-mono text-3xl font-bold mb-2">
                {formatPrice(plan.take_profit_1)}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Profit</span>
                <span className="text-green-300 font-mono">{plan.tp1_pips} pips</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-2 border-green-500/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-400" />
                  <h4 className="font-bold text-lg text-green-200">Take Profit 2</h4>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                  {plan.rr_ratio_2 || '1:3'}
                </Badge>
              </div>
              <p className="text-green-300 font-mono text-3xl font-bold mb-2">
                {formatPrice(plan.take_profit_2)}
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Profit</span>
                <span className="text-green-300 font-mono">{plan.tp2_pips} pips</span>
              </div>
            </div>
          </div>

          {/* Position Size */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-2 border-yellow-500/30">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-yellow-400" />
              <h4 className="font-bold text-lg text-yellow-200">Position Sizing</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 text-xs block mb-1">Lot Size</span>
                <p className="text-yellow-300 font-mono text-xl font-bold">{plan.lot_size}</p>
              </div>
              <div>
                <span className="text-slate-400 text-xs block mb-1">Risk %</span>
                <p className="text-yellow-300 font-mono text-xl font-bold">{plan.risk_percentage}%</p>
              </div>
            </div>
          </div>

          {/* Entry Justification */}
          {plan.entry_justification && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/40 shadow-xl">
              <h5 className="text-white font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">🎯</span> Entry Zone Strategy
              </h5>
              <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                {plan.entry_justification}
              </p>
            </div>
          )}

          {/* Risk Management Guidance */}
          {plan.risk_guidance && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-900/20 to-amber-900/20 border border-orange-500/40 shadow-xl">
              <h5 className="text-white font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">⚖️</span> Risk Management
              </h5>
              <pre className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {plan.risk_guidance}
              </pre>
            </div>
          )}

          {/* Management Notes */}
          {plan.management_notes && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1877F2]/10 to-[#0866FF]/10 border border-[#1877F2]/40 shadow-xl">
              <h5 className="text-white font-bold mb-3 flex items-center gap-2">
                <span className="text-2xl">💡</span> Trade Management
              </h5>
              <pre className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {plan.management_notes}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}