
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getTopCoins } from '../../lib/coingecko';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// --- A small component for the loading state ---
const TableSkeleton = () => (
    <div className="animate-pulse">
        {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                <div className="ml-4 flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/6"></div>
                </div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/5"></div>
            </div>
        ))}
    </div>
);

// --- The Main Home Page Component ---
const HomePage = () => {
    const router = useRouter();

    const { data, isLoading, error } = useQuery({
        queryKey: ['topCoins'],
        queryFn: getTopCoins,
    });
    const coins = Array.isArray(data) ? data : [];

    const handleRowClick = (coinId: string) => {
        router.push(`/coins/${coinId}`);
    };

    return (
        <main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">Crypto Market Overview</h1>
                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                        Live prices for the top 100 cryptocurrencies by market cap.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    {/* Table Header */}
                    <div className="grid grid-cols-3 md:grid-cols-4 p-4 font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase border-b border-gray-200 dark:border-gray-700">
                        <div className="col-span-1">Coin</div>
                        <div className="text-right">Price</div>
                        <div className="text-right">24h Change</div>
                        <div className="hidden md:block text-right">Market Cap</div>
                    </div>

                    {/* Table Body */}
                    <div>
                        {isLoading && <TableSkeleton />}
                        {error && <div className="p-8 text-center text-red-500">Failed to load data. Please try again later.</div>}
                        {!isLoading && !error && coins.map((coin: any) => (
                            <div 
                                key={coin.id} 
                                onClick={() => handleRowClick(coin.id)}
                                className="grid grid-cols-3 md:grid-cols-4 items-center p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                            >
                                {/* Coin Name and Symbol */}
                                <div className="flex items-center gap-4">
                                    <Image src={coin.image} alt={coin.name} width={32} height={32} className="rounded-full" />
                                    <div>
                                        <p className="font-bold text-gray-800 dark:text-white">{coin.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{coin.symbol}</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="text-right font-medium text-gray-800 dark:text-gray-200">
                                    ${coin.current_price.toLocaleString()}
                                </div>

                                {/* 24h Change */}
                                <div className={`text-right font-semibold ${coin.price_change_percentage_24h > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {coin.price_change_percentage_24h.toFixed(2)}%
                                </div>

                                {/* Market Cap (hidden on mobile) */}
                                <div className="hidden md:block text-right text-gray-600 dark:text-gray-300">
                                    ${coin.market_cap.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default HomePage;
