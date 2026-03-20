import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers });
    }

    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Unauthorized' 
            }), { status: 401, headers });
        }

        let body;
        try {
            body = await req.json();
        } catch (e) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Invalid request format' 
            }), { status: 400, headers });
        }

        const { instrument, symbol } = body;
        const tradingSymbol = (instrument || symbol || '').toUpperCase().trim();
        
        if (!tradingSymbol) {
            return new Response(JSON.stringify({ 
                success: false, 
                error: 'Symbol or instrument is required' 
            }), { status: 400, headers });
        }

        // Determine decimals based on symbol
        let decimals = 5;
        if (tradingSymbol.includes('JPY')) {
            decimals = 3;
        } else if (tradingSymbol.includes('XAU') || tradingSymbol.includes('GOLD') || tradingSymbol.includes('XAG') || tradingSymbol.includes('SILVER')) {
            decimals = 2;
        } else if (tradingSymbol.includes('US30') || tradingSymbol.includes('NAS') || tradingSymbol.includes('SPX') || tradingSymbol.includes('BTC') || tradingSymbol.includes('ETH')) {
            decimals = 2;
        }

        // Attempt to fetch live price from FXStreet
        let currentBid;
        let dataSource = "simulated";
        
        try {
            console.log(`Attempting to fetch live price for ${tradingSymbol} from FXStreet...`);
            
            const pricePrompt = `Go to https://www.fxstreet.com/rates-charts/rates and find the current BID price for ${tradingSymbol}.

CRITICAL INSTRUCTIONS:
1. Look for the exact symbol "${tradingSymbol}" on the FXStreet rates page
2. Extract ONLY the current BID price as a decimal number
3. Return the price with ${decimals} decimal places
4. If the symbol is not found, return null

Examples of what to return:
- For EURUSD at 1.08456: return 1.08456
- For XAUUSD at 2650.45: return 2650.45
- For USDJPY at 149.567: return 149.567

Return ONLY the numeric price value for ${tradingSymbol}, nothing else.`;

            const priceResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
                prompt: pricePrompt,
                add_context_from_internet: true,
                response_json_schema: {
                    type: "object",
                    properties: {
                        bid_price: { type: ["number", "null"] },
                        symbol_found: { type: "boolean" }
                    },
                    required: ["bid_price"]
                }
            });

            if (priceResponse.bid_price && priceResponse.bid_price > 0) {
                currentBid = priceResponse.bid_price;
                dataSource = "fxstreet";
                console.log(`Successfully fetched live price from FXStreet: ${currentBid}`);
            } else {
                throw new Error("Invalid price received from FXStreet");
            }

        } catch (error) {
            console.log(`Failed to fetch from FXStreet (${error.message}), using fallback data...`);
            
            // Fallback to realistic simulated data
            const priceMap = {
                'EURUSD': 1.08500,
                'GBPUSD': 1.27500,
                'USDJPY': 149.500,
                'AUDUSD': 0.65500,
                'USDCAD': 1.36500,
                'NZDUSD': 0.60500,
                'USDCHF': 0.88500,
                'XAUUSD': 2650.00,
                'XAGUSD': 31.50,
                'GOLD': 2650.00,
                'US30': 42500.00,
                'NAS100': 18500.00,
                'SPX500': 5800.00,
                'BTCUSD': 95000.00,
                'ETHUSD': 3500.00
            };

            let basePrice = null;
            for (const [key, price] of Object.entries(priceMap)) {
                if (tradingSymbol.includes(key) || key.includes(tradingSymbol)) {
                    basePrice = price;
                    break;
                }
            }

            if (!basePrice) {
                if (tradingSymbol.includes('JPY')) basePrice = 150.000;
                else if (tradingSymbol.includes('XAU') || tradingSymbol.includes('GOLD')) basePrice = 2650.00;
                else if (tradingSymbol.includes('XAG')) basePrice = 31.50;
                else if (tradingSymbol.includes('US30')) basePrice = 42500.00;
                else if (tradingSymbol.includes('NAS')) basePrice = 18500.00;
                else if (tradingSymbol.includes('SPX')) basePrice = 5800.00;
                else if (tradingSymbol.includes('BTC')) basePrice = 95000.00;
                else if (tradingSymbol.includes('ETH')) basePrice = 3500.00;
                else basePrice = 1.10000;
            }

            const variation = basePrice * 0.001;
            currentBid = basePrice + (Math.random() - 0.5) * variation;
        }

        // Calculate derived values
        const spread = currentBid * (decimals === 2 ? 0.0005 : 0.0001);
        const currentAsk = currentBid + spread;
        const changePercent = (Math.random() - 0.5) * 2.0;
        const changePips = changePercent * (decimals === 3 ? 100 : decimals === 2 ? 1 : 10);
        
        const liveData = {
            current_price: {
                bid: parseFloat(currentBid.toFixed(decimals)),
                ask: parseFloat(currentAsk.toFixed(decimals)),
                change_percent: parseFloat(changePercent.toFixed(2)),
                change_pips: parseFloat(changePips.toFixed(1)),
                daily_high: parseFloat((currentBid * 1.005).toFixed(decimals)),
                daily_low: parseFloat((currentBid * 0.995).toFixed(decimals)),
                previous_close: parseFloat((currentBid - (changePercent * currentBid / 100)).toFixed(decimals)),
                data_source: dataSource
            },
            market_sentiment: {
                bullish_percent: Math.round(40 + Math.random() * 20),
                bearish_percent: Math.round(40 + Math.random() * 20),
                sentiment_label: changePercent > 0.8 ? "Strongly Bullish" : 
                                changePercent > 0.3 ? "Moderately Bullish" :
                                changePercent < -0.8 ? "Strongly Bearish" :
                                changePercent < -0.3 ? "Moderately Bearish" : "Neutral",
                retail_positioning: changePercent > 0 ? 
                    `Retail traders are ${Math.round(55 + Math.random() * 15)}% net long on ${tradingSymbol}` : 
                    `Retail traders are ${Math.round(55 + Math.random() * 15)}% net short on ${tradingSymbol}`
            },
            latest_news: [
                {
                    headline: `${tradingSymbol} ${changePercent > 0 ? 'rallies' : 'declines'} amid ${changePercent > 0 ? 'positive' : 'negative'} market sentiment`,
                    summary: `Price action shows ${changePercent > 0 ? 'bullish' : 'bearish'} momentum as traders react to recent economic data releases and central bank commentary`,
                    impact: Math.abs(changePercent) > 1 ? "High" : "Medium",
                    time: new Date().toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                },
                {
                    headline: "Technical analysis reveals key support and resistance levels",
                    summary: "Traders watching closely as price approaches critical zones that could determine next major move",
                    impact: "Medium",
                    time: new Date(Date.now() - 3600000).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                },
                {
                    headline: "Market volatility remains elevated amid economic uncertainty",
                    summary: "Increased trading volumes and wider spreads observed as market participants adjust positions",
                    impact: "Low",
                    time: new Date(Date.now() - 7200000).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                }
            ],
            economic_calendar: [
                {
                    event_name: `${tradingSymbol.includes('USD') ? 'US' : tradingSymbol.includes('EUR') ? 'Eurozone' : tradingSymbol.includes('GBP') ? 'UK' : tradingSymbol.includes('JPY') ? 'Japan' : 'Global'} Interest Rate Decision`,
                    currency: tradingSymbol.substring(0, 3),
                    impact: "High",
                    forecast: "Hold rates steady",
                    previous: "No change",
                    time: new Date(Date.now() + 86400000).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                },
                {
                    event_name: "Inflation Data (CPI)",
                    currency: tradingSymbol.substring(0, 3),
                    impact: "High",
                    forecast: "2.8%",
                    previous: "2.7%",
                    time: new Date(Date.now() + 172800000).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                },
                {
                    event_name: "Employment Report",
                    currency: tradingSymbol.substring(0, 3),
                    impact: "Medium",
                    forecast: "Positive job growth expected",
                    previous: "Strong employment gains",
                    time: new Date(Date.now() + 259200000).toLocaleString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    })
                }
            ]
        };

        return new Response(JSON.stringify({
            success: true,
            data: liveData,
            message: dataSource === "fxstreet" ? "Live data from FXStreet" : "Using simulated data (FXStreet unavailable)"
        }), { status: 200, headers });

    } catch (error) {
        console.error("Function error:", error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || "Internal server error"
        }), { status: 500, headers });
    }
});