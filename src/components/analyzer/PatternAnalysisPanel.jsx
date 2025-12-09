import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, AlertTriangle, Star, Activity } from "lucide-react";

export default function PatternAnalysisPanel({ patternData }) {
  if (!patternData) return null;

  const getPatternDirectionIcon = (direction) => {
    switch (direction) {
      case 'bullish': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'bearish': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getPatternDirectionColor = (direction) => {
    switch (direction) {
      case 'bullish': return 'bg-green-100 text-green-800';
      case 'bearish': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          Pattern Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart Patterns */}
        {patternData.chart_patterns && patternData.chart_patterns.length > 0 && (
          <div>
            <h4 className="text-slate-200 font-medium mb-3 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Chart Patterns
            </h4>
            <div className="space-y-2">
              {patternData.chart_patterns.map((pattern, index) => (
                <div key={index} className="p-3 rounded-lg bg-slate-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPatternDirectionIcon(pattern.direction)}
                      <span className="text-slate-200 font-medium">{pattern.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPatternDirectionColor(pattern.direction)}>
                        {pattern.direction}
                      </Badge>
                      <Badge className={getConfidenceColor(pattern.confidence_score)}>
                        {pattern.confidence_score}%
                      </Badge>
                    </div>
                  </div>
                  
                  {pattern.entry && (
                    <div className="text-sm text-slate-300 mb-1">
                      <span className="text-blue-400">Entry:</span> {pattern.entry}
                    </div>
                  )}
                  
                  {pattern.stop_loss && (
                    <div className="text-sm text-slate-300 mb-1">
                      <span className="text-red-400">Stop Loss:</span> {pattern.stop_loss}
                    </div>
                  )}
                  
                  {pattern.take_profit && (
                    <div className="text-sm text-slate-300">
                      <span className="text-green-400">Take Profit:</span> {pattern.take_profit}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Candlestick Patterns */}
        {patternData.candlestick_patterns && patternData.candlestick_patterns.length > 0 && (
          <div>
            <h4 className="text-slate-200 font-medium mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-400" />
              Candlestick Patterns
            </h4>
            <div className="space-y-2">
              {patternData.candlestick_patterns.map((pattern, index) => (
                <div key={index} className="p-3 rounded-lg bg-slate-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getPatternDirectionIcon(pattern.direction)}
                      <span className="text-slate-200 font-medium">{pattern.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPatternDirectionColor(pattern.direction)}>
                        {pattern.type}
                      </Badge>
                      <Badge className={getConfidenceColor(pattern.confidence_score)}>
                        {pattern.confidence_score}%
                      </Badge>
                    </div>
                  </div>
                  
                  {pattern.conditions && (
                    <div className="text-sm text-slate-400 mb-1">
                      <span className="text-slate-300">Conditions:</span> {pattern.conditions}
                    </div>
                  )}
                  
                  {pattern.entry && (
                    <div className="text-sm text-slate-300 mb-1">
                      <span className="text-blue-400">Entry:</span> {pattern.entry}
                    </div>
                  )}
                  
                  {pattern.stop_loss && (
                    <div className="text-sm text-slate-300">
                      <span className="text-red-400">Stop Loss:</span> {pattern.stop_loss}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pattern Summary */}
        {patternData.pattern_summary && (
          <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/20">
            <h4 className="text-blue-200 font-medium mb-2">Pattern Analysis Summary</h4>
            <div className="text-sm text-blue-100 space-y-1">
              <p><strong>Dominant Direction:</strong> {patternData.pattern_summary.dominant_direction}</p>
              <p><strong>Pattern Count:</strong> {patternData.pattern_summary.total_patterns} patterns detected</p>
              <p><strong>Reliability Score:</strong> {patternData.pattern_summary.reliability_score}%</p>
              <p><strong>Trading Bias:</strong> {patternData.pattern_summary.trading_bias}</p>
            </div>
          </div>
        )}

        {/* Pattern-Based Trade Recommendation */}
        {patternData.trade_recommendation && (
          <div className="p-3 rounded-lg bg-slate-900/30">
            <h4 className="text-slate-200 font-medium mb-2">Pattern-Based Trade Setup</h4>
            <div className="text-sm text-slate-300 space-y-1">
              <p><strong>Signal:</strong> {patternData.trade_recommendation.signal}</p>
              <p><strong>Entry Zone:</strong> {patternData.trade_recommendation.entry_zone}</p>
              <p><strong>Stop Loss:</strong> {patternData.trade_recommendation.stop_loss}</p>
              <p><strong>Take Profit:</strong> {patternData.trade_recommendation.take_profit}</p>
              <p><strong>Risk/Reward:</strong> {patternData.trade_recommendation.risk_reward}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}