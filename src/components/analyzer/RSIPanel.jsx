import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function RSIPanel({ rsiData }) {
  if (!rsiData) return null;

  const getRSIColor = (value) => {
    if (value >= 70) return "text-red-400";
    if (value <= 30) return "text-green-400";
    return "text-yellow-400";
  };

  const getRSIZone = (value) => {
    if (value >= 70) return { zone: "Overbought", color: "bg-red-100 text-red-800" };
    if (value <= 30) return { zone: "Oversold", color: "bg-green-100 text-green-800" };
    return { zone: "Neutral", color: "bg-blue-100 text-blue-800" };
  };

  const getBiasIcon = (bias) => {
    switch (bias) {
      case 'Bullish': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'Bearish': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <Minus className="w-4 h-4 text-yellow-400" />;
    }
  };

  const rsiZone = getRSIZone(rsiData.current_value);

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-400" />
          RSI Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* RSI Value and Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">RSI (14)</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getRSIColor(rsiData.current_value)}`}>
                {rsiData.current_value?.toFixed(1) || 'N/A'}
              </span>
              <Badge className={rsiZone.color}>{rsiZone.zone}</Badge>
            </div>
          </div>
          <Progress 
            value={rsiData.current_value} 
            max={100}
            className="h-2"
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Oversold (30)</span>
            <span>Neutral (50)</span>
            <span>Overbought (70)</span>
          </div>
        </div>

        {/* Divergence Analysis */}
        {rsiData.divergence_type && rsiData.divergence_type !== "None" && (
          <div className="p-3 rounded-lg bg-slate-900/30">
            <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
              {getBiasIcon(rsiData.divergence_type.includes('Bullish') ? 'Bullish' : 'Bearish')}
              RSI Divergence Detected
            </h4>
            <Badge className={
              rsiData.divergence_type.includes('Bullish') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }>
              {rsiData.divergence_type} Divergence
            </Badge>
          </div>
        )}

        {/* Signal and Bias */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-slate-400 text-sm mb-1">Signal</h4>
            <p className="text-slate-200 text-sm">{rsiData.signal || 'No clear signal'}</p>
          </div>
          <div>
            <h4 className="text-slate-400 text-sm mb-1">Bias</h4>
            <div className="flex items-center gap-1">
              {getBiasIcon(rsiData.bias)}
              <span className="text-slate-200 text-sm">{rsiData.bias}</span>
            </div>
          </div>
        </div>

        {/* Support/Resistance Levels */}
        {rsiData.support_resistance && rsiData.support_resistance.length > 0 && (
          <div>
            <h4 className="text-slate-400 text-sm mb-2">RSI Key Levels</h4>
            <div className="flex flex-wrap gap-1">
              {rsiData.support_resistance.map((level, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {level}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}