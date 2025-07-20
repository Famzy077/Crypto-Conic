import axios from 'axios';

const API_URL = 'https://api.coingecko.com/api/v3';

// Function to get the top 100 coins for the homepage
export const getTopCoins = async () => {
  try {
    const response = await axios.get(`${API_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching top coins:", error);
    throw error;
  }
};

// Function to get detailed data for a single coin page
export const getCoinDetails = async (coinId) => {
  try {
    const response = await axios.get(`${API_URL}/coins/${coinId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for ${coinId}:`, error);
    throw error;
  }
};