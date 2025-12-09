import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, XCircle, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export default function CorrelationPanel({ correlationData }) {
  if (!correlationData) return null;

  const getConfluenceColor = (confluence) => {
    switch (confluence) {
      case 'Strong Bullish': return 'bg-green-600 text-white';
      case 'Bullish': return 'bg-green-100 text-green-800';
      case 'Bearish': return 'bg-red-100 text-red-800';
      case 'Strong Bearish': return 'bg-red-600 text-white';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfluenceIcon = (confluence) => {
    if (confluence.includes('Bullish')) return <TrendingUp className="w-4 h-4 text-green-400" />;
    if (confluence.includes('Bearish')) return <TrendingDown className="w-4 h-4 text-red-400" />;
    return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" />
          Correlation & Confluence Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Confluence */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/30">
          <div className="flex items-center gap-2">
            {getConfluenceIcon(correlationData.overall_confluence)}
            <span className="text-slate-200 font-medium">Overall Confluence</span>
          </div>
          <Badge className={getConfluenceColor(correlationData.overall_confluence)}>
            {correlationData.overall_confluence}
          </Badge>
        </div>

        {/* Confidence Score */}
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Confidence Score</span>
          <Badge className={getConfidenceColor(correlationData.confidence_score)}>
            {correlationData.confidence_score}
          </Badge>
        </div>

        {/* Aligned Indicators */}
        {correlationData.aligned_indicators && correlationData.aligned_indicators.length > 0 && (
          <div>
            <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Aligned Indicators ({correlationData.aligned_indicators.length})
            </h4>
            <div className="space-y-1">
              {correlationData.aligned_indicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded bg-green-900/20">
                  <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
                  <span className="text-green-200 text-sm">{indicator}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conflicting Indicators */}
        {correlationData.conflicting_indicators && correlationData.conflicting_indicators.length > 0 && (
          <div>
            <h4 className="text-slate-200 font-medium mb-2 flex items-center gap-2">
              <XCircle className="w-4 h-4 text-red-400" />
              Conflicting Signals ({correlationData.conflicting_indicators.length})
            </h4>
            <div className="space-y-1">
              {correlationData.conflicting_indicators.map((indicator, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded bg-red-900/20">
                  <XCircle className="w-3 h-3 text-red-400 flex-shrink-0" />
                  <span className="text-red-200 text-sm">{indicator}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Correlation Summary */}
        <div className="p-3 rounded-lg bg-slate-900/30">
          <h4 className="text-slate-200 font-medium mb-2">Professional Analysis Summary</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            {correlationData.correlation_summary}
          </p>
        </div>

        {/* Trading Decision Logic */}
        <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-500/20">
          <h4 className="text-blue-200 font-medium mb-2">Trading Decision</h4>
          <div className="text-xs text-blue-100 space-y-1">
            <p>• <strong>High Confidence:</strong> 3+ indicators aligned, enter with full position</p>
            <p>• <strong>Medium Confidence:</strong> 2 indicators aligned, reduce position size</p>
            <p>• <strong>Low Confidence:</strong> Conflicting signals, wait for better setup</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}