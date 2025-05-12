import React, { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import {Link, useNavigate} from 'react-router-dom';
import { useFollowedCategories } from '../contexts/FollowedCategoriesContext';
import { useUser } from '../contexts/UserContext';

const PAGE_SIZE = 10;
const MIN_LOADING_TIME = 300;

const UserCategories = ({ userPublicId }) => {
    const { user, loading: userLoading } = useUser();
    const { followedCategorySlugs, loadingFollowedCategories, removeFollowedCategory } = useFollowedCategories();

    const [categories, setCategories] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isViewingFollowing, setIsViewingFollowing] = useState(false);
    const [isViewingModerated, setIsViewingModerated] = useState(false);
    const navigate = useNavigate();


    const token = Cookies.get('token');
    const observer = useRef();

    const getAvatarColorClass = (identifier) => {
        if (!identifier) return 'bg-gray-medium';
        const firstLetter = identifier.charAt(0).toUpperCase();
        const asciiCode = firstLetter.charCodeAt(0);
        const colorIndex = asciiCode % 10;
        const avatarColors = [
            'bg-accent-green', 'bg-gray-darker', 'bg-indigo-600', 'bg-blue-600', 'bg-purple-600',
            'bg-pink-600', 'bg-teal-600', 'bg-orange-600', 'bg-red-600', 'bg-gray-medium',
        ];
        return avatarColors[colorIndex];
    };

    const getInitials = (name) => {
        if (!name) return '';
        const firstWord = name.split(' ')[0];
        return firstWord.charAt(0).toUpperCase();
    };

    const lastCategoryRef = useCallback(node => {
        if (loading || initialLoading || isSearching || !hasMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, initialLoading, hasMore, isSearching]);


    const fetchCategories = useCallback(async () => {
        if (!userPublicId) {
            setInitialLoading(false);
            setLoading(false);
            setHasMore(false);
            setCategories([]);
            return;
        }

        if (isSearching) {
            setInitialLoading(false);
            setLoading(false);
            return;
        }


        if (page === 0) {
            setInitialLoading(true);
            setCategories([]);
            setHasMore(true);
        } else {
            setLoading(true);
        }

        const startTime = Date.now();

        let fetchedCategories = [];
        let isLast = false;

        try {
            if (isViewingFollowing) {
                const slugsToFetch = followedCategorySlugs;

                const startIndex = page * PAGE_SIZE;
                const endIndex = startIndex + PAGE_SIZE;
                const slugsForPage = slugsToFetch.slice(startIndex, endIndex);

                const categoryDetailsPromises = slugsForPage.map(slug =>
                    axios.get(`http://localhost:8080/api/v1/categories/slug/${slug}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }).then(res => res.data).catch(() => null) // Fetch by slug, handle errors per fetch
                );
                const detailedCategories = await Promise.all(categoryDetailsPromises);
                fetchedCategories = detailedCategories.filter(cat => cat !== null); // Filter out failed fetches

                isLast = endIndex >= followedCategorySlugs.length;


            } else if (isViewingModerated) {
                const url = `http://localhost:8080/api/v1/users/me/moderated-categories`; // Endpoint for moderated categories

                const res = await axios.get(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    params: { page, size: PAGE_SIZE }, // Assuming backend supports pagination
                });

                fetchedCategories = res.data.content || [];
                isLast = res.data.last;

            } else {
                const url = `http://localhost:8080/api/v1/users/me/categories`; // Endpoint for created categories

                const res = await axios.get(url, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                    params: { page, size: PAGE_SIZE },
                });

                fetchedCategories = res.data.content || [];
                isLast = res.data.last;
            }

        } catch (err) {
            console.error('Failed to load categories:', err);
            const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || 'Failed to load categories.';
            if (err.response?.status !== 404 && err.response?.status !== 500 && !(err.response?.status === 403 && (isViewingFollowing || isViewingModerated))) {
                toast.error(errorMessage);
            }
            fetchedCategories = [];
            isLast = true;
        } finally {
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
        }
    }, [page, token, userPublicId, isViewingFollowing, isViewingModerated, isSearching, followedCategorySlugs]);


    const searchCategories = useCallback(async (query) => {
        if (!query.trim()) {
            setIsSearching(false);
            setSearchQuery('');
            setPage(0);
            return;
        }

        if (isViewingFollowing || isViewingModerated) {
            toast.info("Search is currently only available for Created categories.");
            setSearchQuery('');
            setIsSearching(false);
            return;
        }


        setIsSearching(true);
        setInitialLoading(true);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/categories/search`, {
                params: {
                    query,
                    creatorPublicId: userPublicId,
                },
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });

            setCategories(res.data || []);
            setHasMore(false);
        } catch (err) {
            console.error('Failed to search categories:', err);
            const errorMessage = err.response?.data?.body?.detail || err.response?.data?.message || 'Failed to search categories.';
            if (err.response?.status !== 404 && err.response?.status !== 500) {
                toast.error(errorMessage);
            }
            setCategories([]);
            setHasMore(false);
        } finally {
            setInitialLoading(false);
        }
    }, [userPublicId, isViewingFollowing, isViewingModerated, token]); // Added dependencies


    useEffect(() => {
        if (!isSearching) {
            fetchCategories();
        }
    }, [fetchCategories, isSearching]);


    useEffect(() => {
        if (searchQuery.trim()) {
            const delayDebounceFn = setTimeout(() => {
                searchCategories(searchQuery);
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else if (isSearching) {
            setIsSearching(false);
            setPage(0);
            setCategories([]);
            setHasMore(true);
        }
    }, [searchQuery, searchCategories, isSearching]);

    const handleSearchChange = (e) => {
        setPage(0);
        setSearchQuery(e.target.value);
    };

    const toggleCategoryView = (view) => {
        if (view === 'created' && (isViewingFollowing || isViewingModerated)) {
            setIsViewingFollowing(false);
            setIsViewingModerated(false);
        } else if (view === 'following' && (!isViewingFollowing || isViewingModerated)) {
            setIsViewingFollowing(true);
            setIsViewingModerated(false);
        } else if (view === 'moderated' && (!isViewingModerated || isViewingFollowing)) {
            setIsViewingModerated(true);
            setIsViewingFollowing(false);
        } else {
            return;
        }

        setSearchQuery('');
        setPage(0);
        setCategories([]);
        setHasMore(true);
        setIsSearching(false);
    };


    const handleUnfollow = async (categoryId, categorySlug, categoryName) => {
        const token = Cookies.get('token');
        if (!token) {
            toast.error('Please login to unfollow.');
            return;
        }
        try {
            await axios.delete(
                `http://localhost:8080/api/v1/categories/${categoryId}/follows`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success(`${categoryName} unfollowed.`);
            removeFollowedCategory(categorySlug);
            if (isViewingFollowing) {
                setCategories(prev => prev.filter(cat => cat.id !== categoryId));
            }
        } catch (err) {
            console.error('Failed to unfollow category', err);
            const errorMessage = err.response?.data?.message || 'Failed to unfollow category';
            toast.error(errorMessage);
        }
    };

    const overallLoading = initialLoading || loading || userLoading || loadingFollowedCategories;

    const noCategoriesMessage = isSearching
        ? `No categories found matching "${searchQuery}".`
        : isViewingFollowing
            ? 'Not following any categories yet.'
            : isViewingModerated
                ? 'Not moderating any categories yet.'
                : 'No categories created yet.'; // Default message for Created view


    return (
        <div className="mt-6 rounded-md text-black font-sans">
            <div className="mb-6">
                <div className="flex items-center justify-center bg-gray-light rounded-full p-1 w-fit mx-auto">
                    <button
                        onClick={() => toggleCategoryView('created')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${!isViewingFollowing && !isViewingModerated ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                        disabled={overallLoading}
                    >Created</button>
                    <button
                        onClick={() => toggleCategoryView('following')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${isViewingFollowing ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                        disabled={overallLoading}
                    >Following</button>
                    <button
                        onClick={() => toggleCategoryView('moderated')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${isViewingModerated ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                        disabled={overallLoading}
                    >Moderated</button>
                </div>
            </div>

            <div className="mb-6">
                <label htmlFor="categorySearch" className="block text-xs font-normal text-gray-medium mb-1 uppercase tracking-wide">Search Categories</label>
                <input
                    id="categorySearch"
                    type="text"
                    placeholder="Enter category name or slug"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="block w-[186px] bg-transparent border-0 border-b border-border focus:outline-none focus:border-black py-2 text-sm text-gray-darker placeholder-gray-medium"
                    disabled={overallLoading || isViewingFollowing || isViewingModerated} // Disable search in Following/Moderated for now
                />
            </div>

            {overallLoading && categories.length === 0 ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible />
                </div>
            ) : categories.length === 0 ? (
                <p className="text-gray-medium text-center py-10 text-base">
                    {noCategoriesMessage}
                </p>
            ) : (
                <ul className="space-y-8">
                    {categories.map((category, idx) => (
                        <li key={category.id}
                            ref={!isSearching && idx === categories.length - 1 ? lastCategoryRef : null}
                            className="flex items-center justify-between pb-4 border-b border-border last:border-b-0 hover:bg-gray-lighter transition duration-200 rounded-md p-3">
                            <div className="flex items-center gap-3 flex-grow pr-4">
                                <Link to={`/categories/${category.slug}`} className="flex-shrink-0">
                                    {category?.iconUrl ? (
                                        <img src={category.iconUrl} alt={`${category.name} icon`} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className={`${getAvatarColorClass(category?.slug || category.name)} w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold`}>
                                            {getInitials(category?.slug || category.name)}
                                        </div>
                                    )}
                                </Link>
                                <div>
                                    <Link to={`/categories/${category.slug}`} className="text-base font-semibold text-black hover:underline">
                                        {category.name}
                                    </Link>
                                    <p className="text-sm text-gray-darker">
                                        {category.followersCount} {category.followersCount === 1 ? 'follower' : 'followers'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <p className="text-xs text-gray-medium whitespace-nowrap">
                                    {new Date(category.createdAt).toLocaleDateString()}
                                </p>
                                {isViewingFollowing && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleUnfollow(category.id, category.slug, category.name); }} // Pass slug and name to handleUnfollow
                                        className="font-medium px-6 py-1 rounded-full focus:outline-none transition-colors duration-300 bg-gray-light text-gray-darker border border-gray-medium hover:border-black hover:text-black"
                                        disabled={overallLoading}
                                    >Unfollow</button>
                                )}
                                {isViewingModerated && (
                                    <button
                                        onClick={(e) => {
                                            navigate(`/categories/${category.slug}/moderate`); }}
                                        className="font-medium px-6 py-1 rounded-full focus:outline-none transition-colors duration-300 bg-gray-light text-gray-darker border border-gray-medium hover:border-black hover:text-black"
                                        disabled={overallLoading}
                                    >Moderate</button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {loading && page > 0 && !isSearching && (
                <div className="flex justify-center py-6">
                    <Oval height={28} width={28} color="#6B7280" secondaryColor="#E5E7EB" strokeWidth={3} visible />
                </div>
            )}

        </div>
    );
};

export default UserCategories;