import { NewsArticle } from '@/app/lib/coingecko';
import Image from 'next/image';

// A component for the loading skeleton
export const NewsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="h-48 w-full bg-gray-300 dark:bg-gray-700"></div>
                <div className="p-4 space-y-3">
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-5 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
            </div>
        ))}
    </div>
);

// A reusable component for a single News Article Card (Updated for CoinDesk)
export const NewsArticleCard = ({ article }: { article: NewsArticle }) => (
    <a 
        href={article.url} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
    >
        <div className="h-48 w-full relative">
            <Image 
                src={article.thumbnail}
                alt={article.title} 
                fill
                style={{ objectFit: 'cover' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/default-news-image.png'; }}
            />
        </div>
        <div className="p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase">{article.source.name}</p>
            <h3 className="font-bold max-sm:font-normal text-lg max-sm:text-sm text-gray-800 dark:text-white mt-1 max-sm:h-fit place-content-center h-fit overflow-hidden">{article.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 overflow-hidden">{article.summary}</p>
        </div>
    </a>
);
