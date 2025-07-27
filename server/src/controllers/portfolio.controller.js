const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

// In-memory cache to store the entire map of coin prices.
const priceCache = {
    timestamp: 0,
    data: new Map(),
};
const CACHE_DURATION_MS = 5 * 60 * 1000; // Cache prices for 5 minutes

const getPortfolio = async (req, res) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(401).json({ success: false, message: 'Invalid token payload.' });
    }

    try {
        const userHoldings = await prisma.holding.findMany({
            where: { userId: userId },
        });

        if (userHoldings.length === 0) {
            return res.json([]);
        }

        // 1. Check if the cache is still valid
        if (Date.now() - priceCache.timestamp > CACHE_DURATION_MS) {
            console.log('--- Cache expired. Attempting to fetch all assets from CoinCap API. ---');
            try {
                const requestUrl = `https://api.coincap.io/v2/assets`;
                const coincapResponse = await axios.get(requestUrl);
                const fetchedAssets = coincapResponse.data.data;

                // If the API call is successful, clear the old cache and update it.
                const newPriceData = new Map();
                for (const asset of fetchedAssets) {
                    newPriceData.set(asset.id, { usd: parseFloat(asset.priceUsd) });
                }

                priceCache.data = newPriceData;
                priceCache.timestamp = Date.now();
                console.log(`--- Cache updated successfully with ${priceCache.data.size} assets. ---`);

            } catch (apiError) {
                // If the API call fails, log the error but DO NOT clear the old cache.
                console.error("--- CoinCap API Error: Failed to refresh cache. Using stale data if available. ---", { 
                    message: apiError.message, 
                    status: apiError.response?.status,
                });
            }
        } else {
            console.log('--- Using fresh cached prices. ---');
        }

        // 2. Enrich the portfolio with the combined price data from our cache
        const enrichedPortfolio = userHoldings.map(holding => {
            const livePriceData = priceCache.data.get(holding.coinId.toLowerCase());
            
            const currentPrice = livePriceData?.usd || 0;
            const currentValue = holding.quantity * currentPrice;
            const totalProfitLoss = (currentValue - (holding.quantity * holding.buyPrice));

            return { ...holding, currentPrice, currentValue, totalProfitLoss };
        });

        res.status(200).json(enrichedPortfolio);

    } catch (error) {
        console.error("--- Get Portfolio Error ---", error);
        res.status(500).json({ success: false, message: 'Failed to fetch portfolio.' });
    }
};

const addHolding = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Invalid token payload.' });
    }
    const { coinId, quantity, buyPrice } = req.body;
    if (!coinId || !quantity || buyPrice === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }
    try {
        const newHolding = await prisma.holding.create({
            data: {
                userId: userId,
                // Always save the coinId as lowercase to be consistent
                coinId: coinId.toLowerCase(),
                quantity: parseFloat(quantity),
                buyPrice: parseFloat(buyPrice),
            },
        });
        res.status(201).json({ success: true, message: 'Holding added.', data: newHolding });
    } catch (error) {
        console.error("--- Add Holding Error ---", error);
        res.status(500).json({ success: false, message: 'Failed to add holding.' });
    }
};

const deleteHolding = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Invalid token payload.' });
    }
    const { id: holdingId } = req.params;
    try {
        const holding = await prisma.holding.findUnique({ where: { id: holdingId } });
        if (!holding) {
            return res.status(404).json({ success: false, message: 'Holding not found.' });
        }
        if (holding.userId !== userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized.' });
        }
        await prisma.holding.delete({ where: { id: holdingId } });
        res.status(200).json({ success: true, message: 'Holding deleted.' });
    } catch (error) {
        console.error("--- Delete Holding Error ---", error);
        res.status(500).json({ success: false, message: 'Failed to delete holding.' });
    }
};

module.exports = { getPortfolio, addHolding, deleteHolding };