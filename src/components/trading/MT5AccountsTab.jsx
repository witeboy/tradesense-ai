import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Loader2, Activity } from "lucide-react";
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
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="ml-3 text-slate-300">Loading accounts...</span>
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
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Connect MT5 Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Account Name *</Label>
                    <Input
                      value={newAccount.account_name}
                      onChange={(e) => setNewAccount({...newAccount, account_name: e.target.value})}
                      placeholder="e.g., My Trading Account"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200">Broker Name</Label>
                    <Input
                      value={newAccount.broker_name}
                      onChange={(e) => setNewAccount({...newAccount, broker_name: e.target.value})}
                      placeholder="e.g., IC Markets"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-200">Login ID *</Label>
                    <Input
                      value={newAccount.login_id}
                      onChange={(e) => setNewAccount({...newAccount, login_id: e.target.value})}
                      placeholder="MT5 Login ID"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-slate-200">Password *</Label>
                    <Input
                      type="password"
                      value={newAccount.password}
                      onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                      placeholder="Password"
                      className="bg-slate-700/50 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-slate-200">Server Name *</Label>
                  <Input
                    value={newAccount.server_name}
                    onChange={(e) => setNewAccount({...newAccount, server_name: e.target.value})}
                    placeholder="e.g., ICMarkets-MT5"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>

                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-200 text-sm">
                    ⚠️ <strong>Note:</strong> This is a simulated MT5 connection. In production, actual MT5 integration would be implemented.
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
                    className="border-slate-600 text-slate-200"
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
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur hover:border-slate-600 transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white text-xl">
                        {account.account_name}
                      </CardTitle>
                      <p className="text-slate-400 text-sm mt-1">
                        {account.broker_name} • Server: {account.server_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {account.is_active ? (
                        <Badge className="bg-green-500/20 text-green-300">
                          <Activity className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500/20 text-gray-300">
                          Inactive
                        </Badge>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(account.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-slate-400 text-sm">Login ID</p>
                      <p className="text-white font-mono">{account.login_id}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Balance</p>
                      <p className="text-white font-semibold">
                        ${account.account_balance?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Equity</p>
                      <p className="text-white font-semibold">
                        ${account.account_equity?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Last Connected</p>
                      <p className="text-slate-300 text-sm">
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
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardContent className="p-12 text-center">
            <Activity className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No MT5 Accounts Connected</h3>
            <p className="text-slate-400 mb-4">
              Connect your MT5 account to start trading and monitoring positions
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