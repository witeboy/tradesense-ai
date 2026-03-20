import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { TrendingUp, Zap, Target } from "lucide-react";

export default function StrategySignalsPanel({ strategiesAnalysis }) {
  if (!strategiesAnalysis || strategiesAnalysis.strategies.length === 0) {
    return (
      <Card className="bg-white dark:bg-[#242526]/90 border-slate-200 dark:border-slate-700/50 backdrop-blur rounded-xl shadow-lg">
        <CardContent className="p-4 text-center">
          <Zap className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-slate-700 dark:text-slate-400 text-sm">No strategies triggered</p>
          <p className="text-slate-600 dark:text-slate-500 text-xs mt-1">
            Analyze your chart to find matching strategies
          </p>
        </CardContent>
      </Card>
    );
  }

  const { confluencePercentage, triggeredCount, totalStrategies, averageWinRate, averageRiskReward, strategies } = strategiesAnalysis;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {/* Overview Card */}
      <Card className="bg-gradient-to-br from-blue-50 dark:from-blue-900/20 to-indigo-50 dark:to-indigo-900/20 border-blue-200 dark:border-blue-500/40 rounded-xl shadow">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Multi-Strategy Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-4 gap-2">
            <div>
              <p className="text-slate-700 dark:text-slate-400 text-xs">Confluence</p>
              <p className="text-slate-900 dark:text-white font-bold text-lg">{confluencePercentage}%</p>
              <p className="text-slate-600 dark:text-slate-500 text-xs mt-0.5">{triggeredCount}/{totalStrategies}</p>
            </div>
            <div>
              <p className="text-slate-700 dark:text-slate-400 text-xs">Avg Win Rate</p>
              <p className="text-green-600 dark:text-green-400 font-bold text-lg">{averageWinRate}%</p>
            </div>
            <div>
              <p className="text-slate-700 dark:text-slate-400 text-xs">Avg R:R</p>
              <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">{averageRiskReward}</p>
            </div>
            <div>
              <p className="text-slate-700 dark:text-slate-400 text-xs">Reliability</p>
              <Badge className={`${
                confluencePercentage >= 70 ? 'bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300' :
                confluencePercentage >= 50 ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300' :
                'bg-orange-100 dark:bg-orange-500/20 text-orange-800 dark:text-orange-300'
              } text-xs w-fit`}>
                {confluencePercentage >= 70 ? 'High' : confluencePercentage >= 50 ? 'Med' : 'Low'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategies List */}
      <div className="space-y-2">
        {strategies.map((strat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-500/50 transition-all rounded-lg shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="text-slate-900 dark:text-white font-semibold text-sm flex items-center gap-2">
                      <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                      {strat.name}
                    </h4>
                    <p className="text-slate-600 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                      {strat.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 min-w-fit">
                    <Badge className="bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-300 text-xs">
                      ✓ Triggered
                    </Badge>
                    <div className="text-right">
                      <p className="text-slate-700 dark:text-slate-300 text-xs">
                        <span className="font-bold text-green-600 dark:text-green-400">{strat.winRate}%</span> win
                      </p>
                      <p className="text-slate-700 dark:text-slate-300 text-xs">
                        <span className="font-bold text-blue-600 dark:text-blue-400">{strat.riskReward}</span> R:R
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recommendation */}
      {strategies.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 dark:from-green-900/20 to-emerald-50 dark:to-emerald-900/20 border-green-200 dark:border-green-500/40 rounded-lg shadow">
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <p className="text-slate-900 dark:text-white font-semibold text-xs mb-1">Recommended Action</p>
                <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                  {strategies[0].name} shows the highest win rate ({strategies[0].winRate}%). 
                  {confluencePercentage >= 70 
                    ? ' Multiple strategies agree - high conviction setup. Increase position size.'
                    : confluencePercentage >= 50
                    ? ' Good setup with moderate confluence. Normal position size.'
                    : ' Limited strategy confluence. Wait for additional confirmation.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}