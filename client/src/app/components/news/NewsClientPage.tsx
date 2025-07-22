'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCryptoNews, NewsArticle } from '@/app/lib/coingecko';
import { NewsSkeleton, NewsArticleCard } from '../newsUi';

// I pass the server-fetched data as initialData
const NewsClientPage = ({ initialData }: { initialData: NewsArticle[] }) => {
    const { data: news, isLoading, error } = useQuery({
        queryKey: ['cryptoNews'],
        queryFn: getCryptoNews,
        initialData: initialData,
    });
    console.log('NewsClientPage rendered with news:', news);

    // I can show the skeleton if a background refetch is happening, but not on initial load
    if (isLoading && !news) {
        return <NewsSkeleton />;
    }

    if (error) {
        return <div className="p-8 text-center text-red-500">Failed to load news. Please try again later.</div>;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news?.map((article) => (
                <NewsArticleCard key={article.id} article={article} />
            ))}
        </div>
    );
};

export default NewsClientPage;