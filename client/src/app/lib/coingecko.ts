import axios from 'axios';
const API_URL = 'https://api.coingecko.com/api/v3';


// Type definition for NewsArticle
export type NewsArticle = {
  id: string;
  url: string;
  title: string;
  summary: string;
  thumbnail: string;
  source: {
    name: string;
  };
};

  // Define the CoinDesk article response type
  type CoinDeskArticle = {
    ID: string;
    GUID: string;
    TITLE: string;
    SUMMARY: string;
    THUMBNAIL_2X: string;
    SOURCE: string;
  };


// Function to get the top 100 coins for the homepage
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
export interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  image: {
    thumb: string;
    small: string;
    large: string;
  };
  market_data: {
    current_price: { [key: string]: number };
    market_cap: { [key: string]: number };
    total_volume: { [key: string]: number };
    price_change_percentage_24h: number;
    [key: string]: unknown;
  };
  description: { [key: string]: string };
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    twitter_screen_name: string;
    subreddit_url: string;
    repos_url: { github: string[]; bitbucket: string[] };
  };
  [key: string]: unknown;
}

export const getCoinDetails = async (coinId: string): Promise<CoinDetails> => {
  try {
    const response = await axios.get<CoinDetails>(`${API_URL}/coins/${coinId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for ${coinId}:`, error);
    throw error;
  }
};

// --- UPDATED: Function to get news from CoinDesk ---
export const getCryptoNews = async (): Promise<NewsArticle[]> => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_COINDESK_API_KEY;

    if (!apiKey) {
      console.error("CoinDesk API key is missing.");
      return [];
    }

    const url = 'https://data-api.coindesk.com/news/v1/article/list';

    const response = await axios.get(url, {
      params: {
        lang: 'EN',
        limit: 15,
        api_key: apiKey,
      },
    });

    if (response.data && response.data.Data) {
      // The API response fields are in uppercase, I map them to the camelCase type
      const articles = response.data.Data.map((article: CoinDeskArticle) => ({
        id: article.ID,
        url: article.GUID,
        title: article.TITLE,
        summary: article.SUMMARY,
        thumbnail: article.THUMBNAIL_2X, // Use the high-res thumbnail
        source: {
          name: article.SOURCE
        }
      }));
      return articles;
    } else {
      // If the response is successful but has no data
      return [];
    }
  } catch (error) {
    console.error("Error fetching crypto news from CoinDesk:", error);
    return [];
  }
};