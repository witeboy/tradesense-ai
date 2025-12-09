import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function FundamentalAnalysisTab({ analysis }) {
  if (!analysis || !analysis.fundamental_analysis) {
    return <div className="text-slate-400 text-center py-10">No fundamental analysis data available</div>;
  }

  const fund = analysis.fundamental_analysis;

  const getSentimentColor = (sentiment) => {
    const lower = sentiment?.toLowerCase() || '';
    if (lower.includes('bullish') || lower.includes('positive')) return 'bg-green-100 text-green-800';
    if (lower.includes('bearish') || lower.includes('negative')) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6 mt-4">
      {/* News Sentiment */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-400" />
              News Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={getSentimentColor(fund.news_sentiment)}>
              {fund.news_sentiment || "Neutral"}
            </Badge>
          </CardContent>
        </Card>
      </motion.div>

      {/* Economic Bias */}
      {fund.economic_bias && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                Economic Bias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">{fund.economic_bias}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Upcoming Events */}
      {fund.upcoming_events && fund.upcoming_events.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-400" />
                Upcoming High-Impact Events (Next 72 Hours)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {fund.upcoming_events.map((event, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/30">
                    <AlertTriangle className="w-5 h-5 text-orange-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300">{event}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Alignment with Technical */}
      {fund.alignment_with_technical && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Technical-Fundamental Alignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 leading-relaxed">{fund.alignment_with_technical}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}