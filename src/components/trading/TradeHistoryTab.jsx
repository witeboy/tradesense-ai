import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

export default function TradeHistoryTab() {
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const closedTrades = await base44.entities.Trade.filter({ status: 'CLOSED' });
      setTrades(closedTrades.sort((a, b) => new Date(b.close_time) - new Date(a.close_time)));
    } catch (error) {
      console.error("Failed to load trade history:", error);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="ml-3 text-slate-300">Loading trade history...</span>
        </CardContent>
      </Card>
    );
  }

  if (trades.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Trade History</h3>
          <p className="text-slate-400">
            Your closed trades will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
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
            <Card className={`bg-slate-800/50 border-slate-700 backdrop-blur ${
              isProfit ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-white font-semibold text-lg">{trade.symbol}</h4>
                    <Badge className={isBuy ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}>
                      {isBuy ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                      {trade.trade_type}
                    </Badge>
                  </div>
                  <div className={`text-xl font-bold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : ''}${(trade.current_profit || 0).toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Entry</p>
                    <p className="text-white font-mono">{trade.entry_price?.toFixed(5)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Close</p>
                    <p className="text-white font-mono">{trade.close_price?.toFixed(5)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Lot Size</p>
                    <p className="text-white">{trade.lot_size}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Opened</p>
                    <p className="text-slate-300">{new Date(trade.created_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Closed</p>
                    <p className="text-slate-300">{trade.close_time ? new Date(trade.close_time).toLocaleDateString() : '-'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Confidence</p>
                    <Badge className={
                      (trade.confidence_score || 0) >= 80 ? 'bg-green-100 text-green-800' :
                      (trade.confidence_score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }>
                      {trade.confidence_score || 0}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}