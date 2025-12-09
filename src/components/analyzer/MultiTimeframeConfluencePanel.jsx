import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Layers, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

export default function MultiTimeframeConfluencePanel({ 
  overallConfidence, 
  overallConfluenceSummary, 
  timeframeAnalyses 
}) {
  if (!timeframeAnalyses || Object.keys(timeframeAnalyses).length === 0) {
    return null;
  }

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceIcon = (confidence) => {
    switch (confidence) {
      case 'High': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case 'Medium': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'Low': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getDirectionIcon = (direction) => {
    switch (direction) {
      case 'Bullish': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'Bearish': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Layers className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getDirectionColor = (direction) => {
    switch (direction) {
      case 'Bullish': return 'bg-green-100 text-green-800';
      case 'Bearish': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Multi-Timeframe Confluence Analysis
          <Badge className={getConfidenceColor(overallConfidence)}>
            {overallConfidence} Confidence
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Confluence Summary */}
        <div className="p-4 rounded-lg bg-slate-900/30 border border-slate-700">
          <div className="flex items-start gap-3">
            {getConfidenceIcon(overallConfidence)}
            <div className="flex-1">
              <h4 className="text-slate-200 font-medium mb-2">Overall Market Confluence</h4>
              <p className="text-slate-300 text-sm leading-relaxed">
                {overallConfluenceSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Individual Timeframe Breakdown */}
        <div>
          <h4 className="text-slate-200 font-medium mb-3">Timeframe Breakdown</h4>
          <div className="grid gap-3">
            {Object.entries(timeframeAnalyses).map(([timeframe, data]) => (
              <div 
                key={timeframe}
                className="p-3 rounded-lg bg-slate-900/20 border border-slate-700/50 hover:bg-slate-900/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-blue-300 border-blue-500/30">
                      {timeframe}
                    </Badge>
                    <Badge className={getDirectionColor(data.timeframe_direction)}>
                      {getDirectionIcon(data.timeframe_direction)}
                      <span className="ml-1">{data.timeframe_direction}</span>
                    </Badge>
                  </div>
                  
                  {/* Quick bias indicators */}
                  <div className="flex items-center gap-1">
                    {data.moving_averages?.bias && (
                      <Badge variant="outline" className="text-xs">
                        MA: {data.moving_averages.bias}
                      </Badge>
                    )}
                    {data.rsi_analysis?.bias && (
                      <Badge variant="outline" className="text-xs">
                        RSI: {data.rsi_analysis.bias}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <p className="text-slate-400 text-sm">
                  {data.timeframe_direction_rationale}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Confluence Strength Indicator */}
        <div className="pt-3 border-t border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Timeframes Analyzed:</span>
            <Badge variant="outline" className="text-slate-300">
              {Object.keys(timeframeAnalyses).length} Timeframes
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}