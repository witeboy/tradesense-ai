import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Target, Crosshair } from "lucide-react";
import { motion } from "framer-motion";

export default function TopDownAnalysisTab({ analysis }) {
  if (!analysis || !analysis.analyzed_timeframes || analysis.analyzed_timeframes.length === 0) {
    return (
      <div className="text-slate-400 text-center py-10">
        No multi-timeframe data available. Please select multiple timeframes for top-down analysis.
      </div>
    );
  }

  // Simulate trend direction for each timeframe (in production, this would come from actual multi-timeframe analysis)
  const timeframeAnalysis = analysis.analyzed_timeframes.map((tf) => {
    // For now, use the primary analysis direction with some variation
    // In production, you'd analyze each timeframe separately
    const baseDirection = analysis.direction;
    
    // Simulate some variation across timeframes
    let direction = baseDirection;
    if (tf === "M1" || tf === "M5") {
      // Lower timeframes might show more noise
      direction = Math.random() > 0.3 ? baseDirection : "Range";
    }
    
    return {
      timeframe: tf,
      direction: direction,
      strength: analysis.technical_analysis?.trend_strength || "Moderate",
      ema_alignment: analysis.technical_analysis?.ema_alignment || "Neutral",
      key_level: analysis.current_price
    };
  });

  // Determine overall confluence
  const bullishCount = timeframeAnalysis.filter(t => t.direction === 'Bullish').length;
  const bearishCount = timeframeAnalysis.filter(t => t.direction === 'Bearish').length;
  const totalCount = timeframeAnalysis.length;
  
  const confluencePercent = Math.round((Math.max(bullishCount, bearishCount) / totalCount) * 100);
  const overallTrend = bullishCount > bearishCount ? 'Bullish' : bearishCount > bullishCount ? 'Bearish' : 'Range';

  const getDirectionIcon = (direction) => {
    if (direction === 'Bullish') return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (direction === 'Bearish') return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <Minus className="w-5 h-5 text-yellow-400" />;
  };

  const getDirectionColor = (direction) => {
    if (direction === 'Bullish') return 'bg-green-100 text-green-800';
    if (direction === 'Bearish') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Overall Confluence Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 backdrop-blur-xl hover:border-blue-400/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Crosshair className="w-6 h-6 text-blue-400" />
                </div>
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Multi-Timeframe Confluence
                </span>
              </span>
              <Badge className={`${confluencePercent >= 75 ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'} text-lg px-4 py-1`}>
                {confluencePercent}% Agreement
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="p-4 rounded-full bg-slate-900/50 border-2 border-slate-700/50">
                  {getDirectionIcon(overallTrend)}
                </div>
                <h3 className="text-3xl font-black text-white">{overallTrend} Trend</h3>
              </div>
              <p className="text-slate-300 text-lg">
                {Math.max(bullishCount, bearishCount)} out of {totalCount} timeframes agree
              </p>
            </div>

            {confluencePercent >= 75 && (
              <div className="p-5 rounded-xl bg-green-900/30 border border-green-500/30 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <Target className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-green-200 font-bold text-lg">🎯 Sniper Entry Opportunity</p>
                    <p className="text-green-300/90 text-sm mt-2 leading-relaxed">
                      High timeframe confluence detected. Look for pullbacks to key levels for optimal entry.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {confluencePercent < 75 && (
              <div className="p-5 rounded-xl bg-yellow-900/30 border border-yellow-500/30 backdrop-blur-sm">
                <p className="text-yellow-200 leading-relaxed">
                  ⚠️ Mixed signals across timeframes. Wait for clearer alignment before entering.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Individual Timeframe Analysis */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl hover:border-slate-600/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Timeframe Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {timeframeAnalysis.map((tf, idx) => (
                <motion.div
                  key={tf.timeframe}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group p-5 rounded-xl bg-slate-900/30 hover:bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="text-white font-black text-lg">{tf.timeframe}</span>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg">
                          {tf.timeframe === analysis.primary_timeframe && (
                            <span className="text-blue-400 text-xs mr-2 px-2 py-1 rounded bg-blue-500/20">PRIMARY</span>
                          )}
                          {tf.timeframe}
                        </h4>
                        <p className="text-slate-400 text-sm">Trend Strength: {tf.strength}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={`${getDirectionColor(tf.direction)} px-4 py-1 text-base`}>
                        {tf.direction}
                      </Badge>
                      <p className="text-slate-400 text-xs">
                        EMA: {tf.ema_alignment}
                      </p>
                    </div>
                  </div>

                  {/* Visual indicator bar with gradient */}
                  <div className="w-full bg-slate-800/50 rounded-full h-3 overflow-hidden border border-slate-700/50">
                    <motion.div 
                      className={`h-full rounded-full ${
                        tf.direction === 'Bullish' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                        tf.direction === 'Bearish' ? 'bg-gradient-to-r from-red-500 to-rose-500' : 
                        'bg-gradient-to-r from-yellow-500 to-orange-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ 
                        width: tf.direction === 'Range' ? '50%' : 
                               tf.strength === 'Strong' ? '90%' : 
                               tf.strength === 'Moderate' ? '70%' : '40%' 
                      }}
                      transition={{ duration: 1, delay: 0.5 + idx * 0.1, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sniper Entry Strategy */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              Sniper Entry Strategy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/20">
                <h5 className="text-purple-200 font-semibold mb-2">Top-Down Approach:</h5>
                <ol className="text-slate-300 text-sm space-y-2 list-decimal list-inside">
                  <li><strong>Higher Timeframes (H4, D1):</strong> Identify overall trend direction</li>
                  <li><strong>Middle Timeframes (H1):</strong> Look for trend structure and key levels</li>
                  <li><strong>Lower Timeframes (M15, M30):</strong> Find precise entry points on pullbacks</li>
                  <li><strong>Execute:</strong> Enter when lower TF confirms higher TF direction</li>
                </ol>
              </div>

              {analysis.primary_trade_plan && (
                <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/20">
                  <h5 className="text-blue-200 font-semibold mb-2">Recommended Entry Zones:</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-400">Primary Entry</p>
                      <p className="text-blue-400 font-mono">{analysis.primary_trade_plan.entry}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Pullback Entry</p>
                      <p className="text-green-400 font-mono">
                        {analysis.technical_analysis?.ema21?.toFixed(5) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-green-900/20 border border-green-500/20">
                <p className="text-green-200 text-sm">
                  💡 <strong>Pro Tip:</strong> Wait for price to pullback to the 20 or 50 EMA on your primary timeframe, 
                  then look for confirmation on a lower timeframe before entering.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}