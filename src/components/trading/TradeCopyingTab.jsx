import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Users, TrendingUp, Copy, Settings, CheckCircle, Award, Zap } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function TradeCopyingTab() {
  const [masterTraders, setMasterTraders] = useState([]);
  const [mySettings, setMySettings] = useState([]);
  const [copiedTrades, setCopiedTrades] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedMaster, setSelectedMaster] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [newSettings, setNewSettings] = useState({
    follower_account_id: "",
    risk_multiplier: 1.0,
    max_risk_per_trade: 2,
    copy_delay_seconds: 0,
    min_confidence: 70,
    copy_stop_loss: true,
    copy_take_profit: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [traders, settings, trades, mt5Accs, mt4Accs] = await Promise.all([
        base44.entities.MasterTrader.list(),
        base44.entities.TradeCopySettings.list(),
        base44.entities.CopiedTrade.list('-created_date', 50),
        base44.entities.MT5Account.list(),
        base44.entities.MT4Account.list()
      ]);
      
      setMasterTraders(traders);
      setMySettings(settings);
      setCopiedTrades(trades);
      setAccounts([...mt5Accs, ...mt4Accs]);
      
      if (accounts.length > 0 && !newSettings.follower_account_id) {
        setNewSettings({...newSettings, follower_account_id: accounts[0].id});
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load trade copying data");
    }
    setIsLoading(false);
  };

  const startCopying = async () => {
    if (!selectedMaster || !newSettings.follower_account_id) {
      toast.error("Please select a master trader and account");
      return;
    }

    try {
      await base44.entities.TradeCopySettings.create({
        master_trader_id: selectedMaster.id,
        ...newSettings,
        started_date: new Date().toISOString()
      });
      
      toast.success(`✨ Now copying trades from ${selectedMaster.trader_name}!`);
      setShowSetup(false);
      setSelectedMaster(null);
      loadData();
    } catch (error) {
      toast.error("Failed to start copying");
    }
  };

  const toggleCopying = async (settingId, currentStatus) => {
    try {
      await base44.entities.TradeCopySettings.update(settingId, {
        is_active: !currentStatus
      });
      toast.success(!currentStatus ? "✅ Copying enabled" : "⏸️ Copying paused");
      loadData();
    } catch (error) {
      toast.error("Failed to update settings");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-[#1877F2] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0866FF] flex items-center justify-center shadow-lg">
              <Copy className="w-5 h-5 text-white" />
            </div>
            Trade Copying
          </h2>
          <p className="text-slate-400 mt-1">Mirror trades from verified master traders</p>
        </div>
        <Button
          onClick={() => setShowSetup(!showSetup)}
          className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] hover:from-[#166FE5] hover:to-[#0757D6] shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Users className="w-4 h-4 mr-2" />
          Follow New Trader
        </Button>
      </div>

      {/* Setup Panel */}
      <AnimatePresence>
        {showSetup && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
              <CardHeader>
                <CardTitle className="text-white">Setup Trade Copying</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Master Traders Grid */}
                <div>
                  <Label className="text-white font-semibold mb-3 block">Select Master Trader</Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {masterTraders.map(trader => (
                      <motion.div
                        key={trader.id}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedMaster(trader)}
                        className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 ${
                          selectedMaster?.id === trader.id
                            ? 'bg-gradient-to-br from-[#1877F2]/20 to-[#0866FF]/20 border-2 border-[#1877F2] shadow-lg'
                            : 'bg-slate-800/40 border border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0866FF] flex items-center justify-center text-white font-bold text-xl shadow-lg">
                              {trader.trader_name.charAt(0)}
                            </div>
                            {trader.verified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#1877F2] flex items-center justify-center shadow-lg">
                                <CheckCircle className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-bold">{trader.trader_name}</h4>
                              {trader.verified && (
                                <Badge className="bg-[#1877F2]/20 text-[#1877F2] border-[#1877F2]/30 text-xs">
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-slate-400 text-sm mb-3">{trader.trading_style}</p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-slate-500 block">Win Rate</span>
                                <span className="text-green-400 font-bold">{trader.win_rate?.toFixed(1)}%</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Profit</span>
                                <span className="text-[#1877F2] font-bold">${trader.total_profit?.toFixed(0)}</span>
                              </div>
                              <div>
                                <span className="text-slate-500 block">Followers</span>
                                <span className="text-white font-bold">{trader.total_followers}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {selectedMaster && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 p-5 rounded-2xl bg-slate-900/50 border border-slate-700"
                  >
                    <h4 className="text-white font-bold flex items-center gap-2">
                      <Settings className="w-4 h-4 text-[#1877F2]" />
                      Copy Settings
                    </h4>

                    <div>
                      <Label className="text-slate-200">Copy to Account</Label>
                      <Select
                        value={newSettings.follower_account_id}
                        onValueChange={(val) => setNewSettings({...newSettings, follower_account_id: val})}
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white hover:border-[#1877F2] transition-colors">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {accounts.map(acc => (
                            <SelectItem key={acc.id} value={acc.id} className="text-white">
                              {acc.account_name} - ${acc.account_balance?.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-slate-200 mb-2 block">
                        Risk Multiplier: {newSettings.risk_multiplier}x
                      </Label>
                      <Slider
                        value={[newSettings.risk_multiplier]}
                        onValueChange={(val) => setNewSettings({...newSettings, risk_multiplier: val[0]})}
                        min={0.1}
                        max={3}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-slate-500 text-xs mt-1">
                        Position size relative to master trader
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-200">Max Risk per Trade (%)</Label>
                        <Input
                          type="number"
                          value={newSettings.max_risk_per_trade}
                          onChange={(e) => setNewSettings({...newSettings, max_risk_per_trade: parseFloat(e.target.value)})}
                          className="bg-slate-800/50 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-200">Min Confidence (%)</Label>
                        <Input
                          type="number"
                          value={newSettings.min_confidence}
                          onChange={(e) => setNewSettings({...newSettings, min_confidence: parseInt(e.target.value)})}
                          className="bg-slate-800/50 border-slate-600 text-white"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={startCopying}
                      className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Start Copying {selectedMaster.trader_name}
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Copying Settings */}
      {mySettings.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#1877F2]" />
              Active Copy Trading
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mySettings.map(setting => {
                const master = masterTraders.find(t => t.id === setting.master_trader_id);
                const account = accounts.find(a => a.id === setting.follower_account_id);
                const settingTrades = copiedTrades.filter(t => t.copy_settings_id === setting.id);
                const winningTrades = settingTrades.filter(t => t.profit > 0);
                const winRate = settingTrades.length > 0 ? (winningTrades.length / settingTrades.length) * 100 : 0;

                return (
                  <motion.div
                    key={setting.id}
                    whileHover={{ scale: 1.01 }}
                    className="p-6 rounded-2xl bg-slate-900/50 border border-slate-700 hover:border-[#1877F2]/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0866FF] flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {master?.trader_name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-white font-bold">{master?.trader_name}</h4>
                          <p className="text-slate-400 text-sm">{account?.account_name}</p>
                        </div>
                      </div>
                      <Switch
                        checked={setting.is_active}
                        onCheckedChange={() => toggleCopying(setting.id, setting.is_active)}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-slate-800/30">
                      <div>
                        <span className="text-slate-500 text-xs block mb-1">Trades Copied</span>
                        <span className="text-white font-bold text-lg">{setting.total_copied_trades || 0}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs block mb-1">Win Rate</span>
                        <span className="text-green-400 font-bold text-lg">{winRate.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs block mb-1">Total Profit</span>
                        <span className={`font-bold text-lg ${(setting.total_profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${(setting.total_profit || 0).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-xs block mb-1">Risk Multiplier</span>
                        <span className="text-[#1877F2] font-bold text-lg">{setting.risk_multiplier}x</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Copied Trades Log */}
      {copiedTrades.length > 0 && (
        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Copy className="w-5 h-5 text-[#1877F2]" />
              Recent Copied Trades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {copiedTrades.slice(0, 10).map(trade => {
                const master = masterTraders.find(t => t.id === trade.master_trader_id);
                const isProfit = trade.profit > 0;

                return (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 rounded-xl bg-slate-900/30 border border-slate-700 hover:border-slate-600 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={trade.trade_type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                          {trade.trade_type}
                        </Badge>
                        <span className="text-white font-semibold">{trade.symbol}</span>
                        <span className="text-slate-400 text-sm">from {master?.trader_name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className="text-slate-500 text-xs block">Lot</span>
                          <span className="text-white text-sm font-mono">{trade.follower_lot_size}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-500 text-xs block">P/L</span>
                          <span className={`text-sm font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                            ${trade.profit?.toFixed(2) || '0.00'}
                          </span>
                        </div>
                        <Badge className={
                          trade.status === 'OPEN' ? 'bg-blue-500/20 text-blue-400' :
                          trade.status === 'CLOSED' ? 'bg-green-500/20 text-green-400' :
                          'bg-slate-500/20 text-slate-400'
                        }>
                          {trade.status}
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {mySettings.length === 0 && !showSetup && (
        <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1877F2] to-[#0866FF] flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Start Copy Trading</h3>
            <p className="text-slate-400 mb-6">
              Follow verified master traders and automatically mirror their trades
            </p>
            <Button
              onClick={() => setShowSetup(true)}
              className="bg-gradient-to-r from-[#1877F2] to-[#0866FF] hover:from-[#166FE5] hover:to-[#0757D6] shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Award className="w-4 h-4 mr-2" />
              Explore Master Traders
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}