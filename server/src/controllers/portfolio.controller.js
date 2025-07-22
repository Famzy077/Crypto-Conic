const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
require('dotenv').config();
const COINGECKO_API_URL = process.env.CORS_ORIGIN || 'https://api.coingecko.com/api/v3/simple/price';

/**
 * @description Get all holdings for the logged-in user, enriched with live market data.
 */
const getPortfolio = async (req, res) => {
    // The userId is attached to the request by our verifyToken middleware
    const userId = req.user.userId; 

    try {
        // 1. Fetch all holdings for the user from our database
        const userHoldings = await prisma.holding.findMany({
            where: { userId: userId },
        });

        if (userHoldings.length === 0) {
            return res.json([]); // Return an empty array if the user has no holdings
        }

        // 2. Get a unique list of coin IDs to fetch from the external API
        const coinIds = [...new Set(userHoldings.map(h => h.coinId))].join(',');

        // 3. Fetch the current price for all coins in a single API call
        const coingeckoResponse = await axios.get(COINGECKO_API_URL, {
            params: {
                ids: coinIds,
                vs_currencies: 'usd',
            },
        });
        const livePrices = coingeckoResponse.data;

        // 4. Combine our database data with the live price data
        const enrichedPortfolio = userHoldings.map(holding => {
            const currentPrice = livePrices[holding.coinId]?.usd || 0;
            const currentValue = holding.quantity * currentPrice;
            const totalProfitLoss = (currentValue - (holding.quantity * holding.buyPrice));

            return {
                ...holding,
                currentPrice,
                currentValue,
                totalProfitLoss,
            };
        });

        res.status(200).json(enrichedPortfolio);

    } catch (error) {
        console.error("--- Get Portfolio Error ---", error);
        res.status(500).json({ success: false, message: 'Failed to fetch portfolio.' });
    }
};

/**
 * @description Add a new cryptocurrency holding to the user's portfolio.
 */
const addHolding = async (req, res) => {
    const userId = req.user.userId;
    const { coinId, quantity, buyPrice } = req.body;

    // Basic validation
    if (!coinId || !quantity || buyPrice === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required fields: coinId, quantity, buyPrice.' });
    }

    try {
        const newHolding = await prisma.holding.create({
            data: {
                userId: userId,
                coinId: coinId,
                quantity: parseFloat(quantity),
                buyPrice: parseFloat(buyPrice),
            },
        });

        res.status(201).json({ success: true, message: 'Holding added successfully.', data: newHolding });

    } catch (error) {
        console.error("--- Add Holding Error ---", error);
        res.status(500).json({ success: false, message: 'Failed to add holding.' });
    }
};

/**
 * @description Delete a holding from the user's portfolio.
 */
const deleteHolding = async (req, res) => {
    const userId = req.user.userId;
    const { id: holdingId } = req.params; // Get the holding ID from the URL parameter

    try {
        // First, verify the holding exists and belongs to the logged-in user
        const holding = await prisma.holding.findUnique({
            where: { id: holdingId },
        });

        if (!holding) {
            return res.status(404).json({ success: false, message: 'Holding not found.' });
        }

        if (holding.userId !== userId) {
            // This is a crucial security check!
            return res.status(403).json({ success: false, message: 'Unauthorized. You can only delete your own holdings.' });
        }

        // If checks pass, delete the holding
        await prisma.holding.delete({
            where: { id: holdingId },
        });

        res.status(200).json({ success: true, message: 'Holding deleted successfully.' });

    } catch (error) {
        console.error("--- Delete Holding Error ---", error);
        res.status(500).json({ success: false, message: 'Failed to delete holding.' });
    }
};


module.exports = { getPortfolio, addHolding, deleteHolding };
