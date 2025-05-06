import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import SearchResultsFeed from '../components/SearchResultsFeed.jsx';

// In-memory cache for search results posts
const searchResultsPostsCache = new Map();

const SearchResultsPage = () => {
    // Use useSearchParams to easily get and manage query parameters
    const [searchParams] = useSearchParams();

    // Get the 'q' query parameter and replace "+" with "%20" to represent spaces
    const searchQuery = (searchParams.get('q') || '').replace(/\+/g, '%20');

    const [showScrollToTop, setShowScrollToTop] = useState(false);

    // Cache management functions for search results
    const saveSearchResultsPostsCache = useCallback((query, sort, posts, loadedCount, scrollY, page, hasMore) => {
        if (!query) return; // Don't cache if no query
        const key = `${query.toLowerCase()}_${sort}`; // Use lowercase query for key consistency
        searchResultsPostsCache.set(key, { posts, loadedCount, scrollY, page, hasMore, timestamp: Date.now(), sortBy: sort });
        console.log('Saved to search results cache:', key, searchResultsPostsCache.get(key));
    }, []);

    const getSearchResultsPostsCache = useCallback((query, sort) => {
        if (!query) return null; // Cannot get from cache if no query
        const key = `${query.toLowerCase()}_${sort}`; // Use lowercase query for key consistency
        const cachedData = searchResultsPostsCache.get(key);
        console.log('Attempting to get from search results cache:', key, cachedData);
        return cachedData;
    }, []);

    const clearSearchResultsPostsCache = useCallback((query, sort) => {
        if (!query) return; // Cannot clear if no query
        const key = `${query.toLowerCase()}_${sort}`; // Use lowercase query for key consistency
        const deleted = searchResultsPostsCache.delete(key);
        console.log('Cleared search results cache for:', key, 'Deleted:', deleted);
    }, []);


    // Effect for scroll-to-top button visibility
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

    // Function to scroll to the top of the page
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Display a message if no search query is provided
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