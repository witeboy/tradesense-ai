import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"; // NEW IMPORTS FOR ACCORDION
import { Newspaper, Calendar, TrendingUp, TrendingDown, AlertTriangle, RefreshCw, Loader2, Globe, Key } from "lucide-react"; // Added Key icon
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function FundamentalsNewsPanel({ symbol }) {
  const [newsData, setNewsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (symbol) {
      fetchNewsAnalysis();
    }
  }, [symbol]);

  const fetchNewsAnalysis = async () => {
    if (!symbol) return;
    
    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('analyzeNewsAndFundamentals', { symbol });
      if (response.data.success) {
        setNewsData(response.data.data);
        setLastUpdate(new Date());
      } else {
        console.warn("API returned success: false for news analysis.", response.data);
        setNewsData(null); // Clear previous data if analysis fails
      }
    } catch (error) {
      console.error("Failed to fetch news analysis:", error);
      setNewsData(null); // Clear previous data on error
    }
    setIsLoading(false);
  };

  if (!symbol) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-6 text-center">
          <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Select an instrument to view news analysis</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading && !newsData) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
          <span className="ml-3 text-slate-300">Analyzing news from multiple sources...</span>
        </CardContent>
      </Card>
    );
  }

  // Show "no data" message if no newsData is available after initial load or failure
  if (!newsData) { 
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
          <p className="text-slate-400">No fundamental analysis data available for {symbol}.</p>
          <Button onClick={fetchNewsAnalysis} disabled={isLoading} className="mt-4">
            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <RefreshCw className="mr-2" />}
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getDirectionIcon = (direction) => {
    if (direction?.toLowerCase().includes('bullish')) return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (direction?.toLowerCase().includes('bearish')) return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
  };

  const getDirectionColor = (direction) => {
    if (direction?.toLowerCase().includes('bullish')) return 'bg-green-100 text-green-800';
    if (direction?.toLowerCase().includes('bearish')) return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getImpactColor = (impact) => {
    if (impact === 'High') return 'bg-red-100 text-red-800';
    if (impact === 'Medium') return 'bg-orange-100 text-orange-800';
    return 'bg-blue-100 text-blue-800'; // Assuming 'Low' or default impact
  };

  return (
    <div className="space-y-4">
      {/* Overall Bias Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-400" />
                Fundamental Analysis - {symbol}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchNewsAnalysis}
                disabled={isLoading}
                className="text-slate-400 hover:text-white"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Net Bias */}
              <div className="text-center p-4 rounded-lg bg-slate-900/30">
                <div className="flex items-center justify-center gap-3 mb-2">
                  {getDirectionIcon(newsData?.overall_bias?.direction)}
                  <h3 className="text-2xl font-bold text-white">
                    {newsData?.overall_bias?.direction || 'Neutral'}
                  </h3>
                </div>
                <Badge className={getDirectionColor(newsData?.overall_bias?.direction)} style={{ fontSize: '0.9rem', padding: '0.4rem 0.8rem' }}>
                  Confidence: {newsData?.confidence_score || 0}%
                </Badge>
                <p className="text-slate-300 mt-3">
                  Net Bias Score: {newsData?.overall_bias?.net_score > 0 ? '+' : ''}{newsData?.overall_bias?.net_score || 0}
                </p>
              </div>

              {/* Reasoning */}
              {newsData?.overall_bias?.reasoning && (
                <div className="p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
                  <h5 className="text-blue-200 font-semibold mb-2">Analysis</h5>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {newsData.overall_bias.reasoning}
                  </p>
                </div>
              )}

              {/* Trade Recommendation */}
              {newsData?.trade_recommendation && (
                <div className="p-4 rounded-lg bg-purple-900/20 border border-purple-500/30">
                  <h5 className="text-purple-200 font-semibold mb-2">📊 Trade Plan Guidance</h5>
                  <p className="text-slate-300 text-sm">
                    {newsData.trade_recommendation}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Collapsible Sections */}
      {newsData && ( // Only render accordion if newsData exists
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardContent className="p-6">
              <Accordion type="multiple" className="w-full space-y-2">
                
                {/* Disclaimer */}
                <AccordionItem value="disclaimer" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                  <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                    <span className="font-semibold text-yellow-500">Important Disclaimer</span>
                  </AccordionTrigger>
                  <AccordionContent className="pt-4 text-slate-300 text-sm leading-relaxed">
                    This fundamental analysis is generated by an AI model and should be used for informational purposes only. It does not constitute financial advice, investment recommendations, or an offer to trade. Trading involves substantial risk and is not suitable for all investors. Past performance is not indicative of future results. Always consult with a qualified financial professional before making any investment decisions.
                  </AccordionContent>
                </AccordionItem>

                {/* Optimal Entry/Exit Ranges */}
                {newsData?.entry_ranges && (
                  <AccordionItem value="entry-ranges" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                    <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                      <span className="font-semibold">Optimal Entry/Exit Ranges</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 text-slate-300 text-sm leading-relaxed">
                      {newsData.entry_ranges}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Indicator Setup Guide */}
                {newsData?.indicator_setup_guide && (
                  <AccordionItem value="indicator-setup" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                    <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                      <div className="flex items-center gap-2">
                        <Key className="w-5 h-5 text-cyan-400" />
                        <span className="font-semibold">Indicator Setup Guide</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 text-slate-300 text-sm leading-relaxed">
                      {newsData.indicator_setup_guide}
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Currency Bias Breakdown */}
                {newsData?.currency_breakdown && (
                  <AccordionItem value="currency" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                    <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                      <span className="font-semibold">Currency Bias Breakdown</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(newsData.currency_breakdown).map(([currency, data]) => (
                          <div key={currency} className="p-4 rounded-lg bg-slate-900/30">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-white font-semibold text-lg">{currency}</h5>
                              <Badge className={data.bias > 0 ? 'bg-green-100 text-green-800' : data.bias < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                                {data.bias > 0 ? '+' : ''}{data.bias}
                              </Badge>
                            </div>
                            <p className="text-slate-400 text-sm">{data.summary}</p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Source Summary Table */}
                {newsData?.source_summary && newsData.source_summary.length > 0 && (
                  <AccordionItem value="sources" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                    <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                      <div className="flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-orange-400" />
                        <span className="font-semibold">News Events Summary</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-700">
                              <th className="text-left p-3 text-slate-300">Source</th>
                              <th className="text-left p-3 text-slate-300">News Summary</th>
                              <th className="text-center p-3 text-slate-300">Impact</th>
                              <th className="text-center p-3 text-slate-300">Sentiment</th>
                              <th className="text-center p-3 text-slate-300">Effect</th>
                            </tr>
                          </thead>
                          <tbody>
                            {newsData.source_summary.map((item, idx) => (
                              <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-900/30 transition-colors">
                                <td className="p-3">
                                  <Badge variant="outline" className="text-xs">
                                    {item.source}
                                  </Badge>
                                </td>
                                <td className="p-3 text-slate-300">
                                  {item.summary}
                                </td>
                                <td className="p-3 text-center">
                                  <Badge className={getImpactColor(item.impact)}>
                                    {item.impact}
                                  </Badge>
                                </td>
                                <td className="p-3 text-center">
                                  <Badge className={getDirectionColor(item.sentiment)}>
                                    {item.sentiment}
                                  </Badge>
                                </td>
                                <td className="p-3 text-slate-300 text-center">
                                  {item.effect}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Upcoming Events */}
                {newsData?.upcoming_events && newsData.upcoming_events.length > 0 && (
                  <AccordionItem value="events" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                    <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-green-400" />
                        <span className="font-semibold">Upcoming High-Impact Events (Next 72h)</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-3">
                        {newsData.upcoming_events.map((event, idx) => (
                          <div key={idx} className="p-4 rounded-lg bg-slate-900/30 hover:bg-slate-900/50 transition-colors border-l-4" style={{
                            borderColor: event.impact === 'High' ? '#ef4444' : event.impact === 'Medium' ? '#f59e0b' : '#3b82f6'
                          }}>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex-1">
                                <h5 className="text-white font-semibold">{event.event_name}</h5>
                                <p className="text-slate-400 text-sm">{event.currency}</p>
                              </div>
                              <Badge className={getImpactColor(event.impact)}>
                                {event.impact}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-sm mt-2">
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
                              {event.actual && (
                                <div>
                                  <span className="text-slate-500">Actual: </span>
                                  <span className="text-green-300 font-semibold">{event.actual}</span>
                                </div>
                              )}
                            </div>
                            {event.time && (
                              <p className="text-slate-500 text-xs mt-2">📅 {event.time}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}

                {/* Confidence Breakdown */}
                {newsData?.confidence_breakdown && (
                  <AccordionItem value="confidence" className="border-slate-700 bg-slate-900/30 rounded-lg px-4">
                    <AccordionTrigger className="text-white hover:text-blue-400 transition-colors">
                      <span className="font-semibold">Confidence Breakdown</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">High-impact events agreeing</span>
                          <span className="text-blue-400 font-mono">{newsData.confidence_breakdown.high_impact_agreement || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${newsData.confidence_breakdown.high_impact_agreement || 0}%` }} />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Cross-source confirmation</span>
                          <span className="text-purple-400 font-mono">{newsData.confidence_breakdown.cross_source_confirmation || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${newsData.confidence_breakdown.cross_source_confirmation || 0}%` }} />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Technical alignment</span>
                          <span className="text-green-400 font-mono">{newsData.confidence_breakdown.technical_alignment || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: `${newsData.confidence_breakdown.technical_alignment || 0}%` }} />
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Time proximity (within 12h)</span>
                          <span className="text-yellow-400 font-mono">{newsData.confidence_breakdown.time_proximity || 0}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${newsData.confidence_breakdown.time_proximity || 0}%` }} />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {lastUpdate && (
        <div className="text-xs text-slate-500 text-center mt-4">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}