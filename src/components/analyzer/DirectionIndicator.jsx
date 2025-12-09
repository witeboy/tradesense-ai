import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DirectionIndicator({ direction, rationale, instrument, timeframe }) {
  const getDirectionConfig = (dir) => {
    switch (dir) {
      case 'Bullish':
        return {
          icon: TrendingUp,
          color: 'text-green-400',
          bgColor: 'bg-green-900/20',
          borderColor: 'border-green-500/20',
          badgeColor: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'Bearish':
        return {
          icon: TrendingDown,
          color: 'text-red-400',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-500/20',
          badgeColor: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'Range':
        return {
          icon: Minus,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-500/20',
          badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      default:
        return {
          icon: Minus,
          color: 'text-gray-400',
          bgColor: 'bg-gray-900/20',
          borderColor: 'border-gray-500/20',
          badgeColor: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getDirectionConfig(direction);
  const DirectionIcon = config.icon;

  return (
    <Card className={`bg-slate-800/50 border-slate-700 backdrop-blur ${config.bgColor} ${config.borderColor}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DirectionIcon className={`w-6 h-6 ${config.color}`} />
            Market Direction
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-slate-300 border-slate-600">
              {instrument}
            </Badge>
            <Badge variant="outline" className="text-slate-300 border-slate-600">
              {timeframe}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge className={config.badgeColor}>
              <DirectionIcon className="w-3 h-3 mr-1" />
              {direction}
            </Badge>
          </div>
          <p className="text-slate-300">
            {rationale}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}