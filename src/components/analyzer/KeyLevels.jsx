import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";

export default function KeyLevels({ levels }) {
  if (!levels) return null;

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return typeof price === 'number' ? price.toFixed(4) : price;
  };

  const { fibonacci, support_resistance } = levels;

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Key Levels
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Fibonacci Levels */}
          {fibonacci && (
            <div className="space-y-3">
              <h4 className="text-slate-200 font-medium flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                Fibonacci Retracements
              </h4>
              <div className="space-y-2">
                {fibonacci.fib_382 && (
                  <div className="flex justify-between items-center p-2 rounded bg-slate-900/30">
                    <span className="text-slate-400 text-sm">38.2%</span>
                    <span className="text-purple-400 font-mono">{formatPrice(fibonacci.fib_382)}</span>
                  </div>
                )}
                {fibonacci.fib_500 && (
                  <div className="flex justify-between items-center p-2 rounded bg-slate-900/30">
                    <span className="text-slate-400 text-sm">50.0%</span>
                    <span className="text-yellow-400 font-mono">{formatPrice(fibonacci.fib_500)}</span>
                  </div>
                )}
                {fibonacci.fib_618 && (
                  <div className="flex justify-between items-center p-2 rounded bg-slate-900/30">
                    <span className="text-slate-400 text-sm">61.8%</span>
                    <span className="text-blue-400 font-mono">{formatPrice(fibonacci.fib_618)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Support/Resistance */}
          {support_resistance && support_resistance.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-slate-200 font-medium flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                Support & Resistance
              </h4>
              <div className="space-y-2">
                {support_resistance.slice(0, 6).map((level, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded bg-slate-900/30">
                    <span className="text-slate-400 text-sm">Level {index + 1}</span>
                    <span className="text-blue-400 font-mono">{formatPrice(level)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}