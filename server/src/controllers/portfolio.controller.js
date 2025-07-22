
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

// --- THE FIX: Caching Layer ---
// In-memory cache to store coin prices. In a larger application, you might use Redis.
const priceCache = new Map();
// Increased cache duration to 5 minutes to better handle API rate limits.
const CACHE_DURATION_MS = 5 * 60 * 1000; 

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
                livePrices[coinId] = cached.data; // Use cached data
            } else {
                coinsToFetch.push(coinId); // Add to list to fetch from API
            }
        }

        // 2. Fetch any coins that were not in the cache or were stale
        if (coinsToFetch.length > 0) {
            const idsToFetch = coinsToFetch.join(',');
            const requestUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${idsToFetch}&vs_currencies=usd`;
            console.log(`--- Making CoinGecko API Request: ${requestUrl} ---`); // ADDED LOGGING

            try {
                const coingeckoResponse = await axios.get(requestUrl);
                const fetchedPrices = coingeckoResponse.data;
                console.log("--- CoinGecko API Response Received ---", fetchedPrices); // ADDED LOGGING

                // 3. Update cache and merge with other live prices
                for (const coinId of coinsToFetch) {
                    if (fetchedPrices[coinId]) {
                        const priceData = { usd: fetchedPrices[coinId].usd };
                        priceCache.set(coinId, { timestamp: Date.now(), data: priceData });
                        livePrices[coinId] = priceData;
                    }
                }
            } catch (apiError) {
                // ADDED DETAILED LOGGING
                // If the API call fails, log the full error to see the status code (e.g., 429)
                console.error("--- CoinGecko API Error ---", { 
                    message: apiError.message, 
                    status: apiError.response?.status,
                    data: apiError.response?.data 
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
    // --- ADDED SAFETY CHECK ---
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
                coinId: coinId,
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
    // --- ADDED SAFETY CHECK ---
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
