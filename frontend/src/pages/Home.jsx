import React, { useState, useCallback, useEffect } from 'react';
import PostsFeed from '../components/PostsFeed.jsx';
import { ArrowUp } from 'lucide-react';

const homePostsCache = {};

const Home = () => {

    const saveHomePostsCache = useCallback((key, sort, posts, loadedCount, scrollY, page, hasMore) => {
        homePostsCache[`${key}-${sort}`] = { posts, loadedCount, scrollY, page, hasMore, timestamp: Date.now(), sortBy: sort };
    }, []);

    const getHomePostsCache = useCallback((key, sort) => {
        const cachedData = homePostsCache[`${key}-${sort}`];
        if (cachedData) {
            return cachedData;
        }
        return null;
    }, []);

    const clearHomePostsCache = useCallback((key, sort) => {
        delete homePostsCache[`${key}-${sort}`];
    }, []);

    const [showScrollToTop, setShowScrollToTop] = useState(false);

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

    return (
        <div className="min-h-screen bg-gray-50 py-6">
            <div className="container max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <PostsFeed
                        saveHomePostsCache={saveHomePostsCache}
                        getHomePostsCache={getHomePostsCache}
                        clearHomePostsCache={clearHomePostsCache}
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
}

export default Home;