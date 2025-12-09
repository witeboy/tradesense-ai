import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { 
            analysis_id,
            symbol,
            timeframe,
            trade_type,
            entry_price,
            stop_loss,
            take_profit,
            lot_size,
            risk_percentage,
            confidence_score,
            notes
        } = await req.json();

        if (!symbol || !trade_type || !entry_price || !stop_loss || !take_profit || !lot_size) {
            return Response.json({ 
                error: 'Missing required trade parameters' 
            }, { status: 400 });
        }

        // Simulated trade execution for MT4
        const simulatedTicket = `MT4-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create trade record in database
        const trade = await base44.asServiceRole.entities.Trade.create({
            analysis_id: analysis_id || "",
            symbol: symbol,
            timeframe: timeframe || "H1",
            trade_type: trade_type,
            entry_price: entry_price,
            stop_loss: stop_loss,
            take_profit: take_profit,
            lot_size: lot_size,
            risk_percentage: risk_percentage || 2,
            status: "OPEN",
            mt5_ticket: simulatedTicket,
            current_profit: 0,
            is_paper_trade: true,
            confidence_score: confidence_score || 0,
            notes: notes || ""
        });

        return Response.json({
            success: true,
            message: `Trade executed successfully on MT4`,
            trade: trade,
            execution_details: {
                platform: "MT4",
                symbol: symbol,
                type: trade_type,
                lot_size: lot_size,
                entry: entry_price,
                sl: stop_loss,
                tp: take_profit,
                ticket: simulatedTicket,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error("MT4 Trade Execution Error:", error);
        return Response.json({ 
            success: false,
            error: error.message || "Failed to execute trade on MT4" 
        }, { status: 500 });
    }
});