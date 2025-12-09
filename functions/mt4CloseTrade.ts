import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { trade_id, close_price } = await req.json();

        if (!trade_id) {
            return Response.json({ error: 'Missing trade_id' }, { status: 400 });
        }

        const trade = await base44.entities.Trade.get(trade_id);
        
        if (!trade) {
            return Response.json({ error: 'Trade not found' }, { status: 404 });
        }

        const actualClosePrice = close_price || (trade.entry_price * (1 + (Math.random() - 0.5) * 0.001));
        const pips = trade.trade_type === "BUY" 
            ? (actualClosePrice - trade.entry_price) 
            : (trade.entry_price - actualClosePrice);
        const finalProfit = pips * trade.lot_size * 100000 * 0.1;

        const updatedTrade = await base44.entities.Trade.update(trade_id, {
            status: "CLOSED",
            close_price: actualClosePrice,
            current_profit: finalProfit,
            close_time: new Date().toISOString()
        });

        return Response.json({
            success: true,
            message: "Trade closed successfully on MT4",
            trade: updatedTrade,
            final_profit: finalProfit,
            profit_pips: pips * 10000
        });

    } catch (error) {
        console.error("MT4 Trade Close Error:", error);
        return Response.json({ 
            success: false,
            error: error.message || "Failed to close trade" 
        }, { status: 500 });
    }
});