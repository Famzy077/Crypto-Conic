
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCoinDetails } from '@/app/lib/coingecko';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

// --- A component for the loading state ---
const DetailsSkeleton = () => (
    <div className="animate-pulse container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-12"></div>
        <div className="flex flex-col lg:flex-row gap-12">
            <div className="lg:w-1/3 space-y-4">
                <div className="h-24 w-24 bg-gray-300 dark:bg-gray-700 rounded-full mx-auto"></div>
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            </div>
            <div className="lg:w-2/3 space-y-4">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
            </div>
        </div>
    </div>
);

// --- The Main Coin Details Page Component ---
const CoinDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const coinId = params.coinId as string;

    const { data: coin, isLoading, error } = useQuery({
        queryKey: ['coinDetails', coinId],
        queryFn: () => getCoinDetails(coinId),
        enabled: !!coinId, // Only run the query if coinId exists
    });

    if (isLoading) {
        return <DetailsSkeleton />;
    }

    if (error || !coin) {
        return <div className="p-8 text-center text-red-500">Failed to load coin data. It might not exist.</div>;
    }

    // Sanitize the description HTML to prevent XSS attacks
    const cleanDescription = coin.description?.en.replace(/<a/g, '<a target="_blank" rel="noopener noreferrer"');

    return (
        <main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Market Overview
                </button>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Sidebar with Price Info */}
                    <aside className="lg:w-1/3 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md h-fit">
                        <div className="flex flex-col items-center text-center border-b pb-6 border-gray-200 dark:border-gray-700">
                            <Image src={coin.image.large} alt={coin.name} width={100} height={100} className="rounded-full mb-4" />
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{coin.name}</h1>
                            <p className="text-lg text-gray-500 dark:text-gray-400 uppercase">{coin.symbol}</p>
                        </div>
                        <div className="mt-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">Current Price (USD)</p>
                            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-1">
                                ${coin.market_data.current_price.usd.toLocaleString()}
                            </p>
                        </div>
                    </aside>

                    {/* Right Side with Description and Market Data */}
                    <div className="lg:w-2/3">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Market Stats</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Market Cap</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">${coin.market_data.market_cap.usd.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">24h High</p>
                                    <p className="font-semibold text-green-500">${coin.market_data.high_24h.usd.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">24h Low</p>
                                    <p className="font-semibold text-red-500">${coin.market_data.low_24h.usd.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Total Volume</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">${coin.market_data.total_volume.usd.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">Circulating Supply</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">{coin.market_data.circulating_supply.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 dark:text-gray-400">All-Time High</p>
                                    <p className="font-semibold text-gray-800 dark:text-gray-200">${coin.market_data.ath.usd.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">About {coin.name}</h2>
                            <div 
                                className="prose prose-sm dark:prose-invert max-w-none text-gray-600 dark:text-gray-300"
                                dangerouslySetInnerHTML={{ __html: cleanDescription }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default CoinDetailsPage;