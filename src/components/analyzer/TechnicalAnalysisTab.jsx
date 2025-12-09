import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Activity, Target } from "lucide-react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function TechnicalAnalysisTab({ analysis, chartImage }) {
  if (!analysis || !analysis.technical_analysis) {
    return <div className="text-slate-400 text-center py-10">No technical analysis data available</div>;
  }

  const tech = analysis.technical_analysis;
  
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "N/A";
    return typeof num === 'number' ? num.toFixed(5) : num;
  };

  const getEMAColor = (alignment) => {
    if (alignment?.toLowerCase().includes('bullish')) return 'text-green-400';
    if (alignment?.toLowerCase().includes('bearish')) return 'text-red-400';
    return 'text-yellow-400';
  };

  const getRSIColor = (rsi) => {
    if (!rsi) return 'text-slate-400';
    if (rsi > 70) return 'text-red-400';
    if (rsi < 30) return 'text-green-400';
    return 'text-yellow-400';
  };

  return (
    <div className="space-y-6 mt-4">
      {/* Chart Image */}
      {chartImage && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardContent className="p-4">
              <img src={chartImage} alt="Chart" className="w-full rounded-lg" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Direction Card - Always Visible */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              {analysis.direction === 'Bullish' ? <TrendingUp className="w-5 h-5 text-green-400" /> : 
               analysis.direction === 'Bearish' ? <TrendingDown className="w-5 h-5 text-red-400" /> :
               <Activity className="w-5 h-5 text-yellow-400" />}
              Market Direction: {analysis.direction}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300">{analysis.direction_rationale}</p>
            {analysis.confidence_score > 0 && (
              <div className="mt-3">
                <Badge className="bg-blue-100 text-blue-800">
                  Confidence: {analysis.confidence_score}%
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Collapsible Sections */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardContent className="p-6">
            <Accordion type="multiple" className="w-full space-y-2">
              
              {/* Moving Averages Section */}
              <AccordionItem value="ema" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">Moving Averages (EMA)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-1">
                      <span className="text-slate-400 text-sm">EMA 21 (Fast)</span>
                      <p className="text-green-400 font-mono text-lg">{formatNumber(tech.ema21)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 text-sm">EMA 50 (Medium)</span>
                      <p className="text-yellow-400 font-mono text-lg">{formatNumber(tech.ema50)}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-slate-400 text-sm">EMA 200 (Slow)</span>
                      <p className="text-blue-400 font-mono text-lg">{formatNumber(tech.ema200)}</p>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-slate-900/30">
                    <h4 className="text-slate-300 font-medium mb-2">EMA Alignment</h4>
                    <p className={`font-semibold ${getEMAColor(tech.ema_alignment)}`}>
                      {tech.ema_alignment || "Not specified"}
                    </p>
                    {tech.ema_detail && (
                      <p className="text-slate-400 text-sm mt-2">{tech.ema_detail}</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* ADX & RSI Section */}
              <AccordionItem value="momentum" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-400" />
                    <span className="font-semibold">Momentum Indicators (ADX & RSI)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-slate-900/50">
                      <h5 className="text-white text-lg mb-2">ADX (Trend Strength)</h5>
                      <p className="text-4xl font-bold text-purple-400 mb-2">{formatNumber(tech.adx)}</p>
                      <p className="text-slate-300 text-sm">{tech.adx_interpretation || "N/A"}</p>
                      {tech.adx_detail && (
                        <p className="text-slate-400 text-xs mt-2">{tech.adx_detail}</p>
                      )}
                    </div>

                    <div className="p-4 rounded-lg bg-slate-900/50">
                      <h5 className="text-white text-lg mb-2">RSI (14)</h5>
                      <p className={`text-4xl font-bold mb-2 ${getRSIColor(tech.rsi)}`}>
                        {formatNumber(tech.rsi)}
                      </p>
                      <p className="text-slate-300 text-sm">{tech.rsi_zone || "N/A"}</p>
                      {tech.rsi_detail && (
                        <p className="text-slate-400 text-xs mt-2">{tech.rsi_detail}</p>
                      )}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* MACD Section */}
              <AccordionItem value="macd" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    <span className="font-semibold">MACD Analysis</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="grid md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <span className="text-slate-400 text-sm">MACD Line</span>
                      <p className="text-blue-400 font-mono text-lg">{formatNumber(tech.macd_line)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Signal Line</span>
                      <p className="text-purple-400 font-mono text-lg">{formatNumber(tech.macd_signal)}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Histogram</span>
                      <p className={`font-mono text-lg ${tech.macd_histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatNumber(tech.macd_histogram)}
                      </p>
                    </div>
                  </div>
                  {tech.macd_detail && (
                    <div className="p-3 rounded-lg bg-slate-900/30">
                      <p className="text-slate-300 text-sm">{tech.macd_detail}</p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Support & Resistance Section */}
              <AccordionItem value="levels" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold">Key Levels (Support & Resistance)</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Support */}
                    {tech.support_levels && tech.support_levels.length > 0 && (
                      <div>
                        <h4 className="text-green-400 font-medium mb-2">Support Levels</h4>
                        <div className="space-y-2">
                          {tech.support_levels.map((level, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900/30">
                              <span className="text-slate-400 text-sm">S{idx + 1}</span>
                              <span className="text-green-400 font-mono">{formatNumber(level)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Resistance */}
                    {tech.resistance_levels && tech.resistance_levels.length > 0 && (
                      <div>
                        <h4 className="text-red-400 font-medium mb-2">Resistance Levels</h4>
                        <div className="space-y-2">
                          {tech.resistance_levels.map((level, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900/30">
                              <span className="text-slate-400 text-sm">R{idx + 1}</span>
                              <span className="text-red-400 font-mono">{formatNumber(level)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fibonacci */}
                  {tech.fibonacci_levels && (
                    <div className="mt-6">
                      <h4 className="text-purple-400 font-medium mb-2">Fibonacci Retracements</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                        {tech.fibonacci_levels.fib_236 && (
                          <div className="p-2 rounded bg-slate-900/30 text-center">
                            <span className="text-slate-400 text-xs">23.6%</span>
                            <p className="text-purple-400 font-mono text-sm">{formatNumber(tech.fibonacci_levels.fib_236)}</p>
                          </div>
                        )}
                        {tech.fibonacci_levels.fib_382 && (
                          <div className="p-2 rounded bg-slate-900/30 text-center">
                            <span className="text-slate-400 text-xs">38.2%</span>
                            <p className="text-purple-400 font-mono text-sm">{formatNumber(tech.fibonacci_levels.fib_382)}</p>
                          </div>
                        )}
                        {tech.fibonacci_levels.fib_500 && (
                          <div className="p-2 rounded bg-slate-900/30 text-center">
                            <span className="text-slate-400 text-xs">50.0%</span>
                            <p className="text-yellow-400 font-mono text-sm">{formatNumber(tech.fibonacci_levels.fib_500)}</p>
                          </div>
                        )}
                        {tech.fibonacci_levels.fib_618 && (
                          <div className="p-2 rounded bg-slate-900/30 text-center">
                            <span className="text-slate-400 text-xs">61.8%</span>
                            <p className="text-blue-400 font-mono text-sm">{formatNumber(tech.fibonacci_levels.fib_618)}</p>
                          </div>
                        )}
                        {tech.fibonacci_levels.fib_786 && (
                          <div className="p-2 rounded bg-slate-900/30 text-center">
                            <span className="text-slate-400 text-xs">78.6%</span>
                            <p className="text-green-400 font-mono text-sm">{formatNumber(tech.fibonacci_levels.fib_786)}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Trend Strength */}
              {tech.trend_strength && (
                <AccordionItem value="trend" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                  <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-orange-400" />
                      <span className="font-semibold">Overall Trend Strength</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <Badge className={
                      tech.trend_strength === 'Strong' ? 'bg-green-100 text-green-800 text-lg px-4 py-2' :
                      tech.trend_strength === 'Moderate' ? 'bg-yellow-100 text-yellow-800 text-lg px-4 py-2' :
                      'bg-red-100 text-red-800 text-lg px-4 py-2'
                    }>
                      {tech.trend_strength}
                    </Badge>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}