import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function CandlestickAnalysisTab({ analysis }) {
  if (!analysis || !analysis.candlestick_analysis) {
    return <div className="text-slate-400 text-center py-10">No candlestick analysis data available</div>;
  }

  const candle = analysis.candlestick_analysis;

  return (
    <div className="space-y-6 mt-4">
      {/* Patterns Detected - Always Visible */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" />
              Detected Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {candle.patterns_detected && candle.patterns_detected.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {candle.patterns_detected.map((pattern, idx) => (
                  <Badge key={idx} className="bg-orange-100 text-orange-800">
                    {pattern}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No specific patterns detected</p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Collapsible Sections */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardContent className="p-6">
            <Accordion type="multiple" className="w-full space-y-2">
              
              {/* Pattern Implications */}
              {candle.pattern_implications && (
                <AccordionItem value="implications" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                  <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-blue-400" />
                      <span className="font-semibold">Pattern Implications</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <p className="text-slate-300 leading-relaxed">{candle.pattern_implications}</p>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Reversal Signals */}
              <AccordionItem value="reversal" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-400" />
                    <span className="font-semibold">Reversal Signals</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {candle.reversal_signals && candle.reversal_signals.length > 0 ? (
                    <ul className="space-y-2">
                      {candle.reversal_signals.map((signal, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                          <span className="text-red-400 mt-1">•</span>
                          {signal}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 text-sm">No reversal signals detected</p>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Continuation Signals */}
              <AccordionItem value="continuation" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-green-400" />
                    <span className="font-semibold">Continuation Signals</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  {candle.continuation_signals && candle.continuation_signals.length > 0 ? (
                    <ul className="space-y-2">
                      {candle.continuation_signals.map((signal, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-300 text-sm">
                          <span className="text-green-400 mt-1">•</span>
                          {signal}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-slate-400 text-sm">No continuation signals detected</p>
                  )}
                </AccordionContent>
              </AccordionItem>

              {/* Chart Patterns */}
              {analysis.chart_patterns && analysis.chart_patterns.length > 0 && (
                <AccordionItem value="chart-patterns" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                  <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-purple-400" />
                      <span className="font-semibold">Chart Patterns</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4">
                    <div className="flex flex-wrap gap-2">
                      {analysis.chart_patterns.map((pattern, idx) => (
                        <Badge key={idx} className="bg-purple-100 text-purple-800">
                          {pattern}
                        </Badge>
                      ))}
                    </div>
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