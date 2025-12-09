import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, TrendingDown, Minus, Target, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function IndicatorConfluencePanel({ analysis }) {
  if (!analysis || !analysis.confluence_breakdown) {
    return null;
  }

  const indicators = analysis.confluence_breakdown.indicators || [];
  const confluenceScore = analysis.confluence_score || 0;

  let confluenceLevel, confluenceColor, confluenceIcon, recommendation, gradientClass;
  
  if (confluenceScore >= 90) {
    confluenceLevel = "Perfect Confluence";
    confluenceColor = "from-green-500 to-emerald-500";
    gradientClass = "from-green-900/30 to-emerald-900/30";
    confluenceIcon = <Sparkles className="w-6 h-6 text-green-400" />;
    recommendation = "🟢 STRONG SIGNAL - Maximum probability trade setup";
  } else if (confluenceScore >= 75) {
    confluenceLevel = "High Confluence";
    confluenceColor = "from-blue-500 to-cyan-500";
    gradientClass = "from-blue-900/30 to-cyan-900/30";
    confluenceIcon = <CheckCircle2 className="w-6 h-6 text-blue-400" />;
    recommendation = "🔵 EXCELLENT SIGNAL - High confidence trade";
  } else if (confluenceScore >= 60) {
    confluenceLevel = "Good Confluence";
    confluenceColor = "from-cyan-500 to-teal-500";
    gradientClass = "from-cyan-900/30 to-teal-900/30";
    confluenceIcon = <AlertCircle className="w-6 h-6 text-cyan-400" />;
    recommendation = "🟦 GOOD SIGNAL - Favorable conditions";
  } else if (confluenceScore >= 40) {
    confluenceLevel = "Moderate Confluence";
    confluenceColor = "from-yellow-500 to-orange-500";
    gradientClass = "from-yellow-900/30 to-orange-900/30";
    confluenceIcon = <AlertCircle className="w-6 h-6 text-yellow-400" />;
    recommendation = "🟡 CAUTION - Mixed signals, wait for better setup";
  } else {
    confluenceLevel = "Low Confluence";
    confluenceColor = "from-red-500 to-rose-500";
    gradientClass = "from-red-900/30 to-rose-900/30";
    confluenceIcon = <XCircle className="w-6 h-6 text-red-400" />;
    recommendation = "🔴 NO TRADE - Conflicting indicators, stay out";
  }

  const getSignalIcon = (signal) => {
    if (signal === 'bullish') return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (signal === 'bearish') return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <Minus className="w-5 h-5 text-yellow-400" />;
  };

  const getSignalColor = (signal) => {
    if (signal === 'bullish') return 'bg-green-500/20 text-green-300 border-green-500/30';
    if (signal === 'bearish') return 'bg-red-500/20 text-red-300 border-red-500/30';
    return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl overflow-hidden hover:border-slate-600/50 transition-all duration-300">
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-20`} />
        
        <CardHeader className="relative">
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center gap-3">
              {confluenceIcon}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Indicator Confluence
              </span>
            </span>
            <div className="relative">
              {/* Circular Progress Background */}
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth="3"
                />
                <motion.path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  strokeDasharray={`${confluenceScore}, 100`}
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${confluenceScore}, 100` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" className={`${confluenceColor}`} />
                    <stop offset="100%" className={`${confluenceColor}`} />
                  </linearGradient>
                </defs>
              </svg>
              {/* Score Text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className={`text-2xl font-bold bg-gradient-to-r ${confluenceColor} bg-clip-text text-transparent`}>
                    {confluenceScore}
                  </div>
                  <div className="text-[10px] text-slate-400 -mt-1">%</div>
                </div>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 relative">
          {/* Overall Summary */}
          <div className={`p-5 rounded-xl bg-gradient-to-br ${gradientClass} border-2 backdrop-blur-sm ${
            confluenceScore >= 70 ? 'border-green-500/30' : confluenceScore >= 50 ? 'border-yellow-500/30' : 'border-red-500/30'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xl font-bold text-white mb-1">{confluenceLevel}</h4>
                <p className="text-slate-300 text-sm">{analysis.confluence_breakdown.agreement || "Analyzing..."}</p>
              </div>
              <div className="text-right">
                <div className={`text-4xl font-black bg-gradient-to-r ${confluenceColor} bg-clip-text text-transparent`}>
                  {confluenceScore}%
                </div>
                <div className="text-xs text-slate-400 mt-1">of 100%</div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-slate-900/50 backdrop-blur">
              <p className="text-slate-100 font-medium leading-relaxed">{recommendation}</p>
            </div>
          </div>

          {/* Confidence Score Breakdown */}
          {analysis.confidence_score && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-5 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 backdrop-blur-sm"
            >
              <h5 className="text-blue-200 font-bold text-lg mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Final Confidence Score: {analysis.confidence_score}%
              </h5>
              <div className="space-y-3">
                {[
                  { label: "Confluence (75%)", value: analysis.confidence_breakdown?.confluence_weight, color: "from-blue-500 to-cyan-500" },
                  { label: "Top-Down Analysis (10%)", value: analysis.confidence_breakdown?.topdown_weight, color: "from-purple-500 to-pink-500" },
                  { label: "Fundamentals (15%)", value: analysis.confidence_breakdown?.fundamental_weight, color: "from-green-500 to-emerald-500" }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-blue-300 font-mono font-semibold">{item.value?.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.value / analysis.confidence_score) * 100}%` }}
                        transition={{ duration: 1, delay: 0.3 + idx * 0.1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Individual Indicators */}
          <div className="space-y-3">
            <h4 className="text-slate-200 font-semibold text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Individual Indicator Signals
            </h4>
            {indicators.map((indicator, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * idx }}
                className="group p-4 rounded-xl bg-slate-900/30 hover:bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-slate-800/50 group-hover:scale-110 transition-transform">
                      {getSignalIcon(indicator.signal)}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-semibold">{indicator.name}</p>
                      <p className="text-slate-400 text-xs mt-1 line-clamp-2">{indicator.details}</p>
                    </div>
                  </div>
                  <div className="text-right ml-3 space-y-2">
                    <Badge className={`${getSignalColor(indicator.signal)} border px-3 py-1`}>
                      {indicator.signal}
                    </Badge>
                    <div className="text-sm font-mono">
                      <span className={`font-bold ${
                        indicator.signal === 'bullish' ? 'text-green-400' :
                        indicator.signal === 'bearish' ? 'text-red-400' :
                        'text-yellow-400'
                      }`}>{indicator.score}</span>
                      <span className="text-slate-500">/{indicator.max_score}</span>
                    </div>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className={`h-2 rounded-full ${
                      indicator.signal === 'bullish' ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 
                      indicator.signal === 'bearish' ? 'bg-gradient-to-r from-red-500 to-rose-500' : 
                      'bg-gradient-to-r from-yellow-500 to-orange-500'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${(indicator.score / indicator.max_score) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 + idx * 0.1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Trading Decision */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="p-5 rounded-xl bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h5 className="text-purple-200 font-bold text-lg mb-2">Trading Decision</h5>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {analysis.direction_rationale}
                </p>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}