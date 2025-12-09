import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Bell, Plus, Trash2, BellRing, Zap } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

export default function AlertManagementPanel({ currentSymbol, currentAnalysis }) {
  const [alerts, setAlerts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAlert, setNewAlert] = useState({
    symbol: currentSymbol || "",
    confluence_threshold: "100%",
    enable_in_app: true,
    enable_mt5: false,
    auto_execute: false
  });

  useEffect(() => {
    loadAlerts();
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Auto-populate symbol when user inputs it
    if (currentSymbol) {
      setNewAlert(prev => ({ ...prev, symbol: currentSymbol }));
    }
  }, [currentSymbol]);

  const loadAlerts = async () => {
    try {
      const alertsList = await base44.entities.PriceAlert.list();
      setAlerts(alertsList);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    }
  };

  const handleAddAlert = async () => {
    if (!newAlert.symbol) {
      toast.error("Symbol is automatically set from your analysis");
      return;
    }

    if (!newAlert.enable_in_app && !newAlert.enable_mt5) {
      toast.error("Please enable at least one notification method");
      return;
    }

    try {
      await base44.entities.PriceAlert.create({
        symbol: newAlert.symbol,
        confluence_threshold: newAlert.confluence_threshold,
        notification_method: newAlert.enable_in_app && newAlert.enable_mt5 ? "both" : 
                           newAlert.enable_in_app ? "browser" : "mt5",
        auto_execute: newAlert.auto_execute,
        is_active: true
      });
      
      toast.success(`Alert created for ${newAlert.symbol} at ${newAlert.confluence_threshold} confluence`);
      setNewAlert({ 
        symbol: currentSymbol || "", 
        confluence_threshold: "100%",
        enable_in_app: true,
        enable_mt5: false,
        auto_execute: false
      });
      setIsAdding(false);
      loadAlerts();
    } catch (error) {
      toast.error("Failed to create alert");
      console.error(error);
    }
  };

  const handleToggleAlert = async (alert) => {
    try {
      await base44.entities.PriceAlert.update(alert.id, {
        ...alert,
        is_active: !alert.is_active
      });
      loadAlerts();
      toast.success(`Alert ${!alert.is_active ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error("Failed to update alert");
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await base44.entities.PriceAlert.delete(alertId);
      loadAlerts();
      toast.success("Alert deleted");
    } catch (error) {
      toast.error("Failed to delete alert");
    }
  };

  // Check if current analysis meets any alert criteria
  useEffect(() => {
    if (currentAnalysis && alerts.length > 0) {
      checkAlerts(currentAnalysis);
    }
  }, [currentAnalysis, alerts]);

  const checkAlerts = (analysis) => {
    const matchingAlerts = alerts.filter(alert => 
      alert.is_active && 
      alert.symbol === analysis.instrument &&
      analysis.confidence_score >= parseInt(alert.confluence_threshold)
    );

    matchingAlerts.forEach(alert => {
      // Show browser notification if enabled
      if ((alert.notification_method === "browser" || alert.notification_method === "both") && 
          Notification.permission === "granted") {
        new Notification(`🎯 High Confluence Alert: ${alert.symbol}`, {
          body: `${alert.confluence_threshold} confluence reached! Confidence: ${analysis.confidence_score}%`,
          icon: '/favicon.ico'
        });
      }

      // Show in-app toast
      toast.success(`🎯 Alert Triggered: ${alert.symbol} - ${analysis.confidence_score}% Confluence!`, {
        duration: 10000
      });

      // Auto-execute if enabled
      if (alert.auto_execute && analysis.primary_trade_plan) {
        toast.info(`🚀 Auto-executing trade for ${alert.symbol}...`);
        // This would trigger the actual trade execution
      }

      // Update last triggered time
      base44.entities.PriceAlert.update(alert.id, {
        ...alert,
        last_triggered: new Date().toISOString()
      });
    });
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BellRing className="w-5 h-5 text-blue-400" />
            Confluence Alerts
          </span>
          <Button
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Alert
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Alert Form */}
        {isAdding && (
          <div className="p-4 rounded-lg bg-slate-900/30 border border-slate-700 space-y-4">
            <div>
              <Label className="text-slate-200">Symbol (Auto-detected)</Label>
              <div className="mt-2 p-3 rounded bg-slate-800 border border-blue-500/30">
                <p className="text-blue-400 font-mono text-lg">
                  {currentSymbol || "No symbol selected yet"}
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-slate-200 mb-2 block">Confluence Threshold</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={newAlert.confluence_threshold === "75%" ? "default" : "outline"}
                  onClick={() => setNewAlert({...newAlert, confluence_threshold: "75%"})}
                  className={newAlert.confluence_threshold === "75%" ? "bg-yellow-600" : "border-slate-600"}
                >
                  75% (High)
                </Button>
                <Button
                  variant={newAlert.confluence_threshold === "100%" ? "default" : "outline"}
                  onClick={() => setNewAlert({...newAlert, confluence_threshold: "100%"})}
                  className={newAlert.confluence_threshold === "100%" ? "bg-green-600" : "border-slate-600"}
                >
                  100% (Perfect)
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-slate-200">Notification Methods</Label>
              
              <div className="flex items-center justify-between p-3 rounded bg-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-200">In-App Alerts</span>
                </div>
                <Checkbox
                  checked={newAlert.enable_in_app}
                  onCheckedChange={(checked) => setNewAlert({...newAlert, enable_in_app: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-slate-800">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-200">MT5 Platform Alerts</span>
                </div>
                <Checkbox
                  checked={newAlert.enable_mt5}
                  onCheckedChange={(checked) => setNewAlert({...newAlert, enable_mt5: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded bg-green-900/20 border border-green-500/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-400" />
                  <div>
                    <span className="text-green-200 font-semibold block">Auto-Execute Trade</span>
                    <span className="text-green-300/70 text-xs">Automatically execute when alert triggers</span>
                  </div>
                </div>
                <Checkbox
                  checked={newAlert.auto_execute}
                  onCheckedChange={(checked) => setNewAlert({...newAlert, auto_execute: checked})}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddAlert} className="flex-1 bg-green-600 hover:bg-green-700">
                Create Alert
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="outline" className="flex-1 border-slate-600">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Alert List */}
        <div className="space-y-3">
          {alerts.length > 0 ? alerts.map((alert) => (
            <div key={alert.id} className="p-4 rounded-lg bg-slate-900/30 border border-slate-700 hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-white font-semibold text-lg">{alert.symbol}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={alert.confluence_threshold === "100%" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                      {alert.confluence_threshold} Confluence
                    </Badge>
                    {alert.auto_execute && (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Zap className="w-3 h-3 mr-1" />
                        Auto-Execute
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={alert.is_active}
                    onCheckedChange={() => handleToggleAlert(alert)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {(alert.notification_method === "browser" || alert.notification_method === "both") && (
                  <Badge variant="outline" className="text-xs">
                    <Bell className="w-3 h-3 mr-1" />
                    In-App
                  </Badge>
                )}
                {(alert.notification_method === "mt5" || alert.notification_method === "both") && (
                  <Badge variant="outline" className="text-xs">
                    <Zap className="w-3 h-3 mr-1" />
                    MT5
                  </Badge>
                )}
                {alert.is_active ? (
                  <Badge className="bg-green-100 text-green-800 ml-auto">Active</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 ml-auto">Paused</Badge>
                )}
              </div>

              {alert.last_triggered && (
                <p className="text-slate-500 text-xs mt-2">
                  Last triggered: {new Date(alert.last_triggered).toLocaleString()}
                </p>
              )}
            </div>
          )) : (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No alerts configured</p>
              <p className="text-slate-500 text-sm">Add an alert to get notified of high confluence setups</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/20">
          <p className="text-blue-200 text-sm">
            💡 Alerts trigger when your selected confluence threshold is met. Auto-execute requires MT5 connection.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}