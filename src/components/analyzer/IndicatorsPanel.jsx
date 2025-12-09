import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function IndicatorsPanel({ indicators }) {
  if (!indicators) return null;

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "N/A";
    return typeof num === 'number' ? num.toFixed(4) : num;
  };

  const getRSIColor = (rsi) => {
    if (rsi > 70) return "text-red-400";
    if (rsi < 30) return "text-green-400";
    return "text-yellow-400";
  };

  const getEMARelation = () => {
    const { ema20, ema50, ema200 } = indicators;
    if (!ema20 || !ema50 || !ema200) return "Unknown";
    
    if (ema20 > ema50 && ema50 > ema200) return { text: "Bullish", color: "text-green-400" };
    if (ema20 < ema50 && ema50 < ema200) return { text: "Bearish", color: "text-red-400" };
    return { text: "Mixed", color: "text-yellow-400" };
  };

  const emaRelation = getEMARelation();

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Technical Indicators
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* EMAs */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <h4 className="text-slate-200 font-medium">Moving Averages</h4>
              <Badge className={`${emaRelation.color} bg-transparent border`}>
                {emaRelation.text}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">EMA 20</span>
                <span className="text-green-400 font-mono">{formatNumber(indicators.ema20)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">EMA 50</span>
                <span className="text-yellow-400 font-mono">{formatNumber(indicators.ema50)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">EMA 200</span>
                <span className="text-red-400 font-mono">{formatNumber(indicators.ema200)}</span>
              </div>
            </div>
          </div>

          {/* Oscillators */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              <h4 className="text-slate-200 font-medium">Oscillators</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">RSI (14)</span>
                <span className={`font-mono ${getRSIColor(indicators.rsi)}`}>
                  {formatNumber(indicators.rsi)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">MACD Line</span>
                <span className="text-blue-400 font-mono">{formatNumber(indicators.macd_line)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">MACD Signal</span>
                <span className="text-purple-400 font-mono">{formatNumber(indicators.macd_signal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">MACD Histogram</span>
                <span className={`font-mono ${indicators.macd_histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatNumber(indicators.macd_histogram)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}