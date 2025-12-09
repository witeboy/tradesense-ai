import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingUp, DollarSign, Target, BarChart3, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function PerformanceAnalyticsTab() {
  const [trades, setTrades] = useState([]);
  const [mt5Accounts, setMt5Accounts] = useState([]);
  const [mt4Accounts, setMt4Accounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    account: 'all',
    symbol: 'all',
    timeframe: 'all'
  });
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (trades.length > 0) {
      calculateMetrics();
    }
  }, [trades, filters]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [closedTrades, mt5List, mt4List] = await Promise.all([
        base44.entities.Trade.filter({ status: 'CLOSED' }),
        base44.entities.MT5Account.list(),
        base44.entities.MT4Account.list()
      ]);
      setTrades(closedTrades.sort((a, b) => new Date(a.created_date) - new Date(b.created_date)));
      setMt5Accounts(mt5List);
      setMt4Accounts(mt4List);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
    setIsLoading(false);
  };

  const calculateMetrics = () => {
    let filteredTrades = trades;

    // Apply filters
    if (filters.account !== 'all') {
      filteredTrades = filteredTrades.filter(t => 
        t.mt5_account_id === filters.account || t.mt4_account_id === filters.account
      );
    }
    if (filters.symbol !== 'all') {
      filteredTrades = filteredTrades.filter(t => t.symbol === filters.symbol);
    }
    if (filters.timeframe !== 'all') {
      filteredTrades = filteredTrades.filter(t => t.timeframe === filters.timeframe);
    }

    if (filteredTrades.length === 0) {
      setMetrics(null);
      return;
    }

    // Calculate key metrics
    const winningTrades = filteredTrades.filter(t => (t.current_profit || 0) > 0);
    const losingTrades = filteredTrades.filter(t => (t.current_profit || 0) < 0);
    const winRate = (winningTrades.length / filteredTrades.length) * 100;
    
    const totalProfit = filteredTrades.reduce((sum, t) => sum + (t.current_profit || 0), 0);
    const avgProfit = totalProfit / filteredTrades.length;
    
    const grossProfit = winningTrades.reduce((sum, t) => sum + (t.current_profit || 0), 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.current_profit || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
    
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + (t.current_profit || 0), 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0
      ? losingTrades.reduce((sum, t) => sum + Math.abs(t.current_profit || 0), 0) / losingTrades.length
      : 0;

    // Calculate equity curve
    let cumulativeProfit = 0;
    const equityCurve = filteredTrades.map((trade, idx) => {
      cumulativeProfit += (trade.current_profit || 0);
      return {
        trade: idx + 1,
        equity: cumulativeProfit,
        date: new Date(trade.close_time || trade.created_date).toLocaleDateString()
      };
    });

    // Calculate drawdown
    let peak = 0;
    let maxDrawdown = 0;
    equityCurve.forEach(point => {
      if (point.equity > peak) {
        peak = point.equity;
      }
      const drawdown = peak - point.equity;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });
    const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak) * 100 : 0;

    // Profit distribution
    const profitRanges = [
      { range: '$0-$50', count: 0 },
      { range: '$50-$100', count: 0 },
      { range: '$100-$200', count: 0 },
      { range: '$200+', count: 0 },
      { range: '-$0 to -$50', count: 0 },
      { range: '-$50 to -$100', count: 0 },
      { range: '-$100+', count: 0 }
    ];

    filteredTrades.forEach(trade => {
      const profit = trade.current_profit || 0;
      if (profit >= 200) profitRanges[3].count++;
      else if (profit >= 100) profitRanges[2].count++;
      else if (profit >= 50) profitRanges[1].count++;
      else if (profit >= 0) profitRanges[0].count++;
      else if (profit >= -50) profitRanges[4].count++;
      else if (profit >= -100) profitRanges[5].count++;
      else profitRanges[6].count++;
    });

    // Win/Loss by symbol
    const symbolStats = {};
    filteredTrades.forEach(trade => {
      if (!symbolStats[trade.symbol]) {
        symbolStats[trade.symbol] = { wins: 0, losses: 0, profit: 0 };
      }
      if ((trade.current_profit || 0) > 0) {
        symbolStats[trade.symbol].wins++;
      } else {
        symbolStats[trade.symbol].losses++;
      }
      symbolStats[trade.symbol].profit += (trade.current_profit || 0);
    });

    const symbolData = Object.entries(symbolStats).map(([symbol, data]) => ({
      symbol,
      wins: data.wins,
      losses: data.losses,
      profit: data.profit
    })).sort((a, b) => b.profit - a.profit);

    setMetrics({
      totalTrades: filteredTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate,
      totalProfit,
      avgProfit,
      grossProfit,
      grossLoss,
      profitFactor,
      avgWin,
      avgLoss,
      maxDrawdown,
      maxDrawdownPercent,
      equityCurve,
      profitRanges,
      symbolData
    });
  };

  const uniqueSymbols = [...new Set(trades.map(t => t.symbol))];
  const uniqueTimeframes = [...new Set(trades.map(t => t.timeframe).filter(Boolean))];

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="ml-3 text-slate-300">Loading analytics...</span>
        </CardContent>
      </Card>
    );
  }

  if (trades.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-12 text-center">
          <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Trade History</h3>
          <p className="text-slate-400">
            Complete some trades to see performance analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label className="text-slate-200 mb-2 block">Account</Label>
              <Select value={filters.account} onValueChange={(val) => setFilters({...filters, account: val})}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">
                    🌐 Master Account (All Combined)
                  </SelectItem>
                  {mt5Accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id} className="text-white">{acc.account_name} (MT5)</SelectItem>
                  ))}
                  {mt4Accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id} className="text-white">{acc.account_name} (MT4)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-200 mb-2 block">Symbol</Label>
              <Select value={filters.symbol} onValueChange={(val) => setFilters({...filters, symbol: val})}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">All Symbols</SelectItem>
                  {uniqueSymbols.map(sym => (
                    <SelectItem key={sym} value={sym} className="text-white">{sym}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-slate-200 mb-2 block">Timeframe</Label>
              <Select value={filters.timeframe} onValueChange={(val) => setFilters({...filters, timeframe: val})}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">All Timeframes</SelectItem>
                  {uniqueTimeframes.map(tf => (
                    <SelectItem key={tf} value={tf} className="text-white">{tf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {metrics && (
        <>
          {/* Key Metrics */}
          <div className="grid md:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300">Win Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">
                      {metrics.winRate.toFixed(1)}%
                    </div>
                    <Target className="w-8 h-8 text-green-400" />
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    {metrics.winningTrades}W / {metrics.losingTrades}L
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300">Total P/L</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className={`text-3xl font-bold ${metrics.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${metrics.totalProfit.toFixed(2)}
                    </div>
                    <DollarSign className={`w-8 h-8 ${metrics.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    Avg: ${metrics.avgProfit.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300">Profit Factor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-white">
                      {metrics.profitFactor === Infinity ? '∞' : metrics.profitFactor.toFixed(2)}
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    ${metrics.grossProfit.toFixed(0)} / ${metrics.grossLoss.toFixed(0)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-300">Max Drawdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-red-400">
                      {metrics.maxDrawdownPercent.toFixed(1)}%
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    ${metrics.maxDrawdown.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Equity Curve */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Equity Curve</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics.equityCurve}>
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
                      name="Cumulative Profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Profit Distribution */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Profit Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={metrics.profitRanges}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="range" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e293b',
                          border: '1px solid #475569',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Performance by Symbol */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-white">Performance by Symbol</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {metrics.symbolData.map((item, idx) => (
                      <div key={item.symbol} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30">
                        <div>
                          <p className="text-white font-semibold">{item.symbol}</p>
                          <p className="text-slate-400 text-sm">
                            {item.wins}W / {item.losses}L
                          </p>
                        </div>
                        <div className={`text-lg font-bold ${item.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${item.profit.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Additional Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Additional Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-slate-400 mb-2">Average Win</p>
                    <p className="text-2xl font-bold text-green-400">${metrics.avgWin.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-2">Average Loss</p>
                    <p className="text-2xl font-bold text-red-400">${metrics.avgLoss.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-2">Win/Loss Ratio</p>
                    <p className="text-2xl font-bold text-white">
                      {metrics.avgLoss > 0 ? (metrics.avgWin / metrics.avgLoss).toFixed(2) : '∞'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </div>
  );
}