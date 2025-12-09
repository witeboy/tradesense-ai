import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

export default function MACDDivergencePanel({ divergence }) {
  if (!divergence || divergence.divergence_type === "None") {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            MACD Divergence Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300">No significant divergence detected</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getDivergenceConfig = (type, strength) => {
    const isBullish = type.includes("Bullish");
    const isHidden = type.includes("Hidden");
    
    let baseConfig = {
      icon: isBullish ? TrendingUp : TrendingDown,
      color: isBullish ? 'text-green-400' : 'text-red-400',
      bgColor: isBullish ? 'bg-green-900/20' : 'bg-red-900/20',
      borderColor: isBullish ? 'border-green-500/20' : 'border-red-500/20'
    };

    if (isHidden) {
      baseConfig.color = isBullish ? 'text-green-300' : 'text-red-300';
    }

    return baseConfig;
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Strong': return 'bg-green-100 text-green-800';
      case 'Moderate': return 'bg-yellow-100 text-yellow-800';
      case 'Weak': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const config = getDivergenceConfig(divergence.divergence_type, divergence.divergence_strength);
  const DivergenceIcon = config.icon;

  return (
    <Card className={`bg-slate-800/50 border-slate-700 backdrop-blur ${config.bgColor} ${config.borderColor}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DivergenceIcon className={`w-5 h-5 ${config.color}`} />
            MACD Divergence Analysis
          </div>
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge className={`${config.color} bg-transparent border`}>
            {divergence.divergence_type} Divergence
          </Badge>
          <Badge className={getStrengthColor(divergence.divergence_strength)}>
            {divergence.divergence_strength} Strength
          </Badge>
        </div>

        <div className="space-y-3">
          <p className="text-slate-300">
            {divergence.divergence_description}
          </p>

          {divergence.price_points && divergence.price_points.length > 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-slate-200 font-medium mb-2">Price Action Points</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  {divergence.price_points.map((point, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {divergence.macd_points && divergence.macd_points.length > 0 && (
                <div>
                  <h4 className="text-slate-200 font-medium mb-2">MACD Points</h4>
                  <ul className="text-sm text-slate-300 space-y-1">
                    {divergence.macd_points.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-purple-400">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}