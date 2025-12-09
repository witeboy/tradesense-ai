import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Shield, Star, Sparkles, AlertCircle, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function TradePlanTab({ analysis }) {
  if (!analysis || !analysis.primary_trade_plan) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-6 text-center">
          <p className="text-slate-400">No trade plan available</p>
          {analysis && analysis.confluence_score < 70 && (
            <p className="text-slate-500 text-sm mt-2">
              Confluence score below 70% - No trade recommended
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const plan = analysis.primary_trade_plan;

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return typeof price === 'number' ? price.toFixed(5) : price;
  };

  const isLong = plan.action === 'BUY';
  const icon = isLong ? TrendingUp : TrendingDown;
  const color = isLong ? 'text-green-400' : 'text-red-400';
  const bgColor = isLong ? 'bg-green-900/10' : 'bg-red-900/10';
  const borderColor = isLong ? 'border-green-500/20' : 'border-red-500/20';

  // Determine if we should show entry zones
  const showEntryZones = analysis.confluence_score >= 70 && 
                         analysis.technical_analysis && 
                         (analysis.technical_analysis.ema21 || analysis.technical_analysis.ema50);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`bg-slate-800/40 border-slate-700/50 backdrop-blur-xl hover:border-slate-600/50 transition-all duration-300 ${bgColor} ${borderColor} overflow-hidden relative`}>
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 ${isLong ? 'bg-gradient-to-br from-green-900/10 to-emerald-900/10' : 'bg-gradient-to-br from-red-900/10 to-rose-900/10'} pointer-events-none`} />
        
        <CardHeader className="relative">
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${isLong ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                {React.createElement(icon, { className: `w-6 h-6 ${color}` })}
              </div>
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent text-xl font-bold">
                Trade Plan
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <Badge className={`${isLong ? 'bg-green-500 text-white' : 'bg-red-500 text-white'} text-base px-4 py-1`}>
                {plan.action}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <Accordion type="multiple" defaultValue={["entry-exits", "risk-management"]} className="w-full space-y-4">
            {/* Entry & Stop Loss */}
            <AccordionItem value="entry-exits" className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 hover:bg-blue-900/30 transition-colors">
              <AccordionTrigger className="p-4 text-left font-semibold text-blue-300 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-400" />
                  Entry Strategy & Stop Loss
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 px-4 space-y-4">
                {/* Primary Entry */}
                <div className="p-4 rounded-xl bg-blue-900/20 border border-blue-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-400 text-sm font-semibold">Primary Entry Price</span>
                  </div>
                  <p className="text-blue-300 font-mono text-2xl font-bold mb-2">{formatPrice(plan.entry)}</p>
                  
                  {/* Pullback Entry Zones */}
                  {showEntryZones && (
                    <div className="mt-4 p-4 rounded-lg bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/40">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-5 h-5 text-green-400" />
                        <p className="text-green-200 text-base font-bold">🎯 Optimal Pullback Entry Zones</p>
                      </div>
                      
                      <div className="space-y-3">
                        {analysis.technical_analysis.ema21 && (
                          <div className="p-3 rounded-lg bg-slate-900/40 border border-green-500/20">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-slate-300 font-medium">Zone 1: Near 20 EMA</span>
                              <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                                Preferred
                              </Badge>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-green-400 font-mono text-2xl font-bold">
                                {formatPrice(analysis.technical_analysis.ema21)}
                              </span>
                              <span className="text-slate-400 text-xs">
                                (Strong pullback zone)
                              </span>
                            </div>
                          </div>
                        )}
                        
                        {analysis.technical_analysis.ema50 && (
                          <div className="p-3 rounded-lg bg-slate-900/40 border border-yellow-500/20">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-slate-300 font-medium">Zone 2: Near 50 EMA</span>
                              <Badge className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                Alternative
                              </Badge>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-yellow-400 font-mono text-2xl font-bold">
                                {formatPrice(analysis.technical_analysis.ema50)}
                              </span>
                              <span className="text-slate-400 text-xs">
                                (Deeper pullback zone)
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-3 p-3 rounded-lg bg-blue-900/20 border border-blue-500/20">
                        <p className="text-blue-200 text-sm leading-relaxed">
                          💡 <strong>Strategy:</strong> Set limit orders at these levels to catch pullbacks in the {isLong ? 'uptrend' : 'downtrend'}. 
                          The 20 EMA is your primary zone for quick entries, while the 50 EMA offers deeper retracements with potentially better risk/reward.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Stop Loss */}
                <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-red-400" />
                    <span className="text-slate-400 text-sm font-semibold">Stop Loss</span>
                  </div>
                  <p className="text-red-300 font-mono text-2xl font-bold">{formatPrice(plan.stop_loss)}</p>
                  <p className="text-slate-400 text-xs mt-2">
                    Risk: {plan.sl_pips} pips • ${plan.risk_amount}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Take Profits */}
            <AccordionItem value="take-profits" className="rounded-xl border border-green-500/30 bg-gradient-to-br from-green-900/20 to-emerald-900/20 hover:bg-green-900/30 transition-colors">
              <AccordionTrigger className="p-4 text-left font-semibold text-green-300 hover:no-underline">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Take Profit Levels
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 px-4 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-green-900/20 border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm font-semibold">TP1 ({plan.rr_ratio_1 || '1:1.5'})</span>
                    <Badge className="bg-green-500/20 text-green-300 text-xs">{plan.tp1_pips} pips</Badge>
                  </div>
                  <p className="text-green-300 font-mono text-xl font-bold">{formatPrice(plan.take_profit_1)}</p>
                </div>
                <div className="p-4 rounded-xl bg-green-900/20 border border-green-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-sm font-semibold">TP2 ({plan.rr_ratio_2 || '1:3'})</span>
                    <Badge className="bg-green-500/20 text-green-300 text-xs">{plan.tp2_pips} pips</Badge>
                  </div>
                  <p className="text-green-300 font-mono text-xl font-bold">{formatPrice(plan.take_profit_2)}</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Risk Management */}
            <AccordionItem value="risk-management" className="rounded-xl border border-yellow-500/20 bg-gradient-to-br from-yellow-900/10 to-orange-900/10 hover:bg-yellow-900/20 transition-colors">
              <AccordionTrigger className="p-4 text-left font-semibold text-yellow-300 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-yellow-400" />
                  Risk Management
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 px-4 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 text-sm block mb-1">Risk %</span>
                  <p className="text-yellow-300 font-mono font-bold">{plan.risk_percentage}%</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm block mb-1">Recommended Lot</span>
                  <p className="text-yellow-300 font-mono font-bold">{plan.lot_size}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm block mb-1">Risk Amount</span>
                  <p className="text-yellow-300 font-mono font-bold">${plan.risk_amount}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-sm block mb-1">SL Distance</span>
                  <p className="text-yellow-300 font-mono font-bold">{plan.sl_pips} pips</p>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Management Notes */}
            {plan.management_notes && (
              <AccordionItem value="management-notes" className="rounded-xl border border-slate-700/50 bg-slate-900/30 hover:bg-slate-800/40 transition-colors">
                <AccordionTrigger className="p-4 text-left font-semibold text-slate-300 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    Management Notes
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 px-4 text-slate-400 text-sm leading-relaxed">
                  {plan.management_notes}
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Indicator Setup Guide */}
            {analysis.technical_analysis && (
              <AccordionItem value="indicator-setup" className="rounded-xl border border-purple-500/20 bg-purple-900/10 hover:bg-purple-900/20 transition-colors">
                <AccordionTrigger className="p-4 text-left font-semibold text-purple-300 hover:no-underline">
                  <Info className="w-5 h-5 mr-2 text-purple-400" />
                  Indicator Setup Guide
                </AccordionTrigger>
                <AccordionContent className="pb-4 px-4 text-sm text-purple-200 leading-relaxed space-y-2">
                  <p>To identify optimal pullback entry zones, add the following Moving Average indicators to your chart:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    {analysis.technical_analysis.ema21 && <li>Exponential Moving Average (EMA) - Length: <span className="font-bold text-white">21</span></li>}
                    {analysis.technical_analysis.ema50 && <li>Exponential Moving Average (EMA) - Length: <span className="font-bold text-white">50</span></li>}
                    <li>Ensure these indicators are visible on your chosen timeframe (e.g., H1, H4).</li>
                    <li>Look for price action to retrace to or near these EMAs for potential entry opportunities.</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            )}

            {/* Disclaimer */}
            <AccordionItem value="disclaimer" className="rounded-xl border border-red-500/20 bg-red-900/10 hover:bg-red-900/20 transition-colors">
              <AccordionTrigger className="p-4 text-left font-semibold text-red-300 hover:no-underline">
                <AlertCircle className="w-5 h-5 mr-2 text-red-400" />
                Disclaimer
              </AccordionTrigger>
              <AccordionContent className="pb-4 px-4 text-sm text-red-200 leading-relaxed">
                This trade plan is generated by an AI and is for educational and informational purposes only. It does not constitute financial advice. Trading involves substantial risk and is not suitable for all investors. You could lose all or more of your initial investment. Consult with a qualified financial professional before making any investment decisions.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </motion.div>
  );
}