import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Oval } from 'react-loader-spinner';
import CategoryView from "../components/CategoryView.jsx";

const PAGE_SIZE = 9; // 3 categories per row

const ExploreCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [query, setQuery] = useState('');
    const [inputValue, setInputValue] = useState('');

    const observer = useRef();

    const lastCategoryRef = useCallback(node => {
        if (loading || initialLoading) return;
        if (observer.current) observer.current.disconnect();
        if (!query) { // Only observe when NOT searching
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting && hasMore) {
                    setPage(prev => prev + 1);
                }
            });
            if (node) observer.current.observe(node);
        }
    }, [loading, initialLoading, hasMore, query]);

    const fetchCategories = useCallback(async () => {
        if (page === 0) {
            setInitialLoading(true);
        } else {
            setLoading(true);
        }

        try {
            if (query) {
                // Search mode: no pagination
                const response = await axios.get('http://localhost:8080/api/v1/categories/search', {
                    params: { query },
                });
                setCategories(response.data || []);
                setHasMore(false); // No further loading when searching
            } else {
                // Normal Browse with pagination
                const response = await axios.get('http://localhost:8080/api/v1/categories', {
                    params: { page, size: PAGE_SIZE },
                });
                const fetchedCategories = response.data.content || [];
                setCategories(prev => (page === 0 ? fetchedCategories : [...prev, ...fetchedCategories]));

                // Original logic for hasMore
                let morePages = !response.data.last;

                // *** START OF REQUESTED ADDITION ***
                // Frontend Safeguard: If we received an empty array on any page AFTER the first page (page > 0),
                // assume there are no more categories, even if backend 'last' is incorrect.
                if (fetchedCategories.length === 0 && page > 0) {
                    morePages = false;
                    console.log('Frontend: Detected end of results via empty page response.'); // Optional log
                }
                // *** END OF REQUESTED ADDITION ***

                setHasMore(morePages); // Use the potentially updated value
            }
        } catch (error) {
            toast.error('Failed to load categories');
            // Also set hasMore to false on error to prevent infinite loop attempts
            setHasMore(false);
        } finally {
            setInitialLoading(false);
            setLoading(false);
        }
    }, [page, query]);

    useEffect(() => {
        fetchCategories();
    }, [page, fetchCategories]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(0);
        setCategories([]);
        setHasMore(true);
        setQuery(inputValue.trim());
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Explore Categories</h1>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="mb-6 flex justify-center">
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="border border-gray-300 p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-1/3"
                />
                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 rounded-r-md hover:bg-blue-600 transition"
                >
                    Search
                </button>
            </form>

            <div className="grid grid-cols-3 gap-6">
                {categories.map((category, index) => (
                    <div
                        key={category.id}
                        ref={!query && index === categories.length - 1 ? lastCategoryRef : null} // ref only in normal mode
                    >
                        <CategoryView category={category} />
                    </div>
                ))}
            </div>

            {initialLoading && (
                <div className="flex justify-center mt-4">
                    <Oval height={40} width={40} color="#3b82f6" secondaryColor="#dbeafe" strokeWidth={4} visible={true} />
                </div>
            )}

            {loading && !initialLoading && (
                <div className="flex justify-center mt-4">
                    <Oval height={30} width={30} color="#3b82f6" secondaryColor="#dbeafe" strokeWidth={3} visible={true} />
                </div>
            )}

            {!loading && hasMore && categories.length > 0 && !initialLoading && !query && (
                <p className="text-gray-500 mt-4 text-center">Scroll down to load more categories...</p>
            )}
        </div>
    );
};

export default ExploreCategories;