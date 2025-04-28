import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import CategoryCard from './CategoryCard'; // You'll need to create this small component separately.

const PAGE_SIZE = 8;
const MIN_LOADING_TIME = 300;

const UserCategories = ({ userPublicId }) => {
    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const token = Cookies.get('token');
    const observer = useRef();

    const lastCategoryRef = useCallback(node => {
        if (loading || initialLoading || isSearching) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, initialLoading, hasMore, isSearching]);

    const fetchCategories = useCallback(async () => {
        if (!userPublicId) return;

        if (page === 0) {
            setInitialLoading(true);
        } else {
            setLoading(true);
        }

        const startTime = Date.now();
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/users/me/categories`, {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page,
                    size: PAGE_SIZE,
                },
            });

            const fetchedCategories = res.data.content || [];
            const isLast = res.data.last;

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
                setCategories(prev => (page === 0 ? fetchedCategories : [...prev, ...fetchedCategories]));
                setHasMore(!isLast);
                setInitialLoading(false);
                setLoading(false);
            }, remainingTime);

        } catch (err) {
            const errorMessage = err.response?.data?.body?.detail || 'Failed to load categories.';
            if (err.response?.status !== 404 && err.response?.status !== 500) {
                toast.error(errorMessage);
            }
            setInitialLoading(false);
            setLoading(false);
            setHasMore(false);
        }
    }, [page, token, userPublicId]);

    const searchCategories = useCallback(async (query) => {
        if (!query.trim()) {
            setIsSearching(false);
            setPage(0); // Reset to normal list
            return;
        }

        setIsSearching(true);
        setInitialLoading(true);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/categories/search`, {
                params: { query },
            });

            const fetchedCategories = res.data || [];
            setCategories(fetchedCategories);
            setHasMore(false);
        } catch (err) {
            if (err.response?.status !== 404 && err.response?.status !== 500) {
                const errorMessage = err.response?.data?.body?.detail || 'Failed to search categories.';
                toast.error(errorMessage);
            }
            setCategories([]);
            setHasMore(false);
        } finally {
            setInitialLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (isSearching) return; // If searching, skip infinite scroll
        fetchCategories();
    }, [fetchCategories, isSearching]);

    // Debounced search effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            searchCategories(searchQuery);
        }, 500); // Debounce 500ms

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, searchCategories]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    return (
        <div className="mt-6 bg-white rounded-lg shadow p-6 text-gray-800">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">📚 My Categories</h2>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="px-4 py-2 rounded-md border w-full"
                />
            </div>

            {initialLoading && categories.length === 0 ? (
                <div className="flex justify-center mt-6">
                    <Oval
                        height={40}
                        width={40}
                        color="#3b82f6"
                        secondaryColor="#dbeafe"
                        strokeWidth={4}
                        visible={true}
                    />
                </div>
            ) : categories.length === 0 ? (
                <p className="text-gray-500">No categories found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category, idx) => (
                        <div key={category.id} ref={idx === categories.length - 1 ? lastCategoryRef : null}>
                            <CategoryCard category={category} />
                        </div>
                    ))}
                </div>
            )}

            {loading && categories.length > 0 && (
                <div className="flex justify-center mt-4">
                    <Oval
                        height={30}
                        width={30}
                        color="#3b82f6"
                        secondaryColor="#dbeafe"
                        strokeWidth={3}
                        visible={true}
                    />
                </div>
            )}

            {!loading && hasMore && categories.length > 0 && !initialLoading && (
                <p className="text-gray-500 mt-4 text-center">Scroll down to load more categories...</p>
            )}
        </div>
    );
};

export default UserCategories;