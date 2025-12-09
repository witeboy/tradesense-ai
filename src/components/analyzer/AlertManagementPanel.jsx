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
    <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 backdrop-blur">
      <CardHeader className="p-4">
        <CardTitle className="text-slate-900 dark:text-white flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-blue-500" />
            Confluence Alerts
          </span>
          <Button
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 hover:bg-blue-700 h-7 text-xs"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 p-4 pt-0">
        {isAdding && (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 space-y-3">
            <div>
              <Label className="text-slate-700 dark:text-slate-200 text-sm">Symbol (Auto-detected)</Label>
              <div className="mt-1.5 p-2 rounded bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-500/30">
                <p className="text-blue-600 dark:text-blue-400 font-mono text-sm">
                  {currentSymbol || "No symbol selected yet"}
                </p>
              </div>
            </div>
            
            <div>
              <Label className="text-slate-700 dark:text-slate-200 mb-1.5 block text-sm">Confluence Threshold</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={newAlert.confluence_threshold === "75%" ? "default" : "outline"}
                  onClick={() => setNewAlert({...newAlert, confluence_threshold: "75%"})}
                  className={newAlert.confluence_threshold === "75%" ? "bg-yellow-600 text-xs h-8" : "border-slate-300 dark:border-slate-600 text-xs h-8"}
                >
                  75% (High)
                </Button>
                <Button
                  variant={newAlert.confluence_threshold === "100%" ? "default" : "outline"}
                  onClick={() => setNewAlert({...newAlert, confluence_threshold: "100%"})}
                  className={newAlert.confluence_threshold === "100%" ? "bg-green-600 text-xs h-8" : "border-slate-300 dark:border-slate-600 text-xs h-8"}
                >
                  100% (Perfect)
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 dark:text-slate-200 text-sm">Notification Methods</Label>
              
              <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent">
                <div className="flex items-center gap-2">
                  <Bell className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                  <span className="text-slate-700 dark:text-slate-200 text-sm">In-App</span>
                </div>
                <Checkbox
                  checked={newAlert.enable_in_app}
                  onCheckedChange={(checked) => setNewAlert({...newAlert, enable_in_app: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-transparent">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                  <span className="text-slate-700 dark:text-slate-200 text-sm">MT5</span>
                </div>
                <Checkbox
                  checked={newAlert.enable_mt5}
                  onCheckedChange={(checked) => setNewAlert({...newAlert, enable_mt5: checked})}
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-green-600 dark:text-green-400" />
                  <div>
                    <span className="text-green-800 dark:text-green-200 font-medium block text-sm">Auto-Execute</span>
                    <span className="text-green-700 dark:text-green-300/70 text-xs">Auto-execute when triggered</span>
                  </div>
                </div>
                <Checkbox
                  checked={newAlert.auto_execute}
                  onCheckedChange={(checked) => setNewAlert({...newAlert, auto_execute: checked})}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddAlert} className="flex-1 bg-green-600 hover:bg-green-700 h-8 text-xs">
                Create
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="outline" className="flex-1 border-slate-300 dark:border-slate-600 h-8 text-xs">
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {alerts.length > 0 ? alerts.map((alert) => (
            <div key={alert.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="text-slate-900 dark:text-white font-semibold text-sm">{alert.symbol}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge className={alert.confluence_threshold === "100%" ? "bg-green-100 text-green-800 text-xs" : "bg-yellow-100 text-yellow-800 text-xs"}>
                      {alert.confluence_threshold}
                    </Badge>
                    {alert.auto_execute && (
                      <Badge className="bg-purple-100 text-purple-800 text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        Auto
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alert.is_active}
                    onCheckedChange={() => handleToggleAlert(alert)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDeleteAlert(alert.id)}
                    className="h-7 w-7 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-1.5 flex-wrap">
                {(alert.notification_method === "browser" || alert.notification_method === "both") && (
                  <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600">
                    <Bell className="w-3 h-3 mr-1" />
                    In-App
                  </Badge>
                )}
                {(alert.notification_method === "mt5" || alert.notification_method === "both") && (
                  <Badge variant="outline" className="text-xs border-slate-300 dark:border-slate-600">
                    <Zap className="w-3 h-3 mr-1" />
                    MT5
                  </Badge>
                )}
                {alert.is_active ? (
                  <Badge className="bg-green-100 text-green-800 ml-auto text-xs">Active</Badge>
                ) : (
                  <Badge className="bg-gray-100 dark:bg-gray-500/20 text-gray-800 dark:text-gray-300 ml-auto text-xs">Paused</Badge>
                )}
              </div>

              {alert.last_triggered && (
                <p className="text-slate-600 dark:text-slate-500 text-xs mt-1.5">
                  Last: {new Date(alert.last_triggered).toLocaleDateString()}
                </p>
              )}
            </div>
          )) : (
            <div className="text-center py-6">
              <Bell className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-slate-700 dark:text-slate-400 text-sm">No alerts configured</p>
              <p className="text-slate-600 dark:text-slate-500 text-xs">Add alert to get notified</p>
            </div>
          )}
        </div>

        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/20">
          <p className="text-blue-700 dark:text-blue-200 text-xs">
            💡 Alerts trigger when confluence threshold is met.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}