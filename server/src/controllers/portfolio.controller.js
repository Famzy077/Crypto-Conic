const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

const priceCache = new Map();
const CACHE_DURATION_MS = 2 * 60 * 1000; // Cache prices for 2 minutes

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

        for (const coinId of uniqueCoinIds) {
            const cached = priceCache.get(coinId);
            if (cached && (Date.now() - cached.timestamp < CACHE_DURATION_MS)) {
                livePrices[coinId] = cached.data; // Use cached data
            } else {
                coinsToFetch.push(coinId); // Add to list to fetch from API
            }
        }

        if (coinsToFetch.length > 0) {
            try {
                const coingeckoResponse = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
                    params: { ids: coinsToFetch.join(','), vs_currencies: 'usd' },
                });
                const fetchedPrices = coingeckoResponse.data;

                // 3. Update cache and merge with other live prices
                for (const coinId of coinsToFetch) {
                    if (fetchedPrices[coinId]) {
                        const priceData = { usd: fetchedPrices[coinId].usd };
                        priceCache.set(coinId, { timestamp: Date.now(), data: priceData });
                        livePrices[coinId] = priceData;
                    }
                }
            } catch (apiError) {
                console.error("--- CoinGecko API Error ---", apiError.message);
            }
        }

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