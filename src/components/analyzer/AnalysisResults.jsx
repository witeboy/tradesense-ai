import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import AdPlaceholder from "../ads/AdPlaceholder";
import DirectionIndicator from "./DirectionIndicator";
import RSIPanel from "./RSIPanel";
import MovingAveragesPanel from "./MovingAveragesPanel";
import MACDDivergencePanel from "./MACDDivergencePanel";
import PriceActionPanel from "./PriceActionPanel";
import FibonacciPanel from "./FibonacciPanel";
import CandlestickPatternsPanel from "./CandlestickPatternsPanel";
import PatternAnalysisPanel from "./PatternAnalysisPanel";
import CorrelationPanel from "./CorrelationPanel";
import TradePlans from "./TradePlans";
import MultiTimeframeConfluencePanel from "./MultiTimeframeConfluencePanel";

export default function AnalysisResults({ analysis, chartImage }) {
  const [selectedTimeframeForDisplay, setSelectedTimeframeForDisplay] = useState(analysis?.primary_timeframe);

  const currentTfAnalysisData = analysis?.json_output?.multi_timeframe_analysis?.[selectedTimeframeForDisplay];

  if (!currentTfAnalysisData && selectedTimeframeForDisplay && analysis?.json_output?.multi_timeframe_analysis) {
    const availableTfs = Object.keys(analysis.json_output.multi_timeframe_analysis);
    if (availableTfs.length > 0 && !availableTfs.includes(selectedTimeframeForDisplay)) {
      setSelectedTimeframeForDisplay(availableTfs[0]);
    }
  }

  return (
    <div className="space-y-6">
      {chartImage && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
            <CardContent className="p-4">
              <img src={chartImage} alt={`Chart for ${analysis.primary_timeframe}`} className="w-full rounded-lg" />
            </CardContent>
          </Card>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <DirectionIndicator 
          direction={analysis.direction}
          rationale={analysis.direction_rationale}
          instrument={analysis.instrument}
          timeframe={analysis.primary_timeframe}
        />
      </motion.div>

      {analysis?.json_output?.overall_confluence_summary && analysis?.json_output?.multi_timeframe_analysis && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <MultiTimeframeConfluencePanel
            overallConfidence={analysis.confidence_score}
            overallConfluenceSummary={analysis.json_output.overall_confluence_summary}
            timeframeAnalyses={analysis.json_output.multi_timeframe_analysis}
          />
        </motion.div>
      )}

      {analysis?.json_output?.multi_timeframe_analysis && Object.keys(analysis.json_output.multi_timeframe_analysis).length > 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 mb-4">
          <Label className="text-slate-300">View Details For:</Label>
          <Select value={selectedTimeframeForDisplay} onValueChange={setSelectedTimeframeForDisplay}>
            <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600 text-white">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(analysis.json_output.multi_timeframe_analysis).map((tf) => (
                <SelectItem key={tf} value={tf}>{tf}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>
      )}

      {currentTfAnalysisData && (
        <>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="grid lg:grid-cols-2 gap-4">
            {currentTfAnalysisData.rsi_analysis && <RSIPanel rsiData={currentTfAnalysisData.rsi_analysis} />}
            {currentTfAnalysisData.moving_averages && <MovingAveragesPanel maData={currentTfAnalysisData.moving_averages} />}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid lg:grid-cols-2 gap-4">
            {currentTfAnalysisData.macd_analysis && <MACDDivergencePanel divergence={currentTfAnalysisData.macd_analysis} />}
            {currentTfAnalysisData.price_action && <PriceActionPanel priceActionData={currentTfAnalysisData.price_action} />}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="grid lg:grid-cols-2 gap-4">
            {currentTfAnalysisData.fibonacci_analysis && <FibonacciPanel fibData={currentTfAnalysisData.fibonacci_analysis} />}
            {currentTfAnalysisData.pattern_analysis && <PatternAnalysisPanel patternData={currentTfAnalysisData.pattern_analysis} />}
          </motion.div>

          {currentTfAnalysisData.candlestick_patterns && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid lg:grid-cols-2 gap-4">
              <CandlestickPatternsPanel patternData={currentTfAnalysisData.candlestick_patterns} />
            </motion.div>
          )}

          {currentTfAnalysisData.correlation_analysis && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
              <CorrelationPanel correlationData={currentTfAnalysisData.correlation_analysis} />
            </motion.div>
          )}
        </>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <AdPlaceholder title="In-Content Ad" />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <TradePlans primaryPlan={analysis.primary_trade_plan} alternatePlan={analysis.alternate_trade_plan} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Risk Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="text-slate-200 font-medium">Invalidation Rule</h4>
              <p className="text-slate-300 text-sm">{analysis.invalidation_rule}</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}