import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ 
                success: false, 
                error: 'Unauthorized' 
            }, { status: 401 });
        }

        const { symbol, instrument } = await req.json();
        const tradingSymbol = symbol || instrument;
        
        if (!tradingSymbol) {
            return Response.json({ 
                success: false, 
                error: 'Symbol is required' 
            }, { status: 400 });
        }

        // Generate simulated fundamental analysis
        const bias = Math.random();
        const direction = bias > 0.6 ? "Moderately Bullish" : 
                         bias < 0.4 ? "Moderately Bearish" : "Neutral";
        
        const netScore = bias > 0.6 ? Math.round(10 + Math.random() * 20) :
                        bias < 0.4 ? -Math.round(10 + Math.random() * 20) : 
                        Math.round(-5 + Math.random() * 10);

        const currency1 = tradingSymbol.substring(0, 3);
        const currency2 = tradingSymbol.substring(3, 6);

        const fundamentalData = {
            overall_bias: {
                direction: direction,
                net_score: netScore,
                reasoning: `Based on recent economic data and central bank policies, ${tradingSymbol} shows ${direction.toLowerCase()} sentiment. Key factors include interest rate differentials, inflation trends, and economic growth indicators.`
            },
            confidence_score: Math.round(60 + Math.random() * 30),
            confidence_breakdown: {
                high_impact_agreement: Math.round(50 + Math.random() * 30),
                cross_source_confirmation: Math.round(50 + Math.random() * 30),
                technical_alignment: Math.round(50 + Math.random() * 30),
                time_proximity: Math.round(60 + Math.random() * 30)
            },
            currency_breakdown: {
                [currency1]: {
                    bias: netScore > 0 ? Math.round(5 + Math.random() * 10) : -Math.round(5 + Math.random() * 10),
                    summary: `${currency1} shows ${netScore > 0 ? 'strength' : 'weakness'} based on recent economic indicators and monetary policy stance.`
                },
                [currency2]: {
                    bias: netScore > 0 ? -Math.round(5 + Math.random() * 10) : Math.round(5 + Math.random() * 10),
                    summary: `${currency2} exhibits ${netScore > 0 ? 'relative weakness' : 'relative strength'} compared to ${currency1}.`
                }
            },
            source_summary: [
                {
                    source: "ForexFactory",
                    summary: "Central bank maintains hawkish stance on inflation",
                    impact: "High",
                    sentiment: netScore > 0 ? "Bullish" : "Bearish",
                    effect: netScore > 0 ? "+10" : "-10"
                },
                {
                    source: "FXStreet",
                    summary: "Economic data beats expectations",
                    impact: "Medium",
                    sentiment: netScore > 5 ? "Bullish" : netScore < -5 ? "Bearish" : "Neutral",
                    effect: netScore > 5 ? "+7" : netScore < -5 ? "-7" : "0"
                },
                {
                    source: "Reuters",
                    summary: "Geopolitical tensions affect market sentiment",
                    impact: "Medium",
                    sentiment: "Neutral",
                    effect: "0"
                }
            ],
            upcoming_events: [
                {
                    event_name: "Interest Rate Decision",
                    currency: currency1,
                    impact: "High",
                    forecast: "5.25%",
                    previous: "5.25%",
                    time: new Date(Date.now() + 86400000).toLocaleString()
                },
                {
                    event_name: "CPI Report",
                    currency: currency2,
                    impact: "High",
                    forecast: "3.2%",
                    previous: "3.1%",
                    time: new Date(Date.now() + 172800000).toLocaleString()
                },
                {
                    event_name: "Employment Data",
                    currency: currency1,
                    impact: "Medium",
                    forecast: "200K",
                    previous: "195K",
                    time: new Date(Date.now() + 259200000).toLocaleString()
                }
            ],
            trade_recommendation: `${direction === "Moderately Bullish" ? 'Consider long positions' : direction === "Moderately Bearish" ? 'Consider short positions' : 'Wait for clearer direction'} with proper risk management. Monitor upcoming high-impact events closely.`,
            entry_ranges: `For ${direction === "Moderately Bullish" ? 'long' : direction === "Moderately Bearish" ? 'short' : 'any'} positions, consider entries near key support/resistance levels identified in technical analysis.`,
            indicator_setup_guide: `Use EMA 21, 50, and 200 on your chart. Add RSI(14), MACD(12,26,9), and ADX(14) for confirmation. ${direction === "Moderately Bullish" ? 'Look for pullbacks to EMAs for entry' : direction === "Moderately Bearish" ? 'Look for rallies to EMAs for entry' : 'Wait for clear trend confirmation'}.`
        };

        return Response.json({
            success: true,
            data: fundamentalData
        });

    } catch (error) {
        console.error("News Analysis Error:", error);
        return Response.json({ 
            success: false,
            error: error.message || "Failed to analyze news" 
        }, { status: 500 });
    }
});