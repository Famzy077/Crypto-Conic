/*
File: src/controllers/portfolio.controller.js
Description: The complete, robust portfolio controller using the free CoinCap API.
*/
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

// In-memory cache to store coin prices.
const priceCache = new Map();
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

        const uniqueCoinIds = [...new Set(userHoldings.map(h => h.coinId))];
        const livePrices = {};
        const coinsToFetch = [];

        // 1. Check the cache for each coin
        for (const coinId of uniqueCoinIds) {
            const cached = priceCache.get(coinId);
            if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
                livePrices[coinId] = cached.data;
            } else {
                coinsToFetch.push(coinId);
            }
        }

        // 2. Fetch any coins that were not in the cache or were stale
        if (coinsToFetch.length > 0) {
            const idsToFetch = coinsToFetch.join(',');
            // --- THE FIX: Switched to the free and reliable CoinCap API ---
            const requestUrl = `https://api.coincap.io/v2/assets?ids=${idsToFetch}`;
            
            console.log(`--- Making CoinCap API Request: ${requestUrl} ---`);

            try {
                const coincapResponse = await axios.get(requestUrl);
                const fetchedAssets = coincapResponse.data.data; // The assets are in the 'data' array

                // 3. Update cache and build our price map
                for (const asset of fetchedAssets) {
                    const priceData = { usd: parseFloat(asset.priceUsd) };
                    priceCache.set(asset.id, { timestamp: Date.now(), data: priceData });
                    livePrices[asset.id] = priceData;
                }
            } catch (apiError) {
                console.error("--- CoinCap API Error ---", { 
                    message: apiError.message, 
                    status: apiError.response?.status,
                });
            }
        }

        // 4. Enrich the portfolio with the combined price data
        const enrichedPortfolio = userHoldings.map(holding => {
            const currentPrice = livePrices[holding.coinId]?.usd || 0;
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
