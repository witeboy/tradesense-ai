import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, RefreshCw, Loader2, Activity, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function MT5AccountsTab({ onUpdate }) {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [newAccount, setNewAccount] = useState({
    login_id: "",
    password: "",
    server_name: "",
    broker_name: "",
    account_name: ""
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const accountsList = await base44.entities.MT5Account.list();
      setAccounts(accountsList);
    } catch (error) {
      console.error("Failed to load MT5 accounts:", error);
      toast.error("Failed to load MT5 accounts");
    }
    setIsLoading(false);
  };

  const handleConnect = async () => {
    if (!newAccount.login_id || !newAccount.password || !newAccount.server_name) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsConnecting(true);
    try {
      const response = await base44.functions.invoke('mt5Connect', newAccount);
      
      if (response.data.success) {
        toast.success("Successfully connected to MT5 account");
        setNewAccount({
          login_id: "",
          password: "",
          server_name: "",
          broker_name: "",
          account_name: ""
        });
        setIsAdding(false);
        loadAccounts();
        if (onUpdate) onUpdate();
      } else {
        toast.error(response.data.error || "Failed to connect to MT5");
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast.error("Failed to connect to MT5");
    }
    setIsConnecting(false);
  };

  const handleDelete = async (accountId) => {
    try {
      await base44.entities.MT5Account.delete(accountId);
      toast.success("Account removed");
      loadAccounts();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error("Failed to remove account");
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
        <CardContent className="p-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          <span className="ml-3 text-slate-700 dark:text-slate-300">Loading accounts...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Account Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
            <CardHeader className="p-4">
              <CardTitle className="text-slate-900 dark:text-white text-base">Connect MT5 Account</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-700 dark:text-slate-200 text-sm">Account Name *</Label>
                    <Input
                      value={newAccount.account_name}
                      onChange={(e) => setNewAccount({...newAccount, account_name: e.target.value})}
                      placeholder="My Trading Account"
                      className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 dark:text-slate-200 text-sm">Broker Name</Label>
                    <Input
                      value={newAccount.broker_name}
                      onChange={(e) => setNewAccount({...newAccount, broker_name: e.target.value})}
                      placeholder="IC Markets"
                      className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-9"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-slate-700 dark:text-slate-200 text-sm">Login ID *</Label>
                    <Input
                      value={newAccount.login_id}
                      onChange={(e) => setNewAccount({...newAccount, login_id: e.target.value})}
                      placeholder="MT5 Login ID"
                      className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-700 dark:text-slate-200 text-sm">Password *</Label>
                    <Input
                      type="password"
                      value={newAccount.password}
                      onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                      placeholder="Password"
                      className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-9"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-700 dark:text-slate-200 text-sm">Server Name *</Label>
                  <Input
                    value={newAccount.server_name}
                    onChange={(e) => setNewAccount({...newAccount, server_name: e.target.value})}
                    placeholder="ICMarkets-MT5"
                    className="bg-slate-50 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white h-9"
                  />
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-500/30 rounded-lg p-3">
                  <p className="text-yellow-800 dark:text-yellow-200 text-xs">
                    ⚠️ <strong>Note:</strong> Simulated MT5 connection for demo purposes.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4 mr-2" />
                        Connect Account
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setIsAdding(false)}
                    variant="outline"
                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Add Account Button */}
      {!isAdding && (
        <Button
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add MT5 Account
        </Button>
      )}

      {/* Accounts List */}
      {accounts.length > 0 ? (
        <div className="grid gap-6">
          {accounts.map((account, idx) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                <CardHeader className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-slate-900 dark:text-white text-base">
                        {account.account_name}
                      </CardTitle>
                      <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">
                        {account.broker_name} • {account.server_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {account.is_active ? (
                        <Badge className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-xs">
                          <Activity className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-300 text-xs">
                          Inactive
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(account.id)}
                        className="h-8 w-8 text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Login ID</p>
                      <p className="text-slate-900 dark:text-white font-mono text-sm">{account.login_id}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Balance</p>
                      <p className="text-slate-900 dark:text-white font-semibold text-sm">
                        ${account.account_balance?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Equity</p>
                      <p className="text-slate-900 dark:text-white font-semibold text-sm">
                        ${account.account_equity?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs">Last Connected</p>
                      <p className="text-slate-700 dark:text-slate-300 text-xs">
                        {account.last_connected ? new Date(account.last_connected).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardContent className="p-8 text-center">
            <Activity className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No MT5 Accounts</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-3">
              Connect MT5 to start trading
            </p>
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Connect First Account
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}