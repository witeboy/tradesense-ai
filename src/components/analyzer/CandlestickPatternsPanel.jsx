import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight, Minus, Zap } from "lucide-react";

export default function CandlestickPatternsPanel({ patternData }) {
  if (!patternData) return null;

  const getReliabilityColor = (reliability) => {
    switch (reliability) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBiasIcon = (bias) => {
    switch (bias) {
      case 'Bullish': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'Bearish': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Candlestick Patterns
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* All Identified Patterns */}
        {patternData.identified_patterns && patternData.identified_patterns.length > 0 && (
          <div>
            <h4 className="text-slate-400 text-sm mb-2">Identified Patterns</h4>
            <div className="flex flex-wrap gap-1">
              {patternData.identified_patterns.map((pattern, index) => (
                <Badge key={index} variant="outline" className="text-xs mb-1">
                  {pattern}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Reversal Patterns */}
        {patternData.reversal_patterns && patternData.reversal_patterns.length > 0 && (
          <div className="p-3 rounded-lg bg-slate-900/30">
            <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              Reversal Patterns
            </h4>
            <div className="space-y-1">
              {patternData.reversal_patterns.map((pattern, index) => (
                <div key={index} className="text-slate-300 text-sm">{pattern}</div>
              ))}
            </div>
          </div>
        )}

        {/* Continuation Patterns */}
        {patternData.continuation_patterns && patternData.continuation_patterns.length > 0 && (
          <div className="p-3 rounded-lg bg-slate-900/30">
            <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-400" />
              Continuation Patterns
            </h4>
            <div className="space-y-1">
              {patternData.continuation_patterns.map((pattern, index) => (
                <div key={index} className="text-slate-300 text-sm">{pattern}</div>
              ))}
            </div>
          </div>
        )}

        {/* Pattern Reliability */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Pattern Reliability</span>
          <Badge className={getReliabilityColor(patternData.pattern_reliability)}>
            {patternData.pattern_reliability}
          </Badge>
        </div>

        {/* Pattern Bias */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <span className="text-slate-400">Pattern Bias</span>
          <div className="flex items-center gap-2">
            {getBiasIcon(patternData.bias)}
            <span className="text-slate-200 font-medium">{patternData.bias}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}