import React, { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import CategoryCard from './CategoryCard';

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
    const [isFollowing, setIsFollowing] = useState(false);

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

    const fetchCategoryDetails = async (categoryId) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/categories/${categoryId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        } catch (err) {
            toast.error('Failed to load category details');
            return null;
        }
    };

    const fetchCategories = useCallback(async () => {
        if (!userPublicId) return;

        if (page === 0) setInitialLoading(true);
        else setLoading(true);

        const startTime = Date.now();
        try {
            const url = isFollowing
                ? `http://localhost:8080/api/v1/users/me/follows`
                : `http://localhost:8080/api/v1/users/me/categories`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
                params: { page, size: PAGE_SIZE },
            });

            const categoryIds = res.data.content || [];
            const isLast = res.data.last;

            let fetchedCategories = [];
            if (isFollowing) {
                fetchedCategories = await Promise.all(
                    categoryIds.map(async (category) => {
                        const details = await fetchCategoryDetails(category.categoryId);
                        return details;
                    })
                );
            } else {
                fetchedCategories = categoryIds;
            }

            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
                setCategories(prev =>
                    page === 0 ? fetchedCategories : [...prev, ...fetchedCategories]
                );
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
    }, [page, token, userPublicId, isFollowing]);

    const searchCategories = useCallback(async (query) => {
        if (!query.trim()) {
            setIsSearching(false);
            setPage(0);
            return;
        }

        setIsSearching(true);
        setInitialLoading(true);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/categories/search`, {
                params: { query },
            });

            setCategories(res.data || []);
            setHasMore(false);
        } catch (err) {
            const errorMessage = err.response?.data?.body?.detail || 'Failed to search categories.';
            if (err.response?.status !== 404 && err.response?.status !== 500) {
                toast.error(errorMessage);
            }
            setCategories([]);
            setHasMore(false);
        } finally {
            setInitialLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isSearching) return;
        fetchCategories();
    }, [fetchCategories, isSearching]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            searchCategories(searchQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, searchCategories]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const toggleCategoryView = () => {
        setIsFollowing(prev => !prev);
        setPage(0);
        setCategories([]);
    };

    const handleUnfollow = (categoryId) => {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    };

    return (
        <div className="mt-6 bg-white rounded-lg shadow p-6 text-gray-800">
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="px-4 py-2 rounded-md border w-full"
                />
            </div>

            <div className="mb-4 flex items-center justify-center">
                <div className="flex items-center bg-gray-100 rounded-full p-1">
                    <button
                        onClick={() => {
                            if (isFollowing) toggleCategoryView();
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                            !isFollowing ? 'bg-blue-500 text-white' : 'text-gray-700'
                        }`}
                    >
                        Created
                    </button>
                    <button
                        onClick={() => {
                            if (!isFollowing) toggleCategoryView();
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                            isFollowing ? 'bg-blue-500 text-white' : 'text-gray-700'
                        }`}
                    >
                        Following
                    </button>
                </div>
            </div>
            {initialLoading && categories.length === 0 ? (
                <div className="flex justify-center mt-6">
                    <Oval height={40} width={40} color="#3b82f6" secondaryColor="#dbeafe" strokeWidth={4} visible />
                </div>
            ) : categories.length === 0 ? (
                <p className="text-gray-500">No categories found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category, idx) => (
                        <div key={category.id} ref={idx === categories.length - 1 ? lastCategoryRef : null}>
                            <CategoryCard
                                category={category}
                                isFollowed={isFollowing}
                                onUnfollow={handleUnfollow}
                            />
                        </div>
                    ))}
                </div>
            )}

            {loading && categories.length > 0 && (
                <div className="flex justify-center mt-4">
                    <Oval height={30} width={30} color="#3b82f6" secondaryColor="#dbeafe" strokeWidth={3} visible />
                </div>
            )}

            {!loading && hasMore && categories.length > 0 && !initialLoading && (
                <p className="text-gray-500 mt-4 text-center">Scroll down to load more categories...</p>
            )}
        </div>
    );
};

export default UserCategories;