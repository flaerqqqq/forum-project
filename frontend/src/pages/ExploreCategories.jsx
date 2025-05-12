import React, { useEffect, useState, useCallback, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Oval } from 'react-loader-spinner';
import CategoryView from "../components/CategoryView.jsx";

import { useFollowedCategories } from '../contexts/FollowedCategoriesContext';


const PAGE_SIZE = 9;

const ExploreCategories = () => {
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
        if (loading || initialLoading || !hasMore || query) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prev => prev + 1);
            }
        });

        if (node) observer.current.observe(node);

    }, [loading, initialLoading, hasMore, query]); // Dependencies for useCallback

    const fetchCategories = useCallback(async () => {
        if (page === 0) {
            setInitialLoading(true);
        } else {
            setLoading(true);
        }

        try {
            let response;
            if (query) {
                response = await axios.get('http://localhost:8080/api/v1/categories/search', {
                    params: { query },
                });
                setCategories(response.data || []);
                setHasMore(false);
            } else {
                response = await axios.get('http://localhost:8080/api/v1/categories', {
                    params: { page, size: PAGE_SIZE },
                });
                const fetchedCategories = response.data.content || [];

                setCategories(prev => (page === 0 ? fetchedCategories : [...prev, ...fetchedCategories]));

                let morePages = !response.data.last;

                if (fetchedCategories.length === 0 && page > 0) {
                    morePages = false;
                }

                setHasMore(morePages);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
            toast.error('Failed to load categories.');
            setHasMore(false);
        } finally {
            setInitialLoading(false);
            setLoading(false);
        }
    }, [page, query]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setPage(0);
        setCategories([]);
        setHasMore(true);
        setQuery(inputValue.trim());
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
                {categories.map((category, index) => (
                    <div
                        key={category.id}
                        ref={!query && index === categories.length - 1 ? lastCategoryRef : null}
                    >
                        <CategoryView category={category} />
                    </div>
                ))}
            </div>

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

            {!loading && hasMore && categories.length > 0 && !initialLoading && !query && (
                <p className="text-gray-medium mt-8 text-center text-base">Scroll down to load more categories...</p>
            )}
            {!initialLoading && categories.length === 0 && !query && (
                <p className="text-gray-medium mt-10 text-center text-base">No categories found.</p>
            )}
            {!initialLoading && categories.length === 0 && query && (
                <p className="text-gray-medium mt-10 text-center text-base">No results found for "{query}".</p>
            )}

            <div className="pb-10"></div>


        </div>
    );
};

export default ExploreCategories;