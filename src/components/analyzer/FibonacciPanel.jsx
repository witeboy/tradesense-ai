import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react";

export default function FibonacciPanel({ fibData }) {
  if (!fibData) return null;

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return typeof price === 'number' ? price.toFixed(4) : price;
  };

  const getBiasIcon = (bias) => {
    switch (bias) {
      case 'Bullish': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'Bearish': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getFibLevelColor = (level) => {
    // Different colors for different Fibonacci levels
    switch (level) {
      case 'fib_236': return 'text-purple-400';
      case 'fib_382': return 'text-blue-400';
      case 'fib_500': return 'text-yellow-400';
      case 'fib_618': return 'text-green-400';
      case 'fib_786': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getFibLevelLabel = (level) => {
    switch (level) {
      case 'fib_236': return '23.6%';
      case 'fib_382': return '38.2%';
      case 'fib_500': return '50.0%';
      case 'fib_618': return '61.8%';
      case 'fib_786': return '78.6%';
      default: return level;
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Fibonacci Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Fibonacci Levels */}
        {fibData.key_levels && (
          <div>
            <h4 className="text-slate-400 text-sm mb-3">Key Retracement Levels</h4>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(fibData.key_levels).map(([level, price]) => (
                price ? (
                  <div key={level} className="flex justify-between items-center p-2 rounded bg-slate-900/30">
                    <span className="text-slate-400 text-sm">{getFibLevelLabel(level)}</span>
                    <span className={`font-mono font-semibold ${getFibLevelColor(level)}`}>
                      {formatPrice(price)}
                    </span>
                  </div>
                ) : null
              ))}
            </div>
          </div>
        )}

        {/* Price Reactions */}
        {fibData.price_reactions && fibData.price_reactions.length > 0 && (
          <div>
            <h4 className="text-slate-400 text-sm mb-2">Price Reactions at Fib Levels</h4>
            <div className="space-y-1">
              {fibData.price_reactions.map((reaction, index) => (
                <div key={index} className="text-slate-300 text-sm p-2 rounded bg-slate-900/20">
                  {reaction}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confluence Levels */}
        {fibData.confluence_levels && fibData.confluence_levels.length > 0 && (
          <div>
            <h4 className="text-slate-400 text-sm mb-2">High Confluence Levels</h4>
            <div className="flex flex-wrap gap-1">
              {fibData.confluence_levels.map((level, index) => (
                <Badge key={index} variant="outline" className="text-xs text-green-300 border-green-500">
                  {formatPrice(level)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Overall Fibonacci Bias */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700">
          <span className="text-slate-400">Fibonacci Bias</span>
          <div className="flex items-center gap-2">
            {getBiasIcon(fibData.bias)}
            <span className="text-slate-200 font-medium">{fibData.bias}</span>
          </div>
        </div>

        {/* Fibonacci Trading Tips */}
        <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-500/20">
          <h4 className="text-purple-200 font-medium mb-2 text-sm">Fibonacci Trading Tips</h4>
          <div className="text-xs text-purple-100 space-y-1">
            <p>• 61.8% is the golden ratio - most important level</p>
            <p>• 38.2% & 50% are common retracement areas</p>
            <p>• Look for confluence with other indicators</p>
            <p>• Extensions at 127.2% & 161.8% for profit targets</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}