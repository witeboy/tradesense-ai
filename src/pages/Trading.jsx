import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Plus, 
  TrendingUp, 
  AlertCircle,
  BarChart3,
  DollarSign,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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
        totalBalance: totalBalance || 0,
        totalEquity: totalEquity || 0,
        openTrades: openTrades.length,
        totalProfit: totalProfit || 0,
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
      value: stats.totalAccounts || 0,
      subtitle: `$${(stats.totalBalance || 0).toFixed(2)} Total Balance`,
      icon: Activity,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Total Equity",
      value: `$${(stats.totalEquity || 0).toFixed(2)}`,
      subtitle: `Across all accounts`,
      icon: DollarSign,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Open Trades",
      value: stats.openTrades || 0,
      subtitle: `Active positions`,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Total P/L",
      value: `$${(stats.totalProfit || 0).toFixed(2)}`,
      subtitle: `${(stats.winRate || 0).toFixed(1)}% Win Rate`,
      icon: BarChart3,
      color: (stats.totalProfit || 0) >= 0 ? "from-green-500 to-emerald-500" : "from-red-500 to-rose-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-[#18191A] dark:via-[#242526] dark:to-[#18191A]">
      <div className="container mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
          >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1877F2] to-[#0866FF] flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1877F2] via-[#0866FF] to-[#1877F2] bg-clip-text text-transparent">
              Trading Dashboard
            </h1>
          </div>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Manage MT4/MT5 accounts and monitor trades
          </p>
          </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              >
              <Card className="bg-white dark:bg-[#242526]/80 border-slate-200 dark:border-slate-700/50 backdrop-blur hover:border-[#1877F2]/50 transition-all rounded-lg shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-3">
                  <CardTitle className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </div>
                  {stat.subtitle && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
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
            <TabsList className="grid w-full grid-cols-7 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-lg p-0.5">
              <TabsTrigger value="mt5" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#1877F2] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow text-slate-700 dark:text-slate-300 text-xs rounded-md py-1.5">
                MT5
              </TabsTrigger>
              <TabsTrigger value="mt4" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#1877F2] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow text-slate-700 dark:text-slate-300 text-xs rounded-md py-1.5">
                MT4
              </TabsTrigger>
              <TabsTrigger value="trades" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#1877F2] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow text-slate-700 dark:text-slate-300 text-xs rounded-md py-1.5">
                Trades
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#1877F2] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow text-slate-700 dark:text-slate-300 text-xs rounded-md py-1.5">
                History
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#1877F2] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow text-slate-700 dark:text-slate-300 text-xs rounded-md py-1.5">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="backtest" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#1877F2] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow text-slate-700 dark:text-slate-300 text-xs rounded-md py-1.5">
                Backtest
              </TabsTrigger>
              <TabsTrigger value="copy" className="data-[state=active]:bg-white dark:data-[state=active]:bg-[#1877F2] data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow text-slate-700 dark:text-slate-300 text-xs rounded-md py-1.5">
                Copy
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