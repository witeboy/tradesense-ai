
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  BarChart3,
  TrendingUp,
  FileText,
  Activity,
  DollarSign,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import FloatingMenu from "../components/FloatingMenu"; // Added FloatingMenu import

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [analyses, setAnalyses] = useState([]);
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const currentUser = await base44.auth.me();
      
      if (!currentUser || currentUser.role !== 'admin') {
        window.location.href = "/";
        return;
      }
      
      setUser(currentUser);
      await loadDashboardData();
    } catch (error) {
      console.error("Admin access error:", error);
      window.location.href = "/";
    }
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load all data in parallel
      const [usersList, analysesList, tradesList, alertsList] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.Analysis.list('-created_date', 100),
        base44.entities.Trade.list('-created_date', 100),
        base44.entities.PriceAlert.list()
      ]);

      setUsers(usersList);
      setAnalyses(analysesList);
      setTrades(tradesList);

      // Calculate metrics
      const totalUsers = usersList.length;
      const activeUsers = usersList.filter(u => {
        const lastActive = new Date(u.updated_date);
        const daysSinceActive = (Date.now() - lastActive) / (1000 * 60 * 60 * 24);
        return daysSinceActive <= 7;
      }).length;

      const totalAnalyses = analysesList.length;
      const analysesToday = analysesList.filter(a => {
        const created = new Date(a.created_date);
        const today = new Date();
        return created.toDateString() === today.toDateString();
      }).length;

      const totalTrades = tradesList.length;
      const openTrades = tradesList.filter(t => t.status === 'OPEN').length;
      const closedTrades = tradesList.filter(t => t.status === 'CLOSED');
      
      const totalProfit = closedTrades.reduce((sum, t) => sum + (t.current_profit || 0), 0);
      const winningTrades = closedTrades.filter(t => (t.current_profit || 0) > 0).length;
      const winRate = closedTrades.length > 0 ? (winningTrades / closedTrades.length) * 100 : 0;

      const totalAlerts = alertsList.length;
      const activeAlerts = alertsList.filter(a => a.is_active).length;

      // Get analyses by day for chart
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const analysesByDay = last7Days.map(day => {
        const count = analysesList.filter(a => a.created_date.startsWith(day)).length;
        return {
          date: new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          analyses: count
        };
      });

      // Confluence distribution
      const confluenceRanges = [
        { range: '90-100%', count: 0, color: '#10b981' },
        { range: '75-89%', count: 0, color: '#3b82f6' },
        { range: '60-74%', count: 0, color: '#f59e0b' },
        { range: '0-59%', count: 0, color: '#ef4444' }
      ];

      analysesList.forEach(a => {
        const score = a.confluence_score || 0;
        if (score >= 90) confluenceRanges[0].count++;
        else if (score >= 75) confluenceRanges[1].count++;
        else if (score >= 60) confluenceRanges[2].count++;
        else confluenceRanges[3].count++;
      });

      setMetrics({
        totalUsers,
        activeUsers,
        totalAnalyses,
        analysesToday,
        totalTrades,
        openTrades,
        totalProfit,
        winRate,
        totalAlerts,
        activeAlerts,
        analysesByDay,
        confluenceRanges
      });

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-lg">Loading Admin Dashboard...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: metrics?.totalUsers || 0,
      subtitle: `${metrics?.activeUsers || 0} active this week`,
      icon: Users,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Total Analyses",
      value: metrics?.totalAnalyses || 0,
      subtitle: `${metrics?.analysesToday || 0} today`,
      icon: FileText,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Total Trades",
      value: metrics?.totalTrades || 0,
      subtitle: `${metrics?.openTrades || 0} currently open`,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Total P/L",
      value: `$${(metrics?.totalProfit || 0).toFixed(2)}`,
      subtitle: `${(metrics?.winRate || 0).toFixed(1)}% win rate`,
      icon: DollarSign,
      color: (metrics?.totalProfit || 0) >= 0 ? "from-green-500 to-emerald-500" : "from-red-500 to-rose-500",
      bgColor: (metrics?.totalProfit || 0) >= 0 ? "bg-green-500/10" : "bg-red-500/10"
    },
    {
      title: "Active Alerts",
      value: metrics?.activeAlerts || 0,
      subtitle: `${metrics?.totalAlerts || 0} total`,
      icon: AlertCircle,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10"
    },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                Admin Dashboard
              </h1>
              <p className="text-slate-400">Welcome back, {user?.full_name || 'Admin'}</p>
            </div>
            <Button
              onClick={loadDashboardData}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className={`bg-slate-800/50 border-slate-700 backdrop-blur hover:border-slate-600 transition-all ${stat.bgColor}`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-300">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                    <stat.icon className="w-4 h-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <p className="text-xs text-slate-400">
                    {stat.subtitle}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Analyses Over Time */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Analyses Last 7 Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics?.analysesByDay || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
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
                      dataKey="analyses"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Confluence Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-400" />
                  Confluence Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={metrics?.confluenceRanges || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, count, percent }) =>
                        `${range}: ${count} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(metrics?.confluenceRanges || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity Tables */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-400" />
                    Recent Users
                  </span>
                  <Badge className="bg-green-500/20 text-green-300">
                    {users.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {users.slice(0, 10).map((u, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 hover:bg-slate-900/50 transition-colors"
                    >
                      <div>
                        <p className="text-white font-medium">{u.full_name || u.email}</p>
                        <p className="text-slate-400 text-xs">{u.email}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={u.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}>
                          {u.role}
                        </Badge>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(u.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Analyses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-400" />
                    Recent Analyses
                  </span>
                  <Badge className="bg-blue-500/20 text-blue-300">
                    {analyses.length} total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {analyses.slice(0, 10).map((a, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30 hover:bg-slate-900/50 transition-colors"
                    >
                      <div>
                        <p className="text-white font-medium">{a.instrument} - {a.primary_timeframe}</p>
                        <p className="text-slate-400 text-xs">
                          {a.direction} • {a.confidence_score}% confidence
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={
                          a.confluence_score >= 75 ? 'bg-green-500/20 text-green-300' :
                          a.confluence_score >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-red-500/20 text-red-300'
                        }>
                          {a.confluence_score}%
                        </Badge>
                        <p className="text-slate-500 text-xs mt-1">
                          {new Date(a.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Floating Menu */}
      <FloatingMenu />
    </div>
  );
}
