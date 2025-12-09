import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Play, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function BacktestingTab() {
  const [strategies, setStrategies] = useState([]);
  const [currentStrategy, setCurrentStrategy] = useState({
    name: "",
    confluence_threshold: 75,
    min_adx: 25,
    risk_percent: 2,
    max_trades_per_day: 3,
    use_ema_filter: true
  });
  const [backtestResults, setBacktestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [historicalAnalyses, setHistoricalAnalyses] = useState([]);

  useEffect(() => {
    loadHistoricalData();
  }, []);

  const loadHistoricalData = async () => {
    try {
      const analyses = await base44.entities.Analysis.list('-created_date', 100);
      setHistoricalAnalyses(analyses);
    } catch (error) {
      console.error("Failed to load historical analyses:", error);
    }
  };

  const runBacktest = async () => {
    if (!currentStrategy.name) {
      toast.error("Please name your strategy");
      return;
    }

    setIsRunning(true);
    
    // Simulate backtest based on historical analyses
    const validAnalyses = historicalAnalyses.filter(a => 
      (a.confluence_score || 0) >= currentStrategy.confluence_threshold &&
      (a.technical_analysis?.adx || 0) >= currentStrategy.min_adx
    );

    if (validAnalyses.length === 0) {
      toast.error("No historical data matches your strategy criteria");
      setIsRunning(false);
      return;
    }

    // Simulate trades based on strategy
    const simulatedTrades = validAnalyses.slice(0, 50).map((analysis, idx) => {
      const entryPrice = analysis.current_price || 1.08000;
      const direction = analysis.direction?.toLowerCase().includes('buy') ? 'BUY' : 'SELL';
      
      // Simulate outcome based on confluence score
      const winProbability = (analysis.confluence_score || 70) / 100;
      const isWin = Math.random() < winProbability;
      
      const slPips = 30 + Math.random() * 20;
      const tpPips = slPips * (1.5 + Math.random() * 1.5);
      
      const profit = isWin 
        ? (tpPips * currentStrategy.risk_percent * 100) / slPips
        : -currentStrategy.risk_percent * 100;

      return {
        trade_num: idx + 1,
        symbol: analysis.instrument,
        direction: direction,
        confluence: analysis.confluence_score,
        profit: profit,
        win: isWin,
        date: analysis.created_date
      };
    });

    // Calculate backtest metrics
    const winningTrades = simulatedTrades.filter(t => t.win);
    const losingTrades = simulatedTrades.filter(t => !t.win);
    const winRate = (winningTrades.length / simulatedTrades.length) * 100;
    
    const totalProfit = simulatedTrades.reduce((sum, t) => sum + t.profit, 0);
    const grossProfit = winningTrades.reduce((sum, t) => sum + t.profit, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : Infinity;

    // Equity curve
    let cumulative = 0;
    const equityCurve = simulatedTrades.map(trade => {
      cumulative += trade.profit;
      return {
        trade: trade.trade_num,
        equity: cumulative
      };
    });

    // Calculate max drawdown
    let peak = 0;
    let maxDrawdown = 0;
    equityCurve.forEach(point => {
      if (point.equity > peak) peak = point.equity;
      const dd = peak - point.equity;
      if (dd > maxDrawdown) maxDrawdown = dd;
    });

    const results = {
      strategyName: currentStrategy.name,
      totalTrades: simulatedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalProfit,
      profitFactor,
      maxDrawdown,
      equityCurve,
      trades: simulatedTrades
    };

    setBacktestResults(results);
    
    // Save strategy
    const newStrategy = {
      ...currentStrategy,
      results: results,
      id: Date.now().toString()
    };
    setStrategies([...strategies, newStrategy]);
    
    toast.success(`Backtest completed: ${results.totalTrades} trades analyzed`);
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      {/* Strategy Configuration */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Strategy Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label className="text-slate-200">Strategy Name</Label>
              <Input
                value={currentStrategy.name}
                onChange={(e) => setCurrentStrategy({...currentStrategy, name: e.target.value})}
                placeholder="e.g., High Confluence Trend Following"
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>

            <div>
              <Label className="text-slate-200 mb-2 block">
                Confluence Threshold: {currentStrategy.confluence_threshold}%
              </Label>
              <Slider
                value={[currentStrategy.confluence_threshold]}
                onValueChange={(val) => setCurrentStrategy({...currentStrategy, confluence_threshold: val[0]})}
                min={50}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-slate-200 mb-2 block">
                Minimum ADX: {currentStrategy.min_adx}
              </Label>
              <Slider
                value={[currentStrategy.min_adx]}
                onValueChange={(val) => setCurrentStrategy({...currentStrategy, min_adx: val[0]})}
                min={15}
                max={40}
                step={5}
                className="w-full"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-slate-200">Risk Per Trade (%)</Label>
                <Input
                  type="number"
                  value={currentStrategy.risk_percent}
                  onChange={(e) => setCurrentStrategy({...currentStrategy, risk_percent: parseFloat(e.target.value)})}
                  min="0.5"
                  max="5"
                  step="0.5"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label className="text-slate-200">Max Trades/Day</Label>
                <Input
                  type="number"
                  value={currentStrategy.max_trades_per_day}
                  onChange={(e) => setCurrentStrategy({...currentStrategy, max_trades_per_day: parseInt(e.target.value)})}
                  min="1"
                  max="10"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </div>

            <Button
              onClick={runBacktest}
              disabled={isRunning || !currentStrategy.name}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Backtest...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run Backtest
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backtest Results */}
      {backtestResults && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border-blue-500/30 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">
                Backtest Results: {backtestResults.strategyName}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-slate-900/40">
                  <p className="text-slate-400 text-sm mb-1">Win Rate</p>
                  <p className="text-2xl font-bold text-green-400">
                    {backtestResults.winRate.toFixed(1)}%
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    {backtestResults.winningTrades}W / {backtestResults.losingTrades}L
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-slate-900/40">
                  <p className="text-slate-400 text-sm mb-1">Total P/L</p>
                  <p className={`text-2xl font-bold ${backtestResults.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${backtestResults.totalProfit.toFixed(2)}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-900/40">
                  <p className="text-slate-400 text-sm mb-1">Profit Factor</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {backtestResults.profitFactor === Infinity ? '∞' : backtestResults.profitFactor.toFixed(2)}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-900/40">
                  <p className="text-slate-400 text-sm mb-1">Max Drawdown</p>
                  <p className="text-2xl font-bold text-red-400">
                    ${backtestResults.maxDrawdown.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Equity Curve */}
              <div>
                <h4 className="text-white font-semibold mb-3">Simulated Equity Curve</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={backtestResults.equityCurve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="trade" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="equity"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                      name="Equity"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Saved Strategies Comparison */}
      {strategies.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Strategy Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {strategies.map((strat, idx) => (
                <div key={strat.id} className="p-4 rounded-lg bg-slate-900/30 border border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-white font-semibold">{strat.name}</h5>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setStrategies(strategies.filter(s => s.id !== strat.id))}
                      className="text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-slate-400">Win Rate</span>
                      <p className="text-green-400 font-semibold">{strat.results.winRate.toFixed(1)}%</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Total P/L</span>
                      <p className={strat.results.totalProfit >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                        ${strat.results.totalProfit.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Profit Factor</span>
                      <p className="text-blue-400 font-semibold">
                        {strat.results.profitFactor === Infinity ? '∞' : strat.results.profitFactor.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Trades</span>
                      <p className="text-white font-semibold">{strat.results.totalTrades}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap text-xs">
                    <Badge className="bg-blue-500/20 text-blue-300">
                      Confluence: {strat.confluence_threshold}%+
                    </Badge>
                    <Badge className="bg-purple-500/20 text-purple-300">
                      ADX: {strat.min_adx}+
                    </Badge>
                    <Badge className="bg-orange-500/20 text-orange-300">
                      Risk: {strat.risk_percent}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-blue-900/20 border-blue-500/30 backdrop-blur">
        <CardContent className="p-4">
          <p className="text-blue-200 text-sm">
            💡 <strong>Note:</strong> Backtests use your historical chart analyses to simulate performance based on strategy rules. 
            Results are simulated and do not guarantee future performance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}