import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Oval } from 'react-loader-spinner';
import CategoryView from "../components/CategoryView.jsx";

// Import the useFollowedCategories hook
import { useFollowedCategories } from '../contexts/FollowedCategoriesContext';


const PAGE_SIZE = 9;

const ExploreCategories = () => {
    // Use the hook to get followed categories state and loading status
    const { followedCategorySlugs, loadingFollowedCategories } = useFollowedCategories();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [query, setQuery] = useState('');
    const [inputValue, setInputValue] = useState('');

    const observer = useRef();

    const lastCategoryRef = useCallback(node => {
        // Only attach the observer if not loading categories, not initially loading,
        // there are more categories to load, and there is no active search query.
        if (loading || initialLoading || !hasMore || query) return;

        // Disconnect the previous observer if it exists
        if (observer.current) observer.current.disconnect();

        // Create a new IntersectionObserver
        observer.current = new IntersectionObserver(entries => {
            // If the last element is intersecting the viewport and there are more categories,
            // increment the page number to trigger fetching the next page.
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });

        // Start observing the last category node if it exists
        if (node) observer.current.observe(node);

    }, [loading, initialLoading, hasMore, query]); // Dependencies for useCallback

    const fetchCategories = useCallback(async () => {
        // Set loading state based on whether it's the initial load or subsequent pages
        if (page === 0) {
            setInitialLoading(true);
        } else {
            setLoading(true);
        }

        try {
            let response;
            if (query) {
                // If there's a search query, fetch search results
                response = await axios.get('http://localhost:8080/api/v1/categories/search', {
                    params: { query },
                });
                // For search, replace the entire categories list
                setCategories(response.data || []);
                // Search results are typically not paginated in this way, so set hasMore to false
                setHasMore(false);
            } else {
                // If no search query, fetch paginated categories
                response = await axios.get('http://localhost:8080/api/v1/categories', {
                    params: { page, size: PAGE_SIZE },
                });
                const fetchedCategories = response.data.content || [];

                // Append fetched categories for pagination, or replace for the first page
                setCategories(prev => (page === 0 ? fetchedCategories : [...prev, ...fetchedCategories]));

                // Determine if there are more pages based on the backend's 'last' flag
                let morePages = !response.data.last;

                // Additional check: if no categories were fetched on a subsequent page, there are no more pages
                if (fetchedCategories.length === 0 && page > 0) {
                    morePages = false;
                }

                setHasMore(morePages);
            }
        } catch (error) {
            // Log and toast error, set hasMore to false to stop loading attempts
            console.error('Failed to load categories:', error);
            toast.error('Failed to load categories.');
            setHasMore(false); // Stop pagination on error
        } finally {
            // Set loading states to false after the fetch is complete
            setInitialLoading(false);
            setLoading(false);
        }
    }, [page, query]); // Dependencies: re-fetch when page or query changes

    useEffect(() => {
        // Trigger fetching categories when the component mounts or fetchCategories changes
        fetchCategories();
    }, [fetchCategories]); // Dependency: fetchCategories useCallback function

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        // Reset pagination and categories list when a new search is submitted
        setPage(0);
        setCategories([]);
        setHasMore(true); // Assume there might be results for the new query
        setQuery(inputValue.trim()); // Update the query state to trigger fetchCategories useEffect
    };

    return (
        <div className="container mx-auto bg-background-light-gray font-sans text-black px-6 sm:px-8 lg:px-12 pt-4 pb-10">
            <h1 className="text-3xl font-heading text-black mb-10 text-center">Explore Categories</h1>

            <form onSubmit={handleSearchSubmit} className="mb-10 flex justify-center">
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="border border-border p-3 rounded-l-md focus:outline-none focus:border-black w-1/3 text-gray-darker text-base"
                />
                <button
                    type="submit"
                    className="bg-accent-green text-white px-6 rounded-r-md hover:bg-green-700 transition text-base"
                >
                    Search
                </button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
                {/* Map through categories and render CategoryView */}
                {categories.map((category, index) => (
                    <div
                        key={category.id}
                        // Attach the ref to the last element only when NOT searching
                        ref={!query && index === categories.length - 1 ? lastCategoryRef : null}
                    >
                        {/* Pass the category object to CategoryView */}
                        <CategoryView category={category} />
                    </div>
                ))}
            </div>

            {/* Loading indicators */}
            {initialLoading && (
                <div className="flex justify-center mt-10">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible={true} />
                </div>
            )}

            {loading && !initialLoading && (
                <div className="flex justify-center mt-8">
                    <Oval height={30} width={30} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={3} visible={true} />
                </div>
            )}

            {/* Messages for pagination status */}
            {!loading && hasMore && categories.length > 0 && !initialLoading && !query && (
                <p className="text-gray-medium mt-8 text-center text-base">Scroll down to load more categories...</p>
            )}
            {/* Message when no categories are found (initial load, no search) */}
            {!initialLoading && categories.length === 0 && !query && (
                <p className="text-gray-medium mt-10 text-center text-base">No categories found.</p>
            )}
            {/* Message when search yields no results */}
            {!initialLoading && categories.length === 0 && query && (
                <p className="text-gray-medium mt-10 text-center text-base">No results found for "{query}".</p>
            )}

            {/* Add bottom padding to ensure content doesn't stick to the bottom */}
            <div className="pb-10"></div>

            {/*
                Optional: You can use loadingFollowedCategories here if you need to
                show a separate indicator for the followed categories context loading state.
                For example:
                {loadingFollowedCategories && <p>Loading followed status...</p>}
            */}
        </div>
    );
};

export default ExploreCategories;