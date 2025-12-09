import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Shield, DollarSign, Star } from "lucide-react";

export default function TradePlans({ primaryPlan, alternatePlan }) {
  const formatPrice = (price) => {
    if (!price) return "N/A";
    return typeof price === 'number' ? price.toFixed(4) : price;
  };

  const TradeCard = ({ plan, isPrimary = false }) => {
    if (!plan) return null;

    const isLong = plan.type === 'Buy';
    const icon = isLong ? TrendingUp : TrendingDown;
    const color = isLong ? 'text-green-400' : 'text-red-400';
    const bgColor = isLong ? 'bg-green-900/10' : 'bg-red-900/10';
    const borderColor = isLong ? 'border-green-500/20' : 'border-red-500/20';

    return (
      <Card className={`bg-slate-800/50 border-slate-700 backdrop-blur ${bgColor} ${borderColor}`}>
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              {React.createElement(icon, { className: `w-5 h-5 ${color}` })}
              {isPrimary ? 'Primary Plan' : 'Alternate Plan'}
            </div>
            <div className="flex items-center gap-2">
              {isPrimary && <Star className="w-4 h-4 text-yellow-400" />}
              <Badge className={isLong ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {plan.type}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Entry & Exits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-slate-400 text-sm">Entry Zone</span>
              </div>
              <p className="text-blue-400 font-mono text-lg">{plan.entry_zone}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-slate-400 text-sm">Stop Loss</span>
              </div>
              <p className="text-red-400 font-mono text-lg">{formatPrice(plan.stop_loss)}</p>
            </div>
          </div>

          {/* Take Profits */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-slate-400 text-sm">TP1</span>
              <p className="text-green-400 font-mono">{formatPrice(plan.tp1)}</p>
              {plan.rr_ratio && (
                <Badge variant="outline" className="text-xs">
                  RR: 1:{plan.rr_ratio.toFixed(1)}
                </Badge>
              )}
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 text-sm">TP2</span>
              <p className="text-green-400 font-mono">{formatPrice(plan.tp2)}</p>
            </div>
          </div>

          {/* Management Notes */}
          {plan.management_notes && (
            <div className="space-y-2">
              <h5 className="text-slate-300 font-medium text-sm">Management</h5>
              <p className="text-slate-400 text-sm bg-slate-900/30 p-3 rounded">
                {plan.management_notes}
              </p>
            </div>
          )}

          {/* Partial Profit */}
          {plan.partial_profit && (
            <div className="flex items-center justify-between p-2 bg-slate-900/30 rounded">
              <span className="text-slate-400 text-sm">Partial Profit at TP1</span>
              <span className="text-yellow-400 font-medium">{plan.partial_profit}%</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-400" />
        Trade Plans
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <TradeCard plan={primaryPlan} isPrimary={true} />
        <TradeCard plan={alternatePlan} />
      </div>
    </div>
  );
}