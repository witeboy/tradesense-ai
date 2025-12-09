import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Loader2, TrendingUp, TrendingDown, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function OpenTradesTab({ onUpdate }) {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [closingTrade, setClosingTrade] = useState(null);

  useEffect(() => {
    loadTrades();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadTrades, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadTrades = async () => {
    if (!isLoading) setIsRefreshing(true);
    try {
      const openTrades = await base44.entities.Trade.filter({ status: 'OPEN' });
      setTrades(openTrades);
    } catch (error) {
      console.error("Failed to load trades:", error);
    }
    setIsLoading(false);
    setIsRefreshing(false);
  };

  const handleCloseTrade = async (trade) => {
    setClosingTrade(trade.id);
    try {
      const response = await base44.functions.invoke('mt5CloseTrade', {
        trade_id: trade.id
      });

      if (response.data.success) {
        toast.success(`Trade closed - P/L: $${(response.data.final_profit || 0).toFixed(2)}`);
        loadTrades();
        if (onUpdate) onUpdate();
      } else {
        toast.error(response.data.error || "Failed to close trade");
      }
    } catch (error) {
      console.error("Close trade error:", error);
      toast.error("Failed to close trade");
    }
    setClosingTrade(null);
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="ml-3 text-slate-300">Loading open trades...</span>
        </CardContent>
      </Card>
    );
  }

  if (trades.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Open Trades</h3>
          <p className="text-slate-400">
            Your open positions will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <div className="text-slate-300">
          {trades.length} open {trades.length === 1 ? 'trade' : 'trades'}
        </div>
        <Button
          onClick={loadTrades}
          disabled={isRefreshing}
          variant="outline"
          className="border-slate-600 text-slate-200"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Trades List */}
      <div className="grid gap-4">
        {trades.map((trade, idx) => {
          const isProfit = (trade.current_profit || 0) > 0;
          const isBuy = trade.trade_type === 'BUY';

          return (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`bg-slate-800/50 border-slate-700 backdrop-blur hover:border-slate-600 transition-all ${
                isProfit ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-xl flex items-center gap-3">
                        {trade.symbol}
                        <Badge className={isBuy ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                          {isBuy ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                          {trade.trade_type}
                        </Badge>
                      </CardTitle>
                      <p className="text-slate-400 text-sm mt-1">
                        Opened: {new Date(trade.created_date).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                        {isProfit ? '+' : ''}${(trade.current_profit || 0).toFixed(2)}
                      </div>
                      <Button
                        onClick={() => handleCloseTrade(trade)}
                        disabled={closingTrade === trade.id}
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 mt-2"
                      >
                        {closingTrade === trade.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            Closing...
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            Close Trade
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Entry</p>
                      <p className="text-white font-mono">{(trade.entry_price || 0).toFixed(5)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Stop Loss</p>
                      <p className="text-red-300 font-mono">{(trade.stop_loss || 0).toFixed(5)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Take Profit</p>
                      <p className="text-green-300 font-mono">{(trade.take_profit || 0).toFixed(5)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Lot Size</p>
                      <p className="text-white font-semibold">{trade.lot_size}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Confidence</p>
                      <Badge className={
                        (trade.confidence_score || 0) >= 80 ? 'bg-green-100 text-green-800' :
                        (trade.confidence_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {trade.confidence_score || 0}%
                      </Badge>
                    </div>
                  </div>
                  {trade.notes && (
                    <div className="mt-4 p-3 rounded-lg bg-slate-900/30">
                      <p className="text-slate-300 text-sm">{trade.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}