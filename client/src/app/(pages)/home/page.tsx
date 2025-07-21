'use client';

import React from 'react';
import { useInfiniteQuery } from '@tanstack/react-query'; // useInfiniteQuery
import { getTopCoins } from '../../lib/coingecko';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaSpinner } from 'react-icons/fa';
import Button from '@/app/components/ui/button';

// --- Define the Coin type ---
interface Coin {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
    price_change_percentage_24h: number;
}

// --- A reusable component for a single Crypto Card ---
const CryptoCard = ({ coin }: { coin: Coin }) => {
    const router = useRouter();
    const priceChange = coin.price_change_percentage_24h;

    return (
        <div 
            onClick={() => router.push(`/coins/${coin.id}`)}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
        >
            <div className="flex items-center gap-4 mb-4">
                <Image src={coin.image} alt={coin.name} width={40} height={40} className="rounded-full" />
                <div>
                    <p className="font-bold text-lg max-sm:text-sm text-gray-800 dark:text-white">{coin.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{coin.symbol}</p>
                </div>
            </div>
            <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-200">
                    ${coin.current_price.toLocaleString()}
                </p>
                <p className={`text-md font-semibold mt-1 ${priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {priceChange > 0 ? '▲' : '▼'} {priceChange.toFixed(2)}%
                </p>
            </div>
        </div>
    );
};

// --- A component for the loading skeleton ---
const GridSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mt-2"></div>
            </div>
        ))}
    </div>
);


// --- The Main Home Page Component ---
const HomePage = () => {
    const {
        data,
        error,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        status,
    } = useInfiniteQuery({
        queryKey: ['topCoins'],
        queryFn: getTopCoins, // This function needs to be updated to handle pages
        initialPageParam: 1,
        getNextPageParam: (lastPage, allPages) => {
            const nextPage = allPages.length + 1;
            return nextPage > 10 ? undefined : nextPage;
        },
    });

    return (
        <main className="bg-gray-50 mt-18 max-sm:mt-14 pt-5  dark:bg-gray-900 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-2">
                <div className="text-center mb-12">
                    <h1 className="text-4xl max-sm:text-2xl md:text-5xl font-bold text-gray-800 dark:text-white">Crypto Market Overview</h1>
                    <p className="text-lg max-sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Live prices for the top cryptocurrencies.
                    </p>
                </div>

                {status === 'pending' ? (
                    <GridSkeleton />
                ) : status === 'error' ? (
                    <div className="p-8 text-center text-red-500">Error: {error.message}</div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {/*display all fetched coins */}
                            {data.pages.map((page, i) => (
                                <React.Fragment key={i}>
                                    {page.map((coin: Coin) => (
                                        <CryptoCard key={coin.id} coin={coin} />
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* --- The "Load More" Button --- */}
                        <div className="flex justify-center mt-12">
                            {hasNextPage && (
                                <Button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                >
                                    {isFetchingNextPage ? (
                                        <div className="flex items-center gap-2">
                                            <FaSpinner className="animate-spin" />
                                            <span>Loading...</span>
                                        </div>
                                    ) : (
                                        'Load More'
                                    )}
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
};

export default HomePage;
