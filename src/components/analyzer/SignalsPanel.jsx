import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function SignalsPanel({ signals }) {
  if (!signals || signals.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Signals Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400 text-center py-4">No signals detected</p>
        </CardContent>
      </Card>
    );
  }

  const getSignalIcon = (signal) => {
    const lower = signal.toLowerCase();
    if (lower.includes('bullish') || lower.includes('buy') || lower.includes('support')) {
      return <TrendingUp className="w-4 h-4 text-green-400" />;
    }
    if (lower.includes('bearish') || lower.includes('sell') || lower.includes('resistance')) {
      return <TrendingDown className="w-4 h-4 text-red-400" />;
    }
    if (lower.includes('confirmed') || lower.includes('above') || lower.includes('strong')) {
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    }
    if (lower.includes('below') || lower.includes('weak') || lower.includes('broken')) {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
    return <AlertCircle className="w-4 h-4 text-yellow-400" />;
  };

  const getSignalType = (signal) => {
    const lower = signal.toLowerCase();
    if (lower.includes('ema') || lower.includes('moving average')) return 'Trend';
    if (lower.includes('rsi') || lower.includes('macd') || lower.includes('momentum')) return 'Momentum';
    if (lower.includes('fib') || lower.includes('support') || lower.includes('resistance') || lower.includes('level')) return 'Levels';
    if (lower.includes('candle') || lower.includes('pattern') || lower.includes('engulf')) return 'Pattern';
    return 'Signal';
  };

  const groupedSignals = signals.reduce((acc, signal) => {
    const type = getSignalType(signal);
    if (!acc[type]) acc[type] = [];
    acc[type].push(signal);
    return acc;
  }, {});

  const typeColors = {
    'Trend': 'bg-blue-100 text-blue-800',
    'Momentum': 'bg-purple-100 text-purple-800',
    'Levels': 'bg-green-100 text-green-800',
    'Pattern': 'bg-orange-100 text-orange-800',
    'Signal': 'bg-gray-100 text-gray-800'
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-400" />
          Signals Panel
          <Badge variant="outline" className="text-slate-300 border-slate-600">
            {signals.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96 px-4">
          <div className="space-y-4 pb-4">
            {Object.entries(groupedSignals).map(([type, typeSignals]) => (
              <div key={type} className="space-y-2">
                <div className="flex items-center gap-2 sticky top-0 bg-slate-800/80 py-2">
                  <Badge className={typeColors[type] || typeColors['Signal']}>
                    {type}
                  </Badge>
                  <span className="text-xs text-slate-400">({typeSignals.length})</span>
                </div>
                
                {typeSignals.map((signal, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/30 hover:bg-slate-900/50 transition-colors"
                  >
                    {getSignalIcon(signal)}
                    <p className="text-slate-300 text-sm flex-1 leading-relaxed">
                      {signal}
                    </p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}