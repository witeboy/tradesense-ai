import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  TrendingUp,
  BarChart3,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";

import MT5AccountsTab from "../components/trading/MT5AccountsTab";
import MT4AccountsTab from "../components/trading/MT4AccountsTab";
import OpenTradesTab from "../components/trading/OpenTradesTab";
import TradeHistoryTab from "../components/trading/TradeHistoryTab";
import PerformanceAnalyticsTab from "../components/trading/PerformanceAnalyticsTab";
import BacktestingTab from "../components/trading/BacktestingTab";
import TradeCopyingTab from "../components/trading/TradeCopyingTab";
import FloatingMenu from "../components/FloatingMenu";

export default function TradingPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAccounts: 0,
    openTrades: 0,
    totalProfit: 0,
    winRate: 0
  });

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      await base44.auth.redirectToLogin();
    }
    setIsLoading(false);
  };

  const loadStats = async () => {
    try {
      const [mt5Accounts, mt4Accounts, trades] = await Promise.all([
        base44.entities.MT5Account.list(),
        base44.entities.MT4Account.list(),
        base44.entities.Trade.list()
      ]);

      // Aggregate account balances
      const totalBalance = 
        mt5Accounts.reduce((sum, acc) => sum + (acc.account_balance || 0), 0) +
        mt4Accounts.reduce((sum, acc) => sum + (acc.account_balance || 0), 0);
      
      const totalEquity = 
        mt5Accounts.reduce((sum, acc) => sum + (acc.account_equity || 0), 0) +
        mt4Accounts.reduce((sum, acc) => sum + (acc.account_equity || 0), 0);

      const openTrades = trades.filter(t => t.status === 'OPEN');
      const closedTrades = trades.filter(t => t.status === 'CLOSED');
      const totalProfit = closedTrades.reduce((sum, t) => sum + (t.current_profit || 0), 0);
      const winningTrades = closedTrades.filter(t => (t.current_profit || 0) > 0);

      setStats({
        totalAccounts: mt5Accounts.length + mt4Accounts.length,
        totalBalance: totalBalance,
        totalEquity: totalEquity,
        openTrades: openTrades.length,
        totalProfit: totalProfit,
        winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg">Loading Trading Dashboard...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Accounts",
      value: stats.totalAccounts,
      subtitle: `$${stats.totalBalance.toFixed(2)} Total Balance`,
      icon: Activity,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Total Equity",
      value: `$${stats.totalEquity.toFixed(2)}`,
      subtitle: `Across all accounts`,
      icon: DollarSign,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Open Trades",
      value: stats.openTrades,
      subtitle: `Active positions`,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Total P/L",
      value: `$${stats.totalProfit.toFixed(2)}`,
      subtitle: `${stats.winRate.toFixed(1)}% Win Rate`,
      icon: BarChart3,
      color: stats.totalProfit >= 0 ? "from-green-500 to-emerald-500" : "from-red-500 to-rose-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f2f5] via-white to-[#f0f2f5] dark:from-[#18191A] dark:via-[#242526] dark:to-[#18191A]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
          >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1877F2] to-[#0866FF] flex items-center justify-center shadow-2xl shadow-[#1877F2]/30">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#1877F2] via-[#0866FF] to-[#1877F2] bg-clip-text text-transparent">
              Trading Dashboard
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            💼 Manage your MT4/MT5 accounts and monitor trades
          </p>
          </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              >
              <Card className="bg-white dark:bg-[#242526]/80 border-slate-200 dark:border-slate-700/50 backdrop-blur hover:border-[#1877F2]/50 transition-all duration-300 rounded-2xl shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-semibold text-white">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  {stat.subtitle && (
                    <p className="text-xs text-slate-400 mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="mt5" className="w-full">
            <TabsList className="grid w-full grid-cols-7 bg-slate-800/40 border border-slate-700/50 backdrop-blur">
              <TabsTrigger value="mt5" className="data-[state=active]:bg-[#1877F2] data-[state=active]:text-white hover:bg-slate-700/50 transition-colors">
                MT5 Accounts
              </TabsTrigger>
              <TabsTrigger value="mt4" className="data-[state=active]:bg-[#1877F2] data-[state=active]:text-white hover:bg-slate-700/50 transition-colors">
                MT4 Accounts
              </TabsTrigger>
              <TabsTrigger value="trades" className="data-[state=active]:bg-[#1877F2] data-[state=active]:text-white hover:bg-slate-700/50 transition-colors">
                Open Trades
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-[#1877F2] data-[state=active]:text-white hover:bg-slate-700/50 transition-colors">
                Trade History
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-[#1877F2] data-[state=active]:text-white hover:bg-slate-700/50 transition-colors">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="backtest" className="data-[state=active]:bg-[#1877F2] data-[state=active]:text-white hover:bg-slate-700/50 transition-colors">
                Backtest
              </TabsTrigger>
              <TabsTrigger value="copy" className="data-[state=active]:bg-[#1877F2] data-[state=active]:text-white hover:bg-slate-700/50 transition-colors">
                Copy Trading
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mt5">
              <MT5AccountsTab onUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="mt4">
              <MT4AccountsTab onUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="trades">
              <OpenTradesTab onUpdate={loadStats} />
            </TabsContent>

            <TabsContent value="history">
              <TradeHistoryTab />
            </TabsContent>

            <TabsContent value="analytics">
              <PerformanceAnalyticsTab />
            </TabsContent>

            <TabsContent value="backtest">
              <BacktestingTab />
            </TabsContent>

            <TabsContent value="copy">
              <TradeCopyingTab />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* Floating Menu */}
      <FloatingMenu />
    </div>
  );
}