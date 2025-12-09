import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, Newspaper, Calendar, RefreshCw, Loader2, AlertCircle, WifiOff } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function LiveDataPanel({ instrument }) {
  const [liveData, setLiveData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchLiveData = async () => {
    if (!instrument) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout - please try again')), 15000)
      );
      
      const fetchPromise = base44.functions.invoke('fetchLiveData', { 
        instrument: instrument.trim(),
        symbol: instrument.trim() 
      });
      
      const response = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (response.data && response.data.success) {
        setLiveData(response.data.data);
        setLastUpdate(new Date());
        setRetryCount(0);
        setError(null);
      } else {
        const errorMsg = response.data?.error || "Failed to fetch live data";
        setError(errorMsg);
        console.error("Live data fetch failed:", errorMsg);
      }
    } catch (error) {
      console.error("Failed to fetch live data:", error);
      
      let errorMessage = "Unable to connect to live data service";
      
      if (error.message?.includes('timeout')) {
        errorMessage = "Request timed out - server may be busy";
      } else if (error.message?.includes('Network')) {
        errorMessage = "Network error - please check your connection";
      } else if (error.message?.includes('Unauthorized')) {
        errorMessage = "Session expired - please refresh the page";
      }
      
      setError(errorMessage);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (instrument) {
      fetchLiveData();
      // Refresh every 30 seconds
      const interval = setInterval(fetchLiveData, 30000);
      return () => clearInterval(interval);
    } else {
      setLiveData(null);
      setError(null);
    }
  }, [instrument]);

  if (!instrument) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-6 text-center">
          <DollarSign className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Select an instrument to view live market data</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-800/50 border-red-900/20 backdrop-blur">
        <CardContent className="p-6 text-center">
          <WifiOff className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-300 font-semibold mb-2">{error}</p>
          {retryCount > 0 && (
            <p className="text-slate-500 text-sm mb-3">Retry attempt: {retryCount}</p>
          )}
          <Button 
            onClick={fetchLiveData} 
            disabled={isLoading} 
            variant="outline" 
            size="sm"
            className="border-red-500/30 text-red-300 hover:bg-red-900/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry Now
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && !liveData) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
            <p className="text-slate-400">Loading live market data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!liveData) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-6 text-center">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-3">No data available</p>
          <Button onClick={fetchLiveData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Load Data
          </Button>
        </CardContent>
      </Card>
    );
  }

  const price = liveData.current_price || {};
  const sentiment = liveData.market_sentiment || {};
  const news = liveData.latest_news || [];
  const calendar = liveData.economic_calendar || [];

  return (
    <div className="space-y-4">
      {/* Live Price */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl hover:border-slate-600/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center justify-between">
              <span className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                Live Price - {instrument}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchLiveData}
                disabled={isLoading}
                className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Bid/Ask</span>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-bold text-green-400 font-mono">
                      {price.bid?.toFixed(5) || '--.-----'}
                    </div>
                    {(price.change_percent || 0) >= 0 ? (
                      <TrendingUp className="w-6 h-6 text-green-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-red-400" />
                    )}
                  </div>
                  <div className="text-sm text-slate-400">
                    Ask: {price.ask?.toFixed(5) || '--.-----'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Change</div>
                  <div className={`text-xl font-bold font-mono ${(price.change_percent || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(price.change_percent || 0) >= 0 ? '+' : ''}{(price.change_percent || 0).toFixed(2)}%
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50">
                  <div className="text-xs text-slate-400 mb-1">Pips</div>
                  <div className={`text-xl font-bold font-mono ${(price.change_pips || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {(price.change_pips || 0) >= 0 ? '+' : ''}{(price.change_pips || 0).toFixed(1)}
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm p-3 rounded-lg bg-slate-900/30">
                <span className="text-slate-400">Daily Range</span>
                <span className="text-slate-200 font-mono">
                  {price.daily_low?.toFixed(5) || '0.00000'} - {price.daily_high?.toFixed(5) || '0.00000'}
                </span>
              </div>

              {lastUpdate && (
                <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-700/50">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Market Sentiment */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-slate-800/40 border-slate-700/50 backdrop-blur-xl hover:border-slate-600/50 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-500/20">
                {(sentiment.bullish_percent || 0) > (sentiment.bearish_percent || 0) ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              Market Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative h-12 bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/50">
                <motion.div
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-emerald-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${sentiment.bullish_percent || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <motion.div
                  className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-rose-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${sentiment.bearish_percent || 0}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <div className="absolute inset-0 flex items-center justify-between px-4">
                  <div className="text-white font-bold text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    {sentiment.bullish_percent || 0}%
                  </div>
                  <div className="text-white font-bold text-sm flex items-center gap-2">
                    {sentiment.bearish_percent || 0}%
                    <TrendingDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {sentiment.sentiment_label && (
                <div className="p-4 rounded-lg bg-slate-900/30 border border-slate-700/50">
                  <p className="text-slate-200 font-semibold">{sentiment.sentiment_label}</p>
                  {sentiment.retail_positioning && (
                    <p className="text-slate-400 text-sm mt-1">{sentiment.retail_positioning}</p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Latest News */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-purple-400" />
              Latest News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {news.length > 0 ? news.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900/30 hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h5 className="text-white font-medium flex-1">{item.headline}</h5>
                    <Badge className={
                      item.impact === 'High' ? 'bg-red-100 text-red-800' :
                      item.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {item.impact}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-sm mb-2">{item.summary}</p>
                  {item.time && (
                    <p className="text-slate-500 text-xs">{item.time}</p>
                  )}
                </div>
              )) : (
                <p className="text-slate-400 text-center py-4">No recent news available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Economic Calendar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              Economic Calendar (Next 72h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {calendar.length > 0 ? calendar.map((event, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-900/30 hover:bg-slate-900/50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h5 className="text-white font-medium">{event.event_name}</h5>
                      <p className="text-slate-400 text-sm">{event.currency}</p>
                    </div>
                    <Badge className={
                      event.impact === 'High' ? 'bg-red-100 text-red-800' :
                      event.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }>
                      {event.impact}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {event.forecast && (
                      <div>
                        <span className="text-slate-500">Forecast: </span>
                        <span className="text-slate-300">{event.forecast}</span>
                      </div>
                    )}
                    {event.previous && (
                      <div>
                        <span className="text-slate-500">Previous: </span>
                        <span className="text-slate-300">{event.previous}</span>
                      </div>
                    )}
                  </div>
                  {event.time && (
                    <p className="text-slate-500 text-xs mt-2">{event.time}</p>
                  )}
                </div>
              )) : (
                <p className="text-slate-400 text-center py-4">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}