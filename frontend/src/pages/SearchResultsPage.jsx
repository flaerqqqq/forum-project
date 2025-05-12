import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import SearchResultsFeed from '../components/SearchResultsFeed.jsx';

const searchResultsPostsCache = new Map();

const SearchResultsPage = () => {
    const [searchParams] = useSearchParams();

    const searchQuery = (searchParams.get('q') || '').replace(/\+/g, '%20');

    const [showScrollToTop, setShowScrollToTop] = useState(false);

    const saveSearchResultsPostsCache = useCallback((query, sort, posts, loadedCount, scrollY, page, hasMore) => {
        if (!query) return;
        const key = `${query.toLowerCase()}_${sort}`;
        searchResultsPostsCache.set(key, { posts, loadedCount, scrollY, page, hasMore, timestamp: Date.now(), sortBy: sort });
        console.log('Saved to search results cache:', key, searchResultsPostsCache.get(key));
    }, []);

    const getSearchResultsPostsCache = useCallback((query, sort) => {
        if (!query) return null;
        const key = `${query.toLowerCase()}_${sort}`;
        const cachedData = searchResultsPostsCache.get(key);
        console.log('Attempting to get from search results cache:', key, cachedData);
        return cachedData;
    }, []);

    const clearSearchResultsPostsCache = useCallback((query, sort) => {
        if (!query) return;
        const key = `${query.toLowerCase()}_${sort}`;
        const deleted = searchResultsPostsCache.delete(key);
        console.log('Cleared search results cache for:', key, 'Deleted:', deleted);
    }, []);


    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setShowScrollToTop(true);
            } else {
                setShowScrollToTop(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    if (!searchQuery) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600">Please enter a search query.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light-gray py-6">
            <div className="container max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <SearchResultsFeed
                        searchQuery={searchQuery}
                        saveSearchResultsPostsCache={saveSearchResultsPostsCache}
                        getSearchResultsPostsCache={getSearchResultsPostsCache}
                        clearSearchResultsPostsCache={clearSearchResultsPostsCache}
                    />
                </div>
            </div>

            {showScrollToTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 bg-accent-green hover:bg-green-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 z-50 flex items-center justify-center"
                    aria-label="Scroll to top"
                >
                    <ArrowUp size={20} />
                </button>
            )}
        </div>
    );
};

export default SearchResultsPage;