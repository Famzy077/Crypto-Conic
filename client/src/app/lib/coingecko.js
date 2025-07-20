import axios from 'axios';

const API_URL = 'https://api.coingecko.com/api/v3';

// Function to get the top 100 coins for the homepage


// UPDATED function to handle pagination
export const getTopCoins = async ({ pageParam = 1 }) => {
  try {
    const response = await axios.get(`${API_URL}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 15, // Fetch 15 items per page
        page: pageParam, // Use the page number passed by useInfiniteQuery
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