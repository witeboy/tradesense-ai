import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, BarChart2 } from "lucide-react";

export default function MovingAveragesPanel({ maData }) {
  if (!maData) return null;

  const formatPrice = (price) => price?.toFixed(4) || 'N/A';

  const getAlignmentColor = (alignment) => {
    switch (alignment) {
      case 'Bullish': return 'bg-green-100 text-green-800';
      case 'Bearish': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTrendIcon = (strength) => {
    switch (strength) {
      case 'Strong': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'Weak': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-yellow-400" />;
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
          <BarChart2 className="w-5 h-5 text-blue-400" />
          Moving Averages Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* EMA Values with Professional Colors */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-slate-900/30">
            <div className="text-slate-400 text-xs mb-1">EMA 20</div>
            <div className="text-green-400 font-mono font-semibold">{formatPrice(maData.ema20)}</div>
            <div className="text-xs text-green-300">Fast MA</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-900/30">
            <div className="text-slate-400 text-xs mb-1">EMA 50</div>
            <div className="text-red-400 font-mono font-semibold">{formatPrice(maData.ema50)}</div>
            <div className="text-xs text-red-300">Medium MA</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-slate-900/30">
            <div className="text-slate-400 text-xs mb-1">EMA 200</div>
            <div className="text-blue-400 font-mono font-semibold">{formatPrice(maData.ema200)}</div>
            <div className="text-xs text-blue-300">Slow MA</div>
          </div>
        </div>

        {/* Price vs EMAs */}
        <div className="p-3 rounded-lg bg-slate-900/30">
          <h4 className="text-slate-200 font-medium mb-2">Price Position</h4>
          <p className="text-slate-300 text-sm">{maData.price_vs_emas}</p>
        </div>

        {/* EMA Alignment - Professional Logic */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">EMA Alignment</span>
          <Badge className={getAlignmentColor(maData.ema_alignment)}>
            {maData.ema_alignment}
          </Badge>
        </div>
        
        {/* Professional Alignment Explanation */}
        <div className="text-xs text-slate-400">
          • Bullish: Green(20) &gt; Red(50) &gt; Blue(200)<br/>
          • Bearish: Green(20) &lt; Red(50) &lt; Blue(200)<br/>
          • Mixed: Crossed or sideways alignment
        </div>

        {/* Trend Strength */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Trend Strength</span>
          <div className="flex items-center gap-2">
            {getTrendIcon(maData.trend_strength)}
            <span className="text-slate-200">{maData.trend_strength}</span>
          </div>
        </div>

        {/* Crossovers */}
        {maData.crossovers && maData.crossovers.length > 0 && (
          <div>
            <h4 className="text-slate-400 text-sm mb-2">Recent Crossovers</h4>
            <div className="space-y-1">
              {maData.crossovers.map((crossover, index) => (
                <div key={index} className="text-slate-300 text-sm p-2 rounded bg-slate-900/20">
                  {crossover}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overall Bias */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <span className="text-slate-400">MA Bias</span>
          <div className="flex items-center gap-2">
            {getBiasIcon(maData.bias)}
            <span className="text-slate-200 font-medium">{maData.bias}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}