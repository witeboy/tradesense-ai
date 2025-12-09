import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, CheckCircle, XCircle, TrendingUp, Loader2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function MT5ActivityTab({ analysis }) {
  const [mt5Connected, setMt5Connected] = useState(false);
  const [mt4Connected, setMt4Connected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [accountInfo, setAccountInfo] = useState(null);
  const [openTrades, setOpenTrades] = useState([]);
  const [isLoadingTrades, setIsLoadingTrades] = useState(false);
  const [platform, setPlatform] = useState("MT5");
  
  // Connection form states
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [serverName, setServerName] = useState("");
  const [brokerName, setBrokerName] = useState("");

  const handleConnect = async () => {
    if (!loginId || !password || !serverName) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsConnecting(true);
    try {
      const functionName = platform === "MT5" ? 'mt5Connect' : 'mt4Connect';
      const result = await base44.functions.invoke(functionName, {
        login_id: loginId,
        password: password,
        server_name: serverName,
        broker_name: brokerName,
        account_name: `${brokerName || platform} - ${loginId}`
      });

      if (result.data.success) {
        if (platform === "MT5") {
          setMt5Connected(true);
        } else {
          setMt4Connected(true);
        }
        setAccountInfo(result.data.account);
        toast.success(`Successfully connected to ${platform}!`);
        loadTrades(result.data.account_id);
      } else {
        toast.error(result.data.error || `Failed to connect to ${platform}`);
      }
    } catch (error) {
      console.error(`${platform} Connection Error:`, error);
      toast.error(`Failed to connect: ${error.message}`);
    }
    setIsConnecting(false);
  };

  const loadTrades = async (accountId) => {
    setIsLoadingTrades(true);
    try {
      const functionName = platform === "MT5" ? 'mt5MonitorTrades' : 'mt4MonitorTrades';
      const result = await base44.functions.invoke(functionName, {
        account_id: accountId
      });

      if (result.data.success) {
        setOpenTrades(result.data.open_trades || []);
      }
    } catch (error) {
      console.error("Failed to load trades:", error);
    }
    setIsLoadingTrades(false);
  };

  const handleExecuteTrade = async () => {
    if (!analysis || !analysis.primary_trade_plan) {
      toast.error("No trade plan available");
      return;
    }

    const plan = analysis.primary_trade_plan;
    if (plan.action === 'WAIT') {
      toast.info("This analysis recommends waiting. No trade will be executed.");
      return;
    }

    if (analysis.confidence_score < 50) {
      toast.warning("Confidence score is below 50%. Please review the analysis before executing.");
      return;
    }

    setIsConnecting(true);
    try {
      const functionName = platform === "MT5" ? 'mt5ExecuteTrade' : 'mt4ExecuteTrade';
      const result = await base44.functions.invoke(functionName, {
        analysis_id: analysis.id,
        symbol: analysis.instrument,
        timeframe: analysis.primary_timeframe,
        trade_type: plan.action,
        entry_price: parseFloat(plan.entry),
        stop_loss: parseFloat(plan.stop_loss),
        take_profit: parseFloat(plan.take_profit_1),
        lot_size: parseFloat(plan.lot_size),
        risk_percentage: plan.risk_percentage,
        confidence_score: analysis.confidence_score,
        notes: `Vision AI Analysis - ${analysis.trend_consensus} - Confidence: ${analysis.confidence_score}%`
      });

      if (result.data.success) {
        toast.success(`Trade executed successfully on ${platform}!`);
        loadTrades(accountInfo?.id);
      } else {
        toast.error(result.data.error || "Failed to execute trade");
      }
    } catch (error) {
      console.error("Trade execution error:", error);
      toast.error("Failed to execute trade: " + error.message);
    }
    setIsConnecting(false);
  };

  const handleCloseTrade = async (tradeId) => {
    try {
      const functionName = platform === "MT5" ? 'mt5CloseTrade' : 'mt4CloseTrade';
      const result = await base44.functions.invoke(functionName, {
        trade_id: tradeId
      });

      if (result.data.success) {
        toast.success("Trade closed successfully!");
        setOpenTrades(openTrades.filter(t => t.id !== tradeId));
      } else {
        toast.error(result.data.error || "Failed to close trade");
      }
    } catch (error) {
      console.error("Failed to close trade:", error);
      toast.error("Failed to close trade: " + error.message);
    }
  };

  const isConnected = platform === "MT5" ? mt5Connected : mt4Connected;

  return (
    <div className="space-y-6 mt-4">
      {/* Platform Selection */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Select Trading Platform</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={platform} onValueChange={setPlatform}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-700">
              <TabsTrigger value="MT5">MetaTrader 5</TabsTrigger>
              <TabsTrigger value="MT4">MetaTrader 4</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                {platform} Connection
              </span>
              {isConnected ? (
                <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Connected
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Disconnected
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isConnected ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Login ID *</Label>
                    <Input
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="12345678"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200">Password *</Label>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Server Name *</Label>
                    <Input
                      value={serverName}
                      onChange={(e) => setServerName(e.target.value)}
                      placeholder="BrokerName-Demo"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200">Broker Name (Optional)</Label>
                    <Input
                      value={brokerName}
                      onChange={(e) => setBrokerName(e.target.value)}
                      placeholder="e.g., XM, FXTM"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    `Connect to ${platform}`
                  )}
                </Button>

                <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-yellow-200 font-medium">Important:</p>
                      <p className="text-xs text-yellow-200/80 mt-1">
                        For live trading, ensure you have the {platform} Python bridge installed and running. 
                        Currently in simulation mode for demonstration.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded bg-slate-900/30">
                    <p className="text-slate-400 text-sm">Balance</p>
                    <p className="text-green-400 font-mono text-lg">
                      ${accountInfo?.balance?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="p-3 rounded bg-slate-900/30">
                    <p className="text-slate-400 text-sm">Equity</p>
                    <p className="text-blue-400 font-mono text-lg">
                      ${accountInfo?.equity?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="p-3 rounded bg-slate-900/30">
                    <p className="text-slate-400 text-sm">Margin</p>
                    <p className="text-yellow-400 font-mono text-lg">
                      ${accountInfo?.margin?.toFixed(2) || '0.00'}
                    </p>
                  </div>
                  <div className="p-3 rounded bg-slate-900/30">
                    <p className="text-slate-400 text-sm">Leverage</p>
                    <p className="text-purple-400 font-mono text-lg">
                      1:{accountInfo?.leverage || 100}
                    </p>
                  </div>
                </div>

                {analysis && analysis.primary_trade_plan && (
                  <Button 
                    onClick={handleExecuteTrade}
                    disabled={isConnecting || analysis.primary_trade_plan.action === 'WAIT'}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Execute Trade on {platform}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Open Trades */}
      {isConnected && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Open Positions ({openTrades.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTrades ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : openTrades.length > 0 ? (
                <div className="space-y-3">
                  {openTrades.map((trade) => (
                    <div key={trade.id} className="p-4 rounded-lg bg-slate-900/30 border border-slate-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-white font-semibold">{trade.symbol}</h4>
                          <Badge className={trade.trade_type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {trade.trade_type}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className={`font-mono text-lg ${(trade.current_profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${(trade.current_profit || 0).toFixed(2)}
                          </p>
                          <p className="text-slate-400 text-xs">{(trade.profit_pips || 0).toFixed(1)} pips</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-sm mb-3">
                        <div>
                          <p className="text-slate-400">Entry</p>
                          <p className="text-slate-200 font-mono">{trade.entry_price?.toFixed(5)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">SL</p>
                          <p className="text-red-400 font-mono">{trade.stop_loss?.toFixed(5)}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">TP</p>
                          <p className="text-green-400 font-mono">{trade.take_profit?.toFixed(5)}</p>
                        </div>
                      </div>

                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => handleCloseTrade(trade.id)}
                        className="w-full border-red-500/20 text-red-400 hover:bg-red-900/20"
                      >
                        Close Position
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">No open positions</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}