import React, { useCallback, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import CategoryCard from './CategoryCard';
import { Link } from 'react-router-dom';
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

    const fetchCategoryDetails = async (categoryId) => {
        try {
            const res = await axios.get(`http://localhost:8080/api/v1/categories/${categoryId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            return res.data;
        } catch {
            return null;
        }
    };

    // Function to fetch categories (Created or Following)
    // Removed followedCategorySlugs from dependencies to prevent refetch on unfollow
    const fetchCategories = useCallback(async () => {
        if (!userPublicId) return;

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
                // --- Fetching Followed Categories using Context ---
                // Get the list of followed slugs from the context (accessed directly)
                const slugsToFetch = followedCategorySlugs;

                // Implement client-side pagination based on the slugs from context
                const startIndex = page * PAGE_SIZE;
                const endIndex = startIndex + PAGE_SIZE;
                const slugsForPage = slugsToFetch.slice(startIndex, endIndex);

                // Fetch full details for the slugs on the current page
                const categoryDetailsPromises = slugsForPage.map(slug =>
                    axios.get(`http://localhost:8080/api/v1/categories/slug/${slug}`, {
                        headers: token ? { Authorization: `Bearer ${token}` } : {},
                    }).then(res => res.data).catch(() => null) // Fetch by slug
                );
                const detailedCategories = await Promise.all(categoryDetailsPromises);
                fetchedCategories = detailedCategories.filter(cat => cat !== null); // Filter out failed fetches

                // Determine if there are more pages based on the total count from context
                isLast = endIndex >= followedCategorySlugs.length;


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
            // Handle errors during fetching
            const errorMessage = err.response?.data?.body?.detail || 'Failed to load categories.';
            // Avoid showing toast for 404/500 which might be expected for empty lists or specific states
            if (err.response?.status !== 404 && err.response?.status !== 500) {
                toast.error(errorMessage);
            }
            fetchedCategories = []; // Clear categories on error
            isLast = true; // Assume no more data on error
        } finally {
            // Ensure minimum loading time
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

            setTimeout(() => {
                // Update categories state, appending for pagination
                setCategories(prev =>
                    page === 0 ? fetchedCategories : [...prev, ...fetchedCategories]
                );
                // Update hasMore state
                setHasMore(!isLast);
                // Set loading states to false
                setInitialLoading(false);
                setLoading(false);
            }, remainingTime);
        }
    }, [page, token, userPublicId, isViewingFollowing]); // Removed followedCategorySlugs from dependencies


    const searchCategories = useCallback(async (query) => {
        if (!query.trim()) {
            setIsSearching(false);
            setSearchQuery('');
            setPage(0);
            return;
        }

        setIsSearching(true);
        setInitialLoading(true);

        try {
            const res = await axios.get(`http://localhost:8080/api/v1/categories/search`, {
                params: { query },
                creatorPublicId: user?.publicId,
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


    // Effect to trigger fetching when page, fetchCategories function, or view mode changes
    useEffect(() => {
        // Only fetch if not currently searching
        if (!isSearching) {
            fetchCategories();
        }
    }, [fetchCategories, isSearching]); // Dependencies

    // Effect for search functionality (retained from original, adjusted dependencies)
    useEffect(() => {
        if (searchQuery.trim()) {
            // Debounce search input
            const delayDebounceFn = setTimeout(() => {
                searchCategories(searchQuery);
            }, 300);
            return () => clearTimeout(delayDebounceFn); // Cleanup timeout
        } else if (isSearching) {
            searchCategories('');
        }
    }, [searchQuery, searchCategories, isSearching]); // Dependencies

    // Handle search input change (retained from original)
    const handleSearchChange = (e) => {
        setPage(0); // Reset pagination on search
        setSearchQuery(e.target.value); // Update search query state
    };

    // Toggle between Created and Following views
    const toggleCategoryView = () => {
        setIsViewingFollowing(prev => !prev); // Toggle the view state
        setSearchQuery(''); // Clear search query when switching views
        setPage(0); // Reset pagination
        setCategories([]); // Clear categories
        setHasMore(true); // Assume more data in the new view
        setIsSearching(false); // Ensure not in search mode
    };

    // Handle unfollow action using context function
    const handleUnfollow = async (categoryId, categorySlug, categoryName) => {
        const token = Cookies.get('token');
        if (!token) {
            toast.error('Please login to unfollow.');
            return;
        }
        try {
            // Call the API to unfollow
            await axios.delete(
                `http://localhost:8080/api/v1/categories/${categoryId}/follows`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            toast.success(`${categoryName} unfollowed.`);
            removeFollowedCategory(categorySlug);
            setCategories(prev => prev.filter(cat => cat.id !== categoryId));
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to unfollow category');
        }
    };

    // Determine overall loading state including context loading
    const overallLoading = initialLoading || loading || userLoading || loadingFollowedCategories;


    return (
        <div className="mt-6 rounded-md text-black font-sans">
            <div className="mb-6">
                <div className="flex items-center justify-center bg-gray-light rounded-full p-1 w-fit mx-auto">
                    {/* Button to switch to Created view */}
                    <button
                        onClick={() => { if (isViewingFollowing) toggleCategoryView(); }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${!isViewingFollowing ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                    >Created</button>
                    {/* Button to switch to Following view */}
                    <button
                        onClick={() => { if (!isViewingFollowing) toggleCategoryView(); }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-1 ${isViewingFollowing ? 'bg-accent-green text-white' : 'text-gray-darker hover:bg-gray-light'}`}
                    >Following</button>
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
                    className="block w-full sm:w-auto bg-transparent border-0 border-b border-border focus:outline-none focus:border-black py-2 text-sm text-gray-darker placeholder-gray-medium"
                />
            </div>

            {/* Loading indicator for initial load */}
            {overallLoading && categories.length === 0 ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <Oval height={40} width={40} color="#1A8917" secondaryColor="#EAEAEA" strokeWidth={4} visible />
                </div>
            ) : categories.length === 0 ? (
                // Message when no categories are found
                <p className="text-gray-medium text-center py-10 text-base">
                    {isSearching ? `No categories found matching "${searchQuery}".` : `No categories found in the "${isViewingFollowing ? 'Following' : 'Created'}" list.`}
                </p>
            ) : (
                // List of categories
                <ul className="space-y-8">
                    {categories.map((category, idx) => (
                        <li key={category.id}
                            // Attach ref for infinite scrolling only if not searching and it's the last item
                            ref={!isSearching && idx === categories.length - 1 ? lastCategoryRef : null}
                            className="flex items-center justify-between pb-4 border-b border-border last:border-b-0 hover:bg-gray-lighter transition duration-200 rounded-md p-3">
                            <div className="flex items-center gap-3 flex-grow pr-4">
                                {/* Link to category page */}
                                <Link to={`/categories/${category.slug}`} className="flex-shrink-0">
                                    {/* Category icon or initial placeholder */}
                                    {category?.iconUrl ? (
                                        <img src={category.iconUrl} alt={`${category.name} icon`} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className={`${getAvatarColorClass(category?.slug || category.name)} w-8 h-8 rounded-full flex items-center justify-center text-xs text-white font-bold`}>
                                            {getInitials(category?.slug || category.name)}
                                        </div>
                                    )}
                                </Link>
                                <div>
                                    {/* Category name link */}
                                    <Link to={`/categories/${category.slug}`} className="text-base font-semibold text-black hover:underline">
                                        {category.name}
                                    </Link>
                                    {/* Followers count */}
                                    <p className="text-sm text-gray-darker">
                                        {category.followersCount} {category.followersCount === 1 ? 'follower' : 'followers'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* Creation date */}
                                <p className="text-xs text-gray-medium whitespace-nowrap">
                                    {new Date(category.createdAt).toLocaleDateString()}
                                </p>
                                {/* Unfollow button (only shown in Following view) */}
                                {isViewingFollowing && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleUnfollow(category.id, category.slug, category.name); }} // Pass slug to handleUnfollow
                                        className="font-medium px-6 py-1 rounded-full focus:outline-none transition-colors duration-300 bg-gray-light text-gray-darker border border-gray-medium hover:border-black hover:text-black"
                                    >Unfollow</button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Loading indicator for subsequent pages */}
            {loading && page > 0 && !isSearching && (
                <div className="flex justify-center py-6">
                    <Oval height={28} width={28} color="#6B7280" secondaryColor="#E5E7EB" strokeWidth={3} visible />
                </div>
            )}

            {/* Message for scrolling to load more */}
            {!loading && hasMore && categories.length > 0 && !initialLoading && !isSearching && (
                <p className="text-gray-medium text-sm mt-8 text-center pb-4">
                    Scroll down for more categories...
                </p>
            )}
        </div>
    );
};

export default UserCategories;