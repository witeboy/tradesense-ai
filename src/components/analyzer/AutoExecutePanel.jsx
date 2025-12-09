import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AutoExecutePanel({ analysis, tradePlan }) {
  const [autoExecuteEnabled, setAutoExecuteEnabled] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [mt5Accounts, setMt5Accounts] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    loadAccounts();
    // Check if user has previously confirmed
    const confirmed = localStorage.getItem('auto_execute_confirmed');
    setHasConfirmed(confirmed === 'true');
  }, []);

  const loadAccounts = async () => {
    try {
      const accounts = await base44.entities.MT5Account.list();
      setMt5Accounts(accounts.filter(acc => acc.is_active));
      if (accounts.length > 0 && !selectedAccount) {
        setSelectedAccount(accounts[0].id);
      }
    } catch (error) {
      console.error("Failed to load accounts:", error);
    }
  };

  const handleToggle = (checked) => {
    if (checked && !hasConfirmed) {
      setShowConfirmDialog(true);
    } else {
      setAutoExecuteEnabled(checked);
    }
  };

  const handleConfirm = () => {
    setHasConfirmed(true);
    setAutoExecuteEnabled(true);
    localStorage.setItem('auto_execute_confirmed', 'true');
    setShowConfirmDialog(false);
    toast.success("Auto-execution enabled");
  };

  const executeTradeNow = async () => {
    if (!selectedAccount) {
      toast.error("Please select an MT5 account");
      return;
    }

    setIsExecuting(true);
    try {
      const response = await base44.functions.invoke('mt5ExecuteTrade', {
        mt5_account_id: selectedAccount,
        analysis_id: analysis.id,
        symbol: analysis.instrument,
        timeframe: analysis.primary_timeframe,
        trade_type: tradePlan.action,
        entry_price: parseFloat(tradePlan.entry),
        stop_loss: parseFloat(tradePlan.stop_loss),
        take_profit: parseFloat(tradePlan.take_profit_1),
        lot_size: parseFloat(tradePlan.lot_size),
        risk_percentage: tradePlan.risk_percentage,
        confidence_score: analysis.confidence_score,
        notes: `AI Auto-Execute: ${analysis.direction} - Confluence ${analysis.confluence_score}%`
      });

      if (response.data.success) {
        toast.success(`✅ Trade executed: ${tradePlan.action} ${analysis.instrument} - Ticket: ${response.data.execution_details.ticket}`);
      } else {
        toast.error(response.data.error || "Failed to execute trade");
      }
    } catch (error) {
      console.error("Execution error:", error);
      toast.error("Failed to execute trade");
    }
    setIsExecuting(false);
  };

  const confidenceHigh = analysis?.confidence_score >= 85;

  return (
    <>
      <Card className={`${
        confidenceHigh 
          ? 'bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-green-500/50 shadow-2xl shadow-green-500/20' 
          : 'bg-[#242526]/90 border-slate-700/50'
      } backdrop-blur rounded-3xl shadow-xl transition-all duration-300`}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl shadow-lg ${confidenceHigh ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-slate-700'}`}>
                <Zap className={`w-6 h-6 ${confidenceHigh ? 'text-white' : 'text-slate-400'}`} />
              </div>
              <div>
                <Label className="text-white font-bold text-lg">⚡ AI Auto-Execute</Label>
                <p className="text-slate-400 text-xs">
                  {confidenceHigh ? '✅ High confidence trade' : '⏳ Available for 85%+ confidence'}
                </p>
              </div>
            </div>
            <Switch
              checked={autoExecuteEnabled}
              onCheckedChange={handleToggle}
              disabled={!confidenceHigh || mt5Accounts.length === 0}
            />
          </div>

          {autoExecuteEnabled && (
            <div className="space-y-3 pt-3 border-t border-slate-700">
              <div>
                <Label className="text-slate-200 mb-2 block">Execute on Account</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {mt5Accounts.map(acc => (
                      <SelectItem key={acc.id} value={acc.id} className="text-white">
                        {acc.account_name} - ${acc.account_balance?.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={executeTradeNow}
                disabled={isExecuting || !selectedAccount}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl font-bold py-6"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Executing Trade...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    ⚡ Execute Trade Now
                  </>
                )}
              </Button>
            </div>
          )}

          {mt5Accounts.length === 0 && (
            <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
              <p className="text-yellow-200 text-sm">
                ⚠️ Connect an MT5 account in the Trading Dashboard to enable auto-execution
              </p>
            </div>
          )}

          {!confidenceHigh && (
            <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-700">
              <p className="text-slate-400 text-sm">
                Auto-execution requires 85%+ confidence. Current: {analysis?.confidence_score || 0}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Enable Auto-Execution?
            </DialogTitle>
            <DialogDescription className="text-slate-300 space-y-3 pt-2">
              <p>
                <strong className="text-yellow-300">⚠️ Important Warning:</strong>
              </p>
              <p>
                Auto-execution will automatically place real trades on your MT5 account when high-confidence setups (85%+) are detected.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Trades will be executed with real money</li>
                <li>Stop loss and take profit will be set automatically</li>
                <li>Position size calculated based on risk management rules</li>
                <li>You can disable this at any time</li>
                <li>All executed trades are logged for review</li>
              </ul>
              <p className="text-red-300 text-sm font-semibold">
                TradeSense AI is not liable for any losses. Trading involves substantial risk.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="border-slate-600 text-slate-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              I Understand, Enable Auto-Execute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}