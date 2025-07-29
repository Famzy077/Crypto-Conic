const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');

// In-memory cache to store the entire map of coin prices.
const priceCache = {
    timestamp: 0,
    data: new Map(),
};
const CACHE_DURATION_MS = 5 * 60 * 1000; // Cache prices for 5 minutes

// --- HELPER FUNCTION FOR COINGECKO API ---
const fetchPricesFromCoinGecko = async (coinIds) => {
    try {
        const idsToFetch = coinIds.join(',');
        const requestUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${idsToFetch}&vs_currencies=usd`;
        console.log(`--- Attempting to fetch from CoinGecko: ${requestUrl} ---`);
        const response = await axios.get(requestUrl);
        const prices = new Map();
        for (const coinId in response.data) {
            prices.set(coinId, { usd: response.data[coinId].usd });
        }
        console.log('--- Successfully fetched prices from CoinGecko. ---');
        return prices;
    } catch (error) {
        console.error("--- CoinGecko API failed ---", { message: error.message });
        return null; // Return null on failure
    }
};

// --- HELPER FUNCTION FOR COINCAP API (The Backup) ---
const fetchPricesFromCoinCap = async () => {
    try {
        const requestUrl = `https://api.coincap.io/v2/assets`;
        console.log(`--- CoinGecko failed. Attempting backup fetch from CoinCap: ${requestUrl} ---`);
        const response = await axios.get(requestUrl);
        const prices = new Map();
        for (const asset of response.data.data) {
            prices.set(asset.id, { usd: parseFloat(asset.priceUsd) });
        }
        console.log('--- Successfully fetched prices from CoinCap backup. ---');
        return prices;
    } catch (error) {
        console.error("--- CoinCap API failed ---", { message: error.message });
        return null; // Return null on failure
    }
};

const getPortfolio = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ success: false, message: 'Invalid token payload.' });

    try {
        const userHoldings = await prisma.holding.findMany({ where: { userId: userId } });
        if (userHoldings.length === 0) return res.json([]);

        // 1. Check if the cache is still valid
        if (Date.now() - priceCache.timestamp > CACHE_DURATION_MS) {
            const uniqueCoinIds = [...new Set(userHoldings.map(h => h.coinId.toLowerCase()))];
            
            let newPrices = await fetchPricesFromCoinGecko(uniqueCoinIds);

            if (!newPrices) {
                // If CoinGecko fails, try CoinCap
                newPrices = await fetchPricesFromCoinCap();
            }

            // If it successfully got new prices from either source, update the cache
            if (newPrices) {
                priceCache.data = newPrices;
                priceCache.timestamp = Date.now();
            } else {
                console.log("--- Both APIs failed. Using stale cache data if available. ---");
            }
        } else {
            console.log('--- Using fresh cached prices. ---');
        }

        // 2. Enrich the portfolio with the data from our cache
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
    if (!userId) return res.status(401).json({ success: false, message: 'Invalid token payload.' });
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
    const { id: holdingId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Invalid token payload.' });
    if (!holdingId) return res.status(400).json({ success: false, message: 'Holding ID is required.' });
    try {
        const holding = await prisma.holding.findUnique({ where: { id: holdingId } });
        if (!holding) return res.status(404).json({ success: false, message: 'Holding not found.' });
        if (holding.userId !== userId) return res.status(403).json({ success: false, message: 'Unauthorized.' });
        await prisma.holding.delete({ where: { id: holdingId } });
        res.status(200).json({ success: true, message: 'Holding deleted.' });
    } catch (error) {
        console.error("--- Delete Holding Error ---", error);
        res.status(500).json({ success: false, message: 'Failed to delete holding.' });
    }
};

module.exports = { getPortfolio, addHolding, deleteHolding };
