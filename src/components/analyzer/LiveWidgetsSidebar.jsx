import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Newspaper, Calendar, Activity } from "lucide-react";
import { motion } from "framer-motion";

export default function LiveWidgetsSidebar({ instrument }) {
  return (
    <div className="space-y-4">
      {/* Live Price */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              Live Price
            </CardTitle>
          </CardHeader>
          <CardContent>
            {instrument ? (
              <div className="text-center">
                <p className="text-sm text-slate-400 mb-2">{instrument}</p>
                <p className="text-3xl font-bold text-green-400">--.-----</p>
                <p className="text-xs text-slate-500 mt-2">Connect to see live prices</p>
              </div>
            ) : (
              <p className="text-slate-400 text-sm text-center">
                Select an instrument to view live data
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Market Sentiment */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Market Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-sm">Bulls</span>
                <Badge className="bg-green-100 text-green-800">---%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-300 text-sm">Bears</span>
                <Badge className="bg-red-100 text-red-800">---%</Badge>
              </div>
              <p className="text-xs text-slate-500 text-center mt-2">
                Real-time data requires API integration
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* News Headlines */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-purple-400" />
              Latest News
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-slate-400 text-sm">
                Connect news feed API to display real-time market news and analysis
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Economic Calendar */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-400" />
              Economic Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-400 text-sm">
              High-impact events will appear here when calendar API is connected
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}