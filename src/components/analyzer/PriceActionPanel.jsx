import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart, Zap } from "lucide-react";

export default function PriceActionPanel({ priceActionData }) {
  if (!priceActionData) return null;

  const getMomentumColor = (momentum) => {
    switch (momentum) {
      case 'Strong Bullish': return 'bg-green-600 text-white';
      case 'Bullish': return 'bg-green-100 text-green-800';
      case 'Bearish': return 'bg-red-100 text-red-800';
      case 'Strong Bearish': return 'bg-red-600 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBiasIcon = (bias) => {
    switch (bias) {
      case 'Bullish': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'Bearish': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <BarChart className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <BarChart className="w-5 h-5 text-orange-400" />
          Price Action Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Market Structure */}
        <div className="p-3 rounded-lg bg-slate-900/30">
          <h4 className="text-slate-200 font-medium mb-2">Market Structure</h4>
          <p className="text-slate-300 text-sm">{priceActionData.market_structure}</p>
        </div>

        {/* Momentum */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Momentum</span>
          <Badge className={getMomentumColor(priceActionData.momentum)}>
            <Zap className="w-3 h-3 mr-1" />
            {priceActionData.momentum}
          </Badge>
        </div>

        {/* Break of Structure */}
        {priceActionData.break_of_structure && (
          <div className="p-3 rounded-lg bg-slate-900/30">
            <h4 className="text-slate-200 font-medium mb-2">Break of Structure</h4>
            <p className="text-slate-300 text-sm">{priceActionData.break_of_structure}</p>
          </div>
        )}

        {/* Key Levels */}
        {priceActionData.key_levels && priceActionData.key_levels.length > 0 && (
          <div>
            <h4 className="text-slate-400 text-sm mb-2">Key Price Levels</h4>
            <div className="grid grid-cols-2 gap-2">
              {priceActionData.key_levels.slice(0, 6).map((level, index) => (
                <div key={index} className="text-center p-2 rounded bg-slate-900/20">
                  <span className="text-blue-400 font-mono text-sm">{level.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patterns */}
        {priceActionData.patterns && priceActionData.patterns.length > 0 && (
          <div>
            <h4 className="text-slate-400 text-sm mb-2">Identified Patterns</h4>
            <div className="space-y-1">
              {priceActionData.patterns.map((pattern, index) => (
                <Badge key={index} variant="outline" className="mr-1 mb-1">
                  {pattern}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Overall Bias */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <span className="text-slate-400">Price Action Bias</span>
          <div className="flex items-center gap-2">
            {getBiasIcon(priceActionData.bias)}
            <span className="text-slate-200 font-medium">{priceActionData.bias}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}